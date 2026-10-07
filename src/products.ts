// ─────────────────────────────────────────────────────────────
// 商品データ
// 商品の追加・変更はこのファイルだけで行えます。
// 写真は今は仮の素材です。実際の商品写真のURLに差し替えてください。
// ─────────────────────────────────────────────────────────────

export const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Accessories'] as const
export type Category = (typeof CATEGORIES)[number]

// カテゴリの日本語名
export const CATEGORY_LABELS: Record<Category, string> = {
  Outerwear: 'アウター',
  Tops: 'トップス',
  Bottoms: 'ボトムス',
  Knitwear: 'ニット',
  Accessories: 'アクセサリー',
}

export type Product = {
  id: string // URLに使われます（半角英数字とハイフンのみ）
  name: string // 英語の商品名
  nameJa: string // 日本語の商品名
  price: number // 税込価格（円）
  category: Category
  description: string // 商品説明
  material: string // 素材
  care: string // お手入れ方法
  sizes: string[] // サイズ展開（フリーサイズは ['ONE']）
  colors: { name: string; hex: string }[] // カラー展開
  images: string[] // 1枚目が一覧に表示されます。2枚目はマウスを乗せたときに表示
  isNew?: boolean // true にするとトップの New arrivals に表示
  soldOut?: boolean // true にすると「Sold out」表示になり購入不可
}

export const PRODUCTS: Product[] = [
  {
    id: 'wide-sleeve-wool-coat',
    name: 'Wide Sleeve Wool Coat',
    nameJa: 'ワイドスリーブ ウールコート',
    price: 68000,
    category: 'Outerwear',
    description:
      '上質なヴァージンウールを使用した、ゆったりとした袖のコート。身体の輪郭を包み込むように設計したシルエットが、着る人に静かな存在感をもたらします。',
    material: 'ウール 100%',
    care: 'ドライクリーニングを推奨します。',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Charcoal', hex: '#2a2a2a' }],
    images: [
      'https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=1200&h=1600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1687276154823-66f9cba2e484?w=1200&h=1600&fit=crop&auto=format',
    ],
    isNew: true,
  },
  {
    id: 'linen-wide-trousers',
    name: 'Linen Wide Trousers',
    nameJa: 'リネン ワイドトラウザーズ',
    price: 32000,
    category: 'Bottoms',
    description:
      '軽やかなリネンを使用したワイドシルエットのトラウザーズ。風を通す素材感で、季節を問わず穿いていただけます。',
    material: 'リネン 100%',
    care: '手洗い（30℃以下）を推奨します。',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Sand', hex: '#c9bfa8' }],
    images: [
      'https://images.unsplash.com/photo-1687276154397-74e327566a86?w=1200&h=1600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1687276152656-f3fdf72bd5d8?w=1200&h=1600&fit=crop&auto=format',
    ],
    isNew: true,
  },
  {
    id: 'cotton-voile-shirt',
    name: 'Cotton Voile Shirt',
    nameJa: 'コットン ボイルシャツ',
    price: 24000,
    category: 'Tops',
    description:
      '薄手のコットンボイルを使用したオーバーサイズシャツ。透け感のある素材が、重ね着にも一枚でも美しいシルエットをつくります。',
    material: 'コットン 100%',
    care: '洗濯ネットを使用し、弱水流で洗ってください。',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Ivory', hex: '#efebe3' }],
    images: [
      'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=1200&h=1600&fit=crop&auto=format',
    ],
    isNew: true,
  },
  {
    id: 'cashmere-rollneck',
    name: 'Cashmere Rollneck',
    nameJa: 'カシミア ロールネック',
    price: 52000,
    category: 'Knitwear',
    description:
      'カシミアを使用したロールネックニット。肌に触れる繊維の細さと、着るたびに増すやわらかさが特徴です。',
    material: 'カシミア 100%',
    care: 'ドライクリーニングを推奨します。',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Taupe', hex: '#b5a898' }],
    images: [
      'https://images.unsplash.com/photo-1604522655203-b60144616d5b?w=1200&h=1600&fit=crop&auto=format',
    ],
    isNew: true,
  },
  {
    id: 'heavy-canvas-tote',
    name: 'Heavy Canvas Tote',
    nameJa: 'ヘビーキャンバス トート',
    price: 18000,
    category: 'Accessories',
    description:
      '厚手のコットンキャンバスを使用したトートバッグ。使い込むほどに風合いが増し、長く付き合える一品です。',
    material: 'コットン 100%（12オンスキャンバス）',
    care: '汚れは固く絞った布で軽く拭き取ってください。',
    sizes: ['ONE'],
    colors: [{ name: 'Khaki', hex: '#8a7f6c' }],
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=1600&fit=crop&auto=format',
    ],
  },
]
