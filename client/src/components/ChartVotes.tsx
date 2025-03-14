/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chart } from "chart.js/auto"; // Import Chart.js/auto
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface ImputProps {
  proposals: {
    parliament_presence?: number;
    votes_for: number;
    no_vote: number;
    abstentions: number;
    votes_against: number;
    id: number | string;
  };
  width?: number;
  height?: number;
  className?: string;
  logo?: string;
}

export default function ChartVotes({ proposals, className, width = 280, height = width / 2, logo }: ImputProps) {
  const t = useTranslations("general-chart-component");
  const chartRef = useRef<Chart | null>(null); // Use useRef to store the chart instance

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

        if (logo) {
          const image = new Image();
          image.src = logo || "";
          image.onload = () => {
            const imageWidth = image.naturalWidth;
            const imageHeight = image.naturalHeight;

            const targetSize = width / 6;

            let scaledWidth, scaledHeight;

            if (imageWidth > imageHeight) {
              scaledWidth = targetSize;
              scaledHeight = (imageHeight / imageWidth) * targetSize;
            } else {
              scaledHeight = targetSize;
              scaledWidth = (imageWidth / imageHeight) * targetSize;
            }

            ctx.drawImage(image, centerX - scaledWidth / 2, centerY - scaledHeight / 2, scaledWidth, scaledHeight);
          };
        } else {
          const p = document.createElement("p");
          p.textContent = proposals.parliament_presence ? proposals.parliament_presence.toString() : "";
          ctx.font = "900 20px Verdana";
          ctx.fillStyle = "#00000050"; // Example text color
          ctx.textAlign = "center"; // Center the text horizontally

          // Draw the text onto the canvas
          ctx.fillText(p.textContent, centerX, centerY + 8);
        }
      }
    },
  };

  useEffect(() => {
    const ctx = document.getElementById("generalVotes" + proposals.id) as HTMLCanvasElement | null;
    if (!ctx) return;
    ctx.width = width;
    ctx.height = height;

    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy previous chart
    }

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [t("votes_for"), t("abstentions"), t("votes_against"), t("no_votes")],
        datasets: [
          {
            label: t("number_of_votes"),
            data: [proposals.votes_for, proposals.abstentions, proposals.votes_against, proposals.no_vote],
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
      plugins: [centerImagePlugin],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas className={className} id={"generalVotes" + proposals.id}></canvas>;
}
