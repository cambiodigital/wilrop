import { EventEmitter } from 'node:events'

export const BOOKING_CREATED = 'booking.created' as const
export const BOOKING_STATUS_CHANGED = 'booking.status_changed' as const

export type BookingEventName =
  | typeof BOOKING_CREATED
  | typeof BOOKING_STATUS_CHANGED

export interface BookingCreatedPayload {
  bookingId: string
  bookingCode: string
  totalPrice: number
  netPrice: number
  commissionAmt: number
  subagentCommissionAmt: number
  resellerId?: string | null
  subagentId?: string | null
}

export interface BookingStatusChangedPayload {
  bookingId: string
  bookingCode: string
  oldStatus: string
  newStatus: string
}

export type BookingEventPayload =
  | BookingCreatedPayload
  | BookingStatusChangedPayload

class BookingEventEmitter extends EventEmitter {
  /**
   * Emit an event asynchronously using setImmediate for fire-and-forget dispatch.
   * Never blocks the caller — listeners run after the current tick.
   */
  emitAsync(event: BookingEventName, payload: BookingEventPayload): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(() => {
        try {
          this.emit(event, payload)
        } catch {
          // Swallow listener errors — events are fire-and-forget
        } finally {
          resolve()
        }
      })
    })
  }
}

/** Singleton booking event emitter */
export const bookingEvents = new BookingEventEmitter()
