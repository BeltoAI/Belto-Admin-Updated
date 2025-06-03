import { Providers } from './providers'
import RootLayoutClient from './RootLayoutClient'; 
import './globals.css';

// Export metadata from the Server Component
export const metadata = {
  title: "BELTO ADMIN PORTAL",
  description: "BELTO ADMIN PORTAL SUPPORTED BY AI",
};

// RootLayout Server Component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </Providers>
      </body>
    </html>
  )
}