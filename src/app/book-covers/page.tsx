import type { Metadata } from 'next'
import { BookCoversClient } from '../../components/books/BookCoversClient'
import { getVisibleBooks } from '../../lib/books'

export const metadata: Metadata = {
  title: 'Book Covers',
  robots: { index: false, follow: false },
}

export default async function BookCoversPage() {
  const books = await getVisibleBooks()
  if (books.length === 0) return null
  return <BookCoversClient books={books} />
}
