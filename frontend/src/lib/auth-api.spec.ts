const clearSelectedProject = jest.fn();

jest.mock("@/lib/selected-project", () => ({
  clearSelectedProject,
}));

describe("auth-api", () => {
  const fetchMock = jest.fn<typeof fetch>();
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.resetModules();
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    fetchMock.mockReset();
    clearSelectedProject.mockReset();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    window.history.replaceState({}, "", "/dashboard?hours=24");
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("identifies session-expired errors", async () => {
    const { SessionExpiredError, isSessionExpiredError } = await import("./auth-api");

    expect(isSessionExpiredError(new SessionExpiredError())).toBe(true);
    expect(isSessionExpiredError(new Error("other"))).toBe(false);
  });

  it("logs in and registers with the expected payloads", async () => {
    const { login, register } = await import("./auth-api");

    fetchMock
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ user: { id: "u1" } }), ok: true, status: 200 } as unknown as Response)
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ user: { id: "u2" } }), ok: true, status: 200 } as unknown as Response);

    await expect(login({ email: "user@example.com", password: "secret" })).resolves.toEqual({
      user: { id: "u1" },
    });
    await expect(
      register({ email: "user@example.com", name: "User", password: "secret" }),
    ).resolves.toEqual({ user: { id: "u2" } });

    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/auth/login",
        {
          body: JSON.stringify({ email: "user@example.com", password: "secret" }),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      ],
      [
        "http://localhost:3001/auth/register",
        {
          body: JSON.stringify({
            email: "user@example.com",
            name: "User",
            password: "secret",
          }),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      ],
    ]);
  });

  it("refreshes the session and retries getCurrentUser on a 401", async () => {
    const { getCurrentUser } = await import("./auth-api");

    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ email: "user@example.com", name: "User", userId: "u1" }),
        ok: true,
        status: 200,
      } as unknown as Response);

    await expect(getCurrentUser()).resolves.toEqual({
      email: "user@example.com",
      name: "User",
      userId: "u1",
    });
    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/auth/me",
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "GET",
        },
      ],
      [
        "http://localhost:3001/auth/refresh",
        {
          credentials: "include",
          method: "POST",
        },
      ],
      [
        "http://localhost:3001/auth/me",
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "GET",
        },
      ],
    ]);
  });

  it("returns null from getCurrentUserOrNull when refresh fails", async () => {
    const { getCurrentUserOrNull } = await import("./auth-api");

    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    await expect(getCurrentUserOrNull()).resolves.toBeNull();
  });

  it("clears project selection and throws SessionExpiredError when redirecting after auth expiry", async () => {
    const { SessionExpiredError, getCurrentUser } = await import("./auth-api");

    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    await expect(getCurrentUser()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(clearSelectedProject).toHaveBeenCalledTimes(1);
  });

  it("loads auth providers and logs out through the shared auth request helper", async () => {
    const { getAuthProviders, logout } = await import("./auth-api");

    fetchMock
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ github: true, google: false }),
        ok: true,
        status: 200,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ success: true }),
        ok: true,
        status: 200,
      } as unknown as Response);

    await expect(getAuthProviders()).resolves.toEqual({ github: true, google: false });
    await expect(logout()).resolves.toEqual({ success: true });
  });

  it("surfaces API error messages from failed auth requests", async () => {
    const { login } = await import("./auth-api");

    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "Invalid credentials" }),
      ok: false,
      status: 400,
    } as unknown as Response);

    await expect(login({ email: "user@example.com", password: "wrong" })).rejects.toThrow(
      "Invalid credentials",
    );
  });
});
