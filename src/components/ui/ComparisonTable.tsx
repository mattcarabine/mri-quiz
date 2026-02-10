import type { QuickReferenceRow } from '../../lib/quickReference';

interface ComparisonTableProps {
  data: QuickReferenceRow[];
}

/**
 * Visual indicator for brightness levels in MRI images
 */
function BrightnessIndicator({ type }: { type?: 'dark' | 'bright' | 'intermediate' }) {
  if (!type) return null;

  const indicators = {
    dark: { symbol: '●', label: 'Dark', className: 'text-slate-400' },
    bright: { symbol: '○', label: 'Bright', className: 'text-slate-200' },
    intermediate: { symbol: '–', label: 'Intermediate', className: 'text-slate-400' },
  };

  const indicator = indicators[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${indicator.className}`}
      role="img"
      aria-label={`${indicator.label} indicator`}
      title={indicator.label}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {indicator.symbol}
      </span>
      <span className="sr-only">{indicator.label}</span>
    </span>
  );
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-xl overflow-hidden shadow-elevated border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800/50">
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm uppercase tracking-wide font-semibold text-slate-400 border-b-2 border-slate-700/50"
              >
                Characteristic
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-sm uppercase tracking-wide font-semibold bg-blue-950/20 border-b-2 border-blue-700/30"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-gradient-t1">T1-Weighted</span>
                </span>
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-sm uppercase tracking-wide font-semibold bg-purple-950/20 border-b-2 border-purple-700/30"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-gradient-t2">T2-Weighted</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.characteristic}
                className={`
                  transition-colors hover:bg-slate-800/30
                  ${index % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}
                `}
              >
                <td className="px-6 py-4 text-slate-200 font-medium border-b border-slate-800/50">
                  {row.characteristic}
                </td>
                <td className="px-6 py-4 text-center bg-blue-950/10 border-b border-slate-800/50">
                  <div className="inline-flex items-center justify-center gap-2">
                    <BrightnessIndicator type={row.t1.indicator} />
                    <span className="text-slate-200">{row.t1.display}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center bg-purple-950/10 border-b border-slate-800/50">
                  <div className="inline-flex items-center justify-center gap-2">
                    <BrightnessIndicator type={row.t2.indicator} />
                    <span className="text-slate-200">{row.t2.display}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {data.map((row) => (
          <div
            key={row.characteristic}
            className="rounded-xl overflow-hidden shadow-elevated border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          >
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-200">{row.characteristic}</h3>
            </div>
            <div className="divide-y divide-slate-700/50">
              <div className="px-4 py-3 bg-blue-950/10 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide font-semibold text-gradient-t1">
                  T1-Weighted
                </span>
                <div className="flex items-center gap-2">
                  <BrightnessIndicator type={row.t1.indicator} />
                  <span className="text-slate-200 font-medium">{row.t1.display}</span>
                </div>
              </div>
              <div className="px-4 py-3 bg-purple-950/10 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide font-semibold text-gradient-t2">
                  T2-Weighted
                </span>
                <div className="flex items-center gap-2">
                  <BrightnessIndicator type={row.t2.indicator} />
                  <span className="text-slate-200 font-medium">{row.t2.display}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
