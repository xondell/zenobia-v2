import type { Metadata } from 'next';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/cyrillic-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/cyrillic-500.css';
import '@fontsource/cormorant-garamond/cyrillic-400-italic.css';
import '@fontsource/cinzel/latin-400.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'ЗЕНОБИЯ — Женщина, бросившая вызов Риму',
  description: 'Интерактивная история Зенобии и Пальмиры: десять глав, историческая карта, 3D-архитектура и монета. Школьный исторический проект.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
