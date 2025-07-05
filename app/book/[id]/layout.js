import '../../globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Book Recommendation',
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header />
        {children}
    </>
  );
}