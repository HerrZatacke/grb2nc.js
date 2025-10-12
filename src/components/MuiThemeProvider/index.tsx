'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { PropsWithChildren } from 'react';
import { darkTheme } from '@/styles/muiTheme.ts';

export default function MuiThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      {children}
    </ThemeProvider>
  );
}
