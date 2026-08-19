/**
 * @file loginData.ts
 * @description Test data for the login feature. Static, dataset-style data lives here;
 * dynamic data (emails, names, etc.) should be generated at runtime with RandomUtil.
 * Keeping data out of the spec files makes tests easier to read and reuse.
 */
export interface LoginTestData {
  testCase: string;
  username: string;
  password: string;
  expectedError?: string;
}

const NO_MATCH_ERROR = 'Epic sadface: Username and password do not match any user in this service';
const USERNAME_REQUIRED_ERROR = 'Epic sadface: Username is required';

/** Data-driven rows for the login validation tests. */
export const invalidLoginScenarios: LoginTestData[] = [
  {
    testCase: 'wrong username',
    username: 'invalid-user@example.com',
    password: 'secret_sauce',
    expectedError: NO_MATCH_ERROR,
  },
  {
    testCase: 'wrong password',
    username: 'standard_user',
    password: 'wrong-password',
    expectedError: NO_MATCH_ERROR,
  },
  {
    testCase: 'empty credentials',
    username: '',
    password: '',
    expectedError: USERNAME_REQUIRED_ERROR,
  },
];

/** Static success-case login data (matches config env credentials in a real project). */
export const validLoginData: LoginTestData = {
  testCase: 'valid credentials',
  username: 'standard_user',
  password: 'secret_sauce',
};
