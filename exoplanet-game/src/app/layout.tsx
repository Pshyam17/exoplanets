import './globals.css';
import { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { Lato, Montserrat } from 'next/font/google';

const lato = Lato({
  weight: ['400', '700', '900'], // regular, medium, bold
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['400', '700', '900'], // regular, medium, bold
  subsets: ['latin'],
  display: 'swap',
});


export const metadata = {
  title: 'Exoplanet Game',
  description: 'Interactive Exoplanet Classification Mission',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} min-h-screen flex flex-col`}>
        <Header />

        {/* Main content grows to fill available space */}
        <main className="flex-grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
