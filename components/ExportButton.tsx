'use client'

import { Download } from 'lucide-react'
import { downloadCsv } from '@/lib/utils/csv'

export default function ExportButton({ filename, rows, label = 'Exportar CSV' }: {
  filename: string; rows: Array<Record<string, unknown>>; label?: string
}) {
  return (
    <button onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white glass disabled:opacity-50">
      <Download className="w-4 h-4" /> {label}
    </button>
  )
}
