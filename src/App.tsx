import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { PRODUCTS, CATEGORIES, CATEGORY_LABELS, type Category, type Product } from './products'
import { SHOP } from './shop-config'

// ─── 共通 ─────────────────────────────────────────────────────

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

// ─── ページの切り替え（URLの # 以降でページを判定） ─────────────
// 例: #/shop  #/shop/outerwear  #/product/cashmere-rollneck  #/about

type Route =
  | { page: 'home' }
  | { page: 'shop'; category: Category | null }
  | { page: 'product'; id: string }
  | { page: 'about' }
  | { page: 'guide' }
  | { page: 'legal' }
  | { page: 'privacy' }
  | { page: 'notfound' }

function parseHash(): Route {
  const [first, second] = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!first) return { page: 'home' }
  if (first === 'shop') {
    if (!second) return { page: 'shop', category: null }
    const category = CATEGORIES.find(c => c.toLowerCase() === second.toLowerCase())
    return category ? { page: 'shop', category } : { page: 'notfound' }
  }
  if (first === 'product' && second) return { page: 'product', id: decodeURIComponent(second) }
  if (first === 'about') return { page: 'about' }
  if (first === 'guide') return { page: 'guide' }
  if (first === 'legal') return { page: 'legal' }
  if (first === 'privacy') return { page: 'privacy' }
  return { page: 'notfound' }
}

function useRoute() {
  const [route, setRoute] = useState<Route>(parseHash)
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

function pageTitle(route: Route): string {
  switch (route.page) {
    case 'home':
      return `${SHOP.brandName} | ${SHOP.tagline}`
    case 'shop':
      return `${route.category ? CATEGORY_LABELS[route.category] : 'すべての商品'} | ${SHOP.brandName}`
    case 'product':
      return `${findProduct(route.id)?.nameJa ?? '商品が見つかりません'} | ${SHOP.brandName}`
    case 'about':
      return `About | ${SHOP.brandName}`
    case 'guide':
      return `ご利用ガイド | ${SHOP.brandName}`
    case 'legal':
      return `特定商取引法に基づく表記 | ${SHOP.brandName}`
    case 'privacy':
      return `プライバシーポリシー | ${SHOP.brandName}`
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

// ─── ヘッダー ─────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '#/shop', label: 'Shop', page: 'shop' },
  { href: '#/about', label: 'About', page: 'about' },
  { href: '#/guide', label: 'Guide', page: 'guide' },
]

function Header({ route, cartCount, onOpenCart }: { route: Route; cartCount: number; onOpenCart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => setMenuOpen(false), [route])

  return (
    <>
      <div className="bg-ink py-2 text-center text-[11px] tracking-[0.08em] text-paper">{SHOP.announcement}</div>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Container className="grid h-14 grid-cols-3 items-center md:h-16">
          <div className="flex items-center">
            <button
              className="-ml-2 p-2 md:hidden"
              aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
            <nav className="hidden gap-8 text-[13px] tracking-wide md:flex">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`border-b pb-0.5 transition-colors ${
                    route.page === link.page ? 'border-ink' : 'border-transparent text-mute hover:text-ink'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <a href="#/" className="justify-self-center pl-[0.4em] text-[15px] font-medium tracking-[0.4em] md:text-[17px]">
            {SHOP.brandName}
          </a>
          <button onClick={onOpenCart} className="-mr-2 justify-self-end p-2 text-[13px] tracking-wide">
            Cart <span className="tabular-nums">({cartCount})</span>
          </button>
        </Container>

        {menuOpen && (
          <nav className="border-t border-line md:hidden">
            <Container className="flex flex-col py-4">
              {[{ href: '#/', label: 'Home' }, ...NAV_LINKS].map(link => (
                <a key={link.href} href={link.href} className="border-b border-line py-4 text-[22px] font-light last:border-0">
                  {link.label}
                </a>
              ))}
            </Container>
          </nav>
        )}
      </header>
    </>
  )
}

// ─── フッター ─────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="mt-24 border-t border-line md:mt-32">
      <Container className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="pl-[0.4em] text-[17px] font-medium tracking-[0.4em]">{SHOP.brandName}</p>
          <p className="mt-4 text-[13px] text-mute">{SHOP.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-[13px] md:col-span-7 md:grid-cols-3">
          <div>
            <Eyebrow>Shop</Eyebrow>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#/shop" className="hover:text-mute">すべての商品</a>
              </li>
              {CATEGORIES.map(c => (
                <li key={c}>
                  <a href={`#/shop/${c.toLowerCase()}`} className="hover:text-mute">
                    {CATEGORY_LABELS[c]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>Info</Eyebrow>
            <ul className="mt-4 space-y-3">
              <li><a href="#/about" className="hover:text-mute">ブランドについて</a></li>
              <li><a href="#/guide" className="hover:text-mute">ご利用ガイド</a></li>
              <li><a href="#/legal" className="hover:text-mute">特定商取引法に基づく表記</a></li>
              <li><a href="#/privacy" className="hover:text-mute">プライバシーポリシー</a></li>
            </ul>
          </div>
          <div>
            <Eyebrow>Contact</Eyebrow>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={`mailto:${SHOP.contactEmail}`} className="break-all hover:text-mute">
                  {SHOP.contactEmail}
                </a>
              </li>
              {SHOP.instagramUrl && (
                <li>
                  <a href={SHOP.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-mute">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </Container>
      <Container className="border-t border-line py-6 text-[11px] text-mute">
        © {new Date().getFullYear()} {SHOP.brandName}
      </Container>
    </footer>
  )
}

// ─── トップページ ─────────────────────────────────────────────

function HomePage() {
  const newArrivals = PRODUCTS.filter(p => p.isNew)
  const featured = (newArrivals.length ? newArrivals : PRODUCTS).slice(0, 4)

  return (
    <>
      {/* メインビジュアル */}
      <section>
        <Container className="grid gap-8 pt-4 md:grid-cols-12 md:gap-8 md:pt-8">
          <div className="order-2 flex flex-col justify-end pb-2 md:order-1 md:col-span-5 md:pb-12">
            <Eyebrow>{SHOP.hero.season}</Eyebrow>
            <h1 className="mt-5 text-[52px] font-light leading-[0.95] tracking-[-0.03em] md:text-[clamp(64px,7vw,112px)]">
              <Lines text={SHOP.hero.title} />
            </h1>
            <p className="mt-6 max-w-sm text-[14px] leading-[1.9] text-mute">
              <Lines text={SHOP.hero.lead} />
            </p>
            <div className="mt-8">
              <ArrowLink href="#/shop">コレクションを見る</ArrowLink>
            </div>
          </div>
          <div className="order-1 md:order-2 md:col-span-7">
            <div className="aspect-[4/5] overflow-hidden bg-stone">
              <img src={SHOP.hero.image} alt={`${SHOP.brandName} ${SHOP.hero.season}`} className="h-full w-full object-cover" />
            </div>
          </div>
        </Container>
      </section>

      {/* 新作 */}
      <section className="mt-24 md:mt-36">
        <Container>
          <div className="mb-8 flex items-end justify-between md:mb-12">
            <h2 className="text-[26px] font-light tracking-[-0.01em] md:text-[34px]">New arrivals</h2>
            <ArrowLink href="#/shop">すべて見る</ArrowLink>
          </div>
          <ProductGrid products={featured} />
        </Container>
      </section>

      {/* ブランドの考え方 */}
      <section className="mt-24 md:mt-36">
        <Container className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <div className="aspect-[4/5] overflow-hidden bg-stone">
              <img src={SHOP.philosophy.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <Eyebrow>Philosophy</Eyebrow>
            <p className="mt-5 text-[26px] font-light leading-[1.5] md:text-[32px]">
              <Lines text={SHOP.philosophy.title} />
            </p>
            <p className="mt-6 text-[14px] leading-[2] text-mute">{SHOP.philosophy.body}</p>
            <div className="mt-8">
              <ArrowLink href="#/about">ブランドについて</ArrowLink>
            </div>
          </div>
        </Container>
      </section>

      {/* カテゴリ */}
      <section className="mt-24 md:mt-36">
        <Container>
          <Eyebrow>Category</Eyebrow>
          <ul className="mt-6 border-t border-line">
            {CATEGORIES.map(c => {
              const count = PRODUCTS.filter(p => p.category === c).length
              return (
                <li key={c} className="border-b border-line">
                  <a href={`#/shop/${c.toLowerCase()}`} className="group flex items-center justify-between py-5 md:py-7">
                    <span className="flex items-baseline gap-4">
                      <span className="text-[24px] font-light transition-transform duration-300 group-hover:translate-x-2 md:text-[40px]">
                        {c}
                      </span>
                      <span className="text-[12px] text-mute">{CATEGORY_LABELS[c]}</span>
                    </span>
                    <span className="flex items-center gap-4 text-[12px] text-mute">
                      <span className="tabular-nums">{count} items</span>
                      <Icon name="arrow" className="h-5 w-5 text-ink" />
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>
    </>
  )
}

// ─── 商品一覧 ─────────────────────────────────────────────────

function ShopPage({ category }: { category: Category | null }) {
  const list = category ? PRODUCTS.filter(p => p.category === category) : PRODUCTS
  const filters: { href: string; label: string; active: boolean }[] = [
    { href: '#/shop', label: 'All', active: !category },
    ...CATEGORIES.map(c => ({ href: `#/shop/${c.toLowerCase()}`, label: c, active: category === c })),
  ]

  return (
    <Container className="pt-10 md:pt-16">
      <Eyebrow>{category ? CATEGORY_LABELS[category] : 'すべての商品'}</Eyebrow>
      <h1 className="mt-3 text-[36px] font-light tracking-[-0.02em] md:text-[56px]">{category ?? 'All items'}</h1>

      <div className="mt-8 flex items-center justify-between gap-6 border-y border-line md:mt-10">
        <nav className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 md:mx-0 md:px-0" aria-label="カテゴリ">
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
        <p className="hidden shrink-0 text-[12px] text-mute tabular-nums md:block">{list.length} items</p>
      </div>

      <div className="mt-8 md:mt-12">
        {list.length ? (
          <ProductGrid products={list} />
        ) : (
          <p className="py-24 text-center text-[14px] text-mute">このカテゴリの商品は準備中です。</p>
        )}
      </div>
    </Container>
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
      <Container className="pt-4 md:pt-6">
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
          <div className="md:sticky md:top-24">
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

// ─── その他のページ ───────────────────────────────────────────

function TextPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <Container className="pt-10 md:pt-16">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 text-[28px] font-light tracking-[-0.01em] md:text-[40px]">{title}</h1>
        <div className="mt-10 text-[14px] leading-[2]">{children}</div>
      </div>
    </Container>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="text-[15px] font-medium">{title}</h2>
      <div className="mt-4 text-mute">{children}</div>
    </section>
  )
}

function AboutPage() {
  return (
    <>
      <Container className="pt-10 md:pt-16">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-5 text-[32px] font-light leading-[1.4] tracking-[-0.01em] md:text-[56px]">
          <Lines text={SHOP.about.lead} />
        </h1>
      </Container>
      <Container className="mt-10 md:mt-16">
        <div className="aspect-[16/10] overflow-hidden bg-stone">
          <img src={SHOP.about.image} alt="" className="h-full w-full object-cover" />
        </div>
      </Container>
      <Container className="mt-12 md:mt-20">
        <div className="space-y-6 text-[15px] leading-[2.1] md:ml-[calc(100%*5/12)] md:max-w-xl">
          {SHOP.about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-12 md:ml-[calc(100%*5/12)]">
          <ArrowLink href="#/shop">コレクションを見る</ArrowLink>
        </div>
      </Container>
    </>
  )
}

function GuidePage() {
  return (
    <TextPage eyebrow="Guide" title="ご利用ガイド">
      <Section title="送料・配送">
        <p>{SHOP.shippingNote}</p>
      </Section>
      <Section title="返品・交換">
        <p>{SHOP.returnsNote}</p>
      </Section>
      <Section title="サイズガイド">
        <p>参考寸法（cm）です。商品によって異なる場合があります。</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-[13px] text-ink">
            <thead>
              <tr className="border-b border-ink">
                {SHOP.sizeGuide.headers.map(h => (
                  <th key={h} className="py-3 pr-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHOP.sizeGuide.rows.map(row => (
                <tr key={row[0]} className="border-b border-line">
                  {row.map((cell, i) => (
                    <td key={i} className="py-3 pr-4 tabular-nums">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="お問い合わせ">
        <p>
          ご不明な点は
          <a href={`mailto:${SHOP.contactEmail}`} className="mx-1 text-ink underline underline-offset-4">
            {SHOP.contactEmail}
          </a>
          までご連絡ください。
        </p>
      </Section>
    </TextPage>
  )
}

function LegalPage() {
  return (
    <TextPage eyebrow="Legal" title="特定商取引法に基づく表記">
      <dl className="border-t border-line">
        {SHOP.legal.map(([label, value]) => (
          <div key={label} className="grid gap-1 border-b border-line py-5 md:grid-cols-3 md:gap-6">
            <dt className="text-[13px] text-mute">{label}</dt>
            <dd className="text-[14px] md:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
    </TextPage>
  )
}

function PrivacyPage() {
  return (
    <TextPage eyebrow="Privacy" title="プライバシーポリシー">
      <p className="text-mute">
        {SHOP.brandName}（以下「当店」）は、お客様の個人情報を適切に取り扱い、保護することに努めます。
      </p>
      <Section title="取得する情報">
        <p>ご注文やお問い合わせの際に、お名前、住所、電話番号、メールアドレスなどの情報をお預かりします。</p>
      </Section>
      <Section title="利用目的">
        <p>お預かりした情報は、商品の発送、ご連絡、サービス向上のためにのみ利用します。</p>
      </Section>
      <Section title="第三者への提供">
        <p>法令に基づく場合や、配送業者・決済事業者など業務の遂行に必要な場合を除き、お客様の同意なく第三者に提供することはありません。</p>
      </Section>
      <Section title="お問い合わせ">
        <p>個人情報の取り扱いに関するお問い合わせは {SHOP.contactEmail} までご連絡ください。</p>
      </Section>
    </TextPage>
  )
}

function NotFoundPage() {
  return (
    <Container className="py-32 text-center">
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

  useEffect(() => {
    document.title = pageTitle(route)
  }, [route])

  const addToCart = (item: Omit<CartLine, 'qty'>) => {
    cart.add(item)
    setCartOpen(true)
  }

  let page: ReactNode
  switch (route.page) {
    case 'home':
      page = <HomePage />
      break
    case 'shop':
      page = <ShopPage category={route.category} />
      break
    case 'product':
      page = <ProductPage id={route.id} onAdd={addToCart} />
      break
    case 'about':
      page = <AboutPage />
      break
    case 'guide':
      page = <GuidePage />
      break
    case 'legal':
      page = <LegalPage />
      break
    case 'privacy':
      page = <PrivacyPage />
      break
    default:
      page = <NotFoundPage />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header route={route} cartCount={cart.count} onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">{page}</main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} />
    </div>
  )
}
