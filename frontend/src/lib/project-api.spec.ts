import {
  createProject,
  getProjects,
} from "./project-api";

describe("project-api", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    fetchMock.mockReset();
  });

  it("loads projects with credentials included", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue([{ id: "project-1", name: "Payments" }]),
      ok: true,
    } as unknown as Response);

    await expect(getProjects()).resolves.toEqual([
      { id: "project-1", name: "Payments" },
    ]);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/projects", {
      credentials: "include",
    });
  });

  it("surfaces the backend message when project creation fails", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "Project name is required" }),
      ok: false,
    } as unknown as Response);

    await expect(createProject("")).rejects.toThrow("Project name is required");
  });

  it("falls back to a generic error when the failure body is not json", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockRejectedValue(new Error("invalid json")),
      ok: false,
    } as unknown as Response);

    await expect(createProject("Payments")).rejects.toThrow("Request failed");
  });
});
