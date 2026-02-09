var platform = typeof browser === 'undefined' ? chrome : browser;
var userEmail = null;
var toolLoaded = false;
var emailModalController = null;

function storageGet(keys) {
  return new Promise(resolve => platform.storage.sync.get(keys, resolve));
}

function storageSet(values) {
  return new Promise(resolve => platform.storage.sync.set(values, resolve));
}

function storageRemove(keys) {
  return new Promise(resolve => platform.storage.sync.remove(keys, resolve));
}

function getEmailModalController() {
  if (!emailModalController) emailModalController = createEmailModal();
  return emailModalController;
}

function createEmailModal() {
  const hostId = 'iacopi-email-access-modal';
  let host = document.getElementById(hostId);

  if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    document.documentElement.appendChild(host);
  }

  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        pointer-events: none;
        font-family: 'Poppins', 'Montserrat', sans-serif;
      }
      .iacopi-overlay {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(10, 15, 24, 0.55);
        backdrop-filter: blur(6px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 180ms ease;
      }
      .iacopi-overlay[data-open='true'] {
        opacity: 1;
        pointer-events: all;
      }
      .iacopi-card {
        width: min(460px, calc(100vw - 32px));
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 22px 60px rgba(15, 23, 42, 0.35);
        border: 1px solid rgba(15, 23, 42, 0.08);
        overflow: hidden;
        color: #0f172a;
      }
      .iacopi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        background: linear-gradient(135deg, #0f766e, #1a8f82);
        color: #f8fafc;
      }
      .iacopi-title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }
      .iacopi-close {
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
      }
      .iacopi-body {
        padding: 20px;
        display: grid;
        gap: 12px;
      }
      .iacopi-message {
        margin: 0;
        color: #475569;
        line-height: 1.4;
        font-size: 14px;
      }
      .iacopi-label {
        font-size: 12px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 6px;
      }
      .iacopi-input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid #cbd5f5;
        font-size: 14px;
        outline: none;
      }
      .iacopi-input:focus {
        border-color: #0f766e;
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.18);
      }
      .iacopi-actions {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
      }
      .iacopi-button {
        border: none;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .iacopi-primary {
        background: #0f766e;
        color: #f8fafc;
      }
      .iacopi-danger {
        background: transparent;
        color: #b91c1c;
        border: 1px solid rgba(185, 28, 28, 0.2);
      }
      .iacopi-ghost {
        background: transparent;
        color: #0f766e;
        border: 1px solid rgba(15, 118, 110, 0.25);
      }
    </style>
    <div class="iacopi-overlay" data-open="false">
      <form class="iacopi-card" autocomplete="off">
        <div class="iacopi-header">
          <h2 class="iacopi-title" data-title></h2>
          <button class="iacopi-close" type="button" data-close>Fechar</button>
        </div>
        <div class="iacopi-body">
          <p class="iacopi-message" data-message></p>
          <div>
            <div class="iacopi-label" data-label></div>
            <input class="iacopi-input" data-input type="email" />
          </div>
          <div class="iacopi-actions">
            <button class="iacopi-button iacopi-primary" type="submit" data-confirm></button>
            <button class="iacopi-button iacopi-danger" type="button" data-remove></button>
            <button class="iacopi-button iacopi-ghost" type="button" data-cancel></button>
          </div>
        </div>
      </form>
    </div>
  `;

  const overlay = shadow.querySelector('.iacopi-overlay');
  const form = shadow.querySelector('form');
  const title = shadow.querySelector('[data-title]');
  const message = shadow.querySelector('[data-message]');
  const label = shadow.querySelector('[data-label]');
  const input = shadow.querySelector('[data-input]');
  const confirmButton = shadow.querySelector('[data-confirm]');
  const removeButton = shadow.querySelector('[data-remove]');
  const cancelButton = shadow.querySelector('[data-cancel]');
  const closeButton = shadow.querySelector('[data-close]');

  let resolveRequest = null;
  let previousOverflow = null;
  let allowCancel = true;

  const close = result => {
    overlay.setAttribute('data-open', 'false');
    if (previousOverflow !== null) {
      document.documentElement.style.overflow = previousOverflow;
      previousOverflow = null;
    }

    if (resolveRequest) {
      const resolve = resolveRequest;
      resolveRequest = null;
      resolve(result);
    }
  };

  const open = (options = {}) => {
    if (resolveRequest) {
      resolveRequest({ action: 'cancel' });
      resolveRequest = null;
    }

    const {
      titleText = 'Acesso Clona Fácil',
      messageText = 'Informe o e-mail para validar seu acesso.',
      labelText = 'E-mail',
      placeholder = 'seuemail@dominio.com',
      value = '',
      confirmLabel = 'Salvar',
      removeLabel = 'Remover',
      cancelLabel = 'Fechar',
      showRemove = false,
      showCancel = true,
    } = options;

    allowCancel = !!showCancel;
    title.textContent = titleText;
    message.textContent = messageText;
    label.textContent = labelText;
    input.placeholder = placeholder;
    input.value = value || '';
    confirmButton.textContent = confirmLabel;
    removeButton.textContent = removeLabel;
    cancelButton.textContent = cancelLabel;
    removeButton.style.display = showRemove ? 'inline-block' : 'none';
    cancelButton.style.display = showCancel ? 'inline-block' : 'none';
    closeButton.style.display = showCancel ? 'inline-block' : 'none';

    overlay.setAttribute('data-open', 'true');
    if (previousOverflow === null) {
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    }

    input.focus();
    input.select();

    return new Promise(resolve => {
      resolveRequest = resolve;
    });
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    close({ action: 'save', email: input.value.trim() });
  });

  removeButton.addEventListener('click', () => close({ action: 'remove' }));
  cancelButton.addEventListener('click', () => close({ action: 'cancel' }));
  closeButton.addEventListener('click', () => {
    if (allowCancel) close({ action: 'cancel' });
  });
  overlay.addEventListener('click', event => {
    if (event.target === overlay && allowCancel) close({ action: 'cancel' });
  });

  document.addEventListener('keydown', event => {
    if (overlay.getAttribute('data-open') !== 'true') return;
    if (event.key === 'Escape' && allowCancel) {
      event.preventDefault();
      close({ action: 'cancel' });
    }
  });

  return { open };
}

async function openAccessEmailModal(options = {}) {
  const modal = getEmailModalController();
  return modal.open(options);
}

async function collectAndValidateEmail(options = {}) {
  const {
    titleText,
    messageText,
    allowRemove,
    allowCancel,
    initialEmail,
  } = options;

  let currentEmail = initialEmail || '';

  while (true) {
    const result = await openAccessEmailModal({
      titleText,
      messageText,
      labelText: 'E-mail',
      value: currentEmail,
      confirmLabel: 'Salvar',
      removeLabel: 'Remover',
      cancelLabel: allowCancel ? 'Fechar' : 'Cancelar',
      showRemove: !!allowRemove,
      showCancel: !!allowCancel,
    });

    if (!result || result.action === 'cancel') return { action: 'cancel' };

    if (result.action === 'remove') {
      await storageRemove(['userEmail']);
      userEmail = null;
      return { action: 'remove' };
    }

    const email = (result.email || '').trim();
    if (!email) {
      alert('Informe um e-mail valido.');
      continue;
    }

    const hasAccess = await checkEmailAccess(email);
    if (!hasAccess) {
      alert('Desculpe, voce nao tem acesso a esta ferramenta.');
      currentEmail = email;
      continue;
    }

    await storageSet({ userEmail: email });
    userEmail = email;
    return { action: 'save', email };
  }
}

async function openEmailSettingsModal() {
  const state = await storageGet(['userEmail']);
  userEmail = state.userEmail || null;

  const result = await collectAndValidateEmail({
    titleText: 'E-mail de acesso',
    messageText: 'Atualize seu e-mail de acesso ou remova para resetar a validacao.',
    allowRemove: !!userEmail,
    allowCancel: true,
    initialEmail: userEmail || '',
  });

  if (result.action === 'save') {
    alert('E-mail atualizado com sucesso.');
    if (!toolLoaded) loadTool();
  } else if (result.action === 'remove') {
    alert('E-mail removido com sucesso.');
  }
}

async function bootstrapAccess() {
  const state = await storageGet(['userEmail']);

  if (!state.userEmail) {
    const result = await collectAndValidateEmail({
      titleText: 'Acesso Clona Fácil',
      messageText: 'Por favor, insira seu e-mail para habilitar a extensao.',
      allowRemove: false,
      allowCancel: false,
      initialEmail: '',
    });

    if (result.action === 'save') loadTool();
    return;
  }

  userEmail = state.userEmail;
  console.log('User email currently is', userEmail);

  const hasAccess = await checkEmailAccess(userEmail);
  if (hasAccess) {
    loadTool();
    return;
  }

  alert('Seu e-mail atual nao possui acesso. Informe outro e-mail valido.');
  const fallbackResult = await collectAndValidateEmail({
    titleText: 'Atualizar e-mail de acesso',
    messageText: 'O e-mail salvo nao tem acesso. Informe um novo e-mail.',
    allowRemove: true,
    allowCancel: false,
    initialEmail: userEmail,
  });

  if (fallbackResult.action === 'save') loadTool();
}

window.addEventListener('visbug:open-email-modal', () => {
  openEmailSettingsModal().catch(error => {
    console.error('Erro ao abrir modal de e-mail:', error);
  });
});

function loadTool() {
  if (toolLoaded) return;
  toolLoaded = true;

  const script = document.createElement('script');
  script.type = 'module';
  script.src = platform.runtime.getURL('toolbar/bundle.min.js');
  document.body.appendChild(script);

  const visbug = document.createElement('vis-bug');
  const src_path = platform.runtime.getURL('tuts/guides.gif');
  visbug.setAttribute('tutsBaseURL', src_path.slice(0, src_path.lastIndexOf('/')));
  document.body.prepend(visbug);

  platform.runtime.onMessage.addListener(request => {
    if (request.action === 'COLOR_MODE')
      visbug.setAttribute('color-mode', request.params.mode);
    else if (request.action === 'COLOR_SCHEME')
      visbug.setAttribute('color-scheme', request.params.mode);
  });
}

function checkEmailAccess(email) {
  const apiUrl = 'https://api-aicopi.zapime.com.br/verify-email';
  const requestBody = { email: email };

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => response.status === 200)
    .catch(error => {
      console.error('Erro ao fazer a chamada de API:', error);
      return false;
    });
}

bootstrapAccess().catch(error => {
  console.error('Erro ao inicializar o acesso por e-mail:', error);
});
