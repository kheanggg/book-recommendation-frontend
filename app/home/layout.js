import '../globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Home | Book Recommendation',
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header />
        {children}
    </>
  );
}