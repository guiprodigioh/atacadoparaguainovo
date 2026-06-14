'use client'
import { CarrinhoProvider } from './CarrinhoContext'
import { CarrinhoSidebar } from './CarrinhoSidebar'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CarrinhoProvider>
      {children}
      <CarrinhoSidebar />
    </CarrinhoProvider>
  )
}
