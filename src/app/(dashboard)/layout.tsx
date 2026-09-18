


import AuthGuard from '@/components/auth/auth.guard'
import React, { ReactNode } from 'react'

function layout({children}:{children:ReactNode}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}

export default layout