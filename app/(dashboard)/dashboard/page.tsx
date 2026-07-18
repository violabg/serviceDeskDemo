import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          Dashboard
        </h1>
      </div>
      <Suspense fallback={<DashboardPageSkeleton />}>
        <DashboardPageContent />
      </Suspense>
    </main>
  )
}

async function DashboardPageContent() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  )
}

function DashboardPageSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="aspect-video rounded-xl" />
      </div>
      <Skeleton className="min-h-screen flex-1 rounded-xl md:min-h-min" />
    </div>
  )
}
