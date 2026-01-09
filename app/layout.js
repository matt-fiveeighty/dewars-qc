// app/layout.js
import './globals.css';

export const metadata = {
  title: "Dewar's Creative Maven - BVI QC Tool",
  description: 'AI-powered brand compliance analysis for Dewar\'s marketing creatives',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
