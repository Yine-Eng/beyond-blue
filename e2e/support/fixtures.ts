import { test as base } from "@playwright/test";
import {
  type TestAccount,
  type TestRole,
  createTestUser,
  deleteTestUser,
  hasAdmin,
  sessionUserId,
  signInContext,
} from "./accounts";

type Setup = (userId: string) => Promise<void>;

type Fixtures = {
  /** Creates a throwaway account without signing the browser in; deleted after the test. */
  account: (role: TestRole, setup?: Setup) => Promise<TestAccount>;
  /** Signs this test's browser in as a fresh test account; deleted after the test. */
  signIn: (role: TestRole, setup?: Setup) => Promise<string>;
  /** Runs after every test: deletes whichever test account the browser ended up signed in as. */
  cleanup: void;
};

export const test = base.extend<Fixtures>({
  account: async ({}, provide) => {
    const created: string[] = [];
    await provide(async (role, setup) => {
      const account = await createTestUser(role, setup);
      created.push(account.id);
      return account;
    });
    for (const id of created) await deleteTestUser(id);
  },
  signIn: async ({ context, baseURL, account }, provide) => {
    await provide(async (role, setup) => {
      const user = await account(role, setup);
      await signInContext(context, baseURL!, user);
      return user.id;
    });
  },
  cleanup: [
    async ({ context }, provide) => {
      await provide();
      if (!hasAdmin()) return;
      const id = await sessionUserId(context);
      if (id) await deleteTestUser(id);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
