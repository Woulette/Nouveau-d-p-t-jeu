#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from PIL import Image
from playwright.async_api import Page, async_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUT = ROOT / 'tests' / 'output'
OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS = [(667, 375), (812, 375), (844, 390), (896, 414), (932, 430)]


class QuietHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path.split('?', 1)[0] == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, format: str, *args: object) -> None:
        return


async def wait_ready(page: Page) -> None:
    await page.wait_for_function("window.__SOLENNE__ && window.__SOLENNE__.snapshot().ready === true", timeout=20_000)
    await page.wait_for_function("document.querySelector('#loading-screen').classList.contains('hidden')", timeout=5_000)


async def click_world_tile(page: Page, x: int, y: int) -> None:
    position = await page.evaluate(
        """([x,y]) => {
          const s=window.__SOLENNE__;
          return s.worldToScreen(x,y,.5);
        }""",
        [x, y],
    )
    await page.locator('#game').click(position=position)


async def click_monster(page: Page, index: int) -> None:
    position = await page.evaluate(
        """index => {
          const s=window.__SOLENNE__,m=s.monsters[index];
          return s.worldToScreen(m.px,m.py,.4);
        }""",
        index,
    )
    await page.locator('#game').click(position=position)


async def functional_checks(page: Page) -> dict[str, object]:
    checks: dict[str, object] = {}
    snap = await page.evaluate("window.__SOLENNE__.snapshot()")
    assert snap['build'] == '1.2.0-alpha.1' and snap['ready'] is True
    checks['buildReady'] = {'status': 'PASS', 'build': snap['build']}

    selected_weapons = []
    for weapon in ('sling', 'orb', 'staff'):
        await page.locator(f'[data-weapon="{weapon}"]').click()
        await page.wait_for_function(f"window.__SOLENNE__.snapshot().player.weapon === '{weapon}'")
        selected_weapons.append(weapon)
    checks['weaponSelection'] = {'status': 'PASS', 'weapons': selected_weapons}

    await page.locator('[data-weapon="orb"]').click()
    await page.wait_for_function("JSON.parse(localStorage.getItem('chroniques-solenne-save-v1')).player.weapon === 'orb'")
    await page.reload(wait_until='load')
    await wait_ready(page)
    await page.wait_for_function("window.__SOLENNE__.snapshot().player.weapon === 'orb'")
    checks['localSaveReload'] = {'status': 'PASS', 'persistedWeapon': 'orb'}
    await page.locator('[data-weapon="staff"]').click()

    await page.locator('#inventory-button').click()
    await page.wait_for_function("document.querySelector('#drawer').classList.contains('open') && document.querySelector('#drawer-title').textContent === 'Inventaire'")
    inventory_items = await page.locator('#drawer-content .inventory-item').count()
    assert inventory_items >= 1
    await page.locator('#drawer-close').click()
    await page.wait_for_function("!document.querySelector('#drawer').classList.contains('open')")
    checks['inventoryDrawer'] = {'status': 'PASS', 'visibleItems': inventory_items}

    await page.locator('#stats-button').click()
    await page.wait_for_function("document.querySelector('#drawer').classList.contains('open') && document.querySelector('#drawer-title').textContent === 'Statistiques'")
    stat_cards = await page.locator('#drawer-content .stat-card').count()
    assert stat_cards >= 4
    await page.locator('#drawer-close').click()
    await page.wait_for_function("!document.querySelector('#drawer').classList.contains('open')")
    checks['statsDrawer'] = {'status': 'PASS', 'visibleCards': stat_cards}

    before_move = await page.evaluate("window.__SOLENNE__.snapshot().player")
    assert before_move['x'] == 24 and before_move['y'] == 22
    await click_world_tile(page, 23, 22)
    await page.wait_for_function("window.__SOLENNE__.snapshot().player.x === 23 && window.__SOLENNE__.snapshot().player.y === 22", timeout=5_000)
    after_move = await page.evaluate("window.__SOLENNE__.snapshot().player")
    checks['gridMovement'] = {'status': 'PASS', 'from': [before_move['x'], before_move['y']], 'to': [after_move['x'], after_move['y']]}

    await page.locator('[data-weapon="staff"]').click()
    chase_setup = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,m=s.monsters[0];
          s.test.clearTarget();
          if(!s.test.teleport(16,15)) throw new Error('Fixture joueur inaccessible');
          Object.assign(m,{x:22,y:15,px:22,py:15,path:[],from:null,to:null,step:0,routeTargetId:null,
            routeGoalKey:null,repathAt:0,aggro:true,wanderAt:performance.now()/1000+9999,hp:m.maxHp,
            dead:false,pendingAttack:null,attackCooldown:999});
          s.test.selectMonster(0);
          return {player:[s.player.x,s.player.y],monster:[m.x,m.y],monsterHp:m.hp};
        }"""
    )
    chase_result = await page.evaluate(
        """([initialPlayer,initialMonster,monsterHp]) => new Promise(resolve => {
          const s=window.__SOLENNE__,p=s.player,m=s.monsters[0],started=performance.now();
          const violations=[],playerTiles=new Set(),monsterTiles=new Set();
          const sample=()=>{
            if(!p.to && (Math.abs(p.px-p.x)>.001 || Math.abs(p.py-p.y)>.001)) violations.push('player fractional while settled');
            if(!m.to && (Math.abs(m.px-m.x)>.001 || Math.abs(m.py-m.y)>.001)) violations.push('monster fractional while settled');
            if(p.from&&p.to&&Math.abs(p.from.x-p.to.x)+Math.abs(p.from.y-p.to.y)!==1) violations.push('player non-cardinal step');
            if(m.from&&m.to&&Math.abs(m.from.x-m.to.x)+Math.abs(m.from.y-m.to.y)!==1) violations.push('monster non-cardinal step');
            const pTiles=[[p.x,p.y],...(p.to?[[p.to.x,p.to.y]]:[])];
            const mTiles=[[m.x,m.y],...(m.to?[[m.to.x,m.to.y]]:[])];
            if(pTiles.some(a=>mTiles.some(b=>a[0]===b[0]&&a[1]===b[1]))) violations.push('shared reservation');
            if(!p.to) playerTiles.add(`${p.x},${p.y}`);
            if(!m.to) monsterTiles.add(`${m.x},${m.y}`);
            const playerHit=m.hp<monsterHp;
            if((playerHit&&performance.now()-started>450)||performance.now()-started>6000){
              resolve({playerHit,violations:[...new Set(violations)],player:[p.x,p.y],monster:[m.x,m.y],
                playerTiles:[...playerTiles],monsterTiles:[...monsterTiles],monsterHp:m.hp,
                playerMoved:p.x!==initialPlayer[0]||p.y!==initialPlayer[1],monsterMoved:m.x!==initialMonster[0]||m.y!==initialMonster[1]});
              return;
            }
            requestAnimationFrame(sample);
          };
          sample();
        })""",
        [chase_setup['player'], chase_setup['monster'], chase_setup['monsterHp']],
    )
    assert chase_result['playerHit'] is True
    assert chase_result['playerMoved'] is True and chase_result['monsterMoved'] is True
    assert len(chase_result['playerTiles']) >= 3 and len(chase_result['monsterTiles']) >= 2
    assert chase_result['violations'] == []
    assert chase_result['player'] != chase_result['monster']
    checks['dynamicChaseReservation'] = {'status': 'PASS', **chase_result}

    blocked_setup = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,target=s.monsters[0],blocker=s.monsters[1];
          s.test.clearTarget();
          if(!s.test.teleport(16,15)) throw new Error('Fixture détour inaccessible');
          Object.assign(target,{x:22,y:15,px:22,py:15,path:[],from:null,to:null,step:0,routeTargetId:null,
            routeGoalKey:null,repathAt:0,aggro:false,wanderAt:performance.now()/1000+9999,hp:target.maxHp,
            dead:false,pendingAttack:null,attackCooldown:999});
          Object.assign(blocker,{x:40,y:30,px:40,py:30,path:[],from:null,to:null,step:0,aggro:false,
            wanderAt:performance.now()/1000+9999,dead:false,pendingAttack:null,attackCooldown:999});
          s.test.selectMonster(0);
          return {targetHp:target.hp};
        }"""
    )
    await page.wait_for_timeout(90)
    await page.evaluate(
        """() => {
          const blocker=window.__SOLENNE__.monsters[1];
          Object.assign(blocker,{x:18,y:15,px:18,py:15,path:[],from:null,to:null,step:0,aggro:false,wanderAt:performance.now()/1000+9999});
        }"""
    )
    await page.wait_for_function("before => window.__SOLENNE__.monsters[0].hp < before", arg=blocked_setup['targetHp'], timeout=6_000)
    blocked_result = await page.evaluate("({player:[window.__SOLENNE__.player.x,window.__SOLENNE__.player.y],blocker:[window.__SOLENNE__.monsters[1].x,window.__SOLENNE__.monsters[1].y]})")
    assert blocked_result['player'] != blocked_result['blocker']
    checks['blockedWaypointReplan'] = {'status': 'PASS', **blocked_result}

    setup = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,m=s.monsters[0];
          s.test.clearTarget();
          Object.assign(m,{x:24,y:22,px:24,py:22,path:[],from:null,to:null,step:0,aggro:false,
            routeTargetId:null,routeGoalKey:null,repathAt:0,wanderAt:performance.now()/1000+9999,
            hp:m.maxHp,dead:false,pendingAttack:null,attackCooldown:999});
          s.test.teleport(23,22);
          return {id:m.id,hp:m.hp,maxHp:m.maxHp};
        }"""
    )
    await page.wait_for_timeout(350)
    await click_monster(page, 0)
    await page.wait_for_function("window.__SOLENNE__.snapshot().selected === 'm-0'", timeout=3_000)

    combat: dict[str, object] = {}
    expected_states = {'staff': 'staff', 'sling': 'sling', 'orb': 'cast'}
    mastery_names = {'staff': 'melee', 'sling': 'ranged', 'orb': 'magic'}
    for weapon in ('staff', 'sling', 'orb'):
        mastery = mastery_names[weapon]
        await page.locator(f'[data-weapon="{weapon}"]').click()
        before = await page.evaluate(
            """([mastery]) => ({
              xp:window.__SOLENNE__.snapshot().masteries[mastery].xp,
              hp:window.__SOLENNE__.monsters[0].hp,
              mp:window.__SOLENNE__.player.mp
            })""",
            [mastery],
        )
        await page.wait_for_function(
            """([state]) => window.__SOLENNE__.player.state === state""",
            arg=[expected_states[weapon]],
            timeout=5_000,
        )
        await page.wait_for_function(
            """([mastery,beforeXp]) => window.__SOLENNE__.snapshot().masteries[mastery].xp > beforeXp""",
            arg=[mastery, before['xp']],
            timeout=5_000,
        )
        after = await page.evaluate(
            """([mastery]) => ({
              xp:window.__SOLENNE__.snapshot().masteries[mastery].xp,
              hp:window.__SOLENNE__.monsters[0].hp,
              mp:window.__SOLENNE__.player.mp,
              dead:window.__SOLENNE__.monsters[0].dead
            })""",
            [mastery],
        )
        assert after['xp'] > before['xp']
        assert after['hp'] < before['hp']
        if weapon == 'orb':
            assert after['mp'] < before['mp']
        combat[weapon] = {
            'mastery': mastery,
            'xpBefore': before['xp'],
            'xpAfter': after['xp'],
            'hpBefore': before['hp'],
            'hpAfter': after['hp'],
        }
        assert not after['dead']
    checks['threeStyleCombat'] = {'status': 'PASS', 'target': setup, 'styles': combat}

    defense_before = await page.evaluate("window.__SOLENNE__.snapshot().masteries.defense.xp")
    await page.evaluate("() => {window.__SOLENNE__.monsters[0].attackCooldown=0;window.__SOLENNE__.monsters[0].aggro=true;}")
    await page.wait_for_function(
        """before => window.__SOLENNE__.snapshot().masteries.defense.xp > before""",
        arg=defense_before,
        timeout=5_000,
    )
    defense_after = await page.evaluate("window.__SOLENNE__.snapshot().masteries.defense.xp")
    hp_damaged = await page.evaluate("window.__SOLENNE__.snapshot().player.hp")
    assert hp_damaged < 100
    checks['defenseProgression'] = {'status': 'PASS', 'xpBefore': defense_before, 'xpAfter': defense_after, 'hpAfterHit': hp_damaged}

    potion_before = await page.evaluate("window.__SOLENNE__.snapshot().inventory.potion")
    await page.locator('#potion-button').click()
    await page.wait_for_function(
        """before => window.__SOLENNE__.snapshot().inventory.potion === before - 1""",
        arg=potion_before,
        timeout=2_000,
    )
    potion_after = await page.evaluate("({count:window.__SOLENNE__.snapshot().inventory.potion,hp:window.__SOLENNE__.snapshot().player.hp})")
    assert potion_after['hp'] > hp_damaged
    checks['potion'] = {
        'status': 'PASS',
        'countBefore': potion_before,
        'countAfter': potion_after['count'],
        'hpBefore': hp_damaged,
        'hpAfter': potion_after['hp'],
    }

    await page.screenshot(path=str(OUT / 'foundation-combat-896x414.png'))

    await page.evaluate("window.__SOLENNE__.test.damagePlayer(9999)")
    await page.wait_for_function("window.__SOLENNE__.player.dying === true", timeout=2_000)
    await page.wait_for_function("window.__SOLENNE__.player.dying === false", timeout=5_000)
    respawn = await page.evaluate("({x:window.__SOLENNE__.player.x,y:window.__SOLENNE__.player.y,hp:window.__SOLENNE__.snapshot().player.hp,mp:window.__SOLENNE__.snapshot().player.mp})")
    assert respawn['hp'] == 100 and respawn['mp'] == 40
    checks['deathRespawn'] = {'status': 'PASS', **respawn}

    occupied_respawn = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,m=s.monsters[0];
          Object.assign(m,{dead:true,path:[],from:null,to:null,step:0,pendingAttack:null,respawnAt:0});
          if(!s.test.teleport(m.spawnX,m.spawnY)) throw new Error('Spawn monstre inaccessible');
          return {spawn:[m.spawnX,m.spawnY]};
        }"""
    )
    await page.wait_for_timeout(180)
    delayed_respawn = await page.evaluate("({dead:window.__SOLENNE__.monsters[0].dead,same:window.__SOLENNE__.player.x===window.__SOLENNE__.monsters[0].x&&window.__SOLENNE__.player.y===window.__SOLENNE__.monsters[0].y})")
    assert delayed_respawn['dead'] is True
    await page.evaluate("() => {const s=window.__SOLENNE__;s.test.teleport(23,22);s.monsters[0].respawnAt=0;}")
    await page.wait_for_function("window.__SOLENNE__.monsters[0].dead === false", timeout=2_000)
    safe_monster_respawn = await page.evaluate("({same:window.__SOLENNE__.player.x===window.__SOLENNE__.monsters[0].x&&window.__SOLENNE__.player.y===window.__SOLENNE__.monsters[0].y})")
    assert safe_monster_respawn['same'] is False
    checks['reservedRespawns'] = {'status': 'PASS', 'spawn': occupied_respawn['spawn'], 'delayedWhileOccupied': True}

    monster_catalog = await page.evaluate("window.__SOLENNE__.monsterCatalog()")
    monster_types = {entry['type'] for entry in monster_catalog}
    assert {'bear', 'treant'}.issubset(monster_types)
    bear_index = next(index for index, entry in enumerate(monster_catalog) if entry['type'] == 'bear')
    treant_index = next(index for index, entry in enumerate(monster_catalog) if entry['type'] == 'treant')
    legacy = [entry for entry in monster_catalog if entry['type'] in {'slime', 'rat', 'boar', 'wolf', 'wisp'}]
    strongest_legacy_xp = max(entry['rewards']['generalXp'] for entry in legacy)
    strongest_legacy_hp = max(entry['maxHp'] for entry in legacy)
    strongest_legacy_damage = max(entry['damage'] for entry in legacy)
    for index in (bear_index, treant_index):
        assert monster_catalog[index]['rewards']['generalXp'] > strongest_legacy_xp
        assert monster_catalog[index]['maxHp'] > strongest_legacy_hp
        assert monster_catalog[index]['damage'] > strongest_legacy_damage
    await page.evaluate("() => {const s=window.__SOLENNE__;s.state.player.level=1;s.state.player.xp=0;s.state.player.className='Aventurier';s.state.player.classLevel=1;s.state.player.classXp=0;}")
    reward_before = await page.evaluate("window.__SOLENNE__.snapshot().player")
    await page.evaluate("index => window.__SOLENNE__.test.defeatMonster(index)", bear_index)
    reward_after = await page.evaluate("window.__SOLENNE__.snapshot().player")
    expected_reward = monster_catalog[bear_index]['rewards']
    assert reward_after['xp'] - reward_before['xp'] == expected_reward['generalXp']
    assert reward_after['classXp'] - reward_before['classXp'] == expected_reward['classXp']
    assert 10 <= reward_after['gold'] - reward_before['gold'] <= 24
    await page.evaluate("() => {const s=window.__SOLENNE__;s.state.player.level=1;s.state.player.xp=0;s.state.player.classLevel=1;s.state.player.classXp=0;}")
    treant_before = await page.evaluate("window.__SOLENNE__.snapshot().player")
    await page.evaluate("index => window.__SOLENNE__.test.defeatMonster(index)", treant_index)
    treant_after = await page.evaluate("window.__SOLENNE__.snapshot().player")
    treant_reward = monster_catalog[treant_index]['rewards']
    assert treant_after['xp'] - treant_before['xp'] == treant_reward['generalXp']
    assert treant_after['classXp'] - treant_before['classXp'] == treant_reward['classXp']
    assert 13 <= treant_after['gold'] - treant_before['gold'] <= 29
    checks['strongerMonstersAndRewards'] = {
        'status': 'PASS',
        'types': sorted(monster_types),
        'bearReward': expected_reward,
        'treantReward': treant_reward,
        'goldDelta': reward_after['gold'] - reward_before['gold'],
    }

    class_profiles = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,profiles={};
          for(const name of ['Aventurier','Épéiste','Archer','Mage']){
            s.state.player.className=name;
            profiles[name]=s.combatProfile();
          }
          s.state.player.className='Aventurier';
          s.state.classChoiceLocked=false;
          return profiles;
        }"""
    )
    assert class_profiles['Épéiste']['maxHp'] == class_profiles['Aventurier']['maxHp'] + 12
    assert class_profiles['Épéiste']['damageMultipliers']['melee'] == 1.12
    assert class_profiles['Archer']['ranges']['sling'] == class_profiles['Aventurier']['ranges']['sling'] + 0.6
    assert class_profiles['Archer']['damageMultipliers']['ranged'] == 1.12
    assert class_profiles['Mage']['maxMp'] == class_profiles['Aventurier']['maxMp'] + 12
    assert class_profiles['Mage']['damageMultipliers']['magic'] == 1.12

    archer_range_setup = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,m=s.monsters[0];
          s.test.clearTarget();s.state.player.className='Archer';s.state.player.weapon='sling';
          if(!s.test.teleport(23,22)) throw new Error('Fixture Archer inaccessible');
          Object.assign(m,{x:28,y:24,px:28,py:24,path:[],from:null,to:null,step:0,routeTargetId:null,
            routeGoalKey:null,repathAt:0,aggro:false,wanderAt:performance.now()/1000+9999,hp:m.maxHp,
            dead:false,pendingAttack:null,attackCooldown:999});
          s.test.selectMonster(0);
          return {player:[s.player.x,s.player.y],monsterHp:m.hp};
        }"""
    )
    await page.wait_for_function("before => window.__SOLENNE__.monsters[0].hp < before", arg=archer_range_setup['monsterHp'], timeout=4_000)
    archer_range_after = await page.evaluate("({player:[window.__SOLENNE__.player.x,window.__SOLENNE__.player.y],monsterHp:window.__SOLENNE__.monsters[0].hp})")
    assert archer_range_after['player'] == archer_range_setup['player']
    await page.evaluate("() => {const s=window.__SOLENNE__;s.test.clearTarget();s.state.player.className='Aventurier';s.state.player.weapon='staff';}")
    checks['classBonuses'] = {'status': 'PASS', 'profiles': class_profiles, 'archerAttackedWithoutApproach': True}

    class_before = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__;
          s.state.player.level=7;
          s.state.masteries.melee.level=4;
          s.state.inventory.oakRing=1;
          s.state.equipment.ring='oakRing';
          s.test.setClassLevel(19);
          s.test.grantClassXp(99999);
          return s.snapshot();
        }"""
    )
    assert class_before['player']['classLevel'] == 20 and class_before['player']['classXp'] == 0
    await page.evaluate("() => window.__SOLENNE__.test.teleport(18,9)")
    await page.wait_for_timeout(700)
    await click_world_tile(page, 19, 9)
    await page.wait_for_function("document.querySelector('#class-modal').classList.contains('open')", timeout=3_000)
    assert await page.locator('#class-grid [data-class]').count() == 3
    await page.locator('#class-grid [data-class="Archer"]').click()
    await page.wait_for_function("!document.querySelector('#class-confirmation').hidden")
    await page.locator('#class-confirm').click()
    await page.wait_for_function("window.__SOLENNE__.snapshot().player.className === 'Archer'")
    class_after = await page.evaluate("({snapshot:window.__SOLENNE__.snapshot(),profile:window.__SOLENNE__.combatProfile(),equipment:window.__SOLENNE__.state.equipment})")
    assert class_after['snapshot']['player']['classLevel'] == 1
    assert class_after['snapshot']['player']['classXp'] == 0
    assert class_after['snapshot']['player']['level'] == class_before['player']['level']
    assert class_after['snapshot']['masteries']['melee']['level'] == class_before['masteries']['melee']['level']
    assert class_after['snapshot']['inventory']['oakRing'] == class_before['inventory']['oakRing']
    assert class_after['equipment']['ring'] == 'oakRing'
    assert class_after['snapshot']['classChoiceLocked'] is True
    assert class_after['profile']['ranges']['sling'] > 5.2
    await page.reload(wait_until='load')
    await wait_ready(page)
    persisted_class = await page.evaluate("window.__SOLENNE__.snapshot()")
    assert persisted_class['player']['className'] == 'Archer' and persisted_class['classChoiceLocked'] is True
    await page.wait_for_timeout(500)
    await click_world_tile(page, 19, 9)
    await page.wait_for_timeout(250)
    assert not await page.locator('#class-modal').evaluate("el => el.classList.contains('open')")
    checks['permanentClassEvolution'] = {
        'status': 'PASS',
        'className': persisted_class['player']['className'],
        'classLevel': persisted_class['player']['classLevel'],
        'generalLevel': persisted_class['player']['level'],
        'slingRange': class_after['profile']['ranges']['sling'],
        'persisted': True,
    }

    await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,save=JSON.parse(localStorage.getItem('chroniques-solenne-save-v1')||JSON.stringify(s.state));
          save.player.x=s.monsters[0].spawnX;save.player.y=s.monsters[0].spawnY;
          s.state.player.x=save.player.x;s.state.player.y=save.player.y;
          Object.assign(s.player,{x:save.player.x,y:save.player.y,px:save.player.x,py:save.player.y,path:[],from:null,to:null,step:0});
          localStorage.setItem('chroniques-solenne-save-v1',JSON.stringify(save));
        }"""
    )
    await page.reload(wait_until='load')
    await wait_ready(page)
    initial_reservations = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,m=s.monsters[0];
          return {player:[s.player.x,s.player.y],monster:[m.x,m.y],same:s.player.x===m.x&&s.player.y===m.y,monsterDead:m.dead};
        }"""
    )
    assert initial_reservations['same'] is False and initial_reservations['monsterDead'] is False
    checks['initialReservations'] = {'status': 'PASS', **initial_reservations}

    stored = await page.evaluate("JSON.parse(localStorage.getItem('chroniques-solenne-save-v1'))")
    assert stored and stored['version'] == 1
    checks['savePayload'] = {'status': 'PASS', 'version': stored['version'], 'className': stored['player']['className']}
    return checks


async def run() -> None:
    handler = partial(QuietHandler, directory=str(DIST))
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}"
    configured_browser = os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
    system_browser = Path('/usr/bin/chromium')
    browser_executable = configured_browser or (str(system_browser) if system_browser.exists() else None)
    report: dict[str, object] = {
        'version': '1.2.0-alpha.1',
        'status': 'PASS',
        'browserExecutable': browser_executable or 'playwright-managed',
        'servedRelease': 'dist/index.html',
        'viewports': [],
        'functionalChecks': {},
        'errors': [],
    }
    try:
        async with async_playwright() as playwright:
            launch_options: dict[str, object] = {'headless': True, 'args': ['--no-sandbox']}
            if browser_executable:
                launch_options['executable_path'] = browser_executable
            browser = await playwright.chromium.launch(**launch_options)
            functional_page: Page | None = None
            functional_context = None
            for width, height in VIEWPORTS:
                context = await browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1)
                page = await context.new_page()
                errors: list[str] = []
                page.on('pageerror', lambda error, errors=errors: errors.append(f'pageerror:{error}'))
                page.on('console', lambda message, errors=errors: errors.append(f'console:{message.type}:{message.text}') if message.type == 'error' else None)
                await page.goto(f'{base_url}/index.html?qa={width}x{height}', wait_until='load')
                await wait_ready(page)
                await page.wait_for_timeout(3_050)
                shot = OUT / f'foundation-{width}x{height}.png'
                await page.screenshot(path=str(shot))
                image = Image.open(shot).convert('RGB')
                pixels = [
                    image.getpixel((x, y))
                    for x in range(30, width, max(1, width // 15))
                    for y in range(30, height, max(1, height // 10))
                ]
                unique = len(set(pixels))
                key_selectors = [
                    '#portrait', '#settings-button', '#inventory-button', '#stats-button',
                    '[data-weapon="staff"]', '[data-weapon="sling"]', '[data-weapon="orb"]', '#potion-button',
                ]
                clipped: list[str] = []
                for selector in key_selectors:
                    box = await page.locator(selector).bounding_box()
                    if not box or box['x'] < -1 or box['y'] < -1 or box['x'] + box['width'] > width + 1 or box['y'] + box['height'] > height + 1:
                        clipped.append(selector)
                layout = await page.evaluate(
                    """([width,height,selectors]) => {
                      const box=selector=>{
                        const r=document.querySelector(selector).getBoundingClientRect();
                        return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
                      };
                      const overlaps=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));
                      const controls=Object.fromEntries(selectors.map(selector=>[selector,box(selector)]));
                      const weapons=['[data-weapon="staff"]','[data-weapon="sling"]','[data-weapon="orb"]'].map(box);
                      const hudSelectors=['.hud-player','.progress-card','.combat-actions','.side-actions','.utility-actions','#settings-button'];
                      const hud=Object.fromEntries(hudSelectors.map(selector=>[selector,box(selector)]));
                      const target=document.querySelector('.target-card'),targetTransition=target.style.transition;
                      target.style.transition='none';target.classList.add('visible');
                      const targetBox=box('.target-card');
                      target.classList.remove('visible');target.style.transition=targetTransition;
                      const modal=document.querySelector('#class-modal'),grid=document.querySelector('#class-grid'),confirmation=document.querySelector('#class-confirmation');
                      modal.classList.add('open');grid.hidden=true;confirmation.hidden=false;
                      const modalControls=Object.fromEntries(['#class-back','#class-confirm','#class-cancel'].map(selector=>[selector,box(selector)]));
                      const modalCard=document.querySelector('#class-modal .modal-card');
                      const modalFits=modalCard.scrollHeight<=modalCard.clientHeight+1;
                      modal.classList.remove('open');grid.hidden=false;confirmation.hidden=true;
                      const overlapAreas={
                        combatPlayer:overlaps(hud['.combat-actions'],hud['.hud-player']),
                        combatProgress:overlaps(hud['.combat-actions'],hud['.progress-card']),
                        sideSettings:overlaps(hud['.side-actions'],hud['#settings-button']),
                        sideUtility:overlaps(hud['.side-actions'],hud['.utility-actions']),
                        targetPlayer:overlaps(targetBox,hud['.hud-player'])
                      };
                      const occlusion=Object.values(hud).reduce((sum,r)=>sum+r.width*r.height,0)/(width*height);
                      const center=document.elementFromPoint(width/2,height/2);
                      return {
                        controls,weapons,hud,targetBox,modalControls,modalFits,overlapAreas,occlusion,
                        centerIsWorld:center?.id==='game',
                        visibleTilesX:width/(window.__SOLENNE__.tileSize*window.__SOLENNE__.worldScale),
                        worldScale:window.__SOLENNE__.worldScale
                      };
                    }""",
                    [width, height, key_selectors],
                )
                layout_errors: list[str] = []
                for selector, box in layout['controls'].items():
                    if box['width'] < 44 or box['height'] < 44:
                        layout_errors.append(f'touch target too small: {selector}')
                for selector, box in layout['modalControls'].items():
                    if box['width'] < 44 or box['height'] < 44:
                        layout_errors.append(f'modal touch target too small: {selector}')
                if not layout['modalFits']:
                    layout_errors.append('class confirmation requires scrolling')
                weapon_x = [box['x'] for box in layout['weapons']]
                if max(weapon_x) > 20 or max(weapon_x) - min(weapon_x) > 6:
                    layout_errors.append('weapons are not aligned on the far left')
                if any(area > 1 for area in layout['overlapAreas'].values()):
                    layout_errors.append(f"hud overlap: {layout['overlapAreas']}")
                if layout['occlusion'] > .30:
                    layout_errors.append(f"hud occlusion too high: {layout['occlusion']:.3f}")
                if not layout['centerIsWorld']:
                    layout_errors.append('world center is obstructed')
                if layout['visibleTilesX'] < width / 24.1:
                    layout_errors.append('world is still too zoomed in')
                fatal_visible = await page.locator('#fatal-error').evaluate("el => getComputedStyle(el).display !== 'none'")
                if errors or unique < 24 or clipped or fatal_visible or layout_errors:
                    report['status'] = 'FAIL'
                report['viewports'].append({
                    'width': width,
                    'height': height,
                    'uniqueSampleColors': unique,
                    'clippedControls': clipped,
                    'fatalVisible': fatal_visible,
                    'layout': layout,
                    'layoutErrors': layout_errors,
                    'errors': errors,
                })
                report['errors'].extend(errors)
                if width == 896 and height == 414:
                    functional_page = page
                    functional_context = context
                else:
                    await context.close()
            if functional_page is None or functional_context is None:
                raise RuntimeError('Viewport fonctionnel 896x414 absent')
            report['functionalChecks'] = await functional_checks(functional_page)
            await functional_context.close()
            await browser.close()
    except Exception as exc:
        report['status'] = 'FAIL'
        report['errors'].append(f'{type(exc).__name__}: {exc}')
    finally:
        server.shutdown()
        server.server_close()
        payload = json.dumps(report, ensure_ascii=False, indent=2)
        (ROOT / 'tests' / 'mobile-qa-report.json').write_text(payload, encoding='utf-8')
        (ROOT / 'docs' / 'MOBILE_QA.json').write_text(payload + '\n', encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False, indent=2))
    if report['status'] != 'PASS':
        raise SystemExit(1)


if __name__ == '__main__':
    asyncio.run(run())
