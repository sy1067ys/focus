import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { PRODUCTS, CATEGORIES, CATEGORY_LABELS, type Category, type Product } from './products'
import { SHOP } from './shop-config'
import { logoImg, markImg } from './brand-assets'
import { lineupTee, lineupBeanie } from './lineup-images'
import {
  MEMBER,
  useMember,
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  addViewHistory,
  getViewHistory,
  clearViewHistory,
  getOrders,
  type Member,
  type Order,
} from './member'
import { gaEnabled, clarityEnabled, initAnalytics, trackPageView, trackCommerce, trackEvent, type TrackItem } from './analytics'

// ─── 共通 ─────────────────────────────────────────────────────

// ブランドのコンセプト（トップページの一番大きな見出し。\n の位置で改行します）
const CONCEPT = 'Focus point\non life.'

// FOCUS line up（「FOCUSについて」と「Collection」の間に表示。写真を押すと商品ページへ）
const LINEUP: { label: string; labelEn: string; productId: string; image: string; alt: string }[] = [
  { label: 'Tシャツ', labelEn: 'T-shirts', productId: 'focus-logo-tee', image: lineupTee, alt: 'FOCUS ロゴTシャツ（表・裏）' },
  { label: '帽子', labelEn: 'Headwear', productId: 'focus-target-beanie', image: lineupBeanie, alt: 'FOCUS ターゲット ビーニー（ブラック・グレー）' },
]

// 公式LINE（トップページの「公式LINE」欄の内容）
const LINE_OA = {
  // 友だち追加URL（LINE公式アカウントの管理画面でコピーできます。例：'https://lin.ee/AbCdEfG'）
  // 空欄のあいだは、ボタンが「近日公開」の表示になります
  url: '',
  // LINE ID（例：'@focus'）
  id: '@focus',
  // QRコード画像のURL（管理画面の「友だち追加ガイド」でコピーできます。PCでのみ表示。空欄なら非表示）
  qrImage: '',
  lead: '新作や再入荷のお知らせを、\nいち早くLINEでお届けします。',
  // 友だちになるとできること（内容は自由に書き換えてください）
  benefits: [
    { title: 'New arrivals', text: '新作・再入荷のお知らせ' },
    { title: 'Early access', text: '先行販売・限定情報のご案内' },
    { title: 'Support', text: 'サイズやご注文についてのご相談' },
  ],
}

// ブランドのSNS（URLを入れたものだけが SNS用ページとフッターに表示されます）
// handle はアカウント名、about は「公式SNS」欄に出す一言です（@focus は仮の名前です）
// URLが空欄のSNSは「公式SNS」欄で「近日公開」と表示されます
const SOCIAL_LINKS: { label: string; handle: string; url: string; about: string }[] = [
  { label: 'Instagram', handle: '@focus', url: SHOP.instagramUrl, about: '新作やスタイリングを写真でお届けします。' },
  { label: 'X', handle: '@focus', url: '', about: '入荷・販売開始のお知らせを発信します。' },
  { label: 'TikTok', handle: '@focus', url: '', about: '着用イメージを動画でご紹介します。' },
  { label: 'LINE', handle: `公式アカウント ${LINE_OA.id}`, url: LINE_OA.url, about: '新作・再入荷のお知らせをお届けします。' },
]
const ACTIVE_SOCIALS = SOCIAL_LINKS.filter(s => s.url)

// 「FOCUSについて」の文章（\n の位置で改行します）
const ABOUT_TEXT = {
  lead: 'Focus point on life.',
  paragraphs: [
    'FOCUSは、自分の好きなもの、大切にしたいこと、目指す未来に目を向けるアパレルブランドです。',
    '日常に取り入れやすいカジュアルなスタイルに、印象に残るロゴやデザインを重ね、自分らしさを表現する服を提案します。',
    '服を選ぶ時間が、自分の気持ちや進みたい方向を見つめるきっかけになる。そんな存在を目指しています。',
    '自分の意思で選び、自分の人生を楽しむ。\nFOCUSは、その人らしい歩みを服を通して後押しします。',
  ],
}

// 特定商取引法に基づく表記（［　］の部分は公開前に必ず書き換えてください）
const LEGAL_INFO: [string, string][] = [
  ['ショップ名', 'FOCUS'],
  ['販売業者', 'YOICHI'],
  ['運営責任者', '横山真一郎'],
  ['所在地', '〒［郵便番号］ ［住所・番地・建物名・部屋番号］'],
  ['電話番号', '［連絡が取れる電話番号］'],
  ['お問い合わせ', '［メールアドレス］／［お問い合わせフォームURL］'],
  ['受付時間', '［対応する曜日・時間・休業日］'],
  ['販売価格', '各商品ページに税込価格を表示します。'],
  ['商品代金以外の必要料金', '送料：［具体的な金額、または地域別送料表へのリンク］。その他手数料：［内容と金額。発生しない場合は「なし」］。'],
  ['お支払方法', 'クレジットカード'],
  ['お支払時期・期限', '［決済方法ごとの決済時期・支払期限］'],
  ['商品の引渡時期', '通常商品は、［注文・決済・入金確認などの起算点］から［日数］以内に発送します。予約・受注生産商品は、各商品ページに具体的な発送予定日または期間を表示します。'],
  ['販売数量・申込期間', '数量制限や申込期限を設ける場合は、各商品ページにその内容を表示します。'],
  ['ご注文の変更・キャンセル', '［受付可能な期限、連絡方法、変更・キャンセルできない条件］'],
  ['お客様都合の返品・交換', '［返品・交換の可否、受付期限、未使用・タグ付きなどの商品状態の条件、連絡方法、送料負担者］'],
  ['不良品・破損・誤配送への対応', '商品に不良・破損がある場合や、ご注文と異なる商品が届いた場合は、上記お問い合わせ先へ、ご注文番号と商品の状況をご連絡ください。状況を確認のうえ、交換または返金で対応します。この場合の返送・再発送にかかる送料は当店が負担します。'],
]

// プライバシーポリシー（［　］の部分は公開前に必ず書き換えてください）
type PolicyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'dl'; items: [string, string][] }

// アクセス解析ツールを使う場合に、下の「6．Cookie等の利用」へ自動で追記される文章
// （analytics.ts にIDを入れたツールの分だけ表示されます）
const ANALYTICS_TOOLS: [string, string][] = [
  ...(gaEnabled
    ? [[
        'Googleアナリティクス',
        '送信先：Google LLC\n利用目的：アクセス数、流入元、商品の閲覧・カートへの追加状況などの分析\nプライバシーポリシー：https://policies.google.com/privacy\n無効化の方法：https://tools.google.com/dlpage/gaoptout',
      ] as [string, string]]
    : []),
  ...(clarityEnabled
    ? [[
        'Microsoft Clarity',
        '送信先：Microsoft Corporation\n利用目的：ページ内でよく見られている箇所やクリック・スクロール等の操作の分析\nプライバシーポリシー：https://privacy.microsoft.com/ja-jp/privacystatement',
      ] as [string, string]]
    : []),
]
const ANALYTICS_POLICY: PolicyBlock[] = ANALYTICS_TOOLS.length
  ? [
      { type: 'p', text: '当サイトでは、利用状況の把握とサイト・商品の改善のため、以下のアクセス解析ツールを利用しています。これらのツールは、Cookie等を利用して、閲覧したページ、滞在時間、クリック・スクロール等の操作、端末・ブラウザ情報、おおよその地域等の情報を収集し、各提供事業者へ送信します。' },
      { type: 'dl', items: ANALYTICS_TOOLS },
    ]
  : []
const PRIVACY_POLICY: { intro: string; sections: { title: string; blocks: PolicyBlock[] }[] } = {
  intro: "FOCUSのオンラインストアを運営するYOICHI（以下「当店」といいます）は、お客様の個人情報を適切に取り扱うため、個人情報保護法その他の関係法令を遵守し、以下の方針を定めます。",
  sections: [
    {
      title: "1．取得する情報",
      blocks: [
        { type: 'p', text: "当店は、ご注文、お問い合わせその他のサービスのご利用に際し、必要な範囲で以下の情報を取得します。" },
        { type: 'ul', items: [
          "氏名、住所、電話番号、メールアドレス",
          "配送先、お届け先の氏名・連絡先",
          "注文内容、購入履歴、支払状況、取引番号その他の決済に関する情報",
          "返品・交換・返金の対応履歴、お問い合わせ内容",
          "サイト利用時のIPアドレス、端末・ブラウザ情報、閲覧履歴、Cookie等の情報",
        ] },
        { type: 'p', text: "取得する情報は、ご利用の機能やお取引の内容によって異なります。" },
      ],
    },
    {
      title: "2．利用目的",
      blocks: [
        { type: 'p', text: "当店は、取得した個人情報を以下の目的で利用します。" },
        { type: 'ol', items: [
          "ご注文の受付、確認、決済および商品のお届け",
          "注文・発送状況など、お取引に必要なご連絡",
          "返品、交換、返金およびアフターサービスへの対応",
          "お問い合わせ、ご相談、苦情への対応",
          "本人確認、不正注文・不正決済の防止およびサイトの安全な運営",
          "ご利用状況の把握、商品・サービスやサイトの改善",
          "配信を希望・同意されたお客様への、新商品や販売情報などのご案内",
          "会計・税務その他の法令上必要な対応",
        ] },
        { type: 'p', text: "販売情報等の配信は、案内に記載された方法またはお問い合わせ窓口へのご連絡により停止できます。" },
        { type: 'p', text: "利用目的の範囲を超えて個人情報を取り扱う場合は、法令で認められる場合を除き、あらかじめご本人の同意を得ます。" },
      ],
    },
    {
      title: "3．業務委託",
      blocks: [
        { type: 'p', text: "当店は、商品の配送、決済、サイトの運営・保守などに必要な範囲で、個人情報の取扱いを外部の事業者に委託する場合があります。" },
        { type: 'p', text: "委託先の選定に際して個人情報の管理体制を確認し、委託する情報を必要な範囲に限定するとともに、契約等を通じて適切な管理・監督を行います。" },
      ],
    },
    {
      title: "4．第三者への提供",
      blocks: [
        { type: 'p', text: "当店は、法令に基づく場合など、法令で認められる場合を除き、あらかじめご本人の同意を得ることなく個人データを第三者に提供しません。" },
        { type: 'p', text: "前項の業務委託に伴う提供は、利用目的の達成に必要な範囲で行います。" },
        { type: 'p', text: "外国にある事業者に個人データを提供する場合は、委託の場合を含め、法令に従って必要な情報提供、同意取得その他の手続きを行います。提供先の保護措置を根拠として提供する場合は、その措置の継続的な実施を確保し、ご本人の求めに応じて法令上必要な情報を提供します。" },
      ],
    },
    {
      title: "5．安全管理と保存期間",
      blocks: [
        { type: 'p', text: "当店は、個人情報の漏えい、紛失、改ざん、不正アクセス等を防止するため、以下の安全管理措置を講じます。" },
        { type: 'ul', items: [
          "取扱責任者と担当者を明確にし、情報へのアクセス権限を必要な範囲に限定すること",
          "取得、利用、保存、削除等の取扱手順を整備し、担当者に周知すること",
          "機器、書類、記録媒体の紛失・盗難や、権限のない者による閲覧を防止すること",
          "情報システムへの不正アクセスや不正ソフトウェアへの対策を行うこと",
          "委託先の管理状況を確認し、必要な監督を行うこと",
        ] },
        { type: 'p', text: "外国で個人データを取り扱う場合は、当該国の個人情報保護制度等を把握したうえで、必要な対策を講じます。" },
        { type: 'p', text: "個人情報は、利用目的の達成に必要な期間および法令で保存が求められる期間保管し、保管する必要がなくなった情報は、安全な方法で消去・廃棄します。" },
        { type: 'p', text: "漏えい等が発生した場合は、被害の拡大防止と原因の調査を行い、法令上必要な場合には、個人情報保護委員会への報告およびご本人への通知を行います。" },
      ],
    },
    {
      title: "6．Cookie等の利用",
      blocks: [
        { type: 'p', text: "当サイトでは、カート機能の維持、表示設定の保存、安全な運営、利用状況の把握等のために、Cookieその他の類似技術を利用する場合があります。" },
        { type: 'p', text: "取得した情報を他の情報と照合することでお客様を識別できる場合は、個人情報として本ポリシーに従って取り扱います。" },
        { type: 'p', text: "Cookieはブラウザの設定で制限・削除できます。ただし、設定によっては、ご購入などサイトの一部機能が利用できなくなる場合があります。" },
        { type: 'p', text: "アクセス解析や広告等の外部サービスを利用する場合は、その利用目的、送信される情報、送信先および利用停止の方法等について、実際の利用内容に応じて当サイトで案内し、法令上必要な手続きを行います。" },
        ...ANALYTICS_POLICY,
      ],
    },
    {
      title: "7．開示・訂正・利用停止等のご請求",
      blocks: [
        { type: 'p', text: "ご本人または正当な代理人は、当店が保有する個人データについて、法令に従い、以下の請求を行うことができます。" },
        { type: 'ul', items: [
          "利用目的の通知",
          "保有個人データおよび第三者提供記録の開示",
          "内容の訂正、追加または削除",
          "利用の停止、消去または第三者への提供の停止",
        ] },
        { type: 'p', text: "ご請求は、下記のお問い合わせ窓口へ、氏名、ご希望の内容、対象となる情報を確認できる事項（注文番号等）をお知らせください。代理人によるご請求の場合は、その旨をお申し出ください。" },
        { type: 'p', text: "必要な範囲で本人確認・代理権の確認を行ったうえで、法令に従い遅滞なく対応します。開示は、原則として電子データの提供など、ご本人が希望される方法で行います。" },
        { type: 'p', text: "法令により全部または一部の請求に応じられない場合は、その旨と理由をご説明します。法令上の保存義務がある情報などは、直ちに消去できない場合があります。" },
        { type: 'p', text: "これらのご請求に関する手数料は無料です。" },
      ],
    },
    {
      title: "8．お問い合わせ窓口・事業者情報",
      blocks: [
        { type: 'p', text: "本ポリシー、安全管理措置の内容、個人情報の取扱いに関するご質問・苦情、開示等のご請求は、以下の窓口で受け付けます。" },
        { type: 'dl', items: [
          ["ショップ名", "FOCUS"],
          ["運営者", "YOICHI"],
          ["個人情報取扱事業者の氏名または名称", "［正式な法人名または個人事業主の氏名］"],
          ["代表者（法人の場合）", "［代表者氏名］"],
          ["運営責任者", "横山真一郎"],
          ["所在地", "〒［郵便番号］［住所・番地・建物名・部屋番号］"],
          ["メールアドレス", "［お問い合わせ用メールアドレス］"],
        ] },
      ],
    },
    {
      title: "9．本ポリシーの変更",
      blocks: [
        { type: 'p', text: "当店は、法令の改正やサービス内容の変更等に応じて、本ポリシーを見直します。" },
        { type: 'p', text: "変更した内容と適用開始日は当サイトに掲載し、重要な変更については適切な方法でお知らせします。法令上、ご本人の同意が必要な変更については、あらかじめ同意を得ます。" },
      ],
    },
  ],
}


const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const findProduct = (id: string) => PRODUCTS.find(p => p.id === id)

// アクセス解析に送る商品データ
const toTrackItem = (product: Product, variant?: string, quantity = 1): TrackItem => ({
  id: product.id,
  name: product.name,
  category: product.category,
  price: product.price,
  variant,
  quantity,
})
const lineToTrackItem = (line: CartLine): TrackItem[] => {
  const product = findProduct(line.productId)
  return product ? [toTrackItem(product, `${line.color} / ${line.size}`, line.qty)] : []
}

// 文章の中のURLをリンクにする
function Linkify({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https?:\/\/[^\s]+)/).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-mute">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  )
}

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

const SECTIONS = ['top', 'shop', 'about', 'lineup', 'guide', 'sns', 'line', 'info'] as const
type SectionId = (typeof SECTIONS)[number]

type Route =
  | { page: 'home'; section: SectionId; category: Category | null; open: 'legal' | 'privacy' | null }
  | { page: 'product'; id: string }
  | { page: 'links' }
  | { page: 'login'; reset: boolean }
  | { page: 'register' }
  | { page: 'account'; preview: boolean }
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
  if (first === 'about' || first === 'lineup' || first === 'guide' || first === 'sns' || first === 'line' || first === 'info') return homeRoute(first)
  if (first === 'legal' || first === 'privacy') return homeRoute('info', null, first)
  if (first === 'product' && second) return { page: 'product', id: decodeURIComponent(second) }
  if (first === 'links') return { page: 'links' }
  if (first === 'login') return { page: 'login', reset: second === 'reset' }
  if (first === 'register') return { page: 'register' }
  if (first === 'account') return { page: 'account', preview: second === 'preview' }
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
        lineup: 'Line up',
        guide: 'ご利用ガイド',
        sns: '公式SNS',
        line: '公式LINE',
        info: route.open === 'legal' ? '特定商取引法に基づく表記' : route.open === 'privacy' ? 'プライバシーポリシー' : 'Info',
      }
      return `${SHOP.brandName} | ${label[route.section]}`
    }
    case 'product':
      return `${findProduct(route.id)?.nameJa ?? '商品が見つかりません'} | ${SHOP.brandName}`
    case 'login':
      return `${route.reset ? 'パスワードの再設定' : 'ログイン'} | ${SHOP.brandName}`
    case 'register':
      return `新規会員登録 | ${SHOP.brandName}`
    case 'account':
      return `マイページ | ${SHOP.brandName}`
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

function Icon({ name, className = 'h-5 w-5' }: { name: 'menu' | 'close' | 'plus' | 'minus' | 'arrow' | 'bag' | 'search' | 'user'; className?: string }) {
  const paths: Record<string, ReactNode> = {
    // ショッピングバッグ（カート）
    bag: (
      <>
        <path d="M4.5 8.5h15l-1.2 12h-12.6z" />
        <path d="M8.5 8.5V6.5a3.5 3.5 0 0 1 7 0v2" />
      </>
    ),
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
    // 人の形（ログイン・マイページ）
    user: (
      <>
        <circle cx="12" cy="8.5" r="3.75" />
        <path d="M4.5 20.5c.8-3.9 3.8-6 7.5-6s6.7 2.1 7.5 6" />
      </>
    ),
    // 虫めがね（検索）
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <line x1="15" y1="15" x2="20" y2="20" />
      </>
    ),
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

// カートのボタン（バッグの絵＋点数の丸いバッジ）
function CartButton({ count, onClick, className = '' }: { count: number; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={count > 0 ? `カートを開く（${count}点）` : 'カートを開く（空）'}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Icon name="bag" className="h-[22px] w-[22px]" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] leading-none tabular-nums text-paper">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
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
    if (product) {
      trackCommerce('view_item', [toTrackItem(product)])
      addViewHistory(product.id)
    }
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

// ─── 商品検索 ─────────────────────────────────────────────────
// 商品名（英語・日本語）、カテゴリ、カラー、商品説明から探します。
// ひらがな／カタカナ、全角／半角、大文字／小文字の違いは区別しません。

function normalize(text: string) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(/[\s　・\-－‐]+/g, '')
}

const SEARCH_INDEX = PRODUCTS.map(p => ({
  product: p,
  // 名前に一致した商品を上に並べるため、名前とそれ以外を分けておく
  name: normalize(`${p.name} ${p.nameJa}`),
  rest: normalize([p.category, CATEGORY_LABELS[p.category], ...p.colors.map(c => c.name), p.description].join(' ')),
}))

function searchProducts(query: string): Product[] {
  const terms = query.split(/[\s　]+/).map(normalize).filter(Boolean)
  if (terms.length === 0) return []
  return SEARCH_INDEX.filter(e => terms.every(t => e.name.includes(t) || e.rest.includes(t)))
    .sort((a, b) => Number(terms.every(t => b.name.includes(t))) - Number(terms.every(t => a.name.includes(t))))
    .map(e => e.product)
}

function SearchResults({
  query,
  results,
  active,
  onPick,
}: {
  query: string
  results: Product[]
  active: number
  onPick: (p: Product) => void
}) {
  if (!query.trim()) return null
  if (results.length === 0) {
    return <p className="px-4 py-5 text-[13px] text-mute">「{query.trim()}」に一致する商品はありません</p>
  }
  return (
    <ul role="listbox" aria-label="検索結果" className="max-h-[60vh] overflow-y-auto py-1">
      {results.map((p, i) => (
        <li key={p.id} role="option" aria-selected={i === active}>
          <a
            href={`#/product/${p.id}`}
            onClick={() => onPick(p)}
            className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-stone ${i === active ? 'bg-stone' : ''}`}
          >
            <span className="h-14 w-11 shrink-0 overflow-hidden bg-stone">
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px]">{p.name}</span>
              <span className="mt-0.5 block truncate text-[11px] text-mute">
                {CATEGORY_LABELS[p.category]}・{p.nameJa}
              </span>
            </span>
            <span className="shrink-0 text-[12px] tabular-nums">{yen(p.price)}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function useSearch(onDone: () => void) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = searchProducts(query).slice(0, 8)

  const pick = (p: Product) => {
    trackEvent('search', { search_term: query.trim() })
    setQuery('')
    onDone()
    if (window.location.hash !== `#/product/${p.id}`) window.location.hash = `/product/${p.id}`
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = results[active] ?? results[0]
      if (target) pick(target)
    } else if (e.key === 'Escape') {
      setQuery('')
      onDone()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const onChange = (value: string) => {
    setQuery(value)
    setActive(0)
  }

  return { query, results, active, pick, onKeyDown, onChange }
}

// PC：ヘッダー左上の検索欄
function SearchBox() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const search = useSearch(() => setOpen(false))

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div ref={box} className="relative" role="search">
      <label className="flex w-[200px] items-center gap-2 border-b border-line pb-1 transition-colors focus-within:border-ink lg:w-[240px]">
        <Icon name="search" className="h-4 w-4 shrink-0 text-mute" />
        <input
          type="search"
          value={search.query}
          onChange={e => {
            search.onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={search.onKeyDown}
          placeholder="商品を検索"
          aria-label="商品を検索"
          style={{ outline: 'none' }}
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-mute [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      {open && search.query.trim() && (
        <div className="absolute left-0 top-full z-50 mt-3 w-[340px] border border-line bg-paper shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
          <SearchResults query={search.query} results={search.results} active={search.active} onPick={search.pick} />
        </div>
      )}
    </div>
  )
}

// スマホ：虫めがねを押すとヘッダーの下に開く検索パネル
function SearchPanel({ onClose }: { onClose: () => void }) {
  const search = useSearch(onClose)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    input.current?.focus()
  }, [])
  return (
    <div className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_12px_32px_rgba(0,0,0,0.08)] md:hidden" role="search">
      <div className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Icon name="search" className="h-4 w-4 shrink-0 text-mute" />
        <input
          ref={input}
          type="search"
          value={search.query}
          onChange={e => search.onChange(e.target.value)}
          onKeyDown={search.onKeyDown}
          placeholder="商品を検索"
          aria-label="商品を検索"
          style={{ outline: 'none' }}
          enterKeyHint="search"
          className="w-full bg-transparent text-[16px] outline-none placeholder:text-mute [&::-webkit-search-cancel-button]:hidden"
        />
        <button onClick={onClose} className="-mr-2 shrink-0 p-2" aria-label="検索を閉じる">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
      <SearchResults query={search.query} results={search.results} active={search.active} onPick={search.pick} />
    </div>
  )
}

const NAV_ITEMS: { href: string; label: string; section: SectionId }[] = [
  { href: '#/about', label: 'About', section: 'about' },
  { href: '#/lineup', label: 'Line up', section: 'lineup' },
  { href: '#/shop', label: 'Shop', section: 'shop' },
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
  const [searchOpen, setSearchOpen] = useState(false)
  const member = useMember()
  // ページが変わったらスマホの検索パネルを閉じる
  useEffect(() => setSearchOpen(false), [route])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || route.page !== 'home' ? 'border-b border-line bg-paper/90 backdrop-blur' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1040px] items-center justify-between px-5">
        {/* 左上：マーク（スクロールすると表示）＋ 商品検索 */}
        <div className="flex items-center">
          <a
            href="#/"
            aria-label={`${SHOP.brandName} トップへ`}
            tabIndex={showMark ? undefined : -1}
            className={`shrink-0 overflow-hidden transition-all duration-300 ${
              showMark ? 'mr-3 w-6 opacity-100 md:mr-6' : 'pointer-events-none mr-0 w-0 opacity-0'
            }`}
          >
            <Mark className="w-6" />
          </a>
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="-m-1.5 p-1.5 md:hidden"
            aria-label="商品を検索"
            aria-expanded={searchOpen}
          >
            <Icon name="search" className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex items-center gap-2.5 text-[11px] tracking-wide min-[380px]:gap-3 min-[380px]:text-[12px] min-[400px]:gap-4 md:gap-8 md:text-[13px]" aria-label="メインメニュー">
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
          <span className="hidden h-3.5 w-px bg-line min-[400px]:block" aria-hidden="true" />
          <a
            href={member ? '#/account' : '#/login'}
            aria-label={member ? 'マイページ' : 'ログイン'}
            title={member ? 'マイページ' : 'ログイン・会員登録'}
            className={`-m-1.5 p-1.5 transition-colors ${
              route.page === 'login' || route.page === 'register' || route.page === 'account' ? 'text-ink' : 'hover:text-mute'
            }`}
          >
            <Icon name="user" className="h-5 w-5" />
          </a>
          <CartButton count={cartCount} onClick={onOpenCart} className="-m-1.5 p-1.5" />
        </nav>
      </div>
      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
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
        <li><a href="#/about" className={item}>FOCUSについて</a></li>
        <li><a href="#/guide" className={item}>ご利用ガイド</a></li>
        <li><a href="#/login" className={item}>ログイン・会員登録</a></li>
        <li><a href="#/sns" className={item}>公式SNS</a></li>
        <li><a href="#/line" className={item}>公式LINE</a></li>
        <li>
          <details key={`legal-${open}`} open={open === 'legal'} className="scroll-mt-20">
            <summary className={`${item} flex items-center justify-between`}>
              特定商取引法に基づく表記
              <Icon name="plus" className="accordion-icon h-4 w-4 transition-transform" />
            </summary>
            <dl className="mb-4 border-t border-line">
              {LEGAL_INFO.map(([label, value]) => (
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
            <div className="mb-6 border-t border-line pt-4 text-[13px] leading-[1.9] text-mute">
              <p>{PRIVACY_POLICY.intro}</p>
              {PRIVACY_POLICY.sections.map(section => (
                <div key={section.title} className="mt-8">
                  <h3 className="text-[14px] font-medium text-ink">{section.title}</h3>
                  <div className="mt-3 space-y-3">
                    {section.blocks.map((block, i) => {
                      if (block.type === 'p') return <p key={i}><Linkify text={block.text} /></p>
                      if (block.type === 'dl')
                        return (
                          <dl key={i} className="border-t border-line">
                            {block.items.map(([label, value]) => (
                              <div key={label} className="border-b border-line py-3">
                                <dt className="text-[11px]">{label}</dt>
                                <dd className="mt-0.5 whitespace-pre-line break-all text-ink"><Linkify text={value} /></dd>
                              </div>
                            ))}
                          </dl>
                        )
                      const List = block.type === 'ol' ? 'ol' : 'ul'
                      return (
                        <List key={i} className={`space-y-1 pl-5 ${block.type === 'ol' ? 'list-decimal' : 'list-disc'}`}>
                          {block.items.map(text => <li key={text}>{text}</li>)}
                        </List>
                      )
                    })}
                  </div>
                </div>
              ))}
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
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" data-sns={s.label} className="hover:text-mute">
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
      <section id="top" className="mx-auto w-full max-w-[1200px] px-5 pt-28 md:px-8 md:pt-36">
        <div className="flex flex-col items-center text-center">
          {/* シンボルマーク（特大）＋ FOCUS の文字 */}
          {/* 左に大きなマーク、右にFOCUSの文字 */}
          <div className="flex w-full items-center justify-center gap-5 sm:gap-8 md:gap-12">
            {/* マークだけを左へずらす（FOCUSの文字の位置はそのまま） */}
            <Mark className="w-[40%] max-w-[380px] shrink-0 -translate-x-2 md:w-[34%] lg:-translate-x-10 xl:-translate-x-[104px]" label={`${SHOP.brandName} シンボルマーク`} />
            {/* FOCUSの文字（大きさの上限：スマホ160px／タブレット400px／PC 500px） */}
            <div className="min-w-0 max-w-[160px] flex-1 sm:max-w-[260px] md:max-w-[400px] lg:max-w-[500px]">
              <Logo className="w-full" />
            </div>
          </div>

          {/* コンセプト */}
          <h1 className="mt-14 text-[24px] font-light tracking-[-0.02em] sm:text-[28px] md:mt-20 md:text-[36px] lg:text-[42px]">
            {CONCEPT.replace('\n', ' ')}
          </h1>
          <p className="mt-3 text-[11px] tracking-[0.16em] text-mute md:mt-4 md:text-[14px]">{SHOP.tagline}</p>
        </div>
      </section>

      {/* FOCUSについて */}
      <section id="about" className="mx-auto mt-44 w-full max-w-[560px] scroll-mt-20 px-5 md:mt-60">
        <SectionHeading eyebrow="About" title="FOCUSについて" />
        <p className="mt-8 text-center text-[20px] font-light leading-[1.6]">
          <Lines text={ABOUT_TEXT.lead} />
        </p>
        <div className="mt-8 space-y-5 text-[14px] leading-[2.1]">
          {ABOUT_TEXT.paragraphs.map((p, i) => (
            <p key={i}>
              <Lines text={p} />
            </p>
          ))}
        </div>
      </section>

      {/* FOCUS line up */}
      <LineupSection />

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

      {/* 公式LINE */}
      {/* 公式SNS */}
      <SnsSection />

      {/* 公式LINE */}
      <LineSection />
    </>
  )
}

function LineupSection() {
  return (
    <section id="lineup" className="mx-auto mt-28 w-full max-w-[1040px] scroll-mt-20 px-5">
      <SectionHeading eyebrow="Line up" title="FOCUS line up" />
      <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-8">
        {LINEUP.map(item => {
          const product = findProduct(item.productId)
          if (!product) return null
          return (
            <a key={item.productId} href={`#/product/${product.id}`} className="group block">
              <div className="aspect-[3/2] overflow-hidden bg-white">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-end justify-between gap-4 border-b border-line pb-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mute">{item.labelEn}</p>
                  <h3 className="mt-1 text-[20px] font-light">{item.label}</h3>
                  <p className="mt-1 text-[12px] text-mute">
                    {product.name}
                    <span className="ml-2 tabular-nums text-ink">{yen(product.price)}</span>
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2 text-[12px] tracking-wide">
                  商品を見る
                  <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

// LINEはすぐ下に専用の欄があるので、ここではそれ以外のSNSを並べる
function SnsSection() {
  const list = SOCIAL_LINKS.filter(s => s.label !== 'LINE')
  return (
    <section id="sns" className="mx-auto mt-28 w-full max-w-[1040px] scroll-mt-20 px-5">
      <SectionHeading eyebrow="Follow us" title="公式SNS" />
      <p className="mt-6 text-center text-[14px] leading-[2]">
        新作の情報やスタイリングを、
        <br className="sm:hidden" />
        SNSでも発信しています。
      </p>
      <ul className="mt-10 grid border-t border-line md:grid-cols-3 md:border-l">
        {list.map(s => (
          <li key={s.label} className="flex flex-col border-b border-line py-8 md:border-r md:px-8 md:py-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-mute">{s.label}</p>
            <p className="mt-3 text-[22px] font-light tracking-[-0.01em]">{s.handle}</p>
            <p className="mt-3 flex-1 text-[13px] leading-[1.9] text-mute">{s.about}</p>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                data-sns={s.label}
                className="group mt-6 flex items-center justify-between border border-ink px-5 py-3.5 text-[13px] tracking-[0.08em] transition-colors hover:bg-ink hover:text-paper"
              >
                フォローする
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <p className="mt-6 border border-line px-5 py-3.5 text-[13px] tracking-[0.08em] text-mute">近日公開</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function LineSection() {
  const hasQr = !!LINE_OA.qrImage
  return (
    <section id="line" className="mx-auto mt-28 w-full max-w-[760px] scroll-mt-20 px-5">
      <SectionHeading eyebrow="Official LINE" title="公式LINE" />
      <p className="mt-6 text-center text-[14px] leading-[2]">
        <Lines text={LINE_OA.lead} />
      </p>

      <ul className="mt-10 grid border-y border-line sm:grid-cols-3">
        {LINE_OA.benefits.map((b, i) => (
          <li
            key={b.title}
            className={`py-5 text-center sm:py-7 ${i > 0 ? 'border-t border-line sm:border-l sm:border-t-0' : ''}`}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-mute">{b.title}</p>
            <p className="mt-2 text-[13px]">{b.text}</p>
          </li>
        ))}
      </ul>

      <div className={`mt-10 flex flex-col items-center gap-8 ${hasQr ? 'md:flex-row md:justify-center md:gap-14' : ''}`}>
        {hasQr && (
          <div className="hidden shrink-0 text-center md:block">
            <img src={LINE_OA.qrImage} alt="公式LINE 友だち追加用QRコード" className="h-32 w-32 border border-line bg-white p-2" />
            <p className="mt-2 text-[11px] text-mute">スマートフォンで読み取り</p>
          </div>
        )}
        <div className="flex w-full max-w-[320px] flex-col items-center">
          {LINE_OA.url ? (
            <a
              href={LINE_OA.url}
              target="_blank"
              rel="noreferrer"
              data-sns="LINE"
              className="group flex w-full items-center justify-center gap-3 bg-ink py-4 text-[13px] tracking-[0.1em] text-paper transition-opacity hover:opacity-85"
            >
              友だち追加する
              <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          ) : (
            <p className="w-full border border-line py-4 text-center text-[13px] tracking-[0.1em] text-mute">近日公開</p>
          )}
          <p className="mt-3 text-[12px] text-mute">
            LINE ID：<span className="text-ink">{LINE_OA.id}</span>
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── SNS用ページ（プロフィールに貼るリンク集） ───────────────
// URL: https://（サイトのドメイン）/#/links

function LinkRow({ href, title, sub, external, sns }: { href: string; title: string; sub: string; external?: boolean; sns?: string }) {
  return (
    <a
      href={href}
      data-sns={sns}
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
        <div className="fixed right-4 top-4 z-30 md:right-8 md:top-6">
          <CartButton count={cartCount} onClick={onOpenCart} className="h-11 w-11 border border-line bg-paper" />
        </div>
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
        <LinkRow href="#/about" title="About" sub="FOCUSについて" />
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
              <LinkRow key={s.label} href={s.url} title={s.label} sub={s.handle} external sns={s.label} />
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

// ─── 会員ページ（ログイン・会員登録・マイページ） ─────────────────

const inputStyle = { outline: 'none' }

function Field({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  error,
  hint,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  error?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="text-[12px] tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        style={inputStyle}
        className={`mt-2 h-12 w-full border bg-paper px-4 text-[16px] transition-colors focus:border-ink md:text-[14px] ${
          error ? 'border-[#b42318]' : 'border-line'
        }`}
      />
      {error ? (
        <span className="mt-1.5 block text-[12px] text-[#b42318]">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-[11px] text-mute">{hint}</span>
      )}
    </label>
  )
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="border border-line bg-stone px-4 py-3 text-[12px] leading-relaxed">
      {children}
    </p>
  )
}

function SubmitButton({ children, busy }: { children: ReactNode; busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full bg-ink py-4 text-[13px] tracking-[0.1em] text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

function AuthLayout({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px] px-5 pb-8 pt-28 md:pt-36">
      <SectionHeading eyebrow={eyebrow} title={title} />
      {lead && <p className="mt-5 text-center text-[13px] leading-[1.9] text-mute">{lead}</p>}
      <div className="mt-10">{children}</div>
    </div>
  )
}

function LoginPage({ reset, message }: { reset?: boolean; message?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setErrors({})
    setNotice('')
  }, [reset])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!isEmail(email)) next.email = 'メールアドレスを正しく入力してください'
    if (!reset && !password) next.password = 'パスワードを入力してください'
    setErrors(next)
    setNotice('')
    if (Object.keys(next).length) return
    setBusy(true)
    const result = reset ? await requestPasswordReset(email.trim()) : await signIn(email.trim(), password)
    setBusy(false)
    if (!result.ok) setNotice(result.message)
    else if (reset) setNotice('パスワード再設定用のメールをお送りしました。メールに記載のリンクから再設定してください。')
    else window.location.hash = '/account'
  }

  if (reset) {
    return (
      <AuthLayout eyebrow="Password" title="パスワードの再設定" lead="ご登録のメールアドレスに、パスワード再設定用のリンクをお送りします。">
        <form onSubmit={submit} noValidate className="space-y-6">
          <Field label="メールアドレス" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
          {notice && <Notice>{notice}</Notice>}
          <SubmitButton busy={busy}>再設定メールを送る</SubmitButton>
        </form>
        <div className="mt-8 text-center">
          <a href="#/login" className="text-[12px] text-mute underline underline-offset-4 hover:text-ink">ログインに戻る</a>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Login" title="ログイン" lead={message}>
      <form onSubmit={submit} noValidate className="space-y-6">
        <Field label="メールアドレス" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
        <Field label="パスワード" type="password" value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />
        <div className="-mt-2 text-right">
          <a href="#/login/reset" className="text-[12px] text-mute underline underline-offset-4 hover:text-ink">パスワードをお忘れの方</a>
        </div>
        {notice && <Notice>{notice}</Notice>}
        <SubmitButton busy={busy}>ログイン</SubmitButton>
      </form>

      <div className="mt-14 border-t border-line pt-10 text-center">
        <p className="text-[14px]">はじめてご利用の方</p>
        <p className="mt-2 text-[12px] leading-relaxed text-mute">会員登録をすると、閲覧履歴や購入履歴をマイページで確認できます。</p>
        <a
          href="#/register"
          className="mt-6 block w-full border border-ink py-4 text-[13px] tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
        >
          新規会員登録
        </a>
        <p className="mt-6 text-[11px] text-mute">会員登録をしなくても、商品の閲覧・ご購入はご利用いただけます。</p>
      </div>
    </AuthLayout>
  )
}

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'お名前を入力してください'
    if (!isEmail(email)) next.email = 'メールアドレスを正しく入力してください'
    if (password.length < MEMBER.minPasswordLength) next.password = `パスワードは${MEMBER.minPasswordLength}文字以上で入力してください`
    if (confirm !== password) next.confirm = 'パスワードが一致しません'
    if (!agree) next.agree = 'プライバシーポリシーへの同意が必要です'
    setErrors(next)
    setNotice('')
    if (Object.keys(next).length) return
    setBusy(true)
    const result = await signUp(name.trim(), email.trim(), password)
    setBusy(false)
    if (!result.ok) setNotice(result.message)
    else setNotice('ご登録のメールアドレスに確認メールをお送りしました。メールに記載のリンクから登録を完了してください。')
  }

  return (
    <AuthLayout eyebrow="Register" title="新規会員登録" lead="会員登録をすると、閲覧履歴や購入履歴をマイページで確認できます。">
      <form onSubmit={submit} noValidate className="space-y-6">
        <Field label="お名前" value={name} onChange={setName} autoComplete="name" error={errors.name} />
        <Field label="メールアドレス" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
        <Field
          label="パスワード"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={errors.password}
          hint={`${MEMBER.minPasswordLength}文字以上`}
        />
        <Field label="パスワード（確認）" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-ink" />
            <span>
              <a href="#/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-4">プライバシーポリシー</a>
              に同意します
            </span>
          </label>
          {errors.agree && <p className="mt-1.5 text-[12px] text-[#b42318]">{errors.agree}</p>}
        </div>
        {notice && <Notice>{notice}</Notice>}
        <SubmitButton busy={busy}>会員登録する</SubmitButton>
      </form>
      <div className="mt-8 text-center text-[12px] text-mute">
        すでに会員の方は
        <a href="#/login" className="ml-1 text-ink underline underline-offset-4">ログイン</a>
      </div>
    </AuthLayout>
  )
}

// マイページの見本（#/account/preview で表示。会員機能をつなぐ前のデザイン確認用）
const PREVIEW_MEMBER: Member = { name: 'FOCUS 会員', email: 'member@example.com' }
const PREVIEW_ORDERS: Order[] = [
  {
    id: 'FC-000128',
    date: '2026.10.20',
    status: '発送済み',
    shipping: 880,
    lines: [{ productId: 'focus-logo-tee', variant: 'Black / M', qty: 1, price: 8800 }],
  },
  {
    id: 'FC-000097',
    date: '2026.09.02',
    status: 'お届け済み',
    shipping: 0,
    lines: [
      { productId: 'focus-target-beanie', variant: 'Gray / ONE', qty: 1, price: 6600 },
      { productId: 'focus-logo-tee', variant: 'Black / L', qty: 2, price: 8800 },
    ],
  },
]

const formatDate = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function AccountPage({ preview }: { preview: boolean }) {
  const loggedIn = useMember()
  const member = preview ? PREVIEW_MEMBER : loggedIn
  const [tab, setTab] = useState<'history' | 'orders' | 'profile'>('history')
  const [history, setHistory] = useState(getViewHistory)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (preview) setOrders(PREVIEW_ORDERS)
    else if (member) getOrders().then(setOrders)
  }, [preview, member])

  if (!member) return <LoginPage message="マイページをご利用いただくには、ログインしてください。" />

  const tabs = [
    { id: 'history', label: '閲覧履歴' },
    { id: 'orders', label: '購入履歴' },
    { id: 'profile', label: '会員情報' },
  ] as const
  const viewed = history.map(h => ({ ...h, product: findProduct(h.productId) })).filter(h => h.product)

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-28 md:pt-36">
      {preview && (
        <p className="mb-10 border border-line bg-stone px-4 py-3 text-center text-[12px] leading-relaxed">
          マイページの見本です（会員機能は準備中）。購入履歴と会員情報は見本の内容で、閲覧履歴はこのブラウザで見た商品です。
        </p>
      )}
      <SectionHeading eyebrow="My page" title="マイページ" />
      <p className="mt-4 text-center text-[13px] text-mute">{member.name} 様</p>

      <div className="mt-10 flex justify-center gap-8 border-b border-line" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b py-3 text-[13px] tracking-wide transition-colors ${
              tab === t.id ? 'border-ink text-ink' : 'border-transparent text-mute hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === 'history' &&
          (viewed.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] text-mute">閲覧した商品はまだありません</p>
              <div className="mt-8">
                <ArrowLink href="#/shop">商品を見る</ArrowLink>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
                {viewed.map(h => (
                  <a key={h.productId} href={`#/product/${h.productId}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-stone">
                      <img src={h.product!.images[0]} alt={h.product!.nameJa} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    </div>
                    <p className="mt-2 truncate text-[12px]">{h.product!.name}</p>
                    <p className="mt-0.5 flex justify-between text-[11px] text-mute">
                      <span className="tabular-nums">{yen(h.product!.price)}</span>
                      <span className="tabular-nums">{formatDate(h.viewedAt)}</span>
                    </p>
                  </a>
                ))}
              </div>
              <div className="mt-10 text-center">
                <button
                  onClick={() => {
                    clearViewHistory()
                    setHistory([])
                  }}
                  className="text-[12px] text-mute underline underline-offset-4 hover:text-ink"
                >
                  閲覧履歴を削除する
                </button>
              </div>
            </>
          ))}

        {tab === 'orders' &&
          (orders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] text-mute">購入履歴はまだありません</p>
              <div className="mt-8">
                <ArrowLink href="#/shop">商品を見る</ArrowLink>
              </div>
            </div>
          ) : (
            <ul className="space-y-6">
              {orders.map(order => {
                const subtotal = order.lines.reduce((s, l) => s + l.price * l.qty, 0)
                return (
                  <li key={order.id} className="border border-line">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-stone/60 px-4 py-3 text-[12px]">
                      <span className="tabular-nums">
                        {order.date}
                        <span className="ml-3 text-mute">注文番号 {order.id}</span>
                      </span>
                      <span className="border border-ink px-2 py-0.5 text-[11px]">{order.status}</span>
                    </div>
                    <ul className="divide-y divide-line px-4">
                      {order.lines.map((line, i) => {
                        const product = findProduct(line.productId)
                        return (
                          <li key={i} className="flex items-center gap-4 py-4">
                            <a href={`#/product/${line.productId}`} className="h-20 w-15 shrink-0 overflow-hidden bg-stone">
                              {product && <img src={product.images[0]} alt={product.nameJa} className="h-full w-full object-cover" />}
                            </a>
                            <div className="min-w-0 flex-1 text-[13px]">
                              <p className="truncate">{product?.name ?? line.productId}</p>
                              <p className="mt-1 text-[11px] text-mute">
                                {line.variant}・数量 {line.qty}
                              </p>
                            </div>
                            <p className="shrink-0 text-[13px] tabular-nums">{yen(line.price * line.qty)}</p>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex justify-between border-t border-line px-4 py-3 text-[13px]">
                      <span className="text-mute">合計（送料{order.shipping === 0 ? '無料' : yen(order.shipping)}・税込）</span>
                      <span className="tabular-nums">{yen(subtotal + order.shipping)}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ))}

        {tab === 'profile' && (
          <div>
            <dl className="border-t border-line">
              {[
                ['お名前', member.name],
                ['メールアドレス', member.email],
                ['パスワード', '••••••••'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-line py-4">
                  <div className="min-w-0">
                    <dt className="text-[11px] text-mute">{label}</dt>
                    <dd className="mt-0.5 truncate text-[14px]">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] leading-relaxed text-mute">
              登録内容の変更・退会をご希望の場合は
              <a href={`mailto:${SHOP.contactEmail}`} className="mx-1 text-ink underline underline-offset-2">{SHOP.contactEmail}</a>
              までご連絡ください。
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-line pt-8 text-center">
        <button
          onClick={() => {
            if (preview) window.location.hash = '/'
            else signOut().then(() => (window.location.hash = '/'))
          }}
          className="border border-line px-10 py-3 text-[13px] tracking-wide transition-colors hover:border-ink"
        >
          ログアウト
        </button>
      </div>
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
    trackCommerce('view_cart', cart.lines.flatMap(lineToTrackItem))
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
    trackCommerce('begin_checkout', lines.flatMap(lineToTrackItem))
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
          <p className="flex items-center gap-2 text-[14px] tracking-wide">
            <Icon name="bag" className="h-5 w-5" />
            カート
            <span className="text-[12px] text-mute tabular-nums">{cart.count}点</span>
          </p>
          <button onClick={onClose} className="-mr-2 p-2" aria-label="カートを閉じる">
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5">
            <Icon name="bag" className="h-14 w-14 text-line" />
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
                        <button
                          onClick={() => {
                            trackCommerce('remove_from_cart', lineToTrackItem(line))
                            cart.remove(index)
                          }}
                          className="h-fit text-[11px] text-mute underline underline-offset-2 hover:text-ink">
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

  // ページ名の更新とアクセス記録（商品閲覧などの記録より先に行うため useLayoutEffect）
  useLayoutEffect(() => {
    document.title = pageTitle(route)
    initAnalytics()
    trackPageView(document.title)
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
    const product = findProduct(item.productId)
    if (product) trackCommerce('add_to_cart', [toTrackItem(product, `${item.color} / ${item.size}`)])
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
    case 'login':
      page = <LoginPage key={String(route.reset)} reset={route.reset} />
      break
    case 'register':
      page = <RegisterPage />
      break
    case 'account':
      page = <AccountPage key={String(route.preview)} preview={route.preview} />
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
