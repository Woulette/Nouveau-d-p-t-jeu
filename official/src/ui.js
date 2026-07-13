import {
  CLASS_DEFINITIONS,
  ITEMS,
  WEAPONS,
  characterXpRequired,
  jobXpRequired,
  masteryXpRequired,
} from './data.js';
import { getEquipmentBonuses, getPlayerSpeed, resetSave } from './state.js';
import { getLocationName } from './world.js';

const MASTERY_LABELS = {
  melee: 'Corps à corps',
  ranged: 'Attaque à distance',
  magic: 'Magie',
  defense: 'Défense',
};

const CLASS_MENTOR = {
  Épéiste: { name: 'Maître Kael', sprite: 'mentor_sword' },
  Archer: { name: 'Maîtresse Lyra', sprite: 'mentor_archer' },
  Mage: { name: 'Maître Orin', sprite: 'mentor_mage' },
};

function assetSrc(path) {
  return window.__ASSET_DATA__?.[path] ?? path;
}

function percent(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function rarityLabel(item) {
  if (item.rarity === 'rare') return 'Rare';
  if (item.rarity === 'uncommon') return 'Peu commun';
  return item.type === 'equipment' ? 'Équipement' : item.type === 'consumable' ? 'Consommable' : 'Matériau';
}

export class GameUI {
  constructor() {
    this.game = null;
    this.activePanel = null;
    this.panelNeedsRender = true;

    this.loadingScreen = document.querySelector('#loading-screen');
    this.loadingProgress = document.querySelector('#loading-progress');
    this.locationName = document.querySelector('#location-name');
    this.playerName = document.querySelector('#player-name');
    this.levelBadge = document.querySelector('#level-badge');
    this.playerAvatar = document.querySelector('#player-avatar');
    this.healthFill = document.querySelector('#health-fill');
    this.healthText = document.querySelector('#health-text');
    this.manaFill = document.querySelector('#mana-fill');
    this.manaText = document.querySelector('#mana-text');
    this.targetCard = document.querySelector('#target-card');
    this.targetName = document.querySelector('#target-name');
    this.targetLevel = document.querySelector('#target-level');
    this.targetHealthFill = document.querySelector('#target-health-fill');
    this.targetHealthText = document.querySelector('#target-health-text');
    this.xpFill = document.querySelector('#xp-fill');
    this.xpText = document.querySelector('#xp-text');
    this.jobLabel = document.querySelector('#job-label');
    this.jobFill = document.querySelector('#job-fill');
    this.jobText = document.querySelector('#job-text');
    this.goldText = document.querySelector('#gold-text');
    this.contextHintText = document.querySelector('#context-hint-text');
    this.meleeLevel = document.querySelector('#melee-level');
    this.rangedLevel = document.querySelector('#ranged-level');
    this.magicLevel = document.querySelector('#magic-level');
    this.sidePanel = document.querySelector('#side-panel');
    this.sidePanelTitle = document.querySelector('#side-panel-title');
    this.sidePanelContent = document.querySelector('#side-panel-content');
    this.dialogBackdrop = document.querySelector('#dialog-backdrop');
    this.dialogContent = document.querySelector('#dialog-content');
    this.toastContainer = document.querySelector('#toast-container');
    this.lootFeed = document.querySelector('#loot-feed');

    this.weaponButtons = [...document.querySelectorAll('.weapon-button')];
    this.bindStaticEvents();
  }

  bindGame(game) {
    this.game = game;
  }

  bindStaticEvents() {
    this.weaponButtons.forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        this.game?.selectWeapon(button.dataset.weapon);
      });
    });

    document.querySelector('#inventory-button').addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.openPanel('inventory');
    });
    document.querySelector('#stats-button').addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.openPanel('stats');
    });
    document.querySelector('#settings-button').addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.openPanel('settings');
    });
    document.querySelector('#side-panel-close').addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.closePanel();
    });
    document.querySelector('#dialog-close').addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.closeDialog();
    });
    this.dialogBackdrop.addEventListener('pointerdown', (event) => {
      if (event.target === this.dialogBackdrop) this.closeDialog();
    });

    this.sidePanelContent.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-action]');
      if (!actionButton || !this.game) return;
      const action = actionButton.dataset.action;
      const itemId = actionButton.dataset.item;
      if (action === 'use-item') {
        this.game.useInventoryItem(itemId);
      } else if (action === 'equip-item') {
        this.game.equipInventoryItem(itemId);
      } else if (action === 'save-name') {
        const input = this.sidePanelContent.querySelector('#name-input');
        this.game.setPlayerName(input?.value ?? '');
      } else if (action === 'manual-save') {
        this.game.saveNow();
        this.showToast('Progression sauvegardée.', 'level');
      } else if (action === 'reset-save') {
        if (window.confirm('Effacer définitivement cette progression locale ?')) {
          resetSave();
          window.location.reload();
        }
      }
      this.panelNeedsRender = true;
      this.renderActivePanel();
    });

    this.dialogContent.addEventListener('click', (event) => {
      const button = event.target.closest('[data-class-choice]');
      if (!button || !this.game) return;
      const className = button.dataset.classChoice;
      const message = `Le choix ${className} est permanent. Confirmer ?`;
      if (window.confirm(message)) {
        const chosen = this.game.chooseClass(className);
        if (chosen) this.closeDialog();
      }
    });
  }

  setLoadingProgress(value) {
    this.loadingProgress.style.width = `${Math.max(0, Math.min(100, value))}%`;
  }

  hideLoading() {
    this.loadingScreen.classList.add('hidden');
  }

  sync(game) {
    const player = game.player;
    if (!player) return;

    this.locationName.textContent = getLocationName(player.x, player.y);
    this.playerName.textContent = player.name;
    this.levelBadge.textContent = `Niv. ${player.level}`;
    this.playerAvatar.src = assetSrc(`./public/assets/characters/adventurer_${player.selectedWeapon}_down_0.png`);

    this.healthFill.style.width = `${percent(player.hp, player.maxHp)}%`;
    this.healthText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
    this.manaFill.style.width = `${percent(player.mp, player.maxMp)}%`;
    this.manaText.textContent = `${Math.floor(player.mp)}/${player.maxMp}`;

    const xpMax = characterXpRequired(player.level);
    this.xpFill.style.width = `${percent(player.xp, xpMax)}%`;
    this.xpText.textContent = `${Math.floor(player.xp)} / ${xpMax}`;

    const jobMax = jobXpRequired(player.jobLevel);
    this.jobLabel.textContent = `${player.className} ${player.jobLevel}`;
    this.jobFill.style.width = `${percent(player.jobXp, jobMax)}%`;
    this.jobText.textContent = `${Math.floor(player.jobXp)} / ${jobMax}`;
    this.goldText.textContent = String(player.gold);

    this.meleeLevel.textContent = `Corps niv. ${player.masteries.melee.level}`;
    this.rangedLevel.textContent = `Distance niv. ${player.masteries.ranged.level}`;
    this.magicLevel.textContent = `Magie niv. ${player.masteries.magic.level}`;

    this.weaponButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.weapon === player.selectedWeapon);
    });

    const target = game.getSelectedMonster();
    if (target?.alive) {
      const data = game.getMonsterData(target);
      this.targetCard.classList.remove('hidden');
      this.targetName.textContent = data.name;
      this.targetLevel.textContent = `Niv. ${data.level}`;
      this.targetHealthFill.style.width = `${percent(target.hp, target.maxHp)}%`;
      this.targetHealthText.textContent = `${Math.max(0, Math.ceil(target.hp))}/${target.maxHp} PV`;
      this.contextHintText.textContent = `Cible : ${data.name} — ${WEAPONS[player.selectedWeapon].label}`;
    } else {
      this.targetCard.classList.add('hidden');
      if (player.className === 'Aventurier' && player.jobLevel >= 20) {
        this.contextHintText.textContent = 'Les mentors vous attendent au village';
      } else if (player.dead) {
        this.contextHintText.textContent = 'Retour au village…';
      } else {
        this.contextHintText.textContent = 'Touchez une case pour vous déplacer';
      }
    }

    if (this.activePanel && this.panelNeedsRender) this.renderActivePanel();
  }

  openPanel(name) {
    this.activePanel = name;
    this.panelNeedsRender = true;
    this.sidePanel.classList.add('open');
    this.sidePanel.setAttribute('aria-hidden', 'false');
    this.renderActivePanel();
  }

  closePanel() {
    this.activePanel = null;
    this.sidePanel.classList.remove('open');
    this.sidePanel.setAttribute('aria-hidden', 'true');
  }

  renderActivePanel() {
    if (!this.game || !this.activePanel) return;
    this.panelNeedsRender = false;
    if (this.activePanel === 'inventory') this.renderInventory();
    else if (this.activePanel === 'stats') this.renderStats();
    else this.renderSettings();
  }

  renderInventory() {
    const player = this.game.player;
    this.sidePanelTitle.textContent = 'Inventaire';
    const entries = Object.entries(player.inventory)
      .filter(([, quantity]) => quantity > 0)
      .sort(([a], [b]) => (ITEMS[a]?.name ?? a).localeCompare(ITEMS[b]?.name ?? b));

    const equippedIds = new Set(Object.values(player.equipment).filter(Boolean));
    const list = entries.length
      ? entries.map(([itemId, quantity]) => {
        const item = ITEMS[itemId];
        if (!item) return '';
        const equipped = equippedIds.has(itemId);
        const action = item.type === 'consumable'
          ? `<button class="item-action" data-action="use-item" data-item="${itemId}">Utiliser</button>`
          : item.type === 'equipment'
            ? `<button class="item-action" data-action="equip-item" data-item="${itemId}" ${equipped ? 'disabled' : ''}>${equipped ? 'Équipé' : 'Équiper'}</button>`
            : `<span class="item-meta">x${quantity}</span>`;
        return `
          <article class="item-card ${equipped ? 'equipped' : ''}">
            <div>
              <h3>${escapeHtml(item.name)} ×${quantity}</h3>
              <small>${escapeHtml(item.description)}</small>
              <div class="item-meta">${rarityLabel(item)}${equipped ? ' · Équipé' : ''}</div>
            </div>
            ${action}
          </article>`;
      }).join('')
      : '<p>Aucun objet pour le moment.</p>';

    this.sidePanelContent.innerHTML = `
      <div class="panel-summary">
        <div class="summary-box"><small>Or</small><strong>${player.gold}</strong></div>
        <div class="summary-box"><small>Objets différents</small><strong>${entries.length}</strong></div>
      </div>
      <div class="inventory-list">${list}</div>`;
  }

  renderStats() {
    const player = this.game.player;
    const bonuses = getEquipmentBonuses(player);
    this.sidePanelTitle.textContent = 'Statistiques';

    const masteryCards = Object.entries(player.masteries).map(([key, mastery]) => {
      const required = masteryXpRequired(mastery.level);
      return `
        <article class="stat-card">
          <div class="stat-card-head">
            <span>${MASTERY_LABELS[key]}</span>
            <strong>Niv. ${mastery.level}</strong>
          </div>
          <div class="mini-progress"><span style="width:${percent(mastery.xp, required)}%"></span></div>
          <small>${Math.floor(mastery.xp)} / ${required} XP</small>
        </article>`;
    }).join('');

    this.sidePanelContent.innerHTML = `
      <div class="panel-summary">
        <div class="summary-box"><small>Niveau général</small><strong>${player.level}</strong></div>
        <div class="summary-box"><small>Vitesse</small><strong>${getPlayerSpeed(player)}</strong></div>
        <div class="summary-box"><small>Classe</small><strong>${escapeHtml(player.className)}</strong></div>
        <div class="summary-box"><small>Niveau de classe</small><strong>${player.jobLevel}</strong></div>
      </div>
      <div class="stats-grid">${masteryCards}</div>
      <div class="settings-card">
        <strong>Bonus d’équipement</strong>
        <p>Corps +${bonuses.meleePower} · Distance +${bonuses.rangedPower} · Magie +${bonuses.magicPower} · Défense +${bonuses.defensePower} · Vitesse +${bonuses.speed}</p>
        <small>Chaque niveau général gagné ajoute aussi +1 vitesse à partir de la base 100.</small>
      </div>`;
  }

  renderSettings() {
    const player = this.game.player;
    this.sidePanelTitle.textContent = 'Paramètres';
    const minutes = Math.floor(player.playtimeMs / 60000);
    this.sidePanelContent.innerHTML = `
      <div class="settings-card">
        <label>
          Nom du personnage
          <input id="name-input" maxlength="18" value="${escapeHtml(player.name)}" />
        </label>
        <div class="settings-actions">
          <button class="primary-button" data-action="save-name">Enregistrer le nom</button>
          <button class="secondary-button" data-action="manual-save">Sauvegarder</button>
        </div>
      </div>
      <div class="settings-card">
        <strong>Prototype Alpha</strong>
        <p>Temps de jeu local : ${minutes} min</p>
        <small>Cette version teste les déplacements sur grille, le combat, les maîtrises, les niveaux, les butins, l’inventaire et les mentors. La synchronisation MMO en ligne viendra avec le serveur autoritaire.</small>
      </div>
      <div class="settings-card">
        <strong>Zone dangereuse</strong>
        <p>Cette action efface la sauvegarde locale du navigateur.</p>
        <button class="danger-button" data-action="reset-save">Réinitialiser la progression</button>
      </div>`;
  }

  showToast(message, kind = '') {
    const element = document.createElement('div');
    element.className = `toast ${kind}`.trim();
    element.textContent = message;
    this.toastContainer.appendChild(element);
    window.setTimeout(() => element.remove(), 2900);
  }

  showLoot(message) {
    const element = document.createElement('div');
    element.className = 'loot-message';
    element.textContent = message;
    this.lootFeed.appendChild(element);
    window.setTimeout(() => element.remove(), 4200);
  }

  showInfoDialog(title, bodyHtml) {
    this.dialogContent.innerHTML = `<h2 id="dialog-title">${escapeHtml(title)}</h2>${bodyHtml}`;
    this.dialogBackdrop.classList.remove('hidden');
  }

  showMentorDialog(mentor = null) {
    const player = this.game.player;
    const eligible = player.className === 'Aventurier' && player.jobLevel >= 20;

    if (player.className !== 'Aventurier') {
      const future = player.className === 'Mage'
        ? 'Au niveau de classe 50, la voie du Nécromancien pourra s’ouvrir.'
        : 'Au niveau de classe 50, une évolution supérieure pourra s’ouvrir.';
      this.showInfoDialog('Une voie déjà choisie', `
        <p>Vous êtes <strong>${escapeHtml(player.className)}</strong>. Ce choix est permanent et vos maîtrises entraînées sont conservées.</p>
        <p>${future}</p>`);
      return;
    }

    if (!eligible) {
      this.showInfoDialog('Les trois mentors', `
        <p>Revenez lorsque votre niveau d’Aventurier atteindra <strong>20</strong>.</p>
        <p>Niveau actuel : <strong>${player.jobLevel}</strong>. Continuez à vaincre des monstres pour gagner de l’expérience de classe.</p>
        <div class="permanent-warning">Le choix de classe sera permanent. Toutes vos maîtrises déjà entraînées seront conservées.</div>`);
      return;
    }

    const classes = mentor?.className ? [mentor.className] : ['Épéiste', 'Archer', 'Mage'];
    const mentorInfo = mentor?.className ? CLASS_MENTOR[mentor.className] : null;
    const header = mentorInfo
      ? `<div class="mentor-heading"><img src="${assetSrc(`./public/assets/characters/${mentorInfo.sprite}.png`)}" alt=""><div><h2 id="dialog-title">${escapeHtml(mentorInfo.name)}</h2><p>${escapeHtml(CLASS_DEFINITIONS[mentor.className].description)}</p></div></div>`
      : '<h2 id="dialog-title">Choisissez votre voie</h2><p>Votre niveau d’Aventurier sera remplacé par la nouvelle classe au niveau 1.</p>';

    const cards = classes.map((className) => {
      const def = CLASS_DEFINITIONS[className];
      return `
        <article class="class-card">
          <h3>${escapeHtml(className)}</h3>
          <p>${escapeHtml(def.description)} Bonus de spécialité : +12 %.</p>
          <button class="class-choice-button" data-class-choice="${escapeHtml(className)}">Choisir ${escapeHtml(className)}</button>
        </article>`;
    }).join('');

    this.dialogContent.innerHTML = `
      ${header}
      <div class="permanent-warning">Décision permanente. Niveau de classe remis à 1. Niveau général, objets et maîtrises conservés.</div>
      <div class="class-grid">${cards}</div>`;
    this.dialogBackdrop.classList.remove('hidden');
  }

  closeDialog() {
    this.dialogBackdrop.classList.add('hidden');
  }

  markPanelDirty() {
    this.panelNeedsRender = true;
  }
}
