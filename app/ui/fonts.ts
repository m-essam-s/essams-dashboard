import { Inter, Lusitana } from 'next/font/google'; // Import the fonts
 
export const inter = Inter({ subsets: ['latin'] }); // Define the font with the latin subset
 
export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
}); // Define the font with the latin subset and the 400 and 700 weights