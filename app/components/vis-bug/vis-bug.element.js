import $          from 'blingblingjs'
import hotkeys    from 'hotkeys-js'

import {
  Handles, Handle, Label, Overlay, Gridlines, Corners,
  Hotkeys, Metatip, Ally, Distance, BoxModel, Grip
} from '../'

import {
  Selectable, Moveable, Padding, Margin, EditText, Font,
  Flex, Search, ColorPicker, BoxShadow, HueShift, MetaTip,
  Guides, Screenshot, Position, Accessibility, draggable
} from '../../features/'

import {
  VisBugStyles,
  VisBugLightStyles,
  VisBugDarkStyles
} from '../styles.store'

import { VisBugModel }            from './model'
import * as Icons                 from './vis-bug.icons'
import { provideSelectorEngine }  from '../../features/search'
import { PluginRegistry }         from '../../plugins/_registry'
import {
  metaKey,
  isPolyfilledCE,
  constructibleStylesheetSupport,
  schemeRule
} from '../../utilities/'

export default class VisBug extends HTMLElement {
  constructor() {
    super();
    this.iframeContent = null; // Armazena o conteúdo do iframe
    this.globalPageContent = '',
    this.sitename = '',
    this.siteDomain = '',
    this.pixelMeta = '',
    this.pixelGoogle = '',
    this.gtmCode = '',
    this.Cookie = '',
    this.originalContent = document.documentElement.innerHTML;
    this.toolbar_model = VisBugModel;
    this.listSubdomains = [];
    this.$shadow = this.attachShadow({ mode: 'closed' });
    this.applyScheme = schemeRule(
      this.$shadow,
      VisBugStyles, VisBugLightStyles, VisBugDarkStyles
    );
  }

  switchView() {
    debugger
    const e = document.getElementById("editorFrame");
    if (e) {
      // Sair da visualização móvel e aplicar alterações ao documento original
      this.updateOriginalContentWithIframeContent(e);
      e.parentNode.remove();
      
      // Remover o botão de sair da visualização móvel
      const exitButton = document.getElementById("exitMobileViewButton");
      if (exitButton) {
        exitButton.remove();
      }
      
      // Atualizar o conteúdo do documento original
      const t = (new DOMParser).parseFromString(this.iframeContent, "text/html");
      document.documentElement.innerHTML = t.documentElement.innerHTML;
      
      // Mostrar todos os elementos do corpo exceto aqueles com tag name 'vis-bug'
      Array.from(document.body.children).forEach((el) => {
        if ("vis-bug" !== el.tagName.toLowerCase()) {
          el.style.display = "";
        }
      });
    } else {
      // Entrar na visualização móvel
      debugger
      const div = document.createElement("div");
      div.id = "mobileView";
      div.style.position = "fixed";
      div.style.top = "50%";
      div.style.left = "50%";
      div.style.transform = "translate(-50%, -50%)";
      div.style.width = "375px";
      div.style.height = "615px";
      div.style.overflow = "auto";

      const e = document.createElement("iframe");
      e.id = "editorFrame";
      e.style.width = "100%";
      e.style.height = "99%";
      
      const t = this.iframeContent || document.documentElement.outerHTML;
      e.srcdoc = t;
      div.appendChild(e);
      document.body.appendChild(div);
      
      const exitButton = document.createElement("button");
      exitButton.id = "exitMobileViewButton";
      exitButton.textContent = "Desktop View";
      exitButton.style.position = "fixed";
      exitButton.style.top = "31px";
      exitButton.style.right = "22vw";
      exitButton.style.padding = "10px 20px";
      exitButton.style.backgroundColor = "#FF9C08";
      exitButton.style.borderRadius = "5px";
      exitButton.style.color = "white";
      exitButton.style.borderStyle = "none";
      exitButton.addEventListener("click", () => this.switchView());
      document.body.appendChild(exitButton);

      Array.from(document.body.children).forEach((el) => {
        console.log(el.tagName.toLowerCase());
        if (el.id !== "mobileView" && el.id !== "exitMobileViewButton") {
          el.style.display = "none";
        }
      });

      e.onload = () => {
        const t = e.contentDocument || e.contentWindow.document;
        //após o carregamento do iframe, remover o botão que ativa a visualização móvel        <li data-tool="switchView" data-key="switchView" class="mobile">

        const switchViewButton = document.documentElement.outerHTML;

        debugger
        if (switchViewButton) {
          switchViewButton.remove();
        }

        const r = document.createElement("style");
        r.textContent = `
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `;
        t.head.appendChild(r);
      };
    }
  }

  updateOriginalContentWithIframeContent(iframe) {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const newContent = iframeDocument.documentElement.innerHTML;
    this.iframeContent = newContent;

    // Atualizar o documento original com as mudanças feitas no iframe
    const originalDocument = (new DOMParser).parseFromString(newContent, "text/html");
    document.documentElement.innerHTML = originalDocument.documentElement.innerHTML;
  }

  createMobileView() {
    let self = this;
    const e = document.createElement("div");
    e.id = "mobileView";
    e.style.width = "375px"; // Defina a largura para simular um dispositivo móvel
    e.style.height = "100vh";
    e.style.margin = "0 auto";
    e.style.border = "1px solid black";
    e.style.overflowY = "scroll";
    e.style.position = "relative";
    e.style.background = "white";
    e.style.transformOrigin = "top left";
    e.style.transform = "scale(1.0)";
    e.style.scrollbarWidth = "thin"; // Para navegadores que suportam (ex: Firefox)
    e.style.scrollbarColor = "#888 #f1f1f1"; // Cor do thumb e track (Firefox)
    e.style.msOverflowStyle = "-ms-autohiding-scrollbar"; // Para Microsoft Edge
    // Para Webkit (Chrome, Safari, etc.)
    e.style.webkitScrollbar = {
      width: '4px'
    };
    e.style.webkitScrollbarTrack = {
      background: '#f1f1f1'
    };
    e.style.webkitScrollbarThumb = {
      background: '#888',
      borderRadius: '2px'
    };
    e.style.webkitScrollbarThumbHover = {
      background: '#555'
    };
        
  
    e.innerHTML = self.originalContent;
  
    document.body.appendChild(e);
  
    Array.from(document.body.children).forEach((el) => {
      if ("vis-bug" !== el.tagName.toLowerCase() && el !== e) {
        el.style.display = "none";
      }
    });
  
    const r = document.createElement("style");
    r.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        width: 100%;
        height: 100%;
      }
      img, video {
        max-width: 100%;
        height: auto;
      }
      iframe {
        max-width: 100%;
      }
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      [data-tool="download"] {
        display: none;
      }
      /* Adiciona uma meta tag viewport para simular dispositivo móvel */
      @media (max-width: 375px) {
        body {
          overflow-x: hidden;
        }

        #mobileView {
        scrollbar-width: thin !important;
        }
      }
    `;
    e.appendChild(r);
  }

 switchToNormalView() {
  debugger
  let self = this;
  const e = document.getElementById("mobileView");
  if (e) {
      // If mobile view exists, switch to desktop view
      e.remove();

      // Restore the original body content
      document.body.innerHTML = self.originalContent;

      // Show all body children
      Array.from(document.body.children).forEach((el) => {
          el.style.display = "";
      });
  }
}

// This function will be used to track changes in the iframe and apply them to the mobile media query
applyChangesToMobileMediaQuery() {
  const e = document.getElementById("mobileView");

  if (e) {
    const iframeStyles = e.style.cssText;

    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @media (max-width: 375px) {
        ${iframeStyles}
      }
    `;

    document.head.appendChild(styleElement);
  }
}
  static get observedAttributes() {
    return ['color-scheme']
  }

  async connectedCallback() {
    this._tutsBaseURL = this.getAttribute('tutsBaseURL') || 'tuts'

    this.setup()

    this.selectorEngine = Selectable(this)
    this.colorPicker    = ColorPicker(this.$shadow, this.selectorEngine)

    provideSelectorEngine(this.selectorEngine)

    this.toolSelected($('[data-tool="guides"]', this.$shadow)[0])
  }


  disconnectedCallback() {
    // Tratar is not a function
    if (typeof this.deactivate_feature === 'function') {
      this.deactivate_feature()
    }
    this.cleanup()
    this.selectorEngine.disconnect()
    hotkeys.unbind(
      Object.keys(this.toolbar_model).reduce((events, key) =>
        events += ',' + key, ''))
    hotkeys.unbind(`${metaKey}+/`)

    if (this._defaultHotkeysFilter) {
      hotkeys.filter = this._defaultHotkeysFilter
      this._defaultHotkeysFilter = null
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'color-scheme')
      this.applyScheme(newValue)
  }

  setup() {
    this.$shadow.innerHTML = this.render();

    this.setupPuterModal();
    this.setupInputModal();

    const switchViewButton = this.$shadow.querySelector('[data-tool="switchViewtodesktop"]');
    if (switchViewButton) {
      switchViewButton.addEventListener('click', () => this.switchView());
    }
  
    this.hasAttribute('color-mode')
      ? this.getAttribute('color-mode')
      : this.setAttribute('color-mode', 'hex');
  
    this.hasAttribute('color-scheme')
      ? this.getAttribute('color-scheme')
      : this.setAttribute('color-scheme', 'auto');
  
    this.setAttribute('popover', 'manual');
    this.showPopover && this.showPopover();
  
    const main_ol = this.$shadow.querySelector('ol:not([colors])');
    const buttonPieces = $('li[data-tool], li[data-tool] *', main_ol);
  
    this.inputFocused = false;

    this._defaultHotkeysFilter = hotkeys.filter;
    hotkeys.filter = event => {
      if (this.shouldIgnoreShortcuts(event)) return false;
      return this._defaultHotkeysFilter
        ? this._defaultHotkeysFilter.call(hotkeys, event)
        : true;
    };
    
    const clickEvent = (e) => {
      const target = e.currentTarget || e.target;
      const toolButton = target.closest('[data-tool]');
      if (toolButton) this.toolSelected(toolButton) && e.stopPropagation();
    };

    Array.from(buttonPieces).forEach(toolButton => {
      draggable({
        el: this,
        surface: toolButton,
        cursor: 'pointer',
        clickEvent: clickEvent,
        // // Add a condition to prevent dragging if text is being selected
        // dragCondition: (event) => {
        //   return !this.selectorEngine.isActive();
        // }
      });
    });
  
    draggable({
      el: this,
      surface: main_ol,
      cursor: 'grab',
      // Prevent dragging main_ol if text is being selected
      // dragCondition: (event) => {
      //   return !this.inputFocused && !this.selectorEngine.isActive();
      // }
    });
  
  
    // const linkInput = this.$shadow.querySelector('#link-input');
    // if (linkInput) {
    //   linkInput.addEventListener('focus', () => {
    //     this.inputFocused = true;
    //   });
    //   linkInput.addEventListener('blur', () => {
    //     this.inputFocused = false;
    //   });
    //   linkInput.addEventListener('paste', (e) => {
    //     e.preventDefault();
    //     const text = (e.clipboardData || window.clipboardData).getData('text');
    //     document.execCommand('insertText', false, text);
    //   });
    // }
  
    Object.entries(this.toolbar_model).forEach(([key, value]) =>
      hotkeys(key, e => {
        if (this.shouldIgnoreShortcuts(e)) return;
        e.preventDefault();
        this.toolSelected(
          $(`[data-tool="${value.tool}"]`, this.$shadow)[0]
        );
      })
    );
  
    hotkeys(`${metaKey}+/,${metaKey}+.`, e => {
      if (this.shouldIgnoreShortcuts(e)) return;
      this.$shadow.host.style.display =
        this.$shadow.host.style.display === 'none'
          ? 'block'
          : 'none';
    });
  }

  isEditableElement(element) {
    if (!element) return false;
    const tagName = element.tagName;
    if (!tagName) return false;

    if (element.isContentEditable) return true;

    const inputTypesToIgnore = ['checkbox', 'radio', 'range', 'button', 'file', 'reset', 'submit', 'color'];
    if (tagName === 'INPUT') return !inputTypesToIgnore.includes(element.type);
    if (tagName === 'TEXTAREA' || tagName === 'SELECT') return true;

    return false;
  }

  isPuterModalOpen() {
    const modal = this.$shadow.querySelector('#puter-modal');
    return !!modal && modal.style.display !== 'none';
  }

  isInputModalOpen() {
    const modal = this.$shadow.querySelector('#visbug-input-modal');
    return !!modal && modal.style.display !== 'none';
  }

  getDeepActiveElement(root = document) {
    let activeElement = root.activeElement;

    while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement;
  }

  isExternalAccessModalOpen() {
    const modalHostIds = ['iacopi-input-modal', 'iacopi-email-access-modal'];

    return modalHostIds.some(hostId => {
      const host = document.getElementById(hostId);
      if (!host || !host.shadowRoot) return false;
      return !!host.shadowRoot.querySelector('[data-open="true"]');
    });
  }

  shouldIgnoreShortcuts(event) {
    const shadowActiveElement = this.$shadow.activeElement;
    const target = event && event.target;
    const activeElement = document.activeElement;
    const deepActiveElement = this.getDeepActiveElement(document);

    if (this.isEditableElement(target)) return true;
    if (this.isEditableElement(activeElement)) return true;
    if (this.isEditableElement(shadowActiveElement)) return true;
    if (this.isEditableElement(deepActiveElement)) return true;

    if (this.isPuterModalOpen()) return true;
    if (this.isInputModalOpen()) return true;
    if (this.isExternalAccessModalOpen()) return true;

    return false;
  }
  

  cleanup() {
    this.hidePopover && this.hidePopover()

    Array.from(document.body.children)
      .filter(node => node.nodeName.includes('VISBUG'))
      .forEach(el => el.remove())

    this.teardown()

    document.querySelectorAll('[data-pseudo-select=true]')
      .forEach(el =>
        el.removeAttribute('data-pseudo-select'))
  }


  toolSelected(el) {
    if (el === null || el === undefined) return
    if (typeof el === 'string')
      el = $(`[data-tool="${el}"]`, this.$shadow)[0]

    if (this.active_tool && this.active_tool.dataset.tool === el.dataset.tool) return

    if (this.active_tool) {
      this.active_tool.attr('data-active', null)
      if (typeof this.deactivate_feature === 'function') {
        this.deactivate_feature();
      }
    }

    el.attr('data-active', true)
    this.active_tool = el
    if (el.dataset.tool === 'download1') {
      this.downloadHtmlWithStylesAndScripts();
    } else if (el.dataset.tool === 'link') {
      const linkContainer = this.$shadow.querySelector('.link');
      linkContainer.style.display = 'block';
    } else if (el.dataset.tool === 'text') {
      el.style.userSelect = 'all';
      this[el.dataset.tool]()
    } else {
      this[el.dataset.tool]()
    }
  }

  addPixelToHeader(pixelCode, clone) {

    console.log('Código do pixel adicionado:', pixelCode);
  }

  removeFacebookPixelsFromHeader(clone) {
  // Função para remover tags script do pixel do Facebook e scripts que contenham !function(f,b,e,v,n,t,s) ou fbq
  const scripts = clone.getElementsByTagName('script');
  const scriptsArray = Array.from(scripts);
  const scriptsToRemove = scriptsArray.filter(script => {
    const scriptContent = script.innerHTML;
    const scriptSrc = script.src;
    return scriptContent.includes('connect.facebook.net') ||
           scriptContent.includes('connect.facebook.net/signals/config') ||
           scriptContent.includes('fbq') ||
           scriptContent.includes('fbq("set"') ||
           scriptContent.includes('!function(b,e,f,g,a,c,d)') ||
           scriptContent.includes('!function(f,b,e,v,n,t,s)') ||
           scriptContent.includes('www.googletagmanager.com') ||
           scriptContent.includes('pixelId') || 
           scriptContent.includes('PageView') || 
           scriptContent.includes('facebook') ||
           scriptContent.includes('gtag') ||
           scriptContent.includes('bundle.min.js') ||
           scriptContent.includes('chrome-extension') ||
           scriptContent.includes('clarity') ||
           scriptSrc.includes('connect.facebook.net') ||
           scriptSrc.includes('www.googletagmanager.com') ||
           scriptSrc.includes('www.google-analytics.com') ||
           scriptSrc.includes('google') ||
           scriptSrc.includes('clarity');
  });

  scriptsToRemove.forEach(script => {
    script.parentNode.removeChild(script);
  });

  // Função para remover tags noscript do pixel do Facebook
  const noscripts = clone.getElementsByTagName('noscript');
  const noscriptsArray = Array.from(noscripts);
  const facebookPixelNoscripts = noscriptsArray.filter(noscript => {
    return noscript.innerHTML.includes('www.facebook.com/tr');
  });

  facebookPixelNoscripts.forEach(noscript => {
    noscript.parentNode.removeChild(noscript);
  });
  }

  removeCookies(clone) {
    // Obtenha todos os iframes na página
    const iframes = clone.getElementsByTagName('iframe');
  
    // Converta a coleção HTML para um array para usar métodos de array
    const iframesArray = Array.from(iframes);
  
    // Filtre os iframes que têm o atributo frameborder="0"
    const iframesToRemove = iframesArray.filter(iframe => {
      return iframe.getAttribute('frameborder') === '0';
    });
  
    // Remova cada um dos iframes encontrados
    iframesToRemove.forEach(iframe => {
      iframe.parentNode.removeChild(iframe);
    });
  
    console.log(`${iframesToRemove.length} iframe(s) with frameborder="0" removed.`);
  }
  
  changeImage() {
    const images = document.querySelectorAll('img, picture img');
    
    if (images.length === 0) {
      console.log('Nenhuma imagem encontrada.');
      return;
    }

    images.forEach(img => {
      console.log('Adicionando evento de clique à imagem:', img);
      img.addEventListener('click', (e) => {
        console.log('Imagem clicada:', img);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageData = event.target.result;
            img.src = imageData;
          };
          reader.readAsDataURL(file);
        });

        input.click(); // Abre a janela de seleção de arquivo
      });
    });
  }

  render() {
    return `
      <visbug-hotkeys></visbug-hotkeys>
      <ol constructible-support="${constructibleStylesheetSupport ? 'false':'true'}">
        ${Object.entries(this.toolbar_model).reduce((list, [key, tool]) => `
          ${list}
          <li aria-label="${tool.label} Tool" aria-description="${tool.description}" aria-hotkey="${key}" data-tool="${tool.tool}" data-active="${key == 'g'}">
            ${tool.icon}
            ${this.demoTip({key, ...tool})}
          </li>
        `,'')}
      </li>
      <li data-tool="switchView" data-key="switchView" id="sumir" class="mobile">
        ${Icons.mobile_device}
      </li>
      <li data-tool="emailAccess" aria-label="Configurar email" aria-description="Alterar ou remover e-mail de acesso">
        ${Icons.email}
      </li>
      <!-- <li data-tool="link" aria-label="Change Link" aria-description="Change the link of an element">
        ${Icons.link}
        <div class="link" style="display: inline-block">
          <input type="text" id="link-input" style="cursor-none" placeholder="Novo URL">
          <button id="save-link" style="display: inline-block;">Salvar</button>
          <span>Atualizado</span>
          </div> -->
      </li>
        <li class="color" id="foreground" aria-label="Text" aria-description="Change the text color">
          <input type="color">
          ${Icons.color_text}
        </li>
        <li class="color" id="background" aria-label="Background or Fill" aria-description="Change the background color or fill of svg">
          <input type="color">
          ${Icons.color_background}
        </li>
        <li class="color" id="border" aria-label="Border or Stroke" aria-description="Change the border color or stroke of svg">
          <input type="color">
          ${Icons.border_icon}
        </li>
      </ol>
      <style>
        #puter-modal {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: none;
          font-family: 'Poppins', 'Montserrat', sans-serif;
        }
        #puter-modal .puter-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(10, 15, 24, 0.55);
          backdrop-filter: blur(6px);
        }
        #puter-modal .puter-card {
          position: relative;
          margin: 6vh auto;
          width: min(520px, calc(100vw - 32px));
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.35);
          border: 1px solid rgba(15, 23, 42, 0.08);
          overflow: hidden;
          color: #0f172a;
        }
        #puter-modal .puter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: linear-gradient(135deg, #0f766e, #1a8f82);
          color: #f8fafc;
        }
        #puter-modal .puter-title {
          font-size: 18px;
          font-weight: 700;
        }
        #puter-modal .puter-close {
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        #puter-modal .puter-body {
          padding: 20px;
          display: grid;
          gap: 16px;
        }
        #puter-modal .puter-section {
          display: grid;
          gap: 10px;
        }
        #puter-modal .puter-section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
        }
        #puter-modal .puter-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          align-items: center;
        }
        #puter-modal select,
        #puter-modal input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5f5;
          font-size: 14px;
          outline: none;
        }
        #puter-modal select:focus,
        #puter-modal input:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.18);
        }
        #puter-modal button {
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        #puter-modal #puter-auth-button,
        #puter-modal #puter-create-domain {
          background: #0f766e;
          color: #f8fafc;
        }
        #puter-modal #puter-switch-account {
          background: transparent;
          color: #64748b;
          border: 1px solid #cbd5f5;
        }
        #puter-modal #puter-switch-account:hover {
          border-color: #475569;
          color: #475569;
        }
        #puter-modal #puter-publish {
          background: #2563eb;
          color: #f8fafc;
        }
        #puter-modal #puter-site-url {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
        }
        #puter-modal #puter-status {
          font-size: 12px;
          color: #64748b;
        }
        #puter-modal #puter-status[data-status='error'] {
          color: #b91c1c;
        }
        #puter-modal #puter-status[data-status='success'] {
          color: #0f766e;
        }
        #visbug-input-modal {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: none;
          font-family: 'Poppins', 'Montserrat', sans-serif;
        }
        #visbug-input-modal .visbug-input-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(10, 15, 24, 0.55);
          backdrop-filter: blur(6px);
        }
        #visbug-input-modal .visbug-input-card {
          position: relative;
          margin: 8vh auto;
          width: min(460px, calc(100vw - 32px));
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.35);
          border: 1px solid rgba(15, 23, 42, 0.08);
          overflow: hidden;
          color: #0f172a;
        }
        #visbug-input-modal .visbug-input-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: linear-gradient(135deg, #0f766e, #1a8f82);
          color: #f8fafc;
        }
        #visbug-input-modal .visbug-input-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }
        #visbug-input-modal .visbug-input-close {
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }
        #visbug-input-modal .visbug-input-body {
          padding: 20px;
          display: grid;
          gap: 12px;
        }
        #visbug-input-modal .visbug-input-message {
          margin: 0;
          color: #475569;
          line-height: 1.4;
          font-size: 14px;
        }
        #visbug-input-modal .visbug-input-label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }
        #visbug-input-modal .visbug-input-field {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5f5;
          font-size: 14px;
          outline: none;
        }
        #visbug-input-modal .visbug-input-field:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.18);
        }
        #visbug-input-modal .visbug-input-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }
        #visbug-input-modal .visbug-input-confirm {
          background: #0f766e;
          color: #f8fafc;
        }
        #visbug-input-modal .visbug-input-cancel {
          background: transparent;
          color: #0f766e;
          border: 1px solid rgba(15, 118, 110, 0.25);
        }
      </style>
      <div id="puter-modal">
        <div class="puter-backdrop" data-puter-backdrop></div>
        <div class="puter-card">
          <div class="puter-header">
            <div class="puter-title">Publicar no Puter</div>
            <button id="puter-close" class="puter-close" type="button">Fechar</button>
          </div>
          <div class="puter-body">
            <div class="puter-section">
              <div class="puter-section-title">Conta Puter</div>
              <div class="puter-row">
                <div id="puter-auth-status">Desconectado</div>
                <button id="puter-auth-button" type="button">Conectar com Puter</button>
                <button id="puter-switch-account" type="button" style="display: none;">Trocar conta</button>
              </div>
            </div>
            <div class="puter-section">
              <div class="puter-section-title">Dominios</div>
              <select id="puter-domain-select"></select>
              <div class="puter-row">
                <input id="puter-domain-input" type="text" placeholder="meusite" />
                <button id="puter-create-domain" type="button">Criar dominio</button>
              </div>
            </div>
            <div class="puter-section">
              <button id="puter-publish" type="button">Publicar</button>
              <a id="puter-site-url" href="#" target="_blank" rel="noopener">Abrir site</a>
            </div>
            <div id="puter-status"></div>
          </div>
        </div>
      </div>
      <div id="visbug-input-modal">
        <div class="visbug-input-backdrop" data-input-backdrop></div>
        <form class="visbug-input-card" data-input-form autocomplete="off">
          <div class="visbug-input-header">
            <h2 class="visbug-input-title" data-input-title>Atualizar conteudo</h2>
            <button class="visbug-input-close" data-input-close type="button">Fechar</button>
          </div>
          <div class="visbug-input-body">
            <p class="visbug-input-message" data-input-message>Informe o novo valor.</p>
            <div>
              <label class="visbug-input-label" data-input-label for="visbug-input-field">Valor</label>
              <input class="visbug-input-field" id="visbug-input-field" data-input-field type="text" />
            </div>
            <div class="visbug-input-actions">
              <button class="visbug-input-confirm" data-input-confirm type="submit">Salvar</button>
              <button class="visbug-input-cancel" data-input-cancel type="button">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  demoTip({key, tool, label, description, instruction}) {
    return `
      <aside ${tool}>
        <figure>
          <img src="${this._tutsBaseURL}/${tool}.gif" alt="${description}" />
          <figcaption>
            <h2>
              ${label}
              <span hotkey>${key}</span>
            </h2>
            <p>${description}</p>
            ${instruction}
          </figcaption>
        </figure>
      </aside>
    `
  }

  download() {
    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    this.active_tool.attr('data-active', true)
    this.downloadHtmlWithStylesAndScripts();
    this.deactivate_feature = null
  }

  publish() {
    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    if (this.active_tool) this.active_tool.attr('data-active', true)
    this.openPuterPublishModal();
    this.deactivate_feature = null
  }

  emailAccess() {
    window.dispatchEvent(new CustomEvent('visbug:open-email-modal'))
    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    if (this.active_tool) this.active_tool.attr('data-active', true)
    this.deactivate_feature = null
  }

  move() {
    this.deactivate_feature = Moveable(this.selectorEngine)
  }
  proxy () {
    //this.dowloadProdxy()
  }

  async addPixel() {
    const pixelCode = await this.openInputModal({
      titleText: 'Pixel Meta',
      messageText: 'Insira o codigo do Pixel do Meta.',
      labelText: 'Codigo do pixel',
      placeholder: 'Ex: 123456789012345',
      value: this.pixelMeta || '',
      confirmLabel: 'Salvar',
      cancelLabel: 'Fechar'
    });

    if (pixelCode !== null) {
      this.pixelMeta = pixelCode;
    }

    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    if (this.active_tool) this.active_tool.attr('data-active', true)
  }

  async googlepixel() {
    const pixelCode = await this.openInputModal({
      titleText: 'Pixel Google Ads',
      messageText: 'Insira a tag do Google Ads.',
      labelText: 'Tag Google',
      placeholder: 'AW-XXXXXXXXX',
      value: this.pixelGoogle || '',
      confirmLabel: 'Salvar',
      cancelLabel: 'Fechar'
    });

    if (pixelCode !== null) {
      this.pixelGoogle = pixelCode;
    }

    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    if (this.active_tool) this.active_tool.attr('data-active', true)
  }

  async gtmGoogle() {
    const gtmCode = await this.openInputModal({
      titleText: 'Google Tag Manager',
      messageText: 'Insira o ID do GTM.',
      labelText: 'ID do GTM',
      placeholder: 'GTM-XXXXXXX',
      value: this.gtmCode || '',
      confirmLabel: 'Salvar',
      cancelLabel: 'Fechar'
    });

    if (gtmCode !== null) {
      this.gtmCode = gtmCode;
    }

    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    if (this.active_tool) this.active_tool.attr('data-active', true)
  }
  margin() {
    this.deactivate_feature = Margin(this.selectorEngine)
  }

  padding() {
    this.deactivate_feature = Padding(this.selectorEngine)
  }

  font() {
    this.deactivate_feature = Font(this.selectorEngine)
  }

  text() {
    this.selectorEngine.onSelectedUpdate(EditText)
    this.deactivate_feature = () =>
      this.selectorEngine.removeSelectedCallback(EditText)
  }

  align() {
    this.deactivate_feature = Flex(this.selectorEngine)
  }

  search() {
    this.deactivate_feature = Search($('[data-tool="search"]', this.$shadow))
  }

  boxshadow() {
    this.deactivate_feature = BoxShadow(this.selectorEngine)
  }

  hueshift() {
    this.deactivate_feature = HueShift({
      Color:  this.colorPicker,
      Visbug: this.selectorEngine,
    })
  }

  setModalStyle(modal) {
    const modalDiv = modal.querySelector('#domain-modal');
    modalDiv.style.cssText = `
      font-family: Arial, sans-serif;
      color: #fff;
      background-color: #1F1F1F;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      position: fixed;
      z-index: 1000;
    `;

    const copyButton = modal.querySelector('#copy-button');
    copyButton.style.cssText = `
      background-color: #2EAD87;
      padding: 5px 15px;
      border: none;
      color: #ffffff;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
      margin-bottom: 10px !important;
    `;
  }

  setupPuterModal() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    const {
      backdrop,
      closeButton,
      authButton,
      createButton,
      publishButton,
      domainInput,
      switchAccountButton
    } = modalElements;

    backdrop.addEventListener('click', () => this.closePuterPublishModal());
    closeButton.addEventListener('click', () => this.closePuterPublishModal());
    authButton.addEventListener('click', () => this.handlePuterSignIn());
    switchAccountButton.addEventListener('click', () => this.handlePuterSwitchAccount());
    createButton.addEventListener('click', () => this.handlePuterCreateDomain());
    publishButton.addEventListener('click', () => this.handlePuterPublish());
    domainInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.handlePuterCreateDomain();
      }
    });
  }

  getPuterModalElements() {
    if (this.puterModalElements) return this.puterModalElements;
    const modal = this.$shadow.querySelector('#puter-modal');
    if (!modal) return null;

    this.puterModalElements = {
      modal,
      backdrop: modal.querySelector('[data-puter-backdrop]'),
      closeButton: modal.querySelector('#puter-close'),
      authStatus: modal.querySelector('#puter-auth-status'),
      authButton: modal.querySelector('#puter-auth-button'),
      switchAccountButton: modal.querySelector('#puter-switch-account'),
      domainSelect: modal.querySelector('#puter-domain-select'),
      domainInput: modal.querySelector('#puter-domain-input'),
      createButton: modal.querySelector('#puter-create-domain'),
      publishButton: modal.querySelector('#puter-publish'),
      status: modal.querySelector('#puter-status'),
      siteUrl: modal.querySelector('#puter-site-url')
    };

    return this.puterModalElements;
  }

  setupInputModal() {
    const modalElements = this.getInputModalElements();
    if (!modalElements) return;

    const { backdrop, closeButton, cancelButton, form, input } = modalElements;

    const closeModal = () => this.closeInputModal(null);
    backdrop.addEventListener('click', closeModal);
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    form.addEventListener('submit', event => {
      event.preventDefault();
      this.closeInputModal(input.value.trim());
    });
  }

  getInputModalElements() {
    if (this.inputModalElements) return this.inputModalElements;

    const modal = this.$shadow.querySelector('#visbug-input-modal');
    if (!modal) return null;

    this.inputModalElements = {
      modal,
      backdrop: modal.querySelector('[data-input-backdrop]'),
      form: modal.querySelector('[data-input-form]'),
      title: modal.querySelector('[data-input-title]'),
      message: modal.querySelector('[data-input-message]'),
      label: modal.querySelector('[data-input-label]'),
      input: modal.querySelector('[data-input-field]'),
      confirmButton: modal.querySelector('[data-input-confirm]'),
      cancelButton: modal.querySelector('[data-input-cancel]'),
      closeButton: modal.querySelector('[data-input-close]')
    };

    return this.inputModalElements;
  }

  openInputModal(options = {}) {
    const modalElements = this.getInputModalElements();
    if (!modalElements) return Promise.resolve(null);

    const {
      titleText = 'Atualizar conteudo',
      messageText = 'Informe o novo valor.',
      labelText = 'Valor',
      placeholder = '',
      value = '',
      confirmLabel = 'Salvar',
      cancelLabel = 'Fechar'
    } = options;

    if (this.inputModalResolver) {
      this.inputModalResolver(null);
      this.inputModalResolver = null;
    }

    modalElements.title.textContent = titleText;
    modalElements.message.textContent = messageText;
    modalElements.label.textContent = labelText;
    modalElements.input.placeholder = placeholder;
    modalElements.input.value = value;
    modalElements.confirmButton.textContent = confirmLabel;
    modalElements.cancelButton.textContent = cancelLabel;

    modalElements.modal.style.display = 'block';
    modalElements.input.focus();
    modalElements.input.select();

    return new Promise(resolve => {
      this.inputModalResolver = resolve;
    });
  }

  closeInputModal(value) {
    const modalElements = this.getInputModalElements();
    if (!modalElements) return;

    modalElements.modal.style.display = 'none';

    if (this.inputModalResolver) {
      const resolve = this.inputModalResolver;
      this.inputModalResolver = null;
      resolve(value);
    }
  }

  async openPuterPublishModal() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    modalElements.modal.style.display = 'block';
    modalElements.siteUrl.style.display = 'none';
    modalElements.status.textContent = '';
    this.setPuterStatus('Carregando Puter...', 'info');

    try {
      await this.ensurePuter();
      await this.updatePuterAuthStatus();
      await this.refreshPuterSites();
    } catch (error) {
      this.setPuterStatus('Nao foi possivel carregar o Puter.', 'error');
    }
  }

  closePuterPublishModal() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;
    modalElements.modal.style.display = 'none';
  }

  async ensurePuter() {
    if (window.puter) {
      // Garantir AppID padrao, mas sem sobrescrever um app UID ja definido
      const currentAppID = window.puter.appID;
      if (
        typeof window.puter.setAppID === 'function'
        && (!currentAppID || currentAppID === 'puter.com' || currentAppID === 'visbug')
      ) {
        window.puter.setAppID('visbug');
      }
      console.log('[VisBug] Puter ready, appID:', window.puter.appID);
      return window.puter;
    }
    
    if (!window.__visbugPuterLoader) {
      console.log('[VisBug] Loading Puter SDK...');
      window.__visbugPuterLoader = new Promise((resolve, reject) => {
        const head = document.head || document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.onload = () => {
          // Definir AppID fixo imediatamente apos carregar
          if (typeof window.puter.setAppID === 'function') {
            window.puter.setAppID('visbug');
          }
          console.log('[VisBug] Puter SDK loaded, appID:', window.puter.appID);
          resolve(window.puter);
        };
        script.onerror = (error) => {
          console.error('[VisBug] Failed to load Puter SDK:', error);
          reject(error);
        };
        head.appendChild(script);
      });
    }

    return window.__visbugPuterLoader;
  }

  async isPuterSignedIn() {
    try {
      const puter = await this.ensurePuter();
      return await puter.auth.isSignedIn();
    } catch (error) {
      return false;
    }
  }

  async ensurePuterSubdomainPermissions({ manage = false } = {}) {
    try {
      const puter = await this.ensurePuter();
      if (!puter.perms) return true;

      let hasRead = true;
      if (typeof puter.perms.requestReadSubdomains === 'function') {
        hasRead = await puter.perms.requestReadSubdomains();
      }

      if (!hasRead) return false;

      if (manage && typeof puter.perms.requestManageSubdomains === 'function') {
        const hasManage = await puter.perms.requestManageSubdomains();
        return !!hasManage;
      }

      return true;
    } catch (error) {
      console.error('[VisBug] Permission request error:', error);
      return false;
    }
  }

  async updatePuterAuthStatus() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;
    const signedIn = await this.isPuterSignedIn();

    modalElements.authStatus.textContent = signedIn ? 'Conectado' : 'Desconectado';
    modalElements.authButton.textContent = signedIn ? 'Conectado' : 'Conectar com Puter';
    modalElements.authButton.disabled = signedIn;
    modalElements.switchAccountButton.style.display = signedIn ? 'block' : 'none';
  }

  async handlePuterSwitchAccount() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    try {
      const puter = await this.ensurePuter();
      if (puter.auth && typeof puter.auth.signOut === 'function') {
        await puter.auth.signOut();
        console.log('[VisBug] Signed out successfully');
      }
      
      // Clear domains list
      modalElements.domainSelect.innerHTML = '';
      
      // Update UI
      await this.updatePuterAuthStatus();
      console.log('[VisBug] Prompting for sign in again');
      // Prompt for sign in again
      this.handlePuterSignIn();
    } catch (error) {
      console.error('[VisBug] Error switching account:', error);
    }
  }

  async handlePuterSignIn() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    this.setPuterLoading(true);
    try {
      const puter = await this.ensurePuter();
      
      // Simple sign-in like iacopi2.0 - no AppID, no permissions
      console.log('[VisBug] Calling puter.auth.signIn()...');
      await puter.auth.signIn();
      console.log('[VisBug] Sign-in complete');
      
      const user = await puter.auth.getUser();
      console.log('[VisBug] Logged in as:', user?.username || 'unknown');
      
      await this.updatePuterAuthStatus();
      await this.refreshPuterSites();
      this.setPuterStatus('Conta conectada com sucesso.', 'success');
    } catch (error) {
      console.error('[VisBug] Sign in error:', error);
      this.setPuterStatus('Erro ao conectar: ' + (error.message || 'Desconhecido'), 'error');
    } finally {
      this.setPuterLoading(false);
    }
  }

  async refreshPuterSites(selected) {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    const signedIn = await this.isPuterSignedIn();
    console.log('[VisBug] refreshPuterSites - signedIn:', signedIn);
    if (!signedIn) {
      modalElements.domainSelect.innerHTML = '<option value="">Conecte sua conta para listar</option>';
      return;
    }

    // Show loading state
    modalElements.domainSelect.innerHTML = '<option value="">Carregando dominios...</option>';
    modalElements.domainSelect.disabled = true;

    try {
      const puter = await this.ensurePuter();
      console.log('[VisBug] Calling puter.hosting.list()...');
      
      const sites = await puter.hosting.list();
      console.log('[VisBug] Sites returned:', JSON.stringify(sites));
      
      this.listSubdomains = Array.isArray(sites) ? sites : [];

      const appUIDFromSites = this.listSubdomains.find(site => site && site.app_owner && site.app_owner.uid)?.app_owner?.uid;
      if (appUIDFromSites && typeof puter.setAppID === 'function' && puter.appID !== appUIDFromSites) {
        console.log('[VisBug] Aligning appID with listed domains app owner:', appUIDFromSites);
        puter.setAppID(appUIDFromSites);
      }
      
      const options = this.listSubdomains.length
        ? this.listSubdomains.map(site => {
            const subdomain = site.subdomain || site;
            return `<option value="${subdomain}">${subdomain}.puter.site</option>`;
          }).join('')
        : '<option value="">Nenhum dominio encontrado - crie um novo</option>';
      
      modalElements.domainSelect.innerHTML = options;
      if (selected) modalElements.domainSelect.value = selected;
    } catch (error) {
      console.error('[VisBug] Error loading domains:', error);
      modalElements.domainSelect.innerHTML = '<option value="">Erro ao carregar dominios</option>';
    } finally {
      modalElements.domainSelect.disabled = false;
    }
  }

  sanitizeSubdomain(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  async handlePuterCreateDomain() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    const rawValue = modalElements.domainInput.value.trim();
    const subdomain = this.sanitizeSubdomain(rawValue);
    if (!subdomain) {
      this.setPuterStatus('Informe um dominio valido.', 'error');
      return;
    }

    this.setPuterLoading(true);
    try {
      const puter = await this.ensurePuter();
      const signedIn = await this.isPuterSignedIn();
      if (!signedIn) await puter.auth.signIn();

      await puter.hosting.create(subdomain);
      modalElements.domainInput.value = '';
      await this.refreshPuterSites(subdomain);
      this.setPuterStatus(`Dominio ${subdomain}.puter.site criado.`, 'success');
    } catch (error) {
      this.setPuterStatus('Nao foi possivel criar o dominio.', 'error');
    } finally {
      this.setPuterLoading(false);
    }
  }

  async handlePuterPublish() {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;

    const subdomain = modalElements.domainSelect.value;
    if (!subdomain) {
      this.setPuterStatus('Selecione um dominio para publicar.', 'error');
      return;
    }

    this.setPuterLoading(true);
    this.setPuterStatus('Publicando site...', 'info');
    try {
      const publishResult = await this.publishToPuter(subdomain);
      const normalizedSubdomain = publishResult && publishResult.subdomain ? publishResult.subdomain : subdomain;
      const cacheBuster = publishResult && publishResult.publishId ? publishResult.publishId : Date.now();
      modalElements.siteUrl.textContent = `https://${normalizedSubdomain}.puter.site`;
      modalElements.siteUrl.href = `https://${normalizedSubdomain}.puter.site/?v=${cacheBuster}`;
      modalElements.siteUrl.style.display = 'inline-flex';
      this.setPuterStatus('Publicado com sucesso. Se aparecer versao antiga, abra o link novamente.', 'success');

      try {
        window.open(modalElements.siteUrl.href, '_blank');
      } catch (openError) {
        console.warn('[VisBug] Could not open preview tab automatically:', openError);
      }

      await this.refreshPuterSites(normalizedSubdomain);
    } catch (error) {
      console.error('[VisBug] Publish error:', error);
      this.setPuterStatus(`Erro ao publicar no Puter: ${error.message || 'desconhecido'}`, 'error');
    } finally {
      this.setPuterLoading(false);
    }
  }

  async publishToPuter(subdomain) {
    const puter = await this.ensurePuter();
    const signedIn = await this.isPuterSignedIn();
    if (!signedIn) await puter.auth.signIn();

    const html = await this.buildExportHtmlContent({
      notify: message => this.setPuterStatus(message, 'error')
    });

    const normalizedSubdomain = String(subdomain).replace(/\.puter\.site$/i, '');
    const selectedSite = Array.isArray(this.listSubdomains)
      ? this.listSubdomains.find(site => (site.subdomain || site) === normalizedSubdomain)
      : null;
    const ownerAppUID = selectedSite && selectedSite.app_owner && selectedSite.app_owner.uid;

    if (ownerAppUID && typeof puter.setAppID === 'function' && puter.appID !== ownerAppUID) {
      console.log('[VisBug] Switching appID to domain owner app:', ownerAppUID);
      puter.setAppID(ownerAppUID);
      console.log('[VisBug] appID after switch:', puter.appID);
    }

    const publishDirectoryName = `${normalizedSubdomain}-${Date.now()}`;
    console.log('[VisBug] Creating publish directory:', publishDirectoryName);

    const dir = await puter.fs.mkdir(publishDirectoryName, { overwrite: true });
    const dirPath = (dir && (dir.requested_path || dir.path)) || publishDirectoryName;
    console.log('[VisBug] Publish directory ready:', dirPath);

    try {
      await puter.fs.write(`${publishDirectoryName}/index.html`, html, { overwrite: true });
    } catch (writeError) {
      console.warn('[VisBug] Write using relative path failed, trying requested_path:', writeError);
      await puter.fs.write(`${dirPath}/index.html`, html, { overwrite: true });
    }

    try {
      console.log('[VisBug] Updating subdomain root:', normalizedSubdomain, dirPath);
      await puter.hosting.update(normalizedSubdomain, dirPath);
    } catch (updateError) {
      console.warn('[VisBug] hosting.update failed, trying create + update:', updateError);
      try {
        await puter.hosting.create(normalizedSubdomain);
      } catch (createError) {
        // ignore if already exists
      }
      await puter.hosting.update(normalizedSubdomain, dirPath);
    }

    try {
      const siteInfo = await puter.hosting.get(normalizedSubdomain);
      console.log('[VisBug] hosting.get after publish:', siteInfo);
    } catch (getError) {
      console.warn('[VisBug] hosting.get after publish failed:', getError);
    }

    return {
      subdomain: normalizedSubdomain,
      dirPath,
      publishId: Date.now()
    };
  }

  setPuterStatus(message, type) {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;
    modalElements.status.textContent = message || '';
    modalElements.status.setAttribute('data-status', type || '');
  }

  setPuterLoading(isLoading) {
    const modalElements = this.getPuterModalElements();
    if (!modalElements) return;
    if (isLoading) {
      modalElements.authButton.disabled = true;
    } else {
      this.updatePuterAuthStatus();
    }
    modalElements.createButton.disabled = isLoading;
    modalElements.publishButton.disabled = isLoading;
    modalElements.domainSelect.disabled = isLoading;
    modalElements.domainInput.disabled = isLoading;
  }

  inspector() {
    this.deactivate_feature = MetaTip(this.selectorEngine)
    // Event listener para detectar quando um <a> é selecionado
    this.selectorEngine.onSelectedUpdate(nodes => {
      if (nodes.length && nodes[0].nodeName.toLowerCase() === 'a') {
        this.showLinkModal(nodes[0]);
      }
    });
  }

  showLinkModal(element) {
    const modal = this.$shadow.querySelector('#link-modal');
    const closeModal = this.$shadow.querySelector('#close-link-modal');
    const saveButton = this.$shadow.querySelector('#save-link');
    const newLinkInput = this.$shadow.querySelector('#new-link-url');

    modal.style.display = 'block';

    closeModal.onclick = () => {
        modal.style.display = 'none';
    }

    saveButton.onclick = () => {
        const newURL = newLinkInput.value;
        if (newURL) {
            element.href = newURL;
            this.captureState(); // Capturar o estado após a alteração
            modal.style.display = 'none';
        }
    }
}

  accessibility() {
    this.deactivate_feature = Accessibility(this.selectorEngine)
  }

  guides() {
    this.deactivate_feature = Guides(this.selectorEngine)
  }

  screenshot() {
    this.deactivate_feature = Screenshot()
  }

  position() {
    let feature = Position()
    this.selectorEngine.onSelectedUpdate(feature.onNodesSelected)
    this.deactivate_feature = () => {
      this.selectorEngine.removeSelectedCallback(feature.onNodesSelected)
      feature.disconnect()
    }
  }

  execCommand(command) {
    const query = `/${command}`

    if (PluginRegistry.has(query))
      return PluginRegistry.get(query)({
        selected: this.selectorEngine.selection(),
        query
      })

    return Promise.resolve(new Error("Query not found"))
  }
  downloadHtml() {
    let htmlContent = document.documentElement.outerHTML;
    
    if (!htmlContent.startsWith('<!DOCTYPE html>')) {
      htmlContent = '<!DOCTYPE html>' + htmlContent;
    }
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  async downloadHtmlWithStylesAndScripts() {
    const updatedHtmlContent = await this.buildExportHtmlContent({
      openPreview: true
    });

    const blob = new Blob([updatedHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);  
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
 }


  async buildExportHtmlContent(options = {}) {
    const { notify, openPreview } = options;
    const imageCount = document.createElement('div');
    imageCount.id = 'imageCount';
    document.body.appendChild(imageCount);
  
    const cloneDocument = document.cloneNode(true);
    // Embed all stylesheets
    const styleSheets = [...document.styleSheets];
    for (const styleSheet of styleSheets) {
      try {
        if (styleSheet.cssRules) {
          const newStyle = document.createElement('style');
          for (const cssRule of styleSheet.cssRules) {
            newStyle.appendChild(document.createTextNode(cssRule.cssText));
          }
          cloneDocument.head.appendChild(newStyle);
        } else if (styleSheet.href) {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = styleSheet.href;
          cloneDocument.head.appendChild(newLink);
        }
      } catch (e) {
        console.warn('Access to stylesheet %s is restricted by CORS policy', styleSheet.href);
      }
    }
  
    // Embed all scripts
    const scripts = [...document.scripts];
    for (const script of scripts) {
      if (script.src) {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        cloneDocument.body.appendChild(newScript);
      } else {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        cloneDocument.body.appendChild(newScript);
      }
    }
  
    // Remove specific scripts
    const scriptElements = cloneDocument.querySelectorAll('script');
    scriptElements.forEach(script => {
      if (script.src.includes('bundle.min.js') || script.src.includes('chrome-extension')) {
        script.remove();
      }
    });

    const asideElements = cloneDocument.querySelectorAll('aside');
    asideElements.forEach(aside => {
      aside.remove();
    });

    const visBugElement = cloneDocument.querySelector('vis-bug');
    if (visBugElement) {
      visBugElement.remove();
    }

    this.removeFacebookPixelsFromHeader(cloneDocument);

    const htmlContent = cloneDocument.documentElement.outerHTML;  

    let updatedHtmlContent = htmlContent;
    if (this.pixelMeta !== '' || this.pixelGoogle !== '') {
      const payload = {
        pixelMeta: this.pixelMeta,
        pixelGoogle: this.pixelGoogle,
        htmlContent: htmlContent
      };

      try {
        const response = await fetch(`http://localhost:3001/openAdvancedEditor`, {
          method: 'POST',
          headers: {
              'Content-Type': 'text/html'
          },
          body: JSON.stringify(payload)
        });
        if (response.status === 200) {
          updatedHtmlContent = await response.text();
          if (openPreview) {
            window.open(updatedHtmlContent, '_blank');
          }
        } else {
          if (notify) notify('Erro ao injetar o pixel.');
          else alert('Erro ao injetar o pixel. O arquivo será baixado sem o pixel.');
        }
      } catch (error) {
        if (notify) notify('Erro ao injetar o pixel.');
        else alert('Erro ao injetar o pixel. O arquivo será baixado sem o pixel.');
      }
    }

    return updatedHtmlContent;
  }

  
  async generateHtmlWithStylesAndScripts() {
    return this.buildExportHtmlContent();
  }

  async getBase64Image(imageUrl) {
    try {
      const response = await fetch('https://api-aicopi.zapime.com.br/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      }).then(res => {
        if (res.status === 500 || res.status === 404 || res.status === 400) {
          return ''
        } else {
          return res
        }
      })
      if (response === '') {
        return ''
      } else {
        const data = await response.json()
        return data.base64Image
      }
    } catch (error) {
      console.error('Error fetching base64 image:', error);
      return '';
    }
  }


  get activeTool() {

    if (this.active_tool === null || this.active_tool === undefined) {
      return
    } 
    return this.active_tool.dataset.tool
  }

  link() {
    this.selectorEngine.onSelectedUpdate(nodes => {
      if (nodes.length) {
        const node = nodes[0];
        let currentText = node.outerText
        const linkInput = this.$shadow.querySelector('#link-input');
        const linkContainer = this.$shadow.querySelector('.link');
        const saveButton = this.$shadow.querySelector('#save-link');
  
        // Check if the selected element is already a link
        if (node.tagName === 'A') {
          linkInput.value = node.href;
          // node.outerText = currentText
        } else {
          linkInput.value = '';
        }
  
        linkContainer.style.display = 'block';
        linkInput.focus();
  
        const updateLink = () => {
          const url = linkInput.value.trim();
          if (url) {
            if (node.tagName === 'A') {
              // node.outerText = currentText
              node.href = url;
            } else {
              const a = document.createElement('a');
              a.href = url;
              // a.outerText = currentText
              node.parentNode.insertBefore(a, node);
              a.appendChild(node);
            }
            //this.showSaveButton(); // Mostra o botão "Salvar"
            this.showSavedFeedback(); // Mostra o feedback visual de salvamento
          }
          // linkContainer.style.display = 'none';
        };
  
        linkInput.addEventListener('blur', updateLink, { once: true });
        linkInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            updateLink();
          }
        }, { once: true });
  
        saveButton.addEventListener('click', () => {
          updateLink();
        });
      }
    });
  
    this.deactivate_feature = () =>
      this.selectorEngine.removeSelectedCallback();
  }
  
  showSaveButton() {
    const saveButton = this.$shadow.querySelector('#save-link');
    saveButton.style.display = 'inline-block';
  }
  
  showSavedFeedback() {
    const linkContainer = this.$shadow.querySelector('.link');
    const savedFeedback = document.createElement('span');
    savedFeedback.textContent = 'Salvo!';
    savedFeedback.style.color = 'green'; // Cor do feedback visual
    savedFeedback.style.marginLeft = '5px'; // Espaçamento à esquerda do feedback
  
    linkContainer.appendChild(savedFeedback);
  
    // Remover o feedback visual após alguns segundos (opcional)
    setTimeout(() => {
      linkContainer.removeChild(savedFeedback);
    }, 3000); // Remove após 3 segundos (ajuste conforme necessário)
  }
  

  showSaveButton() {
    const saveButton = this.$shadow.querySelector('#save-link');
    saveButton.style.display = 'inline-block';
  }
  
  
}

customElements.define('vis-bug', VisBug)
