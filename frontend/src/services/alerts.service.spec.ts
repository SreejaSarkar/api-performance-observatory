describe("alerts.service", () => {
  it("imports without exporting any runtime members", async () => {
    await expect(import("./alerts.service")).resolves.toEqual({
      default: {},
    });
  });
});
