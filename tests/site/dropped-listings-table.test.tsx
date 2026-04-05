/* @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DroppedListingsTable } from "../../site/src/components/dashboard/DroppedListingsTable";

describe("DroppedListingsTable", () => {
  it("renders a clear empty state when there are no dropped listings", () => {
    render(<DroppedListingsTable items={[]} />);

    expect(
      screen.getByText("今日暂无匹配到降价房源，等待下一次抓取更新。"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("dropped-listing-row")).not.toBeInTheDocument();
  });
});
