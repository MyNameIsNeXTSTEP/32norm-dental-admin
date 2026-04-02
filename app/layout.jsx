import "./globals.css";

export const metadata = {
  title: "План лечения • ООО 32-Норма",
  description: "Приложение для создания планов лечения в стоматологии",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
