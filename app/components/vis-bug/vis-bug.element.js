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

    const modal = this.$shadow.querySelector('#domain-modal');
    const copyButton = modal.querySelector('#copy-button');
    const closeButton = modal.querySelector('#close-modal');

    const setupModalDomain = this.$shadow.querySelector('#setup-domain-modal');
    const closeButtonSetup = setupModalDomain.querySelector('#close-modal');
    const newSubdomainInput = this.$shadow.querySelector('#new-subdomain-input');
    const checkAvailability = this.$shadow.querySelector('#check-availability');
    const publishButton = this.$shadow.querySelector('#publish-button');
    const addSubdomainButton = this.$shadow.querySelector('#add-subdomain-button');

    await this.loadPuterScript();

    // if(!puter.auth.isSignedIn()) {
    //   puter.auth.signIn();
    // }
    this.listSubdomains = await puter.hosting.list();
    console.log(this.listSubdomains)

    // Preenchendo o select com os subdomínios
    const select = this.$shadow.querySelector('#availables-domains');
    
    this.listSubdomains.forEach(domain => {
        const option = document.createElement('option');
        option.value = domain.subdomain;
        option.textContent = domain.subdomain;
        select.appendChild(option);
    });
    // Captura o valor de domínio selecionado
    const domainLink = this.$shadow.querySelector('#domain-link');
    
    select.addEventListener('change', function() {
      if (select.value === 'add-new') {
        newSubdomainInput.style.display = 'block';
        checkAvailability.style.display = 'block';
        publishButton.style.display = 'none';
    } else {
      newSubdomainInput.style.display = 'none';
      checkAvailability.style.display = 'none';

      const selectedSubdomain = select.value;
      const protocol = 'https://';
      const baseDomain = 'puter.site';
      const newLink = `${protocol}${selectedSubdomain}.${baseDomain}`;
      domainLink.href = newLink;
      domainLink.textContent = newLink;
    }
    });

    let domainAvailableText = this.$shadow.querySelector('#domain-available');
    let domainAvailable = false;
    checkAvailability.addEventListener('click', async function() {
      debugger
      const newSubdomain = newSubdomainInput.value.trim();
      // chamar a api do puter e verificar se o domínio já existe
      if(puter.auth.isSignedIn()) {
        this.listSubdomains = await puter.hosting.list();
        //let result = await puter.hosting.get(newSubdomain);
        //encontrar newSubdomain em this.listSubdomains
        if (this.listSubdomains.find(domain => domain.subdomain === newSubdomain)) {
          alert('Subdomínio já existe');
          return;
        }
        domainAvailable = true;
      }

      if (domainAvailable) {
        domainAvailableText.style.display = 'block';
        checkAvailability.style.display = 'none';
      }

      // if (newSubdomain) {
      //     this.listSubdomains.push({ subdomain: newSubdomain });
      //     populateSelect();
      //     select.value = newSubdomain;
      //     const protocol = 'https://';
      //     const baseDomain = 'puter.site';
      //     const newLink = `${protocol}${selectedSubdomain}.${baseDomain}`;
      //     domainLink.href = newLink;
      //     domainLink.textContent = newLink;
      //     newSubdomainInput.value = '';
      //     newSubdomainInput.style.display = 'none';
      //     addSubdomainButton.style.display = 'none';
      // } else {
      //     alert('Por favor, insira um subdomínio.');
      // }
    });

        // Desabilitar atalhos de teclado ao focar no input
        const shortcuts = (e) => {
          e.stopPropagation();
      };

      newSubdomainInput.addEventListener('focus', function() {
          document.addEventListener('keydown', shortcuts, true);
      });

      newSubdomainInput.addEventListener('blur', function() {
          document.removeEventListener('keydown', shortcuts, true);
      });


    // Add event listener for the copy button
    copyButton.addEventListener('click', () => {
      const domainLink = `https://${this.siteDomain}.puter.site`;
      navigator.clipboard.writeText(domainLink)
        .then(() => {
          console.log('Domain link copied to clipboard');
          // Preciso de um feedback visual
          const span = document.createElement('span');
          span.textContent = 'Copiado';
          span.style.color = 'green';
          span.style.marginLeft = '5px';
          copyButton.insertAdjacentElement('afterend', span);
          setTimeout(() => {
            span.remove();
          }
          , 2000);
          
        })
        .catch((error) => {
          console.error('Failed to copy domain link to clipboard:', error);
        });
    });
  
    // Add event listener for the close button
    closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    closeButtonSetup.addEventListener('click', () => {
      setupModalDomain.style.display = 'none';
    });
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
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'color-scheme')
      this.applyScheme(newValue)
  }

  setup() {
    this.$shadow.innerHTML = this.render();

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
        // if (!this.inputFocused) {
          e.preventDefault();
          this.toolSelected(
            $(`[data-tool="${value.tool}"]`, this.$shadow)[0]
          );
        // }
      })
    );
  
    hotkeys(`${metaKey}+/,${metaKey}+.`, e => {
      if (!this.inputFocused) {
        this.$shadow.host.style.display =
          this.$shadow.host.style.display === 'none'
            ? 'block'
            : 'none';
      }
    });
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
    } else if (el.dataset.tool === 'addPixel') {
      const pixelModal = this.$shadow.querySelector('#pixel-modal');
      pixelModal.style.display = 'block';
  
      const addButton = this.$shadow.querySelector('#add-pixel-button');
      addButton.onclick = () => {
        const pixelInput = this.$shadow.querySelector('#pixel-input');
        const pixelCode = pixelInput.value.trim();
        if (pixelCode) {
          this.pixelMeta = pixelCode
          pixelModal.style.display = 'none';
        }
        pixelModal.style.display = 'none';
      };
    }
    else {
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
           scriptSrc.includes('connect.facebook.net') ||
           scriptSrc.includes('www.googletagmanager.com') ||
           scriptSrc.includes('www.google-analytics.com') ||
           scriptSrc.includes('google');
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
    <!-- Modal for adding Facebook Pixel -->
    <div id="pixel-modal" style="display: none;">
      <input type="text" id="pixel-input" placeholder="Insira o código do pixel do Facebook">
      <button id="add-pixel-button">Adicionar</button>
    </div>

    <div id="ads-modal" style="display: none;">
      <input type="text" id="gpixel-input" placeholder="Insira a Tag do Google">
      <button id="add-ads-button">Adicionar</button>
    </div>

    <div id="gtm-modal" style="display: none;">
      <input type="text" id="gtmpixel-input" placeholder="Insira o ID do GTM">
      <button id="add-gtmpixel-button">Adicionar</button>
    </div>

    <div id="gtm-modal" style="display: none;">
      <input type="text" id="pixel-input" placeholder="Insira a Tag do Google">
      <button id="add-pixel-button">Adicionar</button>
    </div>

    <div id="domain-modal" popover="manual" style="display: none; z-index: 1000">
      <div class="modal-header">
        <h2 class="modal-title">Site Publicado</h2>
        <button id="close-modal" class="close">&times;</button>
      </div>
      <div class="modal-body">
        <p>Seu site está disponível em: <a id="new-domain" href="https://${this.siteDomain}.puter.site" target="_blank">https://${this.siteDomain}.puter.site</a></p>
        <button id="copy-button" class="success">Copiar link</button>
      </div>
    </div>

    <div id="setup-domain-modal" class="modal">
        <span id="close-modal" class="close">&times;</span>
        <h2>Configurando Subdomínio</h2>
        <p>Domínio Selecionado:</p>
        <p><a id="domain-link" href="https://teste12345.puter.site" target="_blank">https://teste12345.puter.site</a></p>
        <select id="availables-domains">
            <option value="" disabled selected>Selecione um subdomínio</option>
            <option value="add-new">Adicionar novo domínio</option>
        </select>
        <input type="text" id="new-subdomain-input" placeholder="Novo subdomínio" style="display:none;">
        <span id="domain-available" style="display:none;">Subdomínio disponível</span>
        <button id="check-availability" style="display:none;">Checar Disponibilidade</button>
        <button id="add-subdomain-button" style="display:none;">Checar Disponibilidade</button>
        <button id="publish-button">Publicar</button>
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
    const modal = this.$shadow.querySelector('#setup-domain-modal');
    modal.style.display = 'flex';

    const publishButton = this.$shadow.querySelector('#publish-button');
    publishButton.onclick = () => {
      const selectedDomain = this.$shadow.querySelector('#availables-domains');
      // Se for add-new, eu estou addicionando um novo domínio e preciso pegar o input do usuário
        if (selectedDomain.value === 'add-new') {
          var newDomain = this.$shadow.querySelector('#new-subdomain-input');
          console.log(newDomain.value);
          // Tentar criar o diretório para o domínio
          this.sitename = newDomain.value;
          this.createAndHostWebsite();
          // alert('Subdomínio selecionado: ' + selectedDomain.value);
          // Aqui você pode adicionar o código para manipular o valor selecionado
        } else {
            debugger
            this.sitename = selectedDomain.value;
            this.createAndHostWebsite();
        }
    };
    // Exibir um prompt para o usuario informar o subdomínio do site
    // const subdomain = prompt('Informe o subdomínio do site:');
    // if (subdomain) {
    //   this.sitename = subdomain;
    //   this.createAndHostWebsite();
    // }

    console.log('publish')
    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    this.active_tool.attr('data-active', true)
  }

  move() {
    this.deactivate_feature = Moveable(this.selectorEngine)
  }
  proxy () {
    //this.dowloadProdxy()
  }

  googlepixel() {
    console.log('google')
    const pixelGoogleModal = this.$shadow.querySelector('#ads-modal');
    pixelGoogleModal.style.display = 'block';

    const addButton = this.$shadow.querySelector('#add-ads-button');
    addButton.onclick = () => {
      const pixelInput = this.$shadow.querySelector('#gpixel-input');
      const pixelCode = pixelInput.value.trim();
      if (pixelCode) {
        this.pixelGoogle = pixelCode
        pixelGoogleModal.style.display = 'none';
      }
      pixelGoogleModal.style.display = 'none';
    };


    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    this.active_tool.attr('data-active', true)
  }
  
  gtmGoogle() {
    console.log('GTM')
    const pixelGtmGoogle = this.$shadow.querySelector('#gtm-modal');
    pixelGtmGoogle.style.display = 'block';

    const addButton = this.$shadow.querySelector('#add-gtmpixel-button');
    addButton.onclick = () => {
      const pixelInput = this.$shadow.querySelector('#gtmpixel-input');
      const pixelCode = pixelInput.value.trim();
      if (pixelCode) {
        this.gtmCode = pixelCode
        pixelGtmGoogle.style.display = 'none';
      }
      pixelGtmGoogle.style.display = 'none';
    };


    this.active_tool = $('[data-tool="inspector"]', this.$shadow)[0]
    this.active_tool.attr('data-active', true)
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

  async loadPuterScript() {
    return new Promise((resolve, reject) => {
      const head = document.head || document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = resolve;
      script.onerror = reject;
      head.appendChild(script);
    });
  }
  async createSubdomain(subdomain, directory) {
    try {
        const site = await puter.hosting.create(subdomain, directory);
        console.log(`Subdomínio criado: ${site.subdomain}.puter.site`);
    } catch (error) {
        console.error('Erro ao criar subdomínio:', error);
        this.updateSubdomain(subdomain, subdomain, directory.name);
    }
  }

  async updateSubdomain(oldSubdomain, newSubdomain, directory) {
    try {
        await puter.hosting.delete(oldSubdomain);
        console.log(`Subdomínio removido: ${oldSubdomain}.puter.site`);
        
        const site = await puter.hosting.create(newSubdomain, directory);
        console.log(`Novo subdomínio criado: ${site.subdomain}.puter.site`);
    } catch (error) {
      if (error.error.code === 'already_in_use') {
        debugger
        //const site = await puter.hosting.update(subdomain, directory.name);
        this.updateSubdomain(subdomain, subdomain, directory.name);
      }
    }
}

async removeSubdomain(subdomain) {
  try {
      await puter.hosting.delete(subdomain);
      console.log(`Subdomínio removido: ${subdomain}.puter.site`);
  } catch (error) {
      console.error('Erro ao remover subdomínio:', error);
  }
}

  async createAndHostWebsite() {
    debugger
    await this.loadPuterScript();
    let subdomain = this.sitename;
    this.siteDomain = subdomain;

    // Deleta o subdomain
    try {
      await puter.hosting.delete(subdomain)
    } catch (error) {
      debugger
      console.error('Erro ao remover subdomínio:', error);
    }

    //deleta o directorio
    try {
      await puter.fs.delete(`${subdomain}Folder`, { recursive: true });
    } catch (error) {
      debugger
      console.error('Erro ao remover diretório:', error);
    }
    // (1) Create a directory with the site name
    let directory = await puter.fs.mkdir(`${this.sitename}Folder`, { overwrite: true });
    let folder = `${directory.name}`;
    // Recebe o html da página atual
    let html = await this.generateHtmlWithStylesAndScripts();
    try {
      await puter.fs.write(`${folder}/index.html`, html);
    } catch (error) {
      debugger
      console.error('Erro ao escrever arquivo:', error);
    }
  
    // Cria o subdominio
    try {
      await puter.hosting.create(subdomain, folder);
    } catch (error) {
      debugger
      console.error('Erro ao criar subdomínio:', error);
      await puter.hosting.update(subdomain, folder);
    }
    const modal = this.$shadow.querySelector('#domain-modal');
    modal.style.display = 'block';
    // Alterar o texto e href de #new-domain
    const newDomain = modal.querySelector('#new-domain');
    newDomain.textContent = `https://${site.subdomain}.puter.site`;
    newDomain.href = `https://${site.subdomain}.puter.site`;

    try {     
      // (2) Create 'index.html' in the directory with the contents "Hello, world!"
      //Buscar o conteúdo da página atual e salvar em this.globalPageContent
      //this.globalPageContent = document.documentElement.outerHTML;

      
  
      // (3) Host the directory under a random subdomain
      
      //Verificar se posso utilizar o update para criar
      //se não existir, criar um novo
      //var existSubdomain = await puter.hosting.get(subdomain)
      debugger
      //const site = await puter.hosting.create(subdomain, this.sitename);
      this.createSubdomain(subdomain, directory.name);
      //const site = await puter.hosting.create(subdomain, directory.name);

      // Exibir o modal com o link do site
      const modal = this.$shadow.querySelector('#domain-modal');
      modal.style.display = 'block';
      // Alterar o texto e href de #new-domain
      const newDomain = modal.querySelector('#new-domain');
      newDomain.textContent = `https://${site.subdomain}.puter.site`;
      newDomain.href = `https://${site.subdomain}.puter.site`;

      //window.open(`https://${site.subdomain}.puter.site`, '_blank');
    } catch (error) {
      if (error.code === 'item_with_same_name_exists') {
        debugger
        const teste = await puter.hosting.delete(subdomain)
        const site = await puter.hosting.update(subdomain, directory.name);
      }

      if (error.error.code === 'already_in_use') {
        debugger
        //const site = await puter.hosting.update(subdomain, directory.name);
        this.updateSubdomain(subdomain, subdomain, directory.name);
      }
      debugger
      this.updateSubdomain(subdomain, subdomain, directory.name);
      document.write(`An error occurred: ${error.message}`);
    }
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
    const htmlContent = document.documentElement.outerHTML;
    
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
  
    const visBugElement = cloneDocument.querySelector('vis-bug');
    if (visBugElement) {
      visBugElement.remove();
    }

    this.removeFacebookPixelsFromHeader(cloneDocument);
  
    const htmlContent = cloneDocument.documentElement.outerHTML;

    // Enviar o HTML para o backend e obter o HTML atualizado
    let updatedHtmlContent
    let response
    if (this.pixelMeta !== '' || this.pixelGoogle !== '') {
      const pixelCode = this.pixelMeta;
      const payload = {
        pixelMeta: this.pixelMeta,
        pixelGoogle: this.pixelGoogle,
        htmlContent: htmlContent
      };
      await fetch(`https://api-aicopi.zapime.com.br/inject-pixel`, {
          method: 'POST',
          headers: {
              'Content-Type': 'text/html'
          },
          body: JSON.stringify(payload)
      }).then(async res => {
        if (res.status === 200) {
          response = res
          updatedHtmlContent = await response.text();
          console.log('200 ok')
        } else {
          this.deactivate_feature = null
          alert('Erro ao injetar o pixel. O arquivo será baixado sem o pixel.');
          updatedHtmlContent = htmlContent;
          console.log('Erro')
        }
      })
    }
    else {
      updatedHtmlContent = htmlContent;
      console.log('sem pixel')
    }

    const blob = new Blob([updatedHtmlContent], { type: 'text/html' });
    console.log('passow o blob')
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);  
    console.log('antes do click')
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

  
  async generateHtmlWithStylesAndScripts() {
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
  
    const visBugElement = cloneDocument.querySelector('vis-bug');
    if (visBugElement) {
      visBugElement.remove();
    }

    this.removeFacebookPixelsFromHeader(cloneDocument);
    //Rever pois em alguns casos não exibe o video
    // this.removeCookies(cloneDocument);
    // if(this.pixelMeta !== '') {
    //   this.addPixelToHeader(this.pixelMeta, cloneDocument);
    // }
    const htmlContent = cloneDocument.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return htmlContent;
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'index.html';
    // document.body.appendChild(a);  
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
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
