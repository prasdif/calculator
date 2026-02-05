import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Home Interior Estimator',
    description: 'Calculate the approximate cost of doing up your home interiors. Get estimates for kitchen, wardrobe, and full home interiors.',
    keywords: 'interior design, home interiors, kitchen design, wardrobe, cost estimator',
    authors: [{ name: 'Home Interior Estimator' }],
    openGraph: {
        title: 'Home Interior Estimator',
        description: 'Calculate the approximate cost of doing up your home interiors',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
