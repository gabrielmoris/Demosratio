import React, { useRef, useState, memo, useEffect } from "react";

interface ExpandableTextProps {
  text: string;
  maxLines: number;
  isExpandable?: boolean;
  className?: string;
}

const ExpandableText = ({ text, maxLines, isExpandable = true, className }: ExpandableTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      const element = containerRef.current;
      const isContentOverflowing = element.scrollHeight > element.clientHeight;
      setIsOverflowing(isContentOverflowing);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text, maxLines]);

  const textContainerStyle: React.CSSProperties = {
    display: isExpanded ? "block" : "-webkit-box",
    WebkitLineClamp: isExpanded ? "none" : maxLines,
    WebkitBoxOrient: "vertical",
    overflow: isExpanded ? "visible" : "hidden",
  };

  return (
    <section className={`relative ${className}`}>
      <div ref={containerRef} className="text-justify transition-[max-height,opacity] duration-300 ease-out" style={textContainerStyle}>
        {text}
      </div>
      {isExpandable && (isOverflowing || isExpanded) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-2 text-right bg-transparent border-none cursor-pointer text-gray-400 hover:text-black transition-colors duration-200"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
};

ExpandableText.displayName = "ExpandableText";
const MemoizedExpandableText = memo(ExpandableText);
export { MemoizedExpandableText as ExpandableText };
