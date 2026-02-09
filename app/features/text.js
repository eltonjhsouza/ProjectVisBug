import $ from 'blingblingjs'
import hotkeys from 'hotkeys-js'
import { showHideNodeLabel, metaKey } from '../utilities/'

const removeEditability = ({target}) => {
  target.removeAttribute('contenteditable')
  target.removeAttribute('spellcheck')
  target.removeEventListener('blur', removeEditability)
  target.removeEventListener('keydown', stopBubbling)
  hotkeys.unbind('escape,esc')
}

const isMetaShortcutPressed = event =>
  metaKey === 'cmd'
    ? event.metaKey
    : event.ctrlKey

const isAllowedEditingShortcut = event => {
  if (!isMetaShortcutPressed(event)) return false

  const key = (event.key || '').toLowerCase()

  if (!event.altKey && !event.shiftKey && key === 'd') return true
  if (event.shiftKey && !event.altKey && (key === 'c' || key === 'v')) return true
  if (event.altKey && !event.shiftKey && (key === 'c' || key === 'v')) return true

  return false
}

const stopBubbling = e => {
  if (e.key === 'Escape') return
  if (isAllowedEditingShortcut(e)) return
  e.stopPropagation()
}

const cleanup = (e, handler) => {
  $('[spellcheck="true"]').forEach(target => removeEditability({target}))
  window.getSelection().empty()
}

export function EditText(elements) {
  if (!elements.length) return

  elements.map(el => {
    let $el = $(el)

    $el.attr({
      contenteditable: true,
      spellcheck: true,
    })
    el.focus()
    showHideNodeLabel(el, true)

    $el.on('keydown', stopBubbling)
    $el.on('blur', removeEditability)
  })

  hotkeys('escape,esc', cleanup)
}
