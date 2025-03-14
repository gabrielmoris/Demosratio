/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chart } from "chart.js/auto";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, memo } from "react";

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

const ChartVotes = ({
  proposals,
  className,
  width = 280,
  height = width / 2,
  logo,
}: ImputProps) => {
  const t = useTranslations("general-chart-component");
  const chartRef = useRef<Chart | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null); // Store the image
  const [imageLoaded, setImageLoaded] = useState(false);

  const centerImagePlugin = {
    id: "centerImage",
    beforeDatasetsDraw: (chart: any) => {
      if (chart) {
        const {
          ctx,
          chartArea: { top, bottom, left, right },
        } = chart;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;

        if (logo && imageRef.current && imageLoaded) {
          const image = imageRef.current;
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

          ctx.drawImage(
            image,
            centerX - scaledWidth / 2,
            centerY - scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
        } else if (proposals.parliament_presence) {
          ctx.font = "900 20px Verdana";
          ctx.fillStyle = "#00000050";
          ctx.textAlign = "center";
          ctx.fillText(
            proposals.parliament_presence.toString(),
            centerX,
            centerY + 8
          );
        }
      }
    },
  };

  useEffect(() => {
    if (!proposals?.id) return;

    const ctx = document.getElementById(
      "generalVotes" + proposals.id
    ) as HTMLCanvasElement | null;

    if (!ctx) return;

    ctx.width = width;
    ctx.height = height;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (logo) {
      const image = new Image();
      image.src = logo;
      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);
      };
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
              proposals.no_vote,
            ],
            borderWidth: 0,
            backgroundColor: ["#22981D", "#737383", "#B21D20", "#262835"],
            hoverOffset: 4,
            borderAlign: "inner",
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        cutout: "50%",
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
  }, [imageRef.current]);

  return (
    <canvas className={className} id={"generalVotes" + proposals.id}></canvas>
  );
};

export default memo(ChartVotes);
