/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chart } from "chart.js/auto"; // Import Chart.js/auto
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface ImputProps {
  proposals: {
    parliament_presence: number;
    votes_for: number;
    abstentions: number;
    votes_against: number;
    proposal_id: number;
  };
  width?: number;
  height?: number;
  className?: string;
  logo?: string;
}

export default function ChartVotes({
  proposals,
  className,
  width = 280,
  height = width / 2,
  logo,
}: ImputProps) {
  const t = useTranslations("general-chart-component");
  const chartRef = useRef<Chart | null>(null); // Use useRef to store the chart instance

  const noVotes =
    proposals.abstentions +
    proposals.votes_against +
    proposals.votes_for -
    proposals.parliament_presence;

  const centerImagePlugin = {
    id: "centerImage",
    afterDraw: (chart: any) => {
      if (chart) {
        const {
          ctx,
          chartArea: { top, bottom, left, right },
        } = chart;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;

        const image = new Image();
        image.src = logo || "";
        image.onload = () => {
          const imageSize = width / 6;
          ctx.drawImage(
            image,
            centerX - imageSize / 2,
            centerY - imageSize / 2,
            imageSize,
            imageSize
          );
        };
      }
    },
  };

  useEffect(() => {
    const ctx = document.getElementById(
      "generalVotes" + proposals.proposal_id
    ) as HTMLCanvasElement | null;
    if (!ctx) return;
    ctx.width = width;
    ctx.height = height;

    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy previous chart
    }

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          t("votes_for"),
          t("abstentions"),
          t("votes_against"),
          t("no_votes"),
        ],
        datasets: [
          {
            label: t("number_of_votes"),
            data: [
              proposals.votes_for,
              proposals.abstentions,
              proposals.votes_against,
              noVotes,
            ],
            borderWidth: 0,
            backgroundColor: ["#22981D", "#737383", "#B21D20", "#262835"],
            hoverOffset: 4,
            borderAlign: "inner",
          },
        ],
      },
      options: {
        responsive: false, // Disable responsive resizing
        maintainAspectRatio: true, // Allow custom dimensions
        cutout: "50%", // Adjust the cutout percentage for the doughnut hole if needed
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
      plugins: logo ? [centerImagePlugin] : [],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      className={className}
      id={"generalVotes" + proposals.proposal_id}
    ></canvas>
  );
}
