import { Settings } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Configurações</h1>
      <p className="text-sm text-slate-500">Configurações da plataforma em desenvolvimento.</p>
      <div className="mt-10 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Em breve.</p>
        </div>
      </div>
    </div>
  )
}
