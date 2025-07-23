export function generateOrderId(): string {
  return `MO_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

export function generateSubscriptionId(): string {
  return `MS_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

export function getNextMonday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(9, 0, 0, 0) // 9 AM
  return nextMonday
}

export function getDaysUntilMonday(): number {
  const today = new Date()
  const dayOfWeek = today.getDay()
  return (8 - dayOfWeek) % 7 || 7
}

export function isDebitDue(lastDebitDate: Date | null): boolean {
  if (!lastDebitDate) return true
  
  const today = new Date()
  const daysSinceLastDebit = Math.floor((today.getTime() - lastDebitDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysSinceLastDebit >= 7
}