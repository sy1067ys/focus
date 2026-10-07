import { useState, useEffect } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#f0e9df',
  bgAlt: '#e5dbd0',
  dark: '#1c1510',
  darkFade: 'rgba(28,21,16,0.08)',
  gold: '#b5864a',
  goldMuted: '#c9a06a',
  cream: '#faf6f0',
  muted: '#9a8f82',
  mutedFade: 'rgba(154,143,130,0.5)',
  card: '#ddd5c8',
  espresso: '#2c1f14',
}

type View = 'home' | 'collection' | 'lineup' | 'product' | 'story'
type CartItem = { product: Product; size: string; qty: number }

interface Product {
  id: string; name: string; nameJa: string; price: number
  material: string; description: string; sizes: string[]
  color: string; colorName: string; image: string; images: string[]; category: string
}

const PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Wide Sleeve Wool Coat', nameJa: 'ワイドスリーブ ウールコート',
    price: 68000, material: '100% Virgin Wool',
    description: '上質なヴァージンウールを使用した、ゆったりとした袖のコート。身体の輪郭を包み込むように設計されたシルエットは、着る人に静かな存在感をもたらします。',
    sizes: ['XS', 'S', 'M', 'L'], color: '#2a2520', colorName: 'Charcoal',
    image: 'https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=800&h=1100&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=800&h=1100&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1687276154823-66f9cba2e484?w=800&h=1100&fit=crop&auto=format',
    ],
    category: 'Outerwear',
  },
  {
    id: 'p2', name: 'Linen Wide Trousers', nameJa: 'リネン ワイドトラウザーズ',
    price: 32000, material: '100% Linen',
    description: '軽量なリネン素材を使用したワイドシルエットのトラウザーズ。夏の空気を纏うような着心地で、季節を問わず着用いただけます。',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], color: '#c4b89a', colorName: 'Sand',
    image: 'https://images.unsplash.com/photo-1687276154397-74e327566a86?w=800&h=1100&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1687276154397-74e327566a86?w=800&h=1100&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1687276152656-f3fdf72bd5d8?w=800&h=1100&fit=crop&auto=format',
    ],
    category: 'Bottoms',
  },
  {
    id: 'p3', name: 'Cotton Voile Shirt', nameJa: 'コットン ボイルシャツ',
    price: 24000, material: '100% Cotton Voile',
    description: '薄手のコットンボイルを使用したオーバーサイズシャツ。透け感のある素材が、重ね着にも単体でも美しいシルエットを生み出します。',
    sizes: ['S', 'M', 'L'], color: '#f0ece4', colorName: 'Ivory',
    image: 'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=800&h=1100&fit=crop&auto=format',
    images: ['https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=800&h=1100&fit=crop&auto=format'],
    category: 'Tops',
  },
  {
    id: 'p5', name: 'Heavy Canvas Tote', nameJa: 'ヘビーキャンバス トート',
    price: 18000, material: '12oz Cotton Canvas',
    description: '厚手の綿キャンバスを使用したトートバッグ。使い込むほどに味わいが増し、長年のパートナーとなるよう設計されています。',
    sizes: ['ONE'], color: '#8a7d6a', colorName: 'Khaki',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=1100&fit=crop&auto=format',
    images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=1100&fit=crop&auto=format'],
    category: 'Accessories',
  },
  {
    id: 'p6', name: 'Cashmere Rollneck', nameJa: 'カシミア ロールネック',
    price: 52000, material: '100% Mongolian Cashmere',
    description: 'モンゴル産カシミアを使用したロールネックニット。肌に触れる繊維の細さと、着るたびに増すやわらかさが特徴です。',
    sizes: ['S', 'M', 'L', 'XL'], color: '#b8a898', colorName: 'Taupe',
    image: 'https://images.unsplash.com/photo-1604522655203-b60144616d5b?w=800&h=1100&fit=crop&auto=format',
    images: ['https://images.unsplash.com/photo-1604522655203-b60144616d5b?w=800&h=1100&fit=crop&auto=format'],
    category: 'Knitwear',
  },
]

const CATEGORIES = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Accessories']
const fmt = (n: number) => `¥${n.toLocaleString('ja-JP')}`

function GoldBtn({ onClick, children, full }: { onClick?: () => void; children: React.ReactNode; full?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: full ? '100%' : undefined, padding: '15px 32px', border: 'none', cursor: 'pointer', background: hov ? T.goldMuted : T.gold, color: T.cream, fontFamily: "'Work Sans', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.2s', borderRadius: 2 }}>
      {children}
    </button>
  )
}

function GhostBtn({ onClick, children, light }: { onClick?: () => void; children: React.ReactNode; light?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '13px 28px', cursor: 'pointer', background: hov ? (light ? 'rgba(255,255,255,0.07)' : 'rgba(28,21,16,0.04)') : 'transparent', border: `1px solid ${hov ? (light ? 'rgba(250,246,240,0.75)' : 'rgba(28,21,16,0.35)') : (light ? 'rgba(250,246,240,0.35)' : T.darkFade)}`, color: light ? T.cream : T.dark, fontFamily: "'Work Sans', sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.2s', borderRadius: 2 }}>
      {children}
    </button>
  )
}

function Nav({ view, setView, cartCount, onCartOpen }: { view: View; setView: (v: View) => void; cartCount: number; onCartOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-400" style={{ background: scrolled ? 'rgba(240,233,223,0.97)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? `1px solid ${T.darkFade}` : '1px solid transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 68 }}>
        <button onClick={() => setView('home')} style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, letterSpacing: '0.18em', color: T.dark, background: 'none', border: 'none', cursor: 'pointer' }}>FOUCUS</button>
        <div className="hidden md:flex items-center gap-8">
          {([['collection', 'Collection'], ['lineup', 'Lineup'], ['story', 'Story']] as [View, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, color: view === v ? T.gold : T.muted, borderBottom: view === v ? `1px solid ${T.gold}` : '1px solid transparent', paddingBottom: 2, transition: 'color 0.2s, border-color 0.2s' }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onCartOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.dark, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.gold }}>{cartCount}</span>}
          </button>
          <button className="md:hidden" onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.dark }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="17" x2="21" y2="17"/></>}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div style={{ background: T.bg, borderTop: `1px solid ${T.darkFade}`, padding: '20px 40px 28px' }}>
          {(['collection', 'lineup', 'story'] as View[]).map(v => (
            <button key={v} onClick={() => { setView(v); setMenuOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.dark, padding: '13px 0', borderBottom: `1px solid ${T.darkFade}` }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

function CartSidebar({ open, onClose, items, onRemove, onQtyChange }: { open: boolean; onClose: () => void; items: CartItem[]; onRemove: (i: number) => void; onQtyChange: (i: number, q: number) => void }) {
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,21,16,0.45)', zIndex: 100, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.3s' }}/>
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw', background: T.cream, zIndex: 101, transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${T.darkFade}` }}>
        <div style={{ padding: '22px 32px', borderBottom: `1px solid ${T.darkFade}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: T.dark }}>Cart</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 80, color: T.muted, fontSize: 13 }}>カートは空です</div>
          ) : items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 16, paddingBottom: 24, marginBottom: 24, borderBottom: `1px solid ${T.darkFade}` }}>
              <div style={{ width: 76, height: 100, background: T.card, flexShrink: 0, overflow: 'hidden', borderRadius: 2 }}>
                <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.dark, lineHeight: 1.5, marginBottom: 3 }}>{item.product.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.muted, marginBottom: 10 }}>{item.size} / {item.product.colorName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => onQtyChange(idx, Math.max(1, item.qty - 1))} style={{ background: 'none', border: `1px solid ${T.darkFade}`, width: 24, height: 24, cursor: 'pointer', fontSize: 14, color: T.dark, borderRadius: 2 }}>−</button>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => onQtyChange(idx, item.qty + 1)} style={{ background: 'none', border: `1px solid ${T.darkFade}`, width: 24, height: 24, cursor: 'pointer', fontSize: 14, color: T.dark, borderRadius: 2 }}>+</button>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: T.gold }}>{fmt(item.product.price * item.qty)}</span>
                </div>
              </div>
              <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.mutedFade, alignSelf: 'flex-start' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '20px 32px 28px', borderTop: `1px solid ${T.darkFade}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: T.muted }}>小計</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: T.dark }}>{fmt(total)}</span>
            </div>
            <div style={{ fontSize: 10, color: T.mutedFade, marginBottom: 20 }}>送料は次のステップで計算されます</div>
            <GoldBtn full>購入手続きへ</GoldBtn>
          </div>
        )}
      </div>
    </>
  )
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onSelect} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: T.card, marginBottom: 14, aspectRatio: '3/4', borderRadius: 3 }}>
        <img src={product.image} alt={product.nameJa} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)' }}/>
        <div style={{ position: 'absolute', top: 14, right: 14, background: T.gold, color: T.cream, fontSize: 9, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 2, opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(-4px)', transition: 'all 0.25s', fontFamily: "'Work Sans', sans-serif" }}>View</div>
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(240,233,223,0.88)', backdropFilter: 'blur(6px)', fontSize: 9, color: T.dark, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 2, fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}>{product.category}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, color: T.dark, fontWeight: 400, marginBottom: 2, lineHeight: 1.35 }}>{product.name}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{product.nameJa}</div>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: T.gold, flexShrink: 0 }}>{fmt(product.price)}</div>
      </div>
    </div>
  )
}

function HomeView({ setView, setProductId }: { setView: (v: View) => void; setProductId: (id: string) => void }) {
  return (
    <div style={{ background: T.bg }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, background: T.espresso, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=1600&h=1800&fit=crop&auto=format" alt="FOUCUS AW25" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,21,16,0.7) 0%, rgba(28,21,16,0.1) 65%, transparent 100%)' }}/>
        <div style={{ position: 'absolute', top: 128, left: 48, width: 2, height: 80, background: T.gold }}/>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px 0 60px' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24 }}>Autumn Winter 2025 — Men's Collection</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 'clamp(52px, 9vw, 108px)', lineHeight: 0.95, color: T.cream, letterSpacing: '-0.03em', marginBottom: 40 }}>
            Street<br /><span style={{ fontWeight: 300, fontStyle: 'italic' }}>Luxury.</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(250,246,240,0.6)', maxWidth: 360, lineHeight: 1.75, marginBottom: 40, fontWeight: 300 }}>
            日常に溶け込む上質。<br/>カジュアルとラグジュアリーの境界を問い直す、FOUCUSの2025秋冬コレクション。
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <GoldBtn onClick={() => setView('collection')}>Shop Now</GoldBtn>
            <GhostBtn onClick={() => setView('lineup')} light>Lineup →</GhostBtn>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 48, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 1, height: 56, background: 'rgba(181,134,74,0.5)' }}/>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(181,134,74,0.6)', letterSpacing: '0.2em', writingMode: 'vertical-lr' }}>SCROLL</span>
        </div>
      </section>

      {/* Gold marquee */}
      <div style={{ background: T.gold, padding: '13px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: T.cream, marginRight: 48 }}>FOUCUS AW25 — Street Luxury — Men's Collection —&nbsp;</span>
        ))}
      </div>

      {/* New Arrivals */}
      <section style={{ padding: '96px 48px', background: T.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>AW 2025</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 42, letterSpacing: '-0.02em', color: T.dark, lineHeight: 1 }}>New Arrivals</h2>
          </div>
          <button onClick={() => setView('collection')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.gold, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4 }}>すべて見る →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '56px 28px' }}>
          {PRODUCTS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onSelect={() => { setProductId(p.id); setView('product') }}/>)}
        </div>
      </section>

      {/* Split editorial */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 580 }}>
        <div style={{ background: T.espresso, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 56px' }}>
          <div style={{ width: 32, height: 2, background: T.gold }}/>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>Philosophy</div>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: 28, color: T.cream, lineHeight: 1.5, letterSpacing: '-0.01em', marginBottom: 36 }}>
              "上質な素材と<br/>無造作な着こなし——<br/>それがFOUCUSの文法。"
            </p>
            <GhostBtn onClick={() => setView('story')} light>Our Story</GhostBtn>
          </div>
        </div>
        <div style={{ background: T.card, overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1687276152656-f3fdf72bd5d8?w=900&h=700&fit=crop&auto=format" alt="FOUCUS Lookbook" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
      </section>

      {/* Category tiles */}
      <section style={{ padding: '80px 48px', background: T.bg }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.muted, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 36, textAlign: 'center' }}>Shop by Category</div>
        <CategoryTiles setView={setView}/>
      </section>

      <Footer/>
    </div>
  )
}

function CategoryTiles({ setView }: { setView: (v: View) => void }) {
  const tiles = [
    { cat: 'Outerwear', bg: T.espresso, color: T.cream },
    { cat: 'Tops', bg: T.bgAlt, color: T.dark },
    { cat: 'Bottoms', bg: T.dark, color: T.cream },
    { cat: 'Knitwear', bg: T.bgAlt, color: T.dark },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 3 }}>
      {tiles.map(({ cat, bg, color }) => {
        const [hov, setHov] = useState(false)
        return (
          <button key={cat} onClick={() => setView('collection')} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background: hov ? T.gold : bg, border: 'none', cursor: 'pointer', padding: '52px 28px', textAlign: 'left', transition: 'background 0.25s' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: hov ? 600 : 300, fontSize: 24, marginBottom: 10, color: hov ? T.cream : color, transition: 'all 0.2s' }}>{cat}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: hov ? 'rgba(250,246,240,0.7)' : (color === T.cream ? 'rgba(250,246,240,0.4)' : T.muted), transition: 'all 0.2s' }}>Shop →</div>
          </button>
        )
      })}
    </div>
  )
}

function CollectionView({ setView, setProductId }: { setView: (v: View) => void; setProductId: (id: string) => void }) {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === active)
  return (
    <div style={{ paddingTop: 68, background: T.bg }}>
      <div style={{ padding: '56px 48px 40px', borderBottom: `1px solid ${T.darkFade}` }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>AW 2025</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 52, letterSpacing: '-0.02em', marginBottom: 36, color: T.dark }}>Collection</h1>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)} style={{ background: active === cat ? T.gold : 'none', cursor: 'pointer', padding: '8px 18px', paddingLeft: cat === 'All' ? 0 : 18, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Work Sans', sans-serif", fontWeight: 500, color: active === cat ? T.cream : T.muted, border: 'none', borderRadius: active === cat ? 2 : 0, transition: 'all 0.2s' }}>{cat}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '64px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '64px 28px' }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} onSelect={() => { setProductId(p.id); setView('product') }}/>)}
        </div>
      </div>
      <Footer/>
    </div>
  )
}

function ProductView({ productId, setView, setProductId, onAddToCart }: { productId: string; setView: (v: View) => void; setProductId: (id: string) => void; onAddToCart: (p: Product, s: string) => void }) {
  const product = PRODUCTS.find(p => p.id === productId)
  const [size, setSize] = useState<string | null>(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded] = useState(false)
  if (!product) return null
  function handleAdd() { if (!size) return; onAddToCart(product!, size); setAdded(true); setTimeout(() => setAdded(false), 2000) }
  const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3)
  return (
    <div style={{ paddingTop: 68, background: T.bg }}>
      <div style={{ padding: '18px 48px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.muted }}>Home</button>
        <span style={{ color: T.mutedFade, fontSize: 10 }}>—</span>
        <button onClick={() => setView('collection')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.muted }}>Collection</button>
        <span style={{ color: T.mutedFade, fontSize: 10 }}>—</span>
        <span style={{ fontSize: 11, color: T.dark }}>{product.name}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh' }}>
        <div style={{ padding: '0 20px 0 48px', position: 'sticky', top: 68, height: 'fit-content' }}>
          <div style={{ background: T.card, aspectRatio: '3/4', overflow: 'hidden', marginBottom: 10, borderRadius: 3 }}>
            <img src={product.images[imgIdx]} alt={product.nameJa} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: 68, height: 88, padding: 0, border: 'none', cursor: 'pointer', outline: imgIdx === i ? `2px solid ${T.gold}` : '2px solid transparent', outlineOffset: 2, overflow: 'hidden', background: T.card, borderRadius: 2 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '12px 48px 80px 20px' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>{product.category}</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 34, letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.2, color: T.dark }}>{product.name}</h1>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 28 }}>{product.nameJa}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, color: T.gold, marginBottom: 36 }}>
            {fmt(product.price)}<span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>税込</span>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 10, fontWeight: 500 }}>Color — <span style={{ color: T.dark }}>{product.colorName}</span></div>
            <div style={{ width: 30, height: 30, background: product.color, border: `1px solid ${T.darkFade}`, outline: `2px solid ${T.gold}`, outlineOffset: 3, borderRadius: 2 }}/>
          </div>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
              <span>Size {size && `— ${size}`}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, textDecoration: 'underline', textUnderlineOffset: 3, fontSize: 10 }}>サイズガイド</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} style={{ width: 54, height: 54, background: size === s ? T.gold : 'none', cursor: 'pointer', border: size === s ? `1px solid ${T.gold}` : `1px solid ${T.darkFade}`, fontSize: 12, letterSpacing: '0.04em', fontWeight: 500, color: size === s ? T.cream : T.muted, transition: 'all 0.15s', borderRadius: 2 }}>{s}</button>
              ))}
            </div>
          </div>
          <button onClick={handleAdd} disabled={!size} style={{ width: '100%', padding: '18px', background: added ? '#5c8c5c' : (size ? T.gold : T.card), color: size ? T.cream : T.muted, border: 'none', cursor: size ? 'pointer' : 'not-allowed', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Work Sans', sans-serif", fontWeight: 500, transition: 'all 0.25s', marginBottom: 10, borderRadius: 2 }}>
            {added ? '✓ カートに追加しました' : size ? 'カートに追加' : 'サイズを選択してください'}
          </button>
          <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${T.darkFade}` }}>
            {([
              ['素材・詳細', product.description, product.material],
              ['お手入れ方法', 'ドライクリーニングを推奨します。やむを得ない場合は、手洗いにて30℃以下でお洗いください。', null],
              ['配送・返品', '全国送料無料。お届けまで3〜5営業日。商品到着後14日以内、未使用・タグ付きの場合のみご返品を承ります。', null],
            ] as [string, string, string | null][]).map(([title, body, material]) => (
              <details key={title}>
                <summary style={{ cursor: 'pointer', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dark, listStyle: 'none', display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${T.darkFade}`, fontWeight: 500 }}>
                  <span>{title}</span><span style={{ color: T.gold }}>+</span>
                </summary>
                <div style={{ padding: '14px 0 6px', fontSize: 13, color: T.muted, lineHeight: 1.8 }}>
                  {material && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.gold, marginBottom: 8 }}>{material}</div>}
                  {body}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: '80px 48px', borderTop: `1px solid ${T.darkFade}`, background: T.bgAlt }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Related</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 28, marginBottom: 48, color: T.dark }}>You may also like</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 24px' }}>
          {related.map(p => <ProductCard key={p.id} product={p} onSelect={() => { setProductId(p.id); window.scrollTo(0, 0) }}/>)}
        </div>
      </div>
      <Footer/>
    </div>
  )
}

function LineupView({ setView, setProductId }: { setView: (v: View) => void; setProductId: (id: string) => void }) {
  const categories = ['Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Accessories']
  return (
    <div style={{ paddingTop: 68, background: T.bg }}>
      <div style={{ padding: '64px 48px 40px', borderBottom: `1px solid ${T.darkFade}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>AW 2025 — 全商品</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 52, letterSpacing: '-0.02em', color: T.dark, lineHeight: 1 }}>Lineup</h1>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: T.gold, paddingBottom: 8 }}>{PRODUCTS.length} items</div>
      </div>
      {categories.map((cat, ci) => {
        const items = PRODUCTS.filter(p => p.category === cat)
        if (!items.length) return null
        return (
          <section key={cat} style={{ borderBottom: `1px solid ${T.darkFade}`, background: ci % 2 === 1 ? T.bgAlt : T.bg }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
              <div style={{ padding: '48px', borderRight: `1px solid ${T.darkFade}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.gold, letterSpacing: '0.2em', marginBottom: 10 }}>{String(ci + 1).padStart(2, '0')}</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 600, fontSize: 22, color: T.dark, marginBottom: 4 }}>{cat}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{items.length} item{items.length > 1 ? 's' : ''}</div>
                </div>
                <button onClick={() => setView('collection')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 40, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.gold, textDecoration: 'underline', textUnderlineOffset: 3, textAlign: 'left', padding: 0, fontWeight: 500 }}>すべて見る</button>
              </div>
              <div style={{ overflowX: 'auto', padding: '36px 40px' }}>
                <div style={{ display: 'flex', gap: 20, minWidth: 'max-content' }}>
                  {items.map(p => (
                    <div key={p.id} onClick={() => { setProductId(p.id); setView('product') }} style={{ cursor: 'pointer', width: 200, flexShrink: 0 }}>
                      <div style={{ background: T.card, overflow: 'hidden', aspectRatio: '2/3', marginBottom: 10, borderRadius: 3 }}>
                        <img src={p.image} alt={p.nameJa} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}/>
                      </div>
                      <div style={{ fontSize: 12, color: T.dark, marginBottom: 2, lineHeight: 1.35 }}>{p.name}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.gold }}>{fmt(p.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })}
      <section style={{ padding: '72px 48px', background: T.bgAlt }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Price List</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 24, marginBottom: 28, color: T.dark }}>全商品一覧</h2>
        <div style={{ border: `1px solid ${T.darkFade}`, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px', padding: '13px 24px', background: T.espresso }}>
            {['商品名', 'カテゴリ', '素材', '価格'].map(h => <div key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</div>)}
          </div>
          {PRODUCTS.map((p, i) => (
            <div key={p.id} onClick={() => { setProductId(p.id); setView('product') }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px', padding: '18px 24px', cursor: 'pointer', background: i % 2 === 0 ? T.bg : T.bgAlt, borderTop: `1px solid ${T.darkFade}`, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.card)}
              onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? T.bg : T.bgAlt)}>
              <div>
                <div style={{ fontSize: 13, color: T.dark, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{p.nameJa}</div>
              </div>
              <div style={{ fontSize: 12, color: T.muted, alignSelf: 'center' }}>{p.category}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted, alignSelf: 'center' }}>{p.material}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: T.gold, alignSelf: 'center', textAlign: 'right' }}>{fmt(p.price)}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </div>
  )
}

function StoryView() {
  return (
    <div style={{ paddingTop: 68, background: T.bg }}>
      <div style={{ position: 'relative', height: '60vh', minHeight: 420, overflow: 'hidden', background: T.espresso }}>
        <img src="https://images.unsplash.com/photo-1687276154823-66f9cba2e484?w=1600&h=800&fit=crop&auto=format" alt="FOUCUS Story" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}/>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '56px 48px' }}>
          <div>
            <div style={{ width: 2, height: 56, background: T.gold, marginBottom: 20 }}/>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.gold, letterSpacing: '0.22em', marginBottom: 14 }}>EST. 2019, TOKYO</div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: 'italic', fontSize: 56, color: T.cream, letterSpacing: '-0.02em' }}>Our Story</h1>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '88px 48px' }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 26, fontWeight: 300, lineHeight: 1.6, color: T.dark, marginBottom: 48, letterSpacing: '-0.01em' }}>
          "ストリートで育ち、アトリエで磨かれた——<br/>それがFOUCUSというブランドの正体。"
        </p>
        <div style={{ width: 2, height: 56, background: T.gold, margin: '0 0 48px' }}/>
        <p style={{ fontSize: 15, lineHeight: 2, color: T.muted, marginBottom: 28 }}>2019年、東京・原宿に生まれたFOUCUSは、「カジュアルとラグジュアリーの境界線を溶かす」という思想のもと、日本の職人技術とコンテンポラリーなストリートカルチャーを融合させたメンズアパレルブランドです。</p>
        <p style={{ fontSize: 15, lineHeight: 2, color: T.muted, marginBottom: 28 }}>日常着にも使える上質な素材、どこへでも着て行けるシルエット。スーツが必要な場所にも、ストリートにも。二項対立を超えた「着る自由」を提案しています。</p>
        <p style={{ fontSize: 15, lineHeight: 2, color: T.muted }}>季節ごとに展開するコレクションは、トレンドではなく、着る人の日常と寄り添うことを優先して設計されています。10年後も、その人のクローゼットで生き続けるものを。</p>
        <div style={{ marginTop: 72, padding: '48px', background: T.espresso, borderRadius: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[['2019', '設立年'], ['47', 'ストックアイテム数'], ['12', '国への出荷実績']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 600, fontStyle: 'italic', color: T.gold, marginBottom: 8 }}>{num}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(250,246,240,0.4)', letterSpacing: '0.15em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ background: T.espresso, color: T.cream, padding: '72px 48px 44px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, letterSpacing: '0.14em', color: T.gold, marginBottom: 14 }}>FOUCUS</div>
          <p style={{ fontSize: 12, color: 'rgba(250,246,240,0.4)', lineHeight: 1.9, maxWidth: 220 }}>カジュアルとラグジュアリーの<br/>境界線を溶かす。<br/>東京発メンズアパレル。</p>
        </div>
        {[
          { title: 'Shop', links: ['Collection', 'Lineup', 'New Arrivals', 'Archive'] },
          { title: 'Info', links: ['About', 'Sustainability', 'Stockists', 'Press'] },
          { title: 'Help', links: ['Size Guide', 'Shipping', 'Returns', 'Contact'] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: T.gold, textTransform: 'uppercase', marginBottom: 18 }}>{col.title}</div>
            {col.links.map(link => (
              <div key={link} style={{ marginBottom: 11 }}>
                <a href="#" style={{ fontSize: 12, color: 'rgba(250,246,240,0.45)', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = T.gold)}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(250,246,240,0.45)')}>{link}</a>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(250,246,240,0.07)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.2)' }}>© 2025 FOUCUS Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Instagram', 'X', 'Pinterest'].map(s => (
            <a key={s} href="#" style={{ fontSize: 11, color: 'rgba(250,246,240,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = T.gold)}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(250,246,240,0.3)')}>{s}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [productId, setProductId] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  function addToCart(product: Product, size: string) {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.size === size)
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], qty: n[idx].qty + 1 }; return n }
      return [...prev, { product, size, qty: 1 }]
    })
    setCartOpen(true)
  }

  function navigate(v: View) { setView(v); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Nav view={view} setView={navigate} cartCount={cart.reduce((s, i) => s + i.qty, 0)} onCartOpen={() => setCartOpen(true)}/>
      {view === 'home' && <HomeView setView={navigate} setProductId={setProductId}/>}
      {view === 'collection' && <CollectionView setView={navigate} setProductId={setProductId}/>}
      {view === 'lineup' && <LineupView setView={navigate} setProductId={setProductId}/>}
      {view === 'product' && <ProductView productId={productId} setView={navigate} setProductId={setProductId} onAddToCart={addToCart}/>}
      {view === 'story' && <StoryView/>}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} items={cart}
        onRemove={idx => setCart(p => p.filter((_, i) => i !== idx))}
        onQtyChange={(idx, qty) => setCart(p => p.map((item, i) => i === idx ? { ...item, qty } : item))}/>
    </div>
  )
}
