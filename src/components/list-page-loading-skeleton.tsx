function SkeletonBlock({ className }: { className: string }) {
  return <div className={["skeleton-shimmer rounded-2xl", className].join(" ")} />;
}

function SkeletonHeader({ accentClassName, showAction }: { accentClassName: string; showAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex-1">
        <SkeletonBlock className={["h-4 w-28 rounded-full", accentClassName].join(" ")} />
        <SkeletonBlock className="mt-4 h-10 w-72 max-w-full" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
        <SkeletonBlock className="mt-3 h-4 w-11/12 max-w-xl" />
      </div>
      {showAction ? <SkeletonBlock className="h-12 w-full rounded-2xl lg:w-37" /> : null}
    </div>
  );
}

function SkeletonStatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <SkeletonBlock className="h-3 w-24 rounded-full" />
          <SkeletonBlock className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CustomersPageLoadingSkeleton() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <SkeletonHeader accentClassName="bg-sky-200" showAction />
        <SkeletonStatCards />

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-4 w-116 max-w-full" />
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-71.5" />
              <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-31.5" />
            </div>
          </div>

          <div className="overflow-x-auto lg:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50/80">
                  {[
                    "w-[16%]",
                    "w-[17%]",
                    "w-[16%]",
                    "w-[14%]",
                    "w-[10%]",
                    "w-[9%]",
                    "w-[8%]",
                  ].map((width, index) => (
                    <th key={index} className="px-6 py-4">
                      <SkeletonBlock className={["h-3 rounded-full", width].join(" ")} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="align-top">
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-28" />
                      <SkeletonBlock className="h-4 w-40" />
                      <SkeletonBlock className="h-3 w-16 rounded-full" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <SkeletonBlock className="h-6 w-16 rounded-full" />
                        <SkeletonBlock className="h-6 w-14 rounded-full" />
                        <SkeletonBlock className="h-6 w-12 rounded-full" />
                      </div>
                      <SkeletonBlock className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-36" />
                      <SkeletonBlock className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2 text-sm">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-16" />
                      <SkeletonBlock className="h-4 w-14" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <SkeletonBlock className="ml-auto h-10 w-10 rounded-xl" />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export function PetsPageLoadingSkeleton() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <SkeletonHeader accentClassName="bg-emerald-200" />
        <SkeletonStatCards />

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-6 w-32" />
              <SkeletonBlock className="h-4 w-[24rem] max-w-full" />
            </div>
            <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-71.5" />
          </div>

          <div className="overflow-x-auto lg:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50/80">
                  {[
                    "w-[14%]",
                    "w-[14%]",
                    "w-[16%]",
                    "w-[16%]",
                    "w-[8%]",
                    "w-[8%]",
                  ].map((width, index) => (
                    <th key={index} className="px-6 py-4">
                      <SkeletonBlock className={["h-3 rounded-full", width].join(" ")} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="align-top">
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="h-4 w-32" />
                      <SkeletonBlock className="h-3 w-20 rounded-full" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-28" />
                      <SkeletonBlock className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-36" />
                      <SkeletonBlock className="h-4 w-28" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <SkeletonBlock className="ml-auto h-10 w-10 rounded-xl" />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export function VisitsPageLoadingSkeleton() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <SkeletonBlock className="skeleton-tint-amber h-4 w-24 rounded-full" />
          <SkeletonBlock className="mt-4 h-10 w-64 max-w-full" />
          <SkeletonBlock className="mt-4 h-4 w-full max-w-3xl" />
          <SkeletonBlock className="mt-3 h-4 w-11/12 max-w-2xl" />
        </div>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="h-4 w-80 max-w-full" />
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-71.5" />
              <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-31.5" />
            </div>
          </div>

          <div className="overflow-x-auto lg:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50/80">
                  {[
                    "w-[14%]",
                    "w-[18%]",
                    "w-[12%]",
                    "w-[8%]",
                    "w-[10%]",
                    "w-[10%]",
                    "w-[8%]",
                  ].map((width, index) => (
                    <th key={index} className="px-6 py-4">
                      <SkeletonBlock className={["h-3 rounded-full", width].join(" ")} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-28" />
                      <SkeletonBlock className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-4 w-40" />
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-4 w-10" />
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-5">
                    <SkeletonBlock className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <SkeletonBlock className="ml-auto h-10 w-10 rounded-xl" />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}