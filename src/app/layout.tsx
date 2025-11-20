import './style.scss';
import CssBaseline from '@mui/material/CssBaseline';
import { NextIntlClientProvider } from 'next-intl';
import { PropsWithChildren } from 'react';
import { MainProvider } from '@/components/MainContext';
import MuiThemeProvider from '@/components/MuiThemeProvider';

const locale = 'en';

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang={locale}>
      <body className="layout">
        <MuiThemeProvider>
          <CssBaseline />
          <NextIntlClientProvider>
            <MainProvider>
              {children}
            </MainProvider>
          </NextIntlClientProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
