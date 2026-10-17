'use client'

import dynamic from 'next/dynamic'
import type { BookSpec } from '../../data/books'

const BookStage = dynamic(
  () => import('./BookStage').then((mod) => mod.BookStage),
  { ssr: false },
)

export function BookCoversClient({ books }: { books: BookSpec[] }) {
  return <BookStage books={books} />
}
