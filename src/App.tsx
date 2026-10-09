import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { PRODUCTS, CATEGORIES, CATEGORY_LABELS, type Category, type Product } from './products'
import { SHOP } from './shop-config'
import { logoImg, markImg } from './brand-assets'

// ─── 共通 ─────────────────────────────────────────────────────

// ブランドのコンセプト（トップページの一番大きな見出し。\n の位置で改行します）
const CONCEPT = 'Focus point\non life.'

// ブランドのSNS（URLを入れたものだけが SNS用ページとフッターに表示されます）
const SOCIAL_LINKS: { label: string; handle: string; url: string }[] = [
  { label: 'Instagram', handle: '@focus', url: SHOP.instagramUrl },
  { label: 'X', handle: '@focus', url: '' },
  { label: 'TikTok', handle: '@focus', url: '' },
  { label: 'LINE', handle: '公式アカウント', url: '' },
]
const ACTIVE_SOCIALS = SOCIAL_LINKS.filter(s => s.url)

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const findProduct = (id: string) => PRODUCTS.find(p => p.id === id)

// 改行（\n）を含む文章を表示する
function Lines({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

// ─── ページの切り替え ─────────────────────────────────────────
// トップページは1枚のページで、#/shop #/about #/guide #/info で各セクションへ移動します。
// 商品の詳細だけは別画面（#/product/商品ID）です。

const SECTIONS = ['top', 'shop', 'about', 'guide', 'info'] as const
type SectionId = (typeof SECTIONS)[number]

type Route =
  | { page: 'home'; section: SectionId; category: Category | null; open: 'legal' | 'privacy' | null }
  | { page: 'product'; id: string }
  | { page: 'links' }
  | { page: 'notfound' }

function homeRoute(section: SectionId, category: Category | null = null, open: 'legal' | 'privacy' | null = null): Route {
  return { page: 'home', section, category, open }
}

function parseHash(): Route {
  const [first, second] = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!first) return homeRoute('top')
  if (first === 'shop') {
    if (!second) return homeRoute('shop')
    const category = CATEGORIES.find(c => c.toLowerCase() === second.toLowerCase())
    return category ? homeRoute('shop', category) : { page: 'notfound' }
  }
  if (first === 'about' || first === 'guide' || first === 'info') return homeRoute(first)
  if (first === 'legal' || first === 'privacy') return homeRoute('info', null, first)
  if (first === 'product' && second) return { page: 'product', id: decodeURIComponent(second) }
  if (first === 'links') return { page: 'links' }
  return { page: 'notfound' }
}

function useRoute() {
  const [route, setRoute] = useState<Route>(parseHash)
  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    // 今いる場所と同じリンクを押したときも、もう一度そのセクションへ移動する
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a')
      const href = a?.getAttribute('href')
      if (href && href.startsWith('#') && href === (window.location.hash || '#/')) {
        e.preventDefault()
        onChange()
      }
    }
    window.addEventListener('hashchange', onChange)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('hashchange', onChange)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return route
}

function pageTitle(route: Route): string {
  switch (route.page) {
    case 'home': {
      const label: Record<SectionId, string> = {
        top: CONCEPT.replace('\n', ' '),
        shop: route.category ? CATEGORY_LABELS[route.category] : 'Online store',
        about: 'About',
        guide: 'ご利用ガイド',
        info: route.open === 'legal' ? '特定商取引法に基づく表記' : route.open === 'privacy' ? 'プライバシーポリシー' : 'Info',
      }
      return `${SHOP.brandName} | ${label[route.section]}`
    }
    case 'product':
      return `${findProduct(route.id)?.nameJa ?? '商品が見つかりません'} | ${SHOP.brandName}`
    case 'links':
      return `${SHOP.brandName} | Official links`
    default:
      return `ページが見つかりません | ${SHOP.brandName}`
  }
}

// ─── カート（ブラウザに保存されるので、再読み込みしても消えません） ──

type CartLine = { productId: string; size: string; color: string; qty: number }
const CART_KEY = 'focus-cart-v1'
const MAX_QTY = 10

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (l): l is CartLine =>
        l && typeof l.productId === 'string' && typeof l.qty === 'number' && !!findProduct(l.productId),
    )
  } catch {
    return []
  }
}

function useCart() {
  const [lines, setLines] = useState<CartLine[]>(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines))
    } catch {
      // 保存できない環境では何もしない
    }
  }, [lines])

  const add = (item: Omit<CartLine, 'qty'>) =>
    setLines(prev => {
      const i = prev.findIndex(
        l => l.productId === item.productId && l.size === item.size && l.color === item.color,
      )
      if (i >= 0) return prev.map((l, j) => (j === i ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l))
      return [...prev, { ...item, qty: 1 }]
    })

  const setQty = (index: number, qty: number) =>
    setLines(prev =>
      prev.map((l, i) => (i === index ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)),
    )

  const remove = (index: number) => setLines(prev => prev.filter((_, i) => i !== index))

  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + (findProduct(l.productId)?.price ?? 0) * l.qty, 0)

  return { lines, add, setQty, remove, count, subtotal }
}

// ─── アイコン ─────────────────────────────────────────────────

function Icon({ name, className = 'h-5 w-5' }: { name: 'menu' | 'close' | 'plus' | 'minus' | 'arrow'; className?: string }) {
  const paths: Record<string, ReactNode> = {
    menu: (
      <>
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="3" y1="16" x2="21" y2="16" />
      </>
    ),
    close: (
      <>
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
    arrow: (
      <>
        <line x1="4" y1="12" x2="20" y2="12" />
        <polyline points="14 6 20 12 14 18" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

// ─── 部品 ─────────────────────────────────────────────────────

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 md:px-8 ${className}`}>{children}</div>
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group inline-flex items-center gap-2 text-[13px] tracking-wide">
      <span className="border-b border-ink pb-0.5">{children}</span>
      <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  )
}

// ロゴタイプ（横長の「FOCUS」）
function Logo({ className = '' }: { className?: string }) {
  return <img src={logoImg} alt={SHOP.brandName} className={`block h-auto select-none ${className}`} draggable={false} />
}

// シンボルマーク（照準の「O」）
function Mark({ className = '', label }: { className?: string; label?: string }) {
  return (
    <img
      src={markImg}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      className={`block h-auto select-none ${className}`}
      draggable={false}
    />
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.2em] text-mute">{children}</p>
}

function ProductCard({ product }: { product: Product }) {
  return (
    <a href={`#/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone">
        <img
          src={product.images[0]}
          alt={product.nameJa}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {(product.soldOut || product.isNew) && (
          <span className="absolute left-2 top-2 bg-paper px-2 py-1 text-[10px] uppercase tracking-[0.15em] md:left-3 md:top-3">
            {product.soldOut ? 'Sold out' : 'New'}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1 text-[13px] md:flex-row md:justify-between md:gap-4">
        <div className="min-w-0">
          <p className="leading-snug">{product.name}</p>
          <p className="mt-0.5 text-[12px] text-mute">{product.nameJa}</p>
        </div>
        <p className="shrink-0 tabular-nums">{yen(product.price)}</p>
      </div>
    </a>
  )
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

// ─── 商品詳細 ─────────────────────────────────────────────────

function Accordion({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="border-b border-line" open={defaultOpen}>
      <summary className="flex items-center justify-between py-4 text-[13px] tracking-wide">
        {title}
        <Icon name="plus" className="accordion-icon h-4 w-4 transition-transform" />
      </summary>
      <div className="pb-5 text-[13px] leading-[1.9] text-mute">{children}</div>
    </details>
  )
}

function ProductPage({ id, onAdd }: { id: string; onAdd: (item: Omit<CartLine, 'qty'>) => void }) {
  const product = findProduct(id)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setSize(product && product.sizes.length === 1 ? product.sizes[0] : null)
    setColor(product?.colors[0]?.name ?? '')
    setError('')
  }, [id])

  if (!product) return <NotFoundPage />

  const handleAdd = () => {
    if (!size) {
      setError('サイズを選択してください')
      return
    }
    onAdd({ productId: product.id, size, color })
  }

  const sameCategory = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category)
  const others = PRODUCTS.filter(p => p.id !== product.id && p.category !== product.category)
  const related = [...sameCategory, ...others].slice(0, 4)

  return (
    <>
      <Container className="pt-20 md:pt-24">
        <nav className="flex flex-wrap gap-2 text-[11px] text-mute" aria-label="パンくずリスト">
          <a href="#/" className="hover:text-ink">Home</a>
          <span>/</span>
          <a href={`#/shop/${product.category.toLowerCase()}`} className="hover:text-ink">{product.category}</a>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </Container>

      <Container className="mt-4 grid gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
        {/* 写真（スマホは横スワイプ、PCは縦に並べる） */}
        <div className="-mx-4 md:col-span-7 md:mx-0">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 md:flex-col md:overflow-visible md:px-0">
            {product.images.map((src, i) => (
              <div
                key={src}
                className={`aspect-[3/4] shrink-0 snap-start overflow-hidden bg-stone md:w-full ${
                  product.images.length > 1 ? 'w-[86%]' : 'w-full'
                }`}
              >
                <img
                  src={src}
                  alt={i === 0 ? product.nameJa : `${product.nameJa} ${i + 1}枚目`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 商品情報 */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-20">
            <Eyebrow>{CATEGORY_LABELS[product.category]}</Eyebrow>
            <h1 className="mt-3 text-[26px] font-light leading-tight tracking-[-0.01em] md:text-[32px]">{product.name}</h1>
            <p className="mt-1 text-[13px] text-mute">{product.nameJa}</p>
            <p className="mt-5 text-[18px] tabular-nums">
              {yen(product.price)}
              <span className="ml-2 text-[11px] text-mute">（税込）</span>
            </p>

            {/* カラー */}
            <div className="mt-8">
              <p className="text-[12px] tracking-wide">
                Color <span className="text-mute">— {color}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {product.colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                    className={`h-7 w-7 rounded-full border border-line ring-offset-2 ring-offset-paper ${
                      color === c.name ? 'ring-1 ring-ink' : ''
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* サイズ */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-[12px] tracking-wide">
                <p>
                  Size {size && <span className="text-mute">— {size}</span>}
                </p>
                <a href="#/guide" className="text-mute underline underline-offset-4 hover:text-ink">サイズガイド</a>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setSize(s)
                      setError('')
                    }}
                    aria-pressed={size === s}
                    className={`h-11 border text-[12px] transition-colors ${
                      size === s ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {error && <p className="mt-3 text-[12px] text-[#b42318]">{error}</p>}
            </div>

            {/* カートに入れる */}
            <button
              onClick={handleAdd}
              disabled={product.soldOut}
              className="mt-8 w-full bg-ink py-4 text-[13px] tracking-[0.1em] text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:bg-stone disabled:text-mute"
            >
              {product.soldOut ? 'Sold out' : 'カートに入れる'}
            </button>
            <p className="mt-3 text-[11px] text-mute">
              {yen(SHOP.freeShippingThreshold)}以上のご購入で送料無料
            </p>

            <div className="mt-10 border-t border-line">
              <Accordion title="商品説明" defaultOpen>
                {product.description}
              </Accordion>
              <Accordion title="素材・お手入れ">
                <p>素材：{product.material}</p>
                <p className="mt-1">{product.care}</p>
              </Accordion>
              <Accordion title="配送・返品">
                <p>{SHOP.shippingNote}</p>
                <p className="mt-2">{SHOP.returnsNote}</p>
              </Accordion>
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="mt-24 md:mt-36">
          <Container>
            <h2 className="mb-8 text-[22px] font-light md:mb-12 md:text-[28px]">You may also like</h2>
            <ProductGrid products={related} />
          </Container>
        </section>
      )}
    </>
  )
}

// ─── ナビゲーション（画面上部に固定） ───────────────────────

const NAV_ITEMS: { href: string; label: string; section: SectionId }[] = [
  { href: '#/shop', label: 'Shop', section: 'shop' },
  { href: '#/about', label: 'About', section: 'about' },
  { href: '#/guide', label: 'Guide', section: 'guide' },
  { href: '#/info', label: 'Info', section: 'info' },
]

function SiteNav({ route, cartCount, onOpenCart }: { route: Route; cartCount: number; onOpenCart: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // トップの一番上では大きなマークが見えているので、ナビの小さなマークは隠す
  const showMark = route.page !== 'home' || scrolled

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || route.page !== 'home' ? 'border-b border-line bg-paper/90 backdrop-blur' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1040px] items-center justify-between px-5">
        <a
          href="#/"
          aria-label={`${SHOP.brandName} トップへ`}
          className={`transition-opacity duration-300 ${showMark ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <Mark className="w-6" />
        </a>
        <nav className="flex items-center gap-4 text-[12px] tracking-wide md:gap-8 md:text-[13px]" aria-label="メインメニュー">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                route.page === 'home' && route.section === item.section ? 'text-ink' : 'text-mute hover:text-ink'
              }`}
            >
              {item.label}
            </a>
          ))}
          <span className="h-3.5 w-px bg-line" aria-hidden="true" />
          <button onClick={onOpenCart} className="tracking-wide">
            Cart <span className="tabular-nums">({cartCount})</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

// ─── INFO（ページの一番下。全画面共通） ─────────────────────

function InfoSection({ open }: { open: 'legal' | 'privacy' | null }) {
  const item = 'block w-full py-3 text-left text-[16px] transition-colors hover:text-mute'
  return (
    <section id="info" className="mx-auto mt-28 w-full max-w-[460px] scroll-mt-20 border-t border-line px-5 pb-16 pt-12">
      <Eyebrow>Info</Eyebrow>
      <ul className="mt-6">
        <li><a href="#/about" className={item}>ブランドについて</a></li>
        <li><a href="#/guide" className={item}>ご利用ガイド</a></li>
        <li>
          <details key={`legal-${open}`} open={open === 'legal'} className="scroll-mt-20">
            <summary className={`${item} flex items-center justify-between`}>
              特定商取引法に基づく表記
              <Icon name="plus" className="accordion-icon h-4 w-4 transition-transform" />
            </summary>
            <dl className="mb-4 border-t border-line">
              {SHOP.legal.map(([label, value]) => (
                <div key={label} className="border-b border-line py-3">
                  <dt className="text-[11px] text-mute">{label}</dt>
                  <dd className="mt-0.5 text-[13px]">{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </li>
        <li>
          <details key={`privacy-${open}`} open={open === 'privacy'} className="scroll-mt-20">
            <summary className={`${item} flex items-center justify-between`}>
              プライバシーポリシー
              <Icon name="plus" className="accordion-icon h-4 w-4 transition-transform" />
            </summary>
            <div className="mb-4 space-y-3 border-t border-line pt-3 text-[13px] leading-[1.9] text-mute">
              <p>{SHOP.brandName}（以下「当店」）は、お客様の個人情報を適切に取り扱い、保護することに努めます。</p>
              <p>ご注文やお問い合わせの際に、お名前、住所、電話番号、メールアドレスなどの情報をお預かりします。お預かりした情報は、商品の発送、ご連絡、サービス向上のためにのみ利用します。</p>
              <p>法令に基づく場合や、配送業者・決済事業者など業務の遂行に必要な場合を除き、お客様の同意なく第三者に提供することはありません。</p>
              <p>個人情報の取り扱いに関するお問い合わせは {SHOP.contactEmail} までご連絡ください。</p>
            </div>
          </details>
        </li>
      </ul>

      <div className="mt-10">
        <Eyebrow>Contact</Eyebrow>
        <a href={`mailto:${SHOP.contactEmail}`} className="mt-4 inline-block text-[16px] underline underline-offset-4">
          {SHOP.contactEmail}
        </a>
        {ACTIVE_SOCIALS.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            {ACTIVE_SOCIALS.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-mute">
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="mt-14 text-center text-[11px] text-mute">© {new Date().getFullYear()} {SHOP.brandName}</p>
    </section>
  )
}

// ─── トップページ（1ページ構成） ─────────────────────────────

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-[26px] font-light tracking-[-0.01em] md:text-[32px]">{title}</h2>
    </div>
  )
}

function HomePage({ category }: { category: Category | null }) {
  const list = category ? PRODUCTS.filter(p => p.category === category) : PRODUCTS
  const filters = [
    { href: '#/shop', label: 'All', active: !category },
    ...CATEGORIES.map(c => ({ href: `#/shop/${c.toLowerCase()}`, label: c, active: category === c })),
  ]

  return (
    <>
      {/* ブランド */}
      <section id="top" className="mx-auto w-full max-w-[460px] px-5 pt-24 md:pt-28">
        <div className="flex flex-col items-center text-center">
          <Mark className="w-[72px]" label={`${SHOP.brandName} シンボルマーク`} />
          <Logo className="mt-6 w-[180px]" />
          <h1 className="mt-6 text-[20px] font-light tracking-[-0.01em]">{CONCEPT.replace('\n', ' ')}</h1>
          <p className="mt-2 text-[12px] tracking-[0.12em] text-mute">{SHOP.tagline}</p>
        </div>
        <nav className="mt-10 space-y-3" aria-label="ページ内の移動">
          <LinkRow href="#/shop" title="Online store" sub="オンラインストア" />
          <LinkRow href="#/about" title="About" sub="ブランドについて" />
          <LinkRow href="#/guide" title="Guide" sub="送料・返品・サイズガイド" />
        </nav>
      </section>

      {/* オンラインストア */}
      <section id="shop" className="mx-auto mt-28 w-full max-w-[1040px] scroll-mt-20 px-5">
        <SectionHeading eyebrow="Online store" title="Collection" />
        <p className="mt-3 text-center text-[12px] text-mute">{SHOP.announcement}</p>
        <nav className="no-scrollbar -mx-5 mt-8 flex gap-6 overflow-x-auto border-y border-line px-5 md:mx-0 md:justify-center" aria-label="カテゴリ">
          {filters.map(f => (
            <a
              key={f.href}
              href={f.href}
              aria-current={f.active ? 'page' : undefined}
              className={`shrink-0 border-b py-4 text-[13px] tracking-wide transition-colors ${
                f.active ? 'border-ink' : 'border-transparent text-mute hover:text-ink'
              }`}
            >
              {f.label}
            </a>
          ))}
        </nav>
        <div className="mt-8 md:mt-10">
          {list.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14">
              {list.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-[14px] text-mute">このカテゴリの商品は準備中です。</p>
          )}
        </div>
      </section>

      {/* ブランドについて */}
      <section id="about" className="mx-auto mt-28 w-full max-w-[560px] scroll-mt-20 px-5">
        <SectionHeading eyebrow="About" title="ブランドについて" />
        <p className="mt-8 text-center text-[20px] font-light leading-[1.6]">
          <Lines text={SHOP.about.lead} />
        </p>
        <div className="mt-8 space-y-5 text-[14px] leading-[2.1]">
          {SHOP.about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ご利用ガイド */}
      <section id="guide" className="mx-auto mt-28 w-full max-w-[560px] scroll-mt-20 px-5">
        <SectionHeading eyebrow="Guide" title="ご利用ガイド" />
        <div className="mt-8 border-t border-line">
          <Accordion title="送料・配送" defaultOpen>
            {SHOP.shippingNote}
          </Accordion>
          <Accordion title="返品・交換">{SHOP.returnsNote}</Accordion>
          <Accordion title="サイズガイド">
            <p>参考寸法（cm）です。商品によって異なる場合があります。</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] border-collapse text-left text-[13px] text-ink">
                <thead>
                  <tr className="border-b border-ink">
                    {SHOP.sizeGuide.headers.map(h => (
                      <th key={h} className="py-2 pr-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SHOP.sizeGuide.rows.map(row => (
                    <tr key={row[0]} className="border-b border-line">
                      {row.map((cell, i) => (
                        <td key={i} className="py-2 pr-3 tabular-nums">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Accordion>
          <Accordion title="お問い合わせ">
            ご不明な点は
            <a href={`mailto:${SHOP.contactEmail}`} className="mx-1 text-ink underline underline-offset-4">
              {SHOP.contactEmail}
            </a>
            までご連絡ください。
          </Accordion>
        </div>
      </section>
    </>
  )
}

// ─── SNS用ページ（プロフィールに貼るリンク集） ───────────────
// URL: https://（サイトのドメイン）/#/links

function LinkRow({ href, title, sub, external }: { href: string; title: string; sub: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group flex items-center justify-between border border-ink px-5 py-4 transition-colors hover:bg-ink hover:text-paper"
    >
      <span>
        <span className="block text-[14px] tracking-wide">{title}</span>
        <span className="mt-0.5 block text-[11px] text-mute transition-colors group-hover:text-paper/70">{sub}</span>
      </span>
      <Icon name="arrow" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
    </a>
  )
}

function LinksPage({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  const [copied, setCopied] = useState(false)
  // 新作を優先して並べ、3の倍数（最大6枚）にそろえて並びに隙間ができないようにする
  const sorted = [...PRODUCTS.filter(p => p.isNew), ...PRODUCTS.filter(p => !p.isNew)]
  const latest = sorted.slice(0, Math.min(6, Math.max(3, Math.floor(sorted.length / 3) * 3)))

  const copyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-[460px] px-5 pb-16 pt-12 md:pt-20">
      {/* カートに商品があるときだけ、右上にカートを表示 */}
      {cartCount > 0 && (
        <button onClick={onOpenCart} className="fixed right-4 top-4 z-30 border border-ink bg-paper px-4 py-2 text-[12px] tracking-wide md:right-8 md:top-6">
          Cart <span className="tabular-nums">({cartCount})</span>
        </button>
      )}

      {/* ブランド */}
      <div className="flex flex-col items-center text-center">
        <Mark className="w-[72px]" label={`${SHOP.brandName} シンボルマーク`} />
        <Logo className="mt-6 w-[180px]" />
        <h1 className="mt-6 text-[20px] font-light tracking-[-0.01em]">{CONCEPT.replace('\n', ' ')}</h1>
        <p className="mt-2 text-[12px] tracking-[0.12em] text-mute">{SHOP.tagline}</p>
      </div>

      {/* リンク */}
      <nav className="mt-10 space-y-3" aria-label="公式リンク">
        <LinkRow href="#/shop" title="Online store" sub="オンラインストア" />
        <LinkRow href="#/" title="Website" sub="公式サイト" />
        <LinkRow href="#/about" title="About" sub="ブランドについて" />
        <LinkRow href="#/guide" title="Guide" sub="送料・返品・サイズガイド" />
      </nav>

      {/* 新作（SNSのような正方形のタイル） */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <Eyebrow>New arrivals</Eyebrow>
          <a href="#/shop" className="text-[11px] text-mute underline underline-offset-4 hover:text-ink">すべて見る</a>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {latest.map(p => (
            <a key={p.id} href={`#/product/${p.id}`} className="group relative block aspect-square overflow-hidden bg-stone" aria-label={`${p.nameJa} ${yen(p.price)}`}>
              <img src={p.images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-2 py-1 text-[10px] tabular-nums text-paper opacity-0 transition-opacity group-hover:opacity-100">
                {yen(p.price)}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* SNS */}
      {ACTIVE_SOCIALS.length > 0 && (
        <section className="mt-12">
          <Eyebrow>Follow</Eyebrow>
          <div className="mt-4 space-y-3">
            {ACTIVE_SOCIALS.map(s => (
              <LinkRow key={s.label} href={s.url} title={s.label} sub={s.handle} external />
            ))}
          </div>
        </section>
      )}

      {/* お問い合わせ・共有 */}
      <section className="mt-12 border-t border-line pt-8 text-center">
        <p className="text-[12px] text-mute">お問い合わせ</p>
        <a href={`mailto:${SHOP.contactEmail}`} className="mt-1 inline-block text-[14px] underline underline-offset-4">
          {SHOP.contactEmail}
        </a>
        <div className="mt-8">
          <button onClick={copyLink} className="border border-line px-5 py-2.5 text-[12px] tracking-wide transition-colors hover:border-ink">
            {copied ? 'リンクをコピーしました' : 'このページのリンクをコピー'}
          </button>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-mute">
          <a href="#/legal" className="hover:text-ink">特定商取引法に基づく表記</a>
          <a href="#/privacy" className="hover:text-ink">プライバシーポリシー</a>
        </div>
        <p className="mt-4 text-[11px] text-mute">© {new Date().getFullYear()} {SHOP.brandName}</p>
      </section>
    </div>
  )
}

function NotFoundPage() {
  return (
    <Container className="flex flex-col items-center pb-10 pt-32 text-center">
      <Mark className="mb-8 w-16" />
      <p className="text-[40px] font-light">404</p>
      <p className="mt-4 text-[14px] text-mute">お探しのページは見つかりませんでした。</p>
      <div className="mt-10">
        <ArrowLink href="#/">トップページへ戻る</ArrowLink>
      </div>
    </Container>
  )
}

// ─── カート ───────────────────────────────────────────────────

function CartDrawer({
  open,
  onClose,
  cart,
}: {
  open: boolean
  onClose: () => void
  cart: ReturnType<typeof useCart>
}) {
  const [notice, setNotice] = useState(false)

  useEffect(() => {
    if (!open) {
      setNotice(false)
      return
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const { lines, subtotal } = cart
  const freeShipping = subtotal >= SHOP.freeShippingThreshold
  const shipping = lines.length === 0 || freeShipping ? 0 : SHOP.shippingFee
  const remaining = SHOP.freeShippingThreshold - subtotal

  const handleCheckout = () => {
    if (!SHOP.checkoutEnabled) setNotice(true)
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />
      <aside
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="カート"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-5 md:h-16">
          <p className="text-[13px] tracking-wide">
            Cart <span className="tabular-nums">({cart.count})</span>
          </p>
          <button onClick={onClose} className="-mr-2 p-2" aria-label="カートを閉じる">
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5">
            <Mark className="w-14 opacity-25" />
            <p className="text-[14px] text-mute">カートに商品はありません</p>
            <a href="#/shop" onClick={onClose} className="border border-ink px-8 py-3 text-[13px] tracking-wide">
              商品を見る
            </a>
          </div>
        ) : (
          <>
            {!freeShipping && (
              <p className="border-b border-line bg-stone px-5 py-3 text-[12px]">
                あと{yen(remaining)}のご購入で送料無料になります
              </p>
            )}
            <ul className="flex-1 overflow-y-auto px-5">
              {lines.map((line, index) => {
                const product = findProduct(line.productId)
                if (!product) return null
                return (
                  <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4 border-b border-line py-5">
                    <a href={`#/product/${product.id}`} onClick={onClose} className="w-20 shrink-0">
                      <div className="aspect-[3/4] overflow-hidden bg-stone">
                        <img src={product.images[0]} alt={product.nameJa} className="h-full w-full object-cover" />
                      </div>
                    </a>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] leading-snug">{product.name}</p>
                          <p className="mt-1 text-[11px] text-mute">
                            {line.color} / {line.size}
                          </p>
                        </div>
                        <button onClick={() => cart.remove(index)} className="h-fit text-[11px] text-mute underline underline-offset-2 hover:text-ink">
                          削除
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-line">
                          <button
                            onClick={() => cart.setQty(index, line.qty - 1)}
                            className="p-2 disabled:text-line"
                            disabled={line.qty <= 1}
                            aria-label="数量を減らす"
                          >
                            <Icon name="minus" className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-[12px] tabular-nums">{line.qty}</span>
                          <button
                            onClick={() => cart.setQty(index, line.qty + 1)}
                            className="p-2 disabled:text-line"
                            disabled={line.qty >= MAX_QTY}
                            aria-label="数量を増やす"
                          >
                            <Icon name="plus" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[13px] tabular-nums">{yen(product.price * line.qty)}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-line px-5 pb-6 pt-5">
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-mute">小計</dt>
                  <dd className="tabular-nums">{yen(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mute">送料</dt>
                  <dd className="tabular-nums">{shipping === 0 ? '無料' : yen(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-[15px]">
                  <dt>合計（税込）</dt>
                  <dd className="tabular-nums">{yen(subtotal + shipping)}</dd>
                </div>
              </dl>
              <button
                onClick={handleCheckout}
                className="mt-5 w-full bg-ink py-4 text-[13px] tracking-[0.1em] text-paper transition-opacity hover:opacity-85"
              >
                ご購入手続きへ
              </button>
              {notice && (
                <p className="mt-3 text-[12px] leading-relaxed text-mute">
                  オンライン決済は現在準備中です。ご購入をご希望の方は
                  <a href={`mailto:${SHOP.contactEmail}`} className="mx-1 text-ink underline underline-offset-2">
                    {SHOP.contactEmail}
                  </a>
                  までお問い合わせください。
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}

// ─── アプリ本体 ───────────────────────────────────────────────

export default function App() {
  const route = useRoute()
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const closeCart = useCallback(() => setCartOpen(false), [])
  const openCart = useCallback(() => setCartOpen(true), [])

  useEffect(() => {
    document.title = pageTitle(route)
  }, [route])

  // ページやセクションが変わったら、その場所へスクロール
  useEffect(() => {
    if (route.page === 'home' && route.section !== 'top') {
      const target = route.open ? document.querySelector(`#info details[open]`) ?? document.getElementById('info') : document.getElementById(route.section)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: route.page === 'home' ? 'smooth' : 'auto' })
    }
  }, [route])

  const addToCart = (item: Omit<CartLine, 'qty'>) => {
    cart.add(item)
    setCartOpen(true)
  }

  // SNS用ページは、ナビなしのリンク集として表示
  if (route.page === 'links') {
    return (
      <>
        <main className="min-h-screen">
          <LinksPage cartCount={cart.count} onOpenCart={openCart} />
        </main>
        <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} />
      </>
    )
  }

  let page: ReactNode
  switch (route.page) {
    case 'home':
      page = <HomePage category={route.category} />
      break
    case 'product':
      page = <ProductPage id={route.id} onAdd={addToCart} />
      break
    default:
      page = <NotFoundPage />
  }

  return (
    <div className="min-h-screen">
      <SiteNav route={route} cartCount={cart.count} onOpenCart={openCart} />
      <main>{page}</main>
      <InfoSection open={route.page === 'home' ? route.open : null} />
      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} />
    </div>
  )
}
