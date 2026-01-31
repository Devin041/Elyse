import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SearchModal } from '@/components/layout/SearchModal';
import { CartNotification } from '@/components/ui/CartNotification';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import '@/styles/globals.css';
import '@/styles/GlobalSpacing.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Elysè | Premium Ethnic Wear',
  description: 'Discover the finest collection of ethnic wear at Elysè.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
        <CartProvider>
          <AuthProvider>
            <CartNotification />
            <AnnouncementBar />
            <Header />
            <MobileMenu />
            <CartDrawer />
            <SearchModal />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
