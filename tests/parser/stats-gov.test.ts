import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseStatsGovCityMarket } from "../../parser/stats-gov";

function readFixtureHtml(): string {
  return readFileSync(resolve("tests/fixtures/stats-gov/tianjin.html"), "utf8");
}

describe("parseStatsGovCityMarket", () => {
  it("returns the latest Tianjin secondary-home row from the official stats page", () => {
    expect(parseStatsGovCityMarket(readFixtureHtml(), "天津")).toEqual({
      city: "天津",
      month: "2026-02",
      secondaryHomePriceIndexMom: 99.5,
      secondaryHomePriceIndexYoy: 94.0,
    });
  });

  it("throws when the target city row cannot be found", () => {
    expect(() =>
      parseStatsGovCityMarket(readFixtureHtml(), "不存在市"),
    ).toThrow();
  });

  it("parses a second-half city row without dropping blank placeholder cells", () => {
    const html = `
      <html>
        <head>
          <meta name="ArticleTitle" content="2026年2月份70个大中城市商品住宅销售价格变动情况" />
        </head>
        <body>
          <p>70个大中城市二手住宅销售价格指数</p>
          <div class="ue_table">
            <table>
              <tr>
                <th>城市</th>
                <th>环比</th>
                <th>同比</th>
                <th></th>
                <th>城市</th>
                <th>环比</th>
                <th>同比</th>
                <th></th>
              </tr>
              <tr>
                <td>北京</td>
                <td>100.1</td>
                <td>98.0</td>
                <td></td>
                <td>天津</td>
                <td>99.5</td>
                <td>94.0</td>
                <td></td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

    expect(parseStatsGovCityMarket(html, "天津")).toEqual({
      city: "天津",
      month: "2026-02",
      secondaryHomePriceIndexMom: 99.5,
      secondaryHomePriceIndexYoy: 94.0,
    });
  });
});
