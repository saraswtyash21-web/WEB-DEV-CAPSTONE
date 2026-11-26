import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Book from '../src/models/Book.js';

const sampleBooks = [
  { title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Fiction', isbn: '9781250301697', description: 'A psychological thriller about a painter who stops speaking after a shocking act.', totalCopies: 4 },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Personal Development', isbn: '9780735211292', description: 'A practical guide to building good habits and breaking bad ones.', totalCopies: 5 },
  { title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', isbn: '9780062315007', description: 'A shepherd travels in search of treasure and discovers a personal legend.', totalCopies: 3 },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', isbn: '9780553380163', description: 'An accessible introduction to cosmology and the nature of the universe.', totalCopies: 2 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', isbn: '9780857197689', description: 'Short lessons about wealth, behaviour and making better financial decisions.', totalCopies: 3 },
  { title: 'Educated', author: 'Tara Westover', category: 'Memoir', isbn: '9780399590504', description: 'A memoir about family, education and finding a path beyond expectations.', totalCopies: 2 },
  { title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', isbn: '9780465050659', description: 'A classic introduction to human-centred design and usable products.', totalCopies: 2 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', description: 'A sweeping history of humankind from early humans to the modern era.', totalCopies: 4 },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Personal Development', isbn: '9781455586691', description: 'A case for focused work and practical ways to make room for it.', totalCopies: 3 },
  { title: 'The Namesake', author: 'Jhumpa Lahiri', category: 'Fiction', isbn: '9780618485222', description: 'A family story about identity, belonging and life between cultures.', totalCopies: 3 }
];

try {
  await connectDB();
  for (const book of sampleBooks) {
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
    await Book.updateOne(
      { isbn: book.isbn },
      { $set: { coverUrl }, $setOnInsert: { ...book, availableCopies: book.totalCopies } },
      { upsert: true }
    );
  }
  console.log(`Demo catalogue ready (${sampleBooks.length} sample titles).`);
} finally {
  await mongoose.disconnect();
}
