import { Outlet } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
          <Header />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 
