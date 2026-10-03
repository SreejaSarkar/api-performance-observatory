import { act, renderHook, waitFor } from "@testing-library/react";

import {
  clearSelectedProject,
  hasSelectedProject,
  setSelectedProject,
  useSelectedProject,
} from "./selected-project";

describe("selected-project", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores the selected project and reports it as present", () => {
    setSelectedProject({
      apiKey: "api-key-1",
      id: "project-1",
      name: "Payments",
    });

    expect(localStorage.getItem("projectId")).toBe("project-1");
    expect(localStorage.getItem("apiKey")).toBe("api-key-1");
    expect(localStorage.getItem("projectName")).toBe("Payments");
    expect(hasSelectedProject()).toBe(true);
  });

  it("clears the selected project", () => {
    setSelectedProject({
      apiKey: "api-key-1",
      id: "project-1",
      name: "Payments",
    });

    clearSelectedProject();

    expect(hasSelectedProject()).toBe(false);
    expect(localStorage.getItem("projectId")).toBeNull();
    expect(localStorage.getItem("apiKey")).toBeNull();
    expect(localStorage.getItem("projectName")).toBeNull();
  });

  it("keeps the hook in sync with custom project change events", async () => {
    const { result } = renderHook(() => useSelectedProject());

    expect(result.current).toBeNull();

    act(() => {
      setSelectedProject({
        apiKey: "api-key-2",
        id: "project-2",
        name: "Checkout",
      });
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        apiKey: "api-key-2",
        id: "project-2",
        name: "Checkout",
      });
    });
  });

  it("falls back to a default name when projectName is missing", async () => {
    localStorage.setItem("projectId", "project-3");
    localStorage.setItem("apiKey", "api-key-3");

    const { result } = renderHook(() => useSelectedProject());

    await waitFor(() => {
      expect(result.current).toEqual({
        apiKey: "api-key-3",
        id: "project-3",
        name: "Selected project",
      });
    });
  });
});
