import { expect } from "chai";

// Modules
import { praiseTheSun } from "./index";

describe("index test", () => {
  describe("praiseTheSun function", () => {
    it("should raise its hands up in adoration!", () => {
      const res = praiseTheSun();

      expect(res).to.equal("\\[T]/");
    });
  });
});
