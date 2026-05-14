import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#6366f1FF',
    primaryColorHover: '#818cf8FF',
    primaryColorPressed: '#4f46e5FF',
    primaryColorSuppl: '#818cf8FF',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },

  Menu: {
    itemHeight: '32px',
    itemTextColor: 'rgba(0,0,0,0.65)',
    itemTextColorActive: '#6366f1',
    itemTextColorHover: 'rgba(0,0,0,0.85)',
    itemColorActive: 'rgba(99,102,241,0.08)',
    itemColorActiveHover: 'rgba(99,102,241,0.12)',
    itemIconColor: 'rgba(0,0,0,0.35)',
    itemIconColorActive: '#6366f1',
    itemIconColorHover: 'rgba(0,0,0,0.65)',
  },

  Layout: {
    color: '#f4f6fb',
    siderColor: 'rgba(248,249,252,0.92)',
    siderBorderColor: 'rgba(0,0,0,0.06)',
  },

  Card: {
    color: '#ffffff',
    borderColor: 'rgba(0,0,0,0.07)',
    borderRadius: '12px',
  },

  Input: {
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.8)',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#818cf8FF',
    primaryColorHover: '#a5b4fcFF',
    primaryColorPressed: '#6366f1FF',
    primaryColorSuppl: '#a5b4fcFF',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    bodyColor: '#0f1117',
    baseColor: '#0f1117',
    cardColor: '#1a1d27',
    modalColor: '#1a1d27',
    popoverColor: '#1e2130',
    tableColor: '#1a1d27',
    tableHeaderColor: '#1e2130',
    dividerColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.08)',
    textColor1: 'rgba(255,255,255,0.92)',
    textColor2: 'rgba(255,255,255,0.72)',
    textColor3: 'rgba(255,255,255,0.42)',
    inputColor: 'rgba(255,255,255,0.05)',
    buttonColor2: 'rgba(255,255,255,0.06)',
    buttonColor2Hover: 'rgba(255,255,255,0.10)',
  },

  Menu: {
    itemHeight: '32px',
    itemTextColor: 'rgba(255,255,255,0.58)',
    itemTextColorActive: '#a5b4fc',
    itemTextColorHover: 'rgba(255,255,255,0.85)',
    itemColorActive: 'rgba(129,140,248,0.12)',
    itemColorActiveHover: 'rgba(129,140,248,0.18)',
    itemIconColor: 'rgba(255,255,255,0.32)',
    itemIconColorActive: '#a5b4fc',
    itemIconColorHover: 'rgba(255,255,255,0.65)',
    color: 'transparent',
    borderColor: 'transparent',
  },

  Notification: {
    color: '#1e2130',
    borderRadius: '12px',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#1e2130' },
    },
  },

  Layout: {
    color: '#0f1117',
    siderColor: 'rgba(16,18,26,0.92)',
    siderBorderColor: 'rgba(255,255,255,0.06)',
    headerColor: 'rgba(15,17,23,0.85)',
  },

  Card: {
    color: '#1a1d27',
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: '12px',
    colorEmbedded: '#1e2130',
  },

  Table: {
    tdColor: '#1a1d27',
    thColor: '#1e2130',
  },

  Input: {
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.05)',
    colorFocus: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderFocus: '1px solid #818cf8',
    borderHover: '1px solid rgba(255,255,255,0.2)',
  },

  Collapse: {
    titleFontSize: '14px',
    dividerColor: 'rgba(255,255,255,0.06)',
    titleTextColor: 'rgba(255,255,255,0.72)',
    textColor: 'rgba(255,255,255,0.58)',
  },
};
