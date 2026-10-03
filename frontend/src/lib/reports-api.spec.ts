import { downloadReport } from "./reports-api";

jest.mock("react-hot-toast", () => {
  const error = jest.fn();
  const loading = jest.fn();
  const success = jest.fn();

  return {
    __esModule: true,
    __mockError: error,
    __mockLoading: loading,
    __mockSuccess: success,
    default: {
      error,
      loading,
      success,
    },
  };
});

const mockedToast = jest.requireMock("react-hot-toast") as {
  __mockError: jest.Mock;
  __mockLoading: jest.Mock;
  __mockSuccess: jest.Mock;
};

describe("reports-api", () => {
  const fetchMock = jest.fn<typeof fetch>();
  const createObjectURL = jest.fn();
  const revokeObjectURL = jest.fn();
  const click = jest.fn();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    Object.defineProperty(global, "URL", {
      configurable: true,
      value: {
        createObjectURL,
        revokeObjectURL,
      },
    });
    fetchMock.mockReset();
    createObjectURL.mockReset();
    revokeObjectURL.mockReset();
    click.mockReset();
    mockedToast.__mockLoading.mockReset();
    mockedToast.__mockSuccess.mockReset();
    mockedToast.__mockError.mockReset();
    mockedToast.__mockLoading.mockReturnValue("toast-id");
    localStorage.clear();
    localStorage.setItem("apiKey", "reports-key");

    jest.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        return {
          click,
          download: "",
          href: "",
        } as unknown as HTMLAnchorElement;
      }

      return document.createElement(tagName);
    }) as typeof document.createElement);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("downloads a report file and shows success feedback", async () => {
    const blob = new Blob(["report"]);
    fetchMock.mockResolvedValue({
      blob: jest.fn().mockResolvedValue(blob),
      ok: true,
    } as unknown as Response);
    createObjectURL.mockReturnValue("blob:url");

    await downloadReport(72, "pdf");

    expect(mockedToast.__mockLoading).toHaveBeenCalledWith("Generating 72h PDF report...");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/reports/export?hours=72&format=pdf",
      {
        headers: {
          "x-api-key": "reports-key",
        },
      },
    );
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:url");
    expect(mockedToast.__mockSuccess).toHaveBeenCalledWith("72h PDF report downloaded", {
      id: "toast-id",
    });
  });

  it("shows an error toast when report generation fails", async () => {
    fetchMock.mockResolvedValue({ ok: false } as Response);

    await downloadReport(24, "csv");

    expect(mockedToast.__mockError).toHaveBeenCalledWith("Report download failed", {
      id: "toast-id",
    });
  });
});
