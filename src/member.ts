// ─────────────────────────────────────────────────────────────
// 会員機能（ログイン・会員登録・閲覧履歴・購入履歴）
//
// いまは「画面だけ」の状態です。ログインや会員登録のボタンを押すと
// 「準備中」のお知らせが表示され、入力された内容はどこにも送信・保存されません。
// 会員管理サービスをつなぐときは、このファイルの中身を差し替えます。
//
// 閲覧履歴だけは、会員でなくても このブラウザの中に保存されます（最大20件）。
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

export const MEMBER = {
  // 会員管理サービスをつないだら true にします（それまでは false のまま）
  enabled: false,
  // 準備中のときに表示する文章
  notReadyMessage:
    '会員機能は現在準備中です。会員登録をしなくても、商品の閲覧・ご購入はご利用いただけます。',
  // パスワードの最低文字数
  minPasswordLength: 8,
}

export type Member = { name: string; email: string }

export type AuthResult = { ok: true } | { ok: false; message: string }

const notReady: AuthResult = { ok: false, message: MEMBER.notReadyMessage }

// ─── ログイン状態 ─────────────────────────────────────────────
// 会員管理サービスをつなぐまでは、常に「ログインしていない」状態です。

let current: Member | null = null
const listeners = new Set<(m: Member | null) => void>()

export function useMember() {
  const [member, setMember] = useState<Member | null>(current)
  useEffect(() => {
    listeners.add(setMember)
    return () => {
      listeners.delete(setMember)
    }
  }, [])
  return member
}

export async function signIn(_email: string, _password: string): Promise<AuthResult> {
  return notReady
}

export async function signUp(_name: string, _email: string, _password: string): Promise<AuthResult> {
  return notReady
}

export async function requestPasswordReset(_email: string): Promise<AuthResult> {
  return notReady
}

export async function signOut() {
  current = null
  listeners.forEach(l => l(null))
}

// ─── 閲覧履歴（このブラウザに保存） ───────────────────────────

export type ViewHistoryItem = { productId: string; viewedAt: number }

const HISTORY_KEY = 'focus-history-v1'
const HISTORY_MAX = 20

export function getViewHistory(): ViewHistoryItem[] {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    if (!Array.isArray(data)) return []
    return data.filter(
      (h): h is ViewHistoryItem => h && typeof h.productId === 'string' && typeof h.viewedAt === 'number',
    )
  } catch {
    return []
  }
}

export function addViewHistory(productId: string) {
  try {
    const next = [{ productId, viewedAt: Date.now() }, ...getViewHistory().filter(h => h.productId !== productId)]
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, HISTORY_MAX)))
  } catch {
    // 保存できない環境では何もしない
  }
}

export function clearViewHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // 何もしない
  }
}

// ─── 購入履歴 ─────────────────────────────────────────────────
// オンライン決済と会員管理サービスをつないだあとに、注文データを読み込みます。

export type OrderLine = { productId: string; variant: string; qty: number; price: number }
export type Order = { id: string; date: string; status: string; lines: OrderLine[]; shipping: number }

export async function getOrders(): Promise<Order[]> {
  return []
}
