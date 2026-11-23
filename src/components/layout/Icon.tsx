import type { SVGProps, ReactNode } from 'react'

type IconName =
  | 'user'
  | 'logout'
  | 'arrow-left'
  | 'info'
  | 'calendar'
  | 'clock'
  | 'pin'
  | 'file'
  | 'check'
  | 'check-circle'
  | 'ear'
  | 'x'
  | 'edit'
  | 'shield'
  | 'message'

const paths: Record<IconName, ReactNode> = {
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.8 3-5.7 7-5.7s6.3 1.9 7 5.7"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  'arrow-left': <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.1"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  'check-circle': <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  ear: <><path d="M7 10a5 5 0 0 1 10 0c0 2-1 3-2.5 4.5-1.2 1.2-1.5 2-1.5 3a2 2 0 0 1-4 0"/><path d="M10 10a2 2 0 0 1 4 0c0 1-.5 1.5-1.2 2.2"/><path d="M18.5 4.5 20 3"/></>,
  x: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  shield: <><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
  message: <><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.9-4A8.5 8.5 0 1 1 21 11.5Z"/></>,
}

export default function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="1em"
      height="1em"
      style={{ display: 'inline-block', flex: '0 0 auto', verticalAlign: 'middle' }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
