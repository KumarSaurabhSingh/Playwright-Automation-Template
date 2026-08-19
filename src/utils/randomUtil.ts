/**
 * @file randomUtil.ts
 * @description Reusable random-data generators built on @faker-js/faker.
 * Use these to create unique, realistic test data (emails, names, phone numbers,
 * strings) so tests never collide with previously created data.
 */
import { faker } from '@faker-js/faker';

export class RandomUtil {
  /** Random email like jane.doe123@gmail.com. */
  static email(): string {
    return faker.internet.email();
  }

  /** Random first name. */
  static firstName(): string {
    return faker.person.firstName();
  }

  /** Random last name. */
  static lastName(): string {
    return faker.person.lastName();
  }

  /** Random 10-digit phone number. */
  static phoneNumber(): string {
    return faker.phone.number({ style: 'international' });
  }

  /** Random alphanumeric string of a given length (e.g. for order IDs). */
  static alphanumeric(length = 10): string {
    return faker.string.alphanumeric(length);
  }

  /** Random future date as ISO string (for booking / expiration tests). */
  static futureDate(years = 1): string {
    return faker.date.future({ years }).toISOString();
  }

  /** Random integer between min and max (inclusive). */
  static integer(min = 1, max = 100): number {
    return faker.number.int({ min, max });
  }
}
