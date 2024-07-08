export const EditType = {
    TEXT: "TEXT",
    STYLE: "STYLE",
    ATTR: "ATTR",
    INSERT: "INSERT",
    REMOVE: "REMOVE",
    MOVE: "MOVE",
  }
  export let history = [];
  export let redo = [];
  
  export function clearHistory() {
    history = [];
    redo = [];
  }
  
  // Check keys to deduplicate events
  function compareKeys(a, b) {
    if (!a || !b) return false;
    const set1 = new Set(Object.keys(a));
    const set2 = new Set(Object.keys(b));
    if (set1.size !== set2.size) return false;
    for (let item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }
  
  
  export function addToHistory(event) {
    console.log("Histórico adicionado", event)
    if (history.length === 0) {
      console.log("Novo Evento Edicionado:", event)
      history.push(event);
      return;
    }
  
    // Deduplicate last event
    const lastEvent = history[history.length - 1];
    if (
      lastEvent.editType === event.editType &&
      lastEvent.selector === event.selector &&
      compareKeys(lastEvent.newVal, event.newVal)
    ) {
      lastEvent.newVal = event.newVal;
      lastEvent.createdAt = event.createdAt;
      history[history.length - 1] = lastEvent;
    } else {
      history.push(event);
    }
  }
  
  export function undoLastEvent() {
 // Recupera o histórico do localStorage
 let history = JSON.parse(localStorage.getItem('history')) || [];

 if (history.length < 2) {
   console.log("Não há eventos suficientes para desfazer.");
   return;
 }

 // Remove o último item (representando a posição atual)
 history.pop();

 // Recupera o penúltimo item (representando o estado anterior do elemento)
 let lastEvent = history[history.length - 1];

 // Cria um elemento DOM temporário para parsear a string do elemento HTML
 let tempDiv = document.createElement('div');
 tempDiv.innerHTML = lastEvent.element;
 let element = tempDiv.firstElementChild;

 // Seleciona o elemento real na página usando um seletor adequado
 let realElement = document.querySelector(`[data-label-id="${element.dataset.labelId}"]`);

 if (realElement) {
   // Substitui o HTML do elemento real pelo HTML do estado anterior
   realElement.style.x = lastEvent.previousPosition.x;
   realElement.style.y = lastEvent.previousPosition.y;
   // realElement.outerHTML = element.outerHTML;
 } else {
   console.log("Elemento não encontrado na página ou não está no histórico.");
 }

 // Atualiza o histórico no localStorage
 localStorage.setItem('history', JSON.stringify(history));
  }

  // Check if localStorage history has items and revert to the last item
  const localStorageHistory = localStorage.getItem("history");
  if (localStorageHistory) {
    debugger
    const parsedHistory = JSON.parse(localStorageHistory);
    if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
      history = parsedHistory;
    }
  }
  
  export function redoLastEvent() {
    debugger
    const event = redo.pop();
    if (event) {
      applyEvent(event);
      history.push(event);
    }
  }
  
  function createReverseEvent(event) {
    // Can handle different edit types here
    return {
      createdAt: event.createdAt,
      selector: event.selector,
      editType: event.editType,
      newVal: event.oldVal,
      oldVal: event.newVal,
    };
  }
  
  function applyStyleEvent(event, element) {
    if (!element) return;
    Object.entries(event.newVal).forEach(([style, newVal]) => {
      element.style[style] = newVal;
    });
  }
  
  function applyTextEvent(event, element) {
    if (!element) return;
    const newVal = event.newVal;
    element.textContent = newVal.text;
  }
  
  
  function applyEvent(event) {
    const element = document.querySelector(event.selector);
    switch (event.editType) {
      case EditType.STYLE:
        applyStyleEvent(event, element);
        break;
      case EditType.TEXT:
        applyTextEvent(event, element);
        break;
      default:
        console.error('Unsupported edit type');
        break;
    }
  }