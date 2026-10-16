import type { Metadata } from 'next'
import { BookCoversClient } from '../../components/books/BookCoversClient'

export const metadata: Metadata = {
  title: 'Book Covers',
  robots: { index: false, follow: false },
}

export default function BookCoversPage() {
  return <BookCoversClient />
}
