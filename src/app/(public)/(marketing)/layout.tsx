import Footer from '@/components/layout/public/Footer'
import Header from '@/components/layout/public/Header'
import React from 'react'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
    <main className="flex-1">    {children}</main>
  
      <Footer/>
    </div>
  )
}

export default layout