'use client'

import dynamic from 'next/dynamic'

const BookStage = dynamic(
  () => import('./BookStage').then((mod) => mod.BookStage),
  { ssr: false },
)

export function BookCoversClient() {
  return <BookStage />
}
