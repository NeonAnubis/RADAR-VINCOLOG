import { Settings } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configurações</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Configurações da plataforma</p>
      </div>
      <div className="glass rounded-2xl p-10 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-blue-800 mx-auto mb-3" />
          <p className="text-blue-500 text-sm">Em desenvolvimento. Disponível em breve.</p>
        </div>
      </div>
    </div>
  )
}
