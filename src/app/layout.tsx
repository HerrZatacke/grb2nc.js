import { PropsWithChildren } from 'react';
import {MainProvider} from '@/components/MainContext';
import './style.scss';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <MainProvider>
          {children}
        </MainProvider>
      </body>
    </html>
  );
}
