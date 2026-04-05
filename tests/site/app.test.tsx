/* @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "../../site/src/App";

function renderApp(): void {
  render(<App />);
}

describe("site App", () => {
  it("renders the housing dashboard shell", () => {
    renderApp();

    expect(screen.getByText("Tianjin Housing Monitor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByPlaceholderText("全局搜索小区或房源..."),
    ).toBeInTheDocument();
    expect(screen.getByText("数据最后更新于: 10分钟前")).toBeInTheDocument();
  });

  it("renders KPI cards and dashboard content sections", () => {
    renderApp();

    expect(screen.getByText("今日降价套数")).toBeInTheDocument();
    expect(screen.getByText("核心小区挂牌均价走势 (近30天)")).toBeInTheDocument();
    expect(screen.getByText("单价洼地雷达")).toBeInTheDocument();
    expect(
      screen.getByText("[ Recharts Line Chart Placeholder ]"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("[ Recharts Scatter / Bubble Chart Placeholder ]"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "今日高优降价房源榜" }),
    ).toBeInTheDocument();
    expect(screen.getByText("小区")).toBeInTheDocument();
    expect(screen.getByText("面积")).toBeInTheDocument();
    expect(screen.getByText("原价")).toBeInTheDocument();
    expect(screen.getByText("现价")).toBeInTheDocument();
    expect(screen.getByText("降幅")).toBeInTheDocument();
    expect(screen.getByText("上架天数")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "最新动态信息流" }),
    ).toBeInTheDocument();
  });
});
