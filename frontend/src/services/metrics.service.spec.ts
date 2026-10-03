describe("metrics.service", () => {
  it("imports without exporting any runtime members", async () => {
    await expect(import("./metrics.service")).resolves.toEqual({
      default: {},
    });
  });
});
