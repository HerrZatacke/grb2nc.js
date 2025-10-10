import { NextIntlClientProvider } from 'next-intl';
import { PropsWithChildren } from 'react';
import { MainProvider } from '@/components/MainContext';
import './style.scss';

const locale = 'en';

export default async function RootLayout({ children }: PropsWithChildren) {

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <MainProvider>
            {children}
          </MainProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
