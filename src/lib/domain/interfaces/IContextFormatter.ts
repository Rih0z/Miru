import { Connection } from '@/types'

export interface IContextFormatter {
  formatConnectionContext(connection: Connection): string
}