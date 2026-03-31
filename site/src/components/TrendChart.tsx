import { useEffect, useRef } from "react";
import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts";

import type { CommunitySegmentSeriesEntry } from "../lib/load-json";

interface TrendChartProps {
  series: CommunitySegmentSeriesEntry[];
  segmentLabel: string;
}

function getChartOption(
  series: CommunitySegmentSeriesEntry[],
  segmentLabel: string,
): EChartsOption {
  return {
    animationDuration: 450,
    color: ["#0f766e", "#c2410c"],
    grid: {
      left: 16,
      right: 16,
      top: 24,
      bottom: 24,
      containLabel: true,
    },
    legend: {
      top: 0,
      textStyle: {
        color: "#28403d",
      },
      data: ["挂牌中位价", "挂牌样本"],
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: series.map((entry) => entry.date),
      axisLabel: {
        color: "#415754",
      },
    },
    yAxis: [
      {
        type: "value",
        name: "元/㎡",
        axisLabel: {
          color: "#415754",
        },
      },
      {
        type: "value",
        name: "套数",
        axisLabel: {
          color: "#415754",
        },
      },
    ],
    series: [
      {
        type: "line",
        name: "挂牌中位价",
        smooth: true,
        symbolSize: 8,
        data: series.map((entry) => entry.listingUnitPriceMedian),
      },
      {
        type: "bar",
        name: "挂牌样本",
        yAxisIndex: 1,
        data: series.map((entry) => entry.listingsCount),
        barMaxWidth: 20,
      },
    ],
    title: {
      text: `${segmentLabel} 趋势`,
      left: "center",
      textStyle: {
        color: "#17312e",
        fontFamily: '"Songti SC", "STSong", serif',
        fontSize: 16,
        fontWeight: 700,
      },
    },
  };
}

export default function TrendChart({
  series,
  segmentLabel,
}: TrendChartProps): React.JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (import.meta.env.MODE === "test" || !chartRef.current) {
      return undefined;
    }

    let disposed = false;
    let chart: EChartsType | null = null;
    let resize: () => void = () => {};

    void import("echarts/dist/echarts.esm.js").then((echarts) => {
      if (disposed || !chartRef.current) {
        return;
      }

      chart = echarts.init(chartRef.current, undefined, {
        renderer: "svg",
      });
      chart.setOption(getChartOption(series, segmentLabel));
      resize = () => chart?.resize();
      window.addEventListener("resize", resize);
    });

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      chart?.dispose();
    };
  }, [segmentLabel, series]);

  return (
    <div className="chart-shell">
      <div className="chart-frame" data-testid="trend-chart" ref={chartRef} />
      {series.length === 0 ? (
        <p className="empty-state">
          当前缺少时间序列文件，趋势图仅保留容器以提示缺口。
        </p>
      ) : null}
    </div>
  );
}
