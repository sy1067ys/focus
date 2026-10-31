// ─────────────────────────────────────────────────────────────
// アクセス解析の設定
// IDを入れたサービスだけが動きます。空欄（''）のままなら何も送信しません。
// ─────────────────────────────────────────────────────────────

export const ANALYTICS = {
  // Googleアナリティクス4 の「測定ID」（例：'G-AB12CD34EF'）
  // アクセス数・流入元・売れ筋・カート投入などの数字を見るためのツール
  ga4Id: 'G-L0ZHX5NKZ1',

  // Microsoft Clarity の「プロジェクトID」（例：'abcd1234ef'）
  // ヒートマップ（よく見られている場所）や、閲覧の様子の録画を見るためのツール
  clarityId: 'z66rfsoxtw',
}

// ─── ここから下は変更しなくて大丈夫です ─────────────────────────

type Params = Record<string, unknown>
type W = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
}
const w = window as W

const ok = (id: string, pattern: RegExp) => pattern.test(id.trim())
export const gaEnabled = ok(ANALYTICS.ga4Id, /^G-[A-Z0-9]+$/i)
export const clarityEnabled = ok(ANALYTICS.clarityId, /^[a-z0-9]+$/i)

function addScript(src: string) {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

let started = false

// 解析ツールを読み込む（最初に1回だけ）
export function initAnalytics() {
  if (started) return
  started = true

  if (gaEnabled) {
    const id = ANALYTICS.ga4Id.trim()
    w.dataLayer = w.dataLayer || []
    w.gtag = function () {
      // gtag は arguments オブジェクトをそのまま渡す決まりです
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments)
    }
    w.gtag('js', new Date())
    // ページ表示は下の trackPageView で送るので、自動送信は止めておく
    w.gtag('config', id, { send_page_view: false })
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`)
  }

  if (clarityEnabled) {
    const id = ANALYTICS.clarityId.trim()
    const c = function () {
      // Clarity の決まりに合わせて arguments をそのまま積んでおく
      // eslint-disable-next-line prefer-rest-params
      ;(c.q = c.q || []).push(arguments)
    } as NonNullable<W['clarity']>
    w.clarity = w.clarity || c
    addScript(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`)
  }

  // メール・SNSリンクのクリックを記録
  document.addEventListener('click', e => {
    const a = (e.target as Element | null)?.closest?.('a')
    if (!a) return
    const href = a.getAttribute('href') ?? ''
    const sns = a.getAttribute('data-sns')
    if (href.startsWith('mailto:')) trackEvent('contact_email_click', { link_url: href.replace('mailto:', '') })
    else if (sns) trackEvent('sns_click', { platform: sns, link_url: href })
  })
}

// 「#/product/xxx」のようなページを、解析ツール上では「/product/xxx」として記録する
export function currentPagePath() {
  const path = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  return '/' + path
}

let lastPath = ''

export function trackPageView(title: string) {
  const path = currentPagePath()
  if (path === lastPath) return
  lastPath = path
  if (gaEnabled) {
    // 以降のイベント（カート投入など）もこのページで起きたものとして記録する
    // ?utm_source=instagram などの流入元パラメータもそのまま引き継ぐ
    w.gtag?.('set', { page_title: title, page_location: window.location.origin + path + window.location.search })
    w.gtag?.('event', 'page_view')
  }
  if (clarityEnabled) w.clarity?.('set', 'page', path)
}

export function trackEvent(name: string, params: Params = {}) {
  if (gaEnabled) w.gtag?.('event', name, params)
  if (clarityEnabled) w.clarity?.('event', name)
}

// ─── 販売データ用（Googleアナリティクスの「eコマース」レポートに反映されます） ──

export type TrackItem = {
  id: string
  name: string
  category: string
  price: number
  variant?: string
  quantity?: number
}

const toItems = (items: TrackItem[]) =>
  items.map(i => ({
    item_id: i.id,
    item_name: i.name,
    item_category: i.category,
    item_variant: i.variant,
    price: i.price,
    quantity: i.quantity ?? 1,
  }))

const total = (items: TrackItem[]) => items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0)

// 商品ページを見た／カートに入れた／カートから削除した／カートを開いた／購入手続きへ進んだ
export function trackCommerce(
  name: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'view_cart' | 'begin_checkout',
  items: TrackItem[],
) {
  if (items.length === 0) return
  trackEvent(name, { currency: 'JPY', value: total(items), items: toItems(items) })
}
