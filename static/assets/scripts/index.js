const form = document.getElementById('fs')
const input = document.getElementById('is')

if (form && input) {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    processUrl(input.value, '/p')
  })
}

function processUrl(value, path) {
  let url = String(value || '').trim()
  if (!url) {
    input?.focus()
    return
  }

  const engine = localStorage.getItem('engine') || 'https://www.google.com/search?q='
  if (!isUrl(url)) {
    url = engine + encodeURIComponent(url)
  } else if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP and HTTPS addresses are supported.')
    }
    url = parsed.href
  } catch (error) {
    showProxyError(error.message || 'Enter a valid website address or search term.')
    return
  }

  if (!window.__uv$config?.encodeUrl) {
    showProxyError('The proxy engine did not load. Refresh the page and try again.')
    return
  }

  const encoded = __uv$config.encodeUrl(url)
  sessionStorage.setItem('GoUrl', encoded)

  if (path) {
    location.href = path
    return
  }

  const useDynamic = localStorage.getItem('dy') === 'true'
  location.href = useDynamic ? '/a/q/' + encoded : '/a/' + encoded
}

function showProxyError(message) {
  let notice = document.getElementById('proxy-error')
  if (!notice) {
    notice = document.createElement('p')
    notice.id = 'proxy-error'
    notice.setAttribute('role', 'status')
    notice.style.cssText = 'position:fixed;z-index:9999;left:50%;top:58px;transform:translateX(-50%);max-width:90vw;padding:10px 14px;border-radius:10px;background:#7f1d1d;color:#fff;font:14px system-ui;'
    document.body.appendChild(notice)
  }
  notice.textContent = message
}

function go(value) {
  processUrl(value, '/p')
}

function blank(value) {
  processUrl(value)
}

function dy(value) {
  processUrl(value)
}

function isUrl(value = '') {
  const text = String(value).trim()
  return /^(https?:\/\/|localhost(?::\d+)?(?:\/|$))/i.test(text) ||
    /^(?:[\w-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(text)
}
