import { test as base } from "@playwright/test";
import { type TestRole, deleteTestUser, hasAdmin, sessionUserId, signInAs } from "./accounts";

type Fixtures = {
  /** Signs this test's browser in as a fresh test account; deleted again after the test. */
  signIn: (role: TestRole, setup?: (userId: string) => Promise<void>) => Promise<string>;
  /** Runs after every test: deletes whichever test account the browser ended up signed in as. */
  cleanup: void;
};

export const test = base.extend<Fixtures>({
  signIn: async ({ context, baseURL }, provide) => {
    const created: string[] = [];
    await provide(async (role, setup) => {
      const id = await signInAs(context, baseURL!, role, setup);
      created.push(id);
      return id;
    });
    for (const id of created) await deleteTestUser(id);
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
