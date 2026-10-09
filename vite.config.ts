import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// サイト設定（以前は ./.figma/make/site.json から読み込んでいた内容をここに直接記載）
const siteConfiguration: FigmaSiteConfiguration = {
  title: 'FOCUS',
  description: '余計なものを削ぎ落とし、一着に集中する。東京発のアパレルブランド FOCUS の公式オンラインストア。',
  language: 'ja',
  robots: {
    index: false, // 検索エンジンに表示させたい場合は true に変更
  },
  accessibility: {
    addBypassLinks: false,
  },
  // ブラウザのタブに表示されるアイコン（シンボルマーク）
  icons: {
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAK80lEQVR42u1aW3AV5R3/vm+vZy/nQnIuuYxlJCIwARIwEogEhDxoCQ8QR+2MxUGxEabY6gOOhT5UZ6xjp1Z90PrgjLUWxGARZgidxNjUxqCEmwmiYhIgCbmQnPs5u3t2v0sf1snw0Cl4yEGY8p/zsHtm9tv/7/t+//tC08yCm1kQuMnlFoBbAG4BuAXgvwpjjOO4dDqdTqc5jmOM3Xwn4AJIpdIcxxXuLXzhloYQmqbFGIMQ3nwAGGMQItM0GWMQcoWDwRfSwKBlmZSyghpxQQEAwzAopTcfAEopxhhjnEqlp695nkcI3egACCEQQkVRLvdvPM97vX7GiGsSM+uU4Eyl0y5VFEUDgJ4+/dUXX3zR19eHMWGMCoJQXV1dW1t7553zAADZbBohNFM2zc/Uxns8CkJca+uhN95488iRI+l02nGce+6pAwB2dXUJguD3++vr67dv/+WqVatt28IYzwij0Exoj1VVHxwcbGpq2rBhQ3t7OwBA13X0vUCEkKZpGOODBw/ed9/927Zts6ycLMuEkB+fQoQQVdUPHz68ZcuWiYmJoqIi0zQBAOFwWNf1xYsXQQi//LLXMIyxsTFCiCzL0Wi0urr6ww/3zZ79k2w2e40mwe3atfPa9t67f//fH3roYYyJruvpdHru3Lk1NTV+vz+bzei6bttOPB4vLy+bN2+eJMljY2OiKCKETp36ctmyZUVFxRg712IP+Z8AIURVte7u7vvv/ymEECFEKWtoWGMY5qlTp7LZbCqVWrFiOQCgu/uIruuyLFdXV2ua1tvbW1FR0dHxSV3d8tbWVgjBtcTpPG2AMSYIQjQabW5+EmPMcRyEsKlpw8DAYEdHh2EYpmmqqhqJRCKRiKZplmU5jtPe3j48PLR169bjx4+rqtrZ+a8XXnhBlpVrCXZ5noBL/Wef3fHyy38Ih0OZTLapaePx4yf6+/sVRcEYNzf/4vHHH5+amgKAhcOR3bv3vPrqq5IkVVUtHh4evuuuuw4cOMhxnG3bHR3tNTV3G0aexpAPAEqpJMlnz55dubIeAJDJZNasuTeTyX7++eder5cx9u67f1m3rhEA0NNzFABQU3M3AOCTTzp27tw1NjY6NDS8YsXyWbOKOjo6MMbr169vafnANI38vCrKL2ZxHP/222/HYjFKaWlpqc/n6+npCQQCyWTylVf+uG5dYzIZp5RwHMdxHKUkkYitWbP26ad/PTJyMRQKHTt2QtPUkpKILMttbW3Hjh3zePIkEsqD/bIsT01dOnDgoNfrtW170aJFvb19giAkEomGhoZNmzZlsxlBEBCCLgCEoChKmUzqwQcfamxsjMXioij09vZVVi4khBiGsW/fPgjRdQJAKeV58bPPusfHxzVNC4WCoigODQ3JskwIfeyxzRAiABiEkDHG8zzP84wxCIHrZx59dBNjVJZl9xGv1ysIQmdnp2lmeZ6/TicAAOju7s7lcqlUKhgMTk5OYoxt2y4vL6urW0GI47LZ9VSCILiPIIQwtmtrl5WXl9u2jTGempqKRCIQwsHBc4ODg5Ik53EIPxgAQohS0td3GiFECAmFQpcuXRJF0bKsioo54XDYtu1pp84Ymy7nIYSO44RC4Tlz5uRyOZ7nJycvFRcXIYQymUx//wCEKI/a/6oAwMtEkiTDMC5cOO9qyfN8NBqFENq2U1JSynHCdFRijAWDwWCw2FXLJRXH8ZFIxLIsAEAsFpckiTFmWdbw8LC7O26i6srMZKOUUkqpu5duuj85OYkQFwwGOQ7puq4oiqqqgiCEQkGMHYwxYwAARinbv38/IWTz5s3uGoRgjHE4HC4qKnLZr2l6MBg0DCOZTCaTCcuyJEm8HMYVfesV4gBjbHx8PBaLZzLpRCIVj8eTyYRlmRcuDNt2DiF02223nT9/geOQZVmVlZVLlixVFI/H4/H5vADApUtrCCEnTx5HCKZSacuyDMPs6Tna13dakiQIYXl52dDQMKW0rKxUURRFUb1ePRAIBAJ+TdMCgUAkErkCBtPM/u+fZRm5nGnblm1buZzJGLl4cTgUComipKrqxo0bVVX1er0AgK1bn2SMZbOZXM40zSwheN++lpaWDwjBppnN5UzDyDDGmpubAQCapvn9/sbGRkVRAAC7du1kjJlm1rZz0++yLOOK6vFX43amnYPLZlmWi4qKLMtCCPE85/P5bNvmeSGTyQAAGKOUQpdxq1atAgAwRtxF3HUMIysIgiRJuq6LoiAIAs/zfr+fMeY4zuV2fDVm8MOM2PU8uu6NRMIYY8dxbNtWFMVxHI5DIyMXMXamTxxCFI/HYrEYhGjagxHijI6OIoQcx1FV1TRNtzQrKytz17/cYRQqkAmCuGTJEteyE4lEKBSybdvj8XzzzTcTE+OiKE7vImPgsmsmCMLk5OTg4DlZlh3HCQaL4/E4pVRRlDvuqHDD33VKpysrKx3HEUVxeHikrKzU9VE+n+/Mma85jnepghCybdtxvj8TN4QfPdozMjLiWnBxcXB0dIwxVlZWVlFRYdu56wEAIUQprq+vDwaDEMLx8XGeFwKBQHV1lSRJb731FgBwOn5h7DiOM208AIB33nkHAJDL5UpKIgCwWCyGMa6vX+nzBRzHuR4AIISmad5++5y1a9e6Vtvb2/vEE1vGxsYHBgZaWw+3th7SNK9t25QCxyEYY0qZbduqqre07D10qDUQCJimWVVVdebM1xBCSRIfeOABAPLsQOZdkdHm5icQQoqizJ49OxqN5nI5AIAoilu3bjtx4rjfP8s9K0oJQpzfP6uzs3P79l+pqppOpxcsmE8pO3/+PMZ4yZKldXV1lmXmV9DkU9QjhBzHrqiY++2332KMo9FoV1fX+vWNAwODGGPTNFta9nEcV15eFo3GMCYY49dff/2ZZ55xHAdjHAgE6upWtLW1CYJgmuZrr/1pwYLKXM7Kr6DJs6SklIqiNDY2Vl+/amJiQhCE4uLi1atXHT78j3g8IUmiYZiapjY0rKWUtbW1W5bpOs2SkpJ7713d3v6xW/U3NW3cu3evYWTzbnLl2VZxU8vi4lBpaaSlpUXT9EQiMTFxac2ae3men5qa4jgumUz6/b5sNtPf36+qGsehqqrFCxcu/PjjjnQ6TSkNBoO7d/9N01Q3xfoRGltuaf/SS79/7rnfBIPBXC6HEHKbQrFYdHR01G2Gfvfd2ZKS0kDAPzFx6eTJkzzPU0oJIR99tH/t2oZs9ppmUNcEwHWXiqK9+OKLu3b9Vtc1SZLS6bSu6+Xl5YrimT9/AWP0q6/OGIYxMjJimqau66lUSpKk9977a2Pj+mvUfgZai9MY3n9/z44dOy5eHPX5fBzHOY6TTCbr61cCAD799N9+v5/neffPxYsX//nPb9bWLs9kUvmVkTPZ3HUTmGw2/fDDP+vq6nrqqe2SJMViMbdDOi2ZTCYejxcVFT///O86O/9ZW7s8m50B7WdyPuA2bjlOOHdusL29vafnWH9/v5uiTU1NzZ8/b9myZatXrw6HI7ZtOY4zU2MOOIPfC7k5s8fjQej7rd2zZzch5JFHfu7eYmxbluX2IW/EEROEkOO4XC5HiEkp0XUfQsgtA9LppDsjmxHaFHbIByHkeY4Q4A7LCCGu3gWa1xdqzOqSxOPxMEavsra6sQC4Isty3mnmjQCASZIECiwFpJDbA3V97E1JIcaYoiiMsYJ+LlFAAIQQr1d3Lwr3FljQD1+nm6Q3qREXVvWZSeZ+dLkF4BaA/3cA/wF/R2RDuTU9ygAAAABJRU5ErkJggg==',
  },
}


// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
      watch: {
        ignored: [
          '**/.figma/**',
        ],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies the site configuration to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ''
  const favicon = config.icons?.icon ?? ''
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Dev-server only.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. Dev-server only.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html for the
 * Figma preview. Dev-only: skipped entirely by `vite build`.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}
