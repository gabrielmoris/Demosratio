"use client";
import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "gray" | "green" | "red" | "amber";
}

const colorStyles = {
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: "text-gray-500",
    text: "text-gray-900",
    label: "text-gray-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-500",
    text: "text-green-700",
    label: "text-green-600",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    text: "text-red-700",
    label: "text-red-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    text: "text-amber-700",
    label: "text-amber-600",
  },
};

export const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const styles = colorStyles[color];

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-2 md:p-4 flex items-center gap-4`}
    >
      <div className={`${styles.icon} flex-shrink-0`}>{icon}</div>
      <div>
        <p className={`${styles.label} text-sm font-medium`}>{title}</p>
        <p className={`${styles.text} text-2xl font-bold`}>{value}</p>
      </div>
    </div>
  );
};
