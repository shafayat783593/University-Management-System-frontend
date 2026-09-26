import RoleGuard from '@/components/auth/role.guard'
import DashboardShell from '@/components/dashboard/dashboard-shell'
import React, { ReactNode } from 'react'

function layout({children}:{children:ReactNode}) {
  return (
    <RoleGuard roles={["STUDENT"]}>
      <DashboardShell role='STUDENT' >

      {children}
      </DashboardShell>
    </RoleGuard>
  )
}

export default layout