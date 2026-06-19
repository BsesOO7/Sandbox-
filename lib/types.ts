export type Authority =
  | 'Department of Cooperatives'
  | 'Nepal Rastra Bank'
  | 'Provincial Registrar'

export interface Cooperative {
  id: string
  name: string
  pan: string
  regNo: string
  email: string
  authority: Authority
  enrolledAt: string
  /** Wallet is only created in Step 2 */
  walletAddress: string | null
  /** Internal shadow-ledger balance in integer units (paisa). 1 NPR = 100 units */
  balanceUnits: number
  status: 'enrolled' | 'active'
}

export interface LogEntry {
  id: string
  time: string
  from: 'Entry Point' | 'Middleware' | 'Database' | 'Rafiki' | 'Operator'
  to: 'Entry Point' | 'Middleware' | 'Database' | 'Rafiki' | 'Operator'
  message: string
  level: 'info' | 'success' | 'warn' | 'error'
}

export interface ApiExchange {
  id: string
  endpoint: string
  method: 'GET' | 'POST'
  request: unknown
  response: unknown
  status: number
  at: string
}

/** Asset scale of 2 means 100 minor units (paisa) per major unit (NPR). */
export const ASSET_SCALE = 2
export const ASSET_CODE = 'NPR'

export function unitsToNpr(units: number): number {
  return units / 10 ** ASSET_SCALE
}

export function nprToUnits(npr: number): number {
  return Math.round(npr * 10 ** ASSET_SCALE)
}

export function formatNpr(npr: number): string {
  return new Intl.NumberFormat('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(npr)
}
