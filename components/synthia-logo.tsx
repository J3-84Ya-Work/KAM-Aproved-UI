export function ParkBuddyLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="url(#parkbuddy-gradient)" />
      <path
        d="M8 10.5C8 9.67157 8.67157 9 9.5 9C10.3284 9 11 9.67157 11 10.5C11 11.3284 10.3284 12 9.5 12C8.67157 12 8 11.3284 8 10.5Z"
        fill="white"
      />
      <path
        d="M13 10.5C13 9.67157 13.6716 9 14.5 9C15.3284 9 16 9.67157 16 10.5C16 11.3284 15.3284 12 14.5 12C13.6716 12 13 11.3284 13 10.5Z"
        fill="white"
      />
      <path
        d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="parkbuddy-gradient"
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#005180" />
          <stop offset="1" stopColor="#78BE20" />
        </linearGradient>
      </defs>
    </svg>
  )
}
