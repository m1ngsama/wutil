// Ionicons v8.0.13 (MIT). Source and license: /licenses/ionicons.txt.
import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, strokeWidth = 40, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export function SearchOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="search-outline">
      <path d="M221.09,64A157.09,157.09,0,1,0,378.18,221.09,157.1,157.1,0,0,0,221.09,64Z" fill="none" stroke="currentColor" strokeMiterlimit="10" />
      <line x1="338.29" y1="338.29" x2="448" y2="448" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
    </Icon>
  );
}

export function CloseOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="close-outline">
      <line x1="368" y1="368" x2="144" y2="144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="368" y1="144" x2="144" y2="368" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function ArrowForwardOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="arrow-forward-outline">
      <polyline points="268 112 412 256 268 400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
      <line x1="392" y1="256" x2="100" y2="256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
    </Icon>
  );
}

export function ChevronBackOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="chevron-back-outline">
      <polyline points="328 112 184 256 328 400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
    </Icon>
  );
}

export function StarOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="star-outline">
      <path d="M480,208H308L256,48,204,208H32l140,96L118,464,256,364,394,464,340,304Z" fill="none" stroke="currentColor" strokeLinejoin="round" />
    </Icon>
  );
}

export function Star(props: IconProps) {
  return (
    <Icon {...props} data-symbol="star">
      <path d="M394,480a16,16,0,0,1-9.39-3L256,383.76,127.39,477a16,16,0,0,1-24.55-18.08L153,310.35,23,221.2A16,16,0,0,1,32,192H192.38l48.4-148.95a16,16,0,0,1,30.44,0l48.4,149H480a16,16,0,0,1,9.05,29.2L359,310.35l50.13,148.53A16,16,0,0,1,394,480Z" />
    </Icon>
  );
}

export function DesktopOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="desktop-outline">
      <rect x="32" y="64" width="448" height="320" rx="32" ry="32" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <polygon points="304 448 296 384 216 384 208 448 304 448" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="368" y1="448" x2="144" y2="448" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32,304v48a32.09,32.09,0,0,0,32,32H448a32.09,32.09,0,0,0,32-32V304Zm224,64a16,16,0,1,1,16-16A16,16,0,0,1,256,368Z" />
    </Icon>
  );
}

export function SunnyOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="sunny-outline">
      <line x1="256" y1="48" x2="256" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="256" y1="416" x2="256" y2="464" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="403.08" y1="108.92" x2="369.14" y2="142.86" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="142.86" y1="369.14" x2="108.92" y2="403.08" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="464" y1="256" x2="416" y2="256" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="96" y1="256" x2="48" y2="256" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="403.08" y1="403.08" x2="369.14" y2="369.14" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <line x1="142.86" y1="142.86" x2="108.92" y2="108.92" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <circle cx="256" cy="256" r="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
    </Icon>
  );
}

export function MoonOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="moon-outline">
      <path d="M160,136c0-30.62,4.51-61.61,16-88C99.57,81.27,48,159.32,48,248c0,119.29,96.71,216,216,216,88.68,0,166.73-51.57,200-128-26.39,11.49-57.38,16-88,16C256.71,352,160,255.29,160,136Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CopyOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="copy-outline">
      <rect x="128" y="128" width="336" height="336" rx="57" ry="57" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <path d="M383.5,128l.5-24a56.16,56.16,0,0,0-56-56H112a64.19,64.19,0,0,0-64,64V328a56.16,56.16,0,0,0,56,56h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CheckmarkOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="checkmark-outline">
      <polyline points="416 128 192 384 96 288" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function DownloadOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="download-outline">
      <path d="M336,176h40a40,40,0,0,1,40,40V424a40,40,0,0,1-40,40H136a40,40,0,0,1-40-40V216a40,40,0,0,1,40-40h40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="176 272 256 352 336 272" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="256" y1="48" x2="256" y2="336" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function SwapVerticalOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="swap-vertical-outline">
      <polyline points="464 208 352 96 240 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="352" y1="113.13" x2="352" y2="416" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="48 304 160 416 272 304" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="160" y1="398" x2="160" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function ArrowUpOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="arrow-up-outline">
      <polyline points="112 244 256 100 400 244" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
      <line x1="256" y1="120" x2="256" y2="412" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
    </Icon>
  );
}

export function ArrowDownOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="arrow-down-outline">
      <polyline points="112 268 256 412 400 268" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
      <line x1="256" y1="392" x2="256" y2="100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" />
    </Icon>
  );
}

export function RefreshOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="refresh-outline">
      <path d="M320,146s24.36-12-64-12A160,160,0,1,0,416,294" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
      <polyline points="256 58 336 138 256 218" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function ImageOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="image-outline">
      <rect x="48" y="80" width="416" height="352" rx="48" ry="48" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <circle cx="336" cy="176" r="32" fill="none" stroke="currentColor" strokeMiterlimit="10" />
      <path d="M304,335.79,213.34,245.3A32,32,0,0,0,169.47,244L48,352" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M224,432,347.34,308.66a32,32,0,0,1,43.11-2L464,368" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function LockClosedOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="lock-closed-outline">
      <path d="M336,208V113a80,80,0,0,0-160,0v95" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="96" y="208" width="320" height="272" rx="48" ry="48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function LockOpenOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="lock-open-outline">
      <path d="M336,112a80,80,0,0,0-160,0v96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="96" y="208" width="320" height="272" rx="48" ry="48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function DocumentOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="document-outline">
      <path d="M416,221.25V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V96a48,48,0,0,1,48-48h98.75a32,32,0,0,1,22.62,9.37L406.63,198.63A32,32,0,0,1,416,221.25Z" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <path d="M256,56V176a32,32,0,0,0,32,32H408" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function DocumentTextOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="document-text-outline">
      <path d="M416,221.25V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V96a48,48,0,0,1,48-48h98.75a32,32,0,0,1,22.62,9.37L406.63,198.63A32,32,0,0,1,416,221.25Z" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <path d="M256,56V176a32,32,0,0,0,32,32H408" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="176" y1="288" x2="336" y2="288" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="176" y1="368" x2="336" y2="368" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function DocumentsOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="documents-outline">
      <path d="M336,264.13V436c0,24.3-19.05,44-42.95,44H107C83.05,480,64,460.3,64,436V172a44.26,44.26,0,0,1,44-44h94.12a24.55,24.55,0,0,1,17.49,7.36l109.15,111A25.4,25.4,0,0,1,336,264.13Z" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <path d="M200,128V236a28.34,28.34,0,0,0,28,28H336" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M176,128V76a44.26,44.26,0,0,1,44-44h94a24.83,24.83,0,0,1,17.61,7.36l109.15,111A25.09,25.09,0,0,1,448,168V340c0,24.3-19.05,44-42.95,44H344" fill="none" stroke="currentColor" strokeLinejoin="round" />
      <path d="M312,32V140a28.34,28.34,0,0,0,28,28H448" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function AddCircleOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="add-circle-outline">
      <path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" fill="none" stroke="currentColor" strokeMiterlimit="10" />
      <line x1="256" y1="176" x2="256" y2="336" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="336" y1="256" x2="176" y2="256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function ArrowUpCircleOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="arrow-up-circle-outline">
      <polyline points="176 249.38 256 170 336 249.38" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="256" y1="181.03" x2="256" y2="342" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" fill="none" stroke="currentColor" strokeMiterlimit="10" />
    </Icon>
  );
}

export function ShieldCheckmarkOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="shield-checkmark-outline">
      <polyline points="336 176 225.2 304 176 255.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M463.1,112.37C373.68,96.33,336.71,84.45,256,48,175.29,84.45,138.32,96.33,48.9,112.37,32.7,369.13,240.58,457.79,256,464,271.42,457.79,479.3,369.13,463.1,112.37Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CheckmarkCircle(props: IconProps) {
  return (
    <Icon {...props} data-symbol="checkmark-circle">
      <path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48ZM364.25,186.29l-134.4,160a16,16,0,0,1-12,5.71h-.27a16,16,0,0,1-11.89-5.3l-57.6-64a16,16,0,1,1,23.78-21.4l45.29,50.32L339.75,165.71a16,16,0,0,1,24.5,20.58Z" />
    </Icon>
  );
}

export function AlertCircle(props: IconProps) {
  return (
    <Icon {...props} data-symbol="alert-circle">
      <path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm0,319.91a20,20,0,1,1,20-20A20,20,0,0,1,256,367.91Zm21.72-201.15-5.74,122a16,16,0,0,1-32,0l-5.74-121.94v-.05a21.74,21.74,0,1,1,43.44,0Z" />
    </Icon>
  );
}

export function InformationCircle(props: IconProps) {
  return (
    <Icon {...props} data-symbol="information-circle">
      <path d="M256,56C145.72,56,56,145.72,56,256s89.72,200,200,200,200-89.72,200-200S366.28,56,256,56Zm0,82a26,26,0,1,1-26,26A26,26,0,0,1,256,138Zm48,226H216a16,16,0,0,1,0-32h28V244H228a16,16,0,0,1,0-32h32a16,16,0,0,1,16,16V332h28a16,16,0,0,1,0,32Z" />
    </Icon>
  );
}

export function Warning(props: IconProps) {
  return (
    <Icon {...props} data-symbol="warning">
      <path d="M449.07,399.08,278.64,82.58c-12.08-22.44-44.26-22.44-56.35,0L51.87,399.08A32,32,0,0,0,80,446.25H420.89A32,32,0,0,0,449.07,399.08Zm-198.6-1.83a20,20,0,1,1,20-20A20,20,0,0,1,250.47,397.25ZM272.19,196.1l-5.74,122a16,16,0,0,1-32,0l-5.74-121.95v0a21.73,21.73,0,0,1,21.5-22.69h.21a21.74,21.74,0,0,1,21.73,22.7Z" />
    </Icon>
  );
}

export function KeyOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="key-outline">
      <path d="M218.1,167.17c0,13,0,25.6,4.1,37.4-43.1,50.6-156.9,184.3-167.5,194.5a20.17,20.17,0,0,0-6.7,15c0,8.5,5.2,16.7,9.6,21.3,6.6,6.9,34.8,33,40,28,15.4-15,18.5-19,24.8-25.2,9.5-9.3-1-28.3,2.3-36s6.8-9.2,12.5-10.4,15.8,2.9,23.7,3c8.3.1,12.8-3.4,19-9.2,5-4.6,8.6-8.9,8.7-15.6.2-9-12.8-20.9-3.1-30.4s23.7,6.2,34,5,22.8-15.5,24.1-21.6-11.7-21.8-9.7-30.7c.7-3,6.8-10,11.4-11s25,6.9,29.6,5.9c5.6-1.2,12.1-7.1,17.4-10.4,15.5,6.7,29.6,9.4,47.7,9.4,68.5,0,124-53.4,124-119.2S408.5,48,340,48,218.1,101.37,218.1,167.17ZM400,144a32,32,0,1,1-32-32A32,32,0,0,1,400,144Z" fill="none" stroke="currentColor" strokeLinejoin="round" />
    </Icon>
  );
}

export function ColorPaletteOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="color-palette-outline">
      <path d="M430.11,347.9c-6.6-6.1-16.3-7.6-24.6-9-11.5-1.9-15.9-4-22.6-10-14.3-12.7-14.3-31.1,0-43.8l30.3-26.9c46.4-41,46.4-108.2,0-149.2-34.2-30.1-80.1-45-127.8-45-55.7,0-113.9,20.3-158.8,60.1-83.5,73.8-83.5,194.7,0,268.5,41.5,36.7,97.5,55,152.9,55.4h1.7c55.4,0,110-17.9,148.8-52.4C444.41,382.9,442,359,430.11,347.9Z" fill="none" stroke="currentColor" strokeMiterlimit="10" />
      <circle cx="144" cy="208" r="32" />
      <circle cx="152" cy="311" r="32" />
      <circle cx="224" cy="144" r="32" />
      <circle cx="256" cy="367" r="48" />
      <circle cx="328" cy="144" r="32" />
    </Icon>
  );
}

export function LinkOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="link-outline">
      <path d="M208,352H144a96,96,0,0,1,0-192h64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="36" />
      <path d="M304,160h64a96,96,0,0,1,0,192H304" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="36" />
      <line x1="163.29" y1="256" x2="350.71" y2="256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="36" />
    </Icon>
  );
}

export function TextOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="text-outline">
      <polyline points="32 415.5 152 95.5 272 415.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="230" y1="303.5" x2="74" y2="303.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M326,239.5c12.19-28.69,41-48,74-48h0c46,0,80,32,80,80v144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M320,358.5c0,36,26.86,58,60,58,54,0,100-27,100-106v-15c-20,0-58,1-92,5C355.23,304.36,320,319.5,320,358.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CodeWorkingOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="code-working-outline">
      <circle cx="256" cy="256" r="26" />
      <circle cx="346" cy="256" r="26" />
      <circle cx="166" cy="256" r="26" />
      <polyline points="160 368 32 256 160 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="352 368 480 256 352 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function TimeOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="time-outline">
      <path d="M256,64C150,64,64,150,64,256s86,192,192,192,192-86,192-192S362,64,256,64Z" fill="none" stroke="currentColor" strokeMiterlimit="10" />
      <polyline points="256 128 256 272 352 272" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CodeSlashOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="code-slash-outline">
      <polyline points="160 368 32 256 160 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="352 368 480 256 352 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="304" y1="96" x2="208" y2="416" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CodeOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="code-outline">
      <polyline points="160 368 32 256 160 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="352 368 480 256 352 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function ResizeOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="resize-outline">
      <polyline points="304 96 416 96 416 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="405.77" y1="106.2" x2="111.98" y2="400.02" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="208 416 96 416 96 304" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function FingerPrintOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="finger-print-outline">
      <path d="M390.42,75.28a10.45,10.45,0,0,1-5.32-1.44C340.72,50.08,302.35,40,256.35,40c-45.77,0-89.23,11.28-128.76,33.84C122,77,115.11,74.8,111.87,69a12.4,12.4,0,0,1,4.63-16.32A281.81,281.81,0,0,1,256.35,16c49.23,0,92.23,11.28,139.39,36.48a12,12,0,0,1,4.85,16.08A11.3,11.3,0,0,1,390.42,75.28Zm-330.79,126a11.73,11.73,0,0,1-6.7-2.16,12.26,12.26,0,0,1-2.78-16.8c22.89-33.6,52-60,86.69-78.48C209.42,65,302.35,64.72,375.16,103.6c34.68,18.48,63.8,44.64,86.69,78a12.29,12.29,0,0,1-2.78,16.8,11.26,11.26,0,0,1-16.18-2.88c-20.8-30.24-47.15-54-78.36-70.56-66.34-35.28-151.18-35.28-217.29.24-31.44,16.8-57.79,40.8-78.59,71A10,10,0,0,1,59.63,201.28ZM204.1,491a10.66,10.66,0,0,1-8.09-3.6C175.9,466.48,165,453,149.55,424c-16-29.52-24.27-65.52-24.27-104.16,0-71.28,58.71-129.36,130.84-129.36S387,248.56,387,319.84a11.56,11.56,0,1,1-23.11,0c0-58.08-48.32-105.36-107.72-105.36S148.4,261.76,148.4,319.84c0,34.56,7.39,66.48,21.49,92.4,14.8,27.6,25,39.36,42.77,58.08a12.67,12.67,0,0,1,0,17A12.44,12.44,0,0,1,204.1,491Zm165.75-44.4c-27.51,0-51.78-7.2-71.66-21.36a129.1,129.1,0,0,1-55-105.36,11.57,11.57,0,1,1,23.12,0,104.28,104.28,0,0,0,44.84,85.44c16.41,11.52,35.6,17,58.72,17a147.41,147.41,0,0,0,24-2.4c6.24-1.2,12.25,3.12,13.4,9.84a11.92,11.92,0,0,1-9.47,13.92A152.28,152.28,0,0,1,369.85,446.56ZM323.38,496a13,13,0,0,1-3-.48c-36.76-10.56-60.8-24.72-86-50.4-32.37-33.36-50.16-77.76-50.16-125.28,0-38.88,31.9-70.56,71.19-70.56s71.2,31.68,71.2,70.56c0,25.68,21.5,46.56,48.08,46.56s48.08-20.88,48.08-46.56c0-90.48-75.13-163.92-167.59-163.92-65.65,0-125.75,37.92-152.79,96.72-9,19.44-13.64,42.24-13.64,67.2,0,18.72,1.61,48.24,15.48,86.64,2.32,6.24-.69,13.2-6.7,15.36a11.34,11.34,0,0,1-14.79-7,276.39,276.39,0,0,1-16.88-95c0-28.8,5.32-55,15.72-77.76,30.75-67,98.94-110.4,173.6-110.4,105.18,0,190.71,84.24,190.71,187.92,0,38.88-31.9,70.56-71.2,70.56s-71.2-31.68-71.2-70.56C303.5,293.92,282,273,255.42,273s-48.08,20.88-48.08,46.56c0,41,15.26,79.44,43.23,108.24,22,22.56,43,35,75.59,44.4,6.24,1.68,9.71,8.4,8.09,14.64A11.39,11.39,0,0,1,323.38,496Z" />
    </Icon>
  );
}

export function CalendarOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="calendar-outline">
      <rect fill="none" stroke="currentColor" strokeLinejoin="round" x="48" y="80" width="416" height="384" rx="48" />
      <circle cx="296" cy="232" r="24" />
      <circle cx="376" cy="232" r="24" />
      <circle cx="296" cy="312" r="24" />
      <circle cx="376" cy="312" r="24" />
      <circle cx="136" cy="312" r="24" />
      <circle cx="216" cy="312" r="24" />
      <circle cx="136" cy="392" r="24" />
      <circle cx="216" cy="392" r="24" />
      <circle cx="296" cy="392" r="24" />
      <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" x1="128" y1="48" x2="128" y2="80" />
      <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" x1="384" y1="48" x2="384" y2="80" />
      <line fill="none" stroke="currentColor" strokeLinejoin="round" x1="464" y1="160" x2="48" y2="160" />
    </Icon>
  );
}

export function BarcodeOutline(props: IconProps) {
  return (
    <Icon {...props} data-symbol="barcode-outline">
      <path d="M384,400.33l35.13-.33A29,29,0,0,0,448,371.13V140.87A29,29,0,0,0,419.13,112l-35.13.33" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128,112l-36.8.33c-15.88,0-27.2,13-27.2,28.87V371.47c0,15.87,11.32,28.86,27.2,28.86L128,400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="384" y1="192" x2="384" y2="320" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="320" y1="160" x2="320" y2="352" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="256" y1="176" x2="256" y2="336" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="192" y1="160" x2="192" y2="352" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="128" y1="192" x2="128" y2="320" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
