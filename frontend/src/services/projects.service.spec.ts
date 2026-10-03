describe("projects.service", () => {
  it("imports without exporting any runtime members", async () => {
    await expect(import("./projects.service")).resolves.toEqual({
      default: {},
    });
  });
});