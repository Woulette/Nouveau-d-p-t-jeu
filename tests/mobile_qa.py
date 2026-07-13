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
VIEWPORTS = [(667, 375), (844, 390), (896, 414), (932, 430)]


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
          return {x:x*32+16-s.camera.x,y:y*32+16-s.camera.y};
        }""",
        [x, y],
    )
    await page.locator('#game').click(position=position)


async def click_monster(page: Page, index: int) -> None:
    position = await page.evaluate(
        """index => {
          const s=window.__SOLENNE__,m=s.monsters[index];
          return {x:m.px*32+16-s.camera.x,y:m.py*32+10-s.camera.y};
        }""",
        index,
    )
    await page.locator('#game').click(position=position)


async def functional_checks(page: Page) -> dict[str, object]:
    checks: dict[str, object] = {}
    snap = await page.evaluate("window.__SOLENNE__.snapshot()")
    assert snap['build'] == '1.1.0-foundation.1' and snap['ready'] is True
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

    setup = await page.evaluate(
        """() => {
          const s=window.__SOLENNE__,m=s.monsters[0];
          Object.assign(m,{x:24,y:22,px:24,py:22,path:[],from:null,to:null,step:0,aggro:false,
            wanderAt:performance.now()/1000+9999,hp:m.maxHp,dead:false,pendingAttack:null,attackCooldown:999});
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
        'version': '1.1.0-foundation.1',
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
                fatal_visible = await page.locator('#fatal-error').evaluate("el => getComputedStyle(el).display !== 'none'")
                if errors or unique < 24 or clipped or fatal_visible:
                    report['status'] = 'FAIL'
                report['viewports'].append({
                    'width': width,
                    'height': height,
                    'uniqueSampleColors': unique,
                    'clippedControls': clipped,
                    'fatalVisible': fatal_visible,
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
        (ROOT / 'tests' / 'mobile-qa-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False, indent=2))
    if report['status'] != 'PASS':
        raise SystemExit(1)


if __name__ == '__main__':
    asyncio.run(run())
