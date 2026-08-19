/**
 * @file dateUtil.ts
 * @description Date/time helpers used across tests (formatting, offsets, ISO values).
 * Keeping date logic here avoids repeating ad-hoc Date manipulations in specs.
 */
export class DateUtil {
  /** Today's date as YYYY-MM-DD. */
  static today(): string {
    return this.format(new Date());
  }

  /** Date `days` in the future as YYYY-MM-DD (negative = past). */
  static addDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.format(date);
  }

  /** Format a Date object as YYYY-MM-DD. */
  static format(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  /** Current Unix timestamp in milliseconds. */
  static nowMillis(): number {
    return Date.now();
  }
}
