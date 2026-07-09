export interface NotificationRecipient {
  role: 'admin' | 'reseller' | 'subagent' | 'provider'
  actorId?: string | null
}

export interface NotificationChannel {
  send(event: string, payload: unknown): void | Promise<void>
}

/**
 * Resolve notification recipients from booking actor data.
 * Admin is always included. Reseller and subagent are included when present.
 */
export function buildRecipients(booking: {
  resellerId?: string | null
  subagentId?: string | null
}): NotificationRecipient[] {
  const recipients: NotificationRecipient[] = [
    { role: 'admin' },
  ]

  if (booking.resellerId) {
    recipients.push({ role: 'reseller', actorId: booking.resellerId })
  }

  if (booking.subagentId) {
    recipients.push({ role: 'subagent', actorId: booking.subagentId })
  }

  return recipients
}

/**
 * Console-based notification channel.
 * Logs structured JSON to stdout — future channels (email, WhatsApp, webhook)
 * implement the same NotificationChannel interface.
 */
export class ConsoleChannel implements NotificationChannel {
  send(event: string, payload: unknown): void {
    const entry = {
      channel: 'console',
      event,
      timestamp: new Date().toISOString(),
      payload,
    }
    console.log(JSON.stringify(entry))
  }
}

/**
 * Fire a booking notification via the console channel.
 * Extensible: swap ConsoleChannel for EmailChannel/WhatsAppChannel later.
 */
export function notifyBookingCreated(
  booking: {
    code: string
    resellerId?: string | null
    subagentId?: string | null
    totalPrice: number
    netPrice: number
    commissionAmt: number
    subagentCommissionAmt: number
  },
  items: Array<{ itemType: string; serviceName: string; totalPrice: number }>,
  channel: NotificationChannel = new ConsoleChannel(),
): void {
  const recipients = buildRecipients(booking)
  const payload = {
    event: 'booking.created',
    bookingCode: booking.code,
    totalPrice: booking.totalPrice,
    netPrice: booking.netPrice,
    commissionAmt: booking.commissionAmt,
    subagentCommissionAmt: booking.subagentCommissionAmt,
    actors: {
      resellerId: booking.resellerId || null,
      subagentId: booking.subagentId || null,
    },
    itemsSummary: items.map((item) => ({
      type: item.itemType,
      name: item.serviceName,
      total: item.totalPrice,
    })),
    recipients: recipients.map((r) => r.role),
    timestamp: new Date().toISOString(),
  }
  channel.send('booking.created', payload)
}
