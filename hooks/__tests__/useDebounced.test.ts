import { renderHook, act } from "@testing-library/react-native";
import { useDebounced } from "../useDebounced";

describe("useDebounced", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounced("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update until the delay elapses", () => {
    const { result, rerender } = renderHook<string, { value: string }>(
      ({ value }) => useDebounced(value, 300) as any,
      { initialProps: { value: "hello" } }
    );

    rerender({ value: "world" });
    expect(result.current).toBe("hello");

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("hello");

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe("world");
  });

  it("only emits the latest value when rapid changes occur", () => {
    const { result, rerender } = renderHook<string, { value: string }>(
      ({ value }) => useDebounced(value, 300) as any,
      { initialProps: { value: "a" } }
    );

    rerender({ value: "ab" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "abc" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "abcd" });

    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("abcd");
  });
});
