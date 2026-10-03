import { renderHook, waitFor } from "@testing-library/react";

import { useRequireProject } from "./useRequireProject";
import { hasSelectedProject } from "./selected-project";

jest.mock("next/navigation", () => {
  const replace = jest.fn();

  return {
    __mockReplace: replace,
    useRouter: () => ({
      replace,
    }),
  };
});

jest.mock("react-hot-toast", () => {
  const mockedError = jest.fn();

  return {
    __esModule: true,
    __mockError: mockedError,
    default: {
      error: mockedError,
    },
  };
});

jest.mock("./selected-project", () => ({
  hasSelectedProject: jest.fn(),
}));

const { __mockReplace: replace } = jest.requireMock("next/navigation") as {
  __mockReplace: jest.Mock;
};

const { __mockError: error } = jest.requireMock("react-hot-toast") as {
  __mockError: jest.Mock;
};

describe("useRequireProject", () => {
  const mockedHasSelectedProject = hasSelectedProject as jest.MockedFunction<
    typeof hasSelectedProject
  >;

  beforeEach(() => {
    replace.mockReset();
    error.mockReset();
  });

  it("returns true when a project is already selected", async () => {
    mockedHasSelectedProject.mockReturnValue(true);

    const { result } = renderHook(() => useRequireProject());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(error).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to the projects page when no project is selected", async () => {
    mockedHasSelectedProject.mockReturnValue(false);

    const { result } = renderHook(() => useRequireProject());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    expect(error).toHaveBeenCalledWith(
      "Please select a project first to proceed.",
      {
        id: "require-project",
      },
    );
    expect(replace).toHaveBeenCalledWith("/projects");
  });
});