import React from 'react';

export const SunIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

export const MoonIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

export const SoundOnIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);

export const SoundOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
);

export const HelpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
{/* FIX: Changed Icn component to use React.FC to fix typing issues with children prop. */}
const Icn: React.FC = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export const EscapeIcon = () => <Icn><path d="M14.5 2.5a2.5 2.5 0 0 0-5 0V5a2.5 2.5 0 0 0 5 0V2.5z"/><path d="M12 11.5v10"/><path d="M12 21.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/><path d="M6 14.5h12"/><path d="M6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/><path d="M18 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></Icn>;
export const TabIcon = () => <Icn><path d="M10 3H4v18h6"/><path d="m15 8-5 4 5 4"/><path d="M20 3v18"/></Icn>;
export const CapsLockIcon = () => <Icn><path d="m2 14 10-10 10 10"/><path d="M12 22V4"/><path d="M6 14h12"/></Icn>;
export const ShiftIcon = () => <Icn><path d="M12 3 2 13h7v9h6v-9h7L12 3z"/></Icn>;
export const ControlIcon = () => <Icn><circle cx="12" cy="12" r="10"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M18 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"/><path d="M6 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"/></Icn>;
export const WinIcon = () => <Icn><path d="M2 5.5h8.5v8H2z"/><path d="M13.5 5.5H22v8h-8.5z"/><path d="M2 16.5h8.5v8H2z"/><path d="M13.5 16.5H22v8h-8.5z"/></Icn>;
export const AltIcon = () => <Icn><path d="M4 12h16"/><path d="m8 8 4 4 4-4"/><path d="m8 16 4-4 4 4"/><path d="M10 3v18"/></Icn>;
export const SpaceIcon = () => <Icn><path d="M4 18h16"/><path d="M4 12h2"/><path d="M18 12h2"/></Icn>;
export const BackspaceIcon = () => <Icn><path d="M10 3H4v18h6"/><path d="m14 8-4 4 4 4"/><path d="M22 3v18"/></Icn>;
export const EnterIcon = () => <Icn><path d="M13 3H4v11h9"/><path d="m8 19 5-5-5-5"/><path d="M13 14H3"/></Icn>;
{/* FIX: Corrected invalid characters in SVG path data. */}
export const PrintScreenIcon = () => <Icn><path d="M18 13v5H6v-5"/><path d="M12 13v-3"/><path d="M10 8h4"/><path d="M15 3H9v5h6z"/><circle cx="12" cy="15.5" r="2.5"/></Icn>;
export const ScrollLockIcon = () => <Icn><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M12 3v5"/><path d="M12 13a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z"/><path d="M17 3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5h10V3z"/></Icn>;
export const PauseBreakIcon = () => <Icn><path d="M3 13h6v8H3z"/><path d="M15 3h6v8h-6z"/><path d="M12 3v18"/></Icn>;
export const InsertIcon = () => <Icn><path d="M12 3v18"/><path d="M8 7h8"/><path d="M8 17h8"/><path d="M14 3h5v4h-5z"/><path d="M5 17H2v4h3z"/></Icn>;
export const HomeIcon = () => <Icn><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icn>;
export const PageUpIcon = () => <Icn><path d="m12 2-8 8h16L12 2z"/><path d="M12 22v-8"/><path d="M4 14h16"/></Icn>;
export const DeleteIcon = () => <Icn><path d="M4 3v18h16V3"/><path d="m10 8 4 4"/><path d="m14 8-4 4"/><path d="M3 5h18"/></Icn>;
export const EndIcon = () => <Icn><path d="M4 3h16v13H4z"/><path d="M12 16v5"/><path d="M9 21h6"/></Icn>;
export const PageDownIcon = () => <Icn><path d="m12 22 8-8H4l8 8z"/><path d="M12 2v8"/><path d="M4 10h16"/></Icn>;
export const NumLockIcon = () => <Icn><path d="M12 2v4"/><path d="M10 4h4"/><path d="M4 8h16v13H4z"/><path d="M10 12v6"/><path d="M14 12h-4"/></Icn>;
export const MenuIcon = () => <Icn><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></Icn>;
export const ArrowUpIcon = () => <Icn><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></Icn>;
export const ArrowDownIcon = () => <Icn><path d="m5 7 7 7 7-7"/><path d="M12 5v14"/></Icn>;
export const ArrowLeftIcon = () => <Icn><path d="m12 5-7 7 7 7"/><path d="M19 12H5"/></Icn>;
export const ArrowRightIcon = () => <Icn><path d="m12 19 7-7-7-7"/><path d="M5 12h14"/></Icn>;