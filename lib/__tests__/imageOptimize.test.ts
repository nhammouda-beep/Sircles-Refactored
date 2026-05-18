import { optimizeImageForUpload } from "../imageOptimize";

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(async (uri: string, _actions: any, _opts: any) => ({
    uri: uri + "?optimized",
    width: 1080,
    height: 720,
  })),
  SaveFormat: { JPEG: "jpeg" },
}));

const { manipulateAsync } = require("expo-image-manipulator");

describe("optimizeImageForUpload", () => {
  beforeEach(() => {
    (manipulateAsync as jest.Mock).mockClear();
  });

  it("skips manipulation for already-small images", async () => {
    const result = await optimizeImageForUpload({
      uri: "file://tiny.jpg",
      width: 800,
      height: 600,
      mimeType: "image/jpeg",
      fileSize: 100_000,
    });

    expect(manipulateAsync).not.toHaveBeenCalled();
    expect(result.uri).toBe("file://tiny.jpg");
  });

  it("resizes large images", async () => {
    const result = await optimizeImageForUpload({
      uri: "file://big.jpg",
      width: 4000,
      height: 3000,
      mimeType: "image/jpeg",
      fileSize: 5_000_000,
    });

    expect(manipulateAsync).toHaveBeenCalledTimes(1);
    const actions = (manipulateAsync as jest.Mock).mock.calls[0][1];
    expect(actions).toEqual([{ resize: { width: 1080 } }]);
    expect(result.uri).toContain("optimized");
  });

  it("re-encodes small-but-large-file images even without resize", async () => {
    const result = await optimizeImageForUpload({
      uri: "file://heavy.jpg",
      width: 800,
      height: 600,
      mimeType: "image/jpeg",
      fileSize: 2_000_000,
    });

    expect(manipulateAsync).toHaveBeenCalledTimes(1);
    const actions = (manipulateAsync as jest.Mock).mock.calls[0][1];
    expect(actions).toEqual([]); // no resize, just compression
    expect(result.uri).toContain("optimized");
  });

  it("uses default mimeType when not provided", async () => {
    const result = await optimizeImageForUpload({
      uri: "file://x.jpg",
      fileSize: 100_000,
    });
    expect(result.mimeType).toBe("image/jpeg");
  });
});
