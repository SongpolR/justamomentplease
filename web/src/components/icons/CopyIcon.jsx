import React from "react";

export default function CopyIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="inline-block"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 7V5.8C8 4.805 8.805 4 9.8 4H18.2C19.195 4 20 4.805 20 5.8V14.2C20 15.195 19.195 16 18.2 16H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 8.8C6 7.805 6.805 7 7.8 7H14.2C15.195 7 16 7.805 16 8.8V18.2C16 19.195 15.195 20 14.2 20H7.8C6.805 20 6 19.195 6 18.2V8.8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
