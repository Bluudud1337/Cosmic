const iframe = document.getElementById('ifra')
const addressInput = document.getElementById('is')
const fullscreenButton = document.getElementById('fullscreen-button')
const homeButton = document.getElementById('home-page')

function getProxyPath(encoded) {
  const mode = localStorage.getItem('dy')
  return mode === 'true' || mode === 'auto' ? '/a/q/' + encoded : '/a/' + encoded
}

// Start safely when there is no saved destination yet.
window.addEventListener('load', () => {
  const encoded = sessionStorage.getItem('GoUrl')
  if (!iframe) return

  if (!encoded) {
    iframe.removeAttribute('src')
    iframe.style.display = 'none'
    return
  }

  iframe.style.display = 'block'
  iframe.src = encoded.startsWith('/e/') ? encoded : getProxyPath(encoded)
})

function decodeXor(input) {
  if (!input) return input
  try {
    let [str, ...search] = input.split('?')
    const decoded = decodeURIComponent(str)
      .split('')
      .map((char, index) => index % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char)
      .join('')
    return decoded + (search.length ? '?' + search.join('?') : '')
  } catch {
    return input
  }
}

function iframeLoad() {
  if (!iframe || !addressInput) return
  try {
    const currentUrl = iframe.contentWindow?.location.href
    if (!currentUrl || !currentUrl.startsWith(window.location.origin)) return

    const match = currentUrl.match(/\/a\/(?:q\/)?([^#]*)/)
    if (match?.[1]) {
      const decoded = decodeXor(match[1])
      addressInput.value = decoded
      localStorage.setItem('decoded', decoded)
    }
  } catch {
    // Cross-origin pages may prevent reading their location. The proxy still works.
  }
}

function reload() {
  if (!iframe) return
  if (!iframe.src || iframe.src === 'about:blank') {
    addressInput?.focus()
    return
  }
  iframe.contentWindow?.location.reload()
}

function popout() {
  if (!iframe?.src || iframe.src === 'about:blank') {
    addressInput?.focus()
    return
  }

  const newWindow = window.open('about:blank', '_blank')
  if (!newWindow) return

  const title = localStorage.getItem('name') || 'Cosmic'
  const icon = localStorage.getItem('icon') || '/favicon.png'
  newWindow.document.title = title

  const link = newWindow.document.createElement('link')
  link.rel = 'icon'
  link.href = icon
  newWindow.document.head.appendChild(link)

  const newIframe = newWindow.document.createElement('iframe')
  Object.assign(newIframe.style, {
    position: 'fixed',
    inset: '0',
    border: '0',
    width: '100%',
    height: '100%',
  })
  newIframe.allow = 'fullscreen; autoplay; clipboard-read; clipboard-write'
  newIframe.src = iframe.src
  newWindow.document.body.style.margin = '0'
  newWindow.document.body.appendChild(newIframe)
}

function erudaToggle() {
  if (!iframe) return
  try {
    const targetWindow = iframe.contentWindow
    const targetDocument = iframe.contentDocument
    if (!targetWindow || !targetDocument) return

    if (targetWindow.eruda?._isInit) {
      targetWindow.eruda.destroy()
      return
    }

    const script = targetDocument.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/eruda'
    script.onload = () => {
      targetWindow.eruda?.init()
      targetWindow.eruda?.show()
    }
    targetDocument.head.appendChild(script)
  } catch {
    alert('The inspector is unavailable on this page.')
  }
}

if (fullscreenButton) {
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // Fullscreen may be blocked by the browser or device.
    }
  })
}

if (homeButton) {
  homeButton.addEventListener('click', () => {
    sessionStorage.removeItem('GoUrl')
    if (iframe) {
      iframe.removeAttribute('src')
      iframe.style.display = 'none'
    }
    if (addressInput) {
      addressInput.value = ''
      addressInput.focus()
    }
  })
}

function goBack() {
  try {
    iframe?.contentWindow?.history.back()
  } catch {
    // Navigation may be unavailable before a page has loaded.
  }
}

function goForward() {
  try {
    iframe?.contentWindow?.history.forward()
  } catch {
    // Navigation may be unavailable before a page has loaded.
  }
}

document.addEventListener('fullscreenchange', () => {
  document.body.classList.toggle('fullscreen', Boolean(document.fullscreenElement))
})
