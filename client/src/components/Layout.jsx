import { NavLink, Outlet } from 'react-router-dom';
import { Boxes, History, LayoutDashboard, PackageMinus, PackagePlus, Store, TriangleAlert } from 'lucide-react';

const links = [
  { para: '/', texto: 'Dashboard', Icone: LayoutDashboard, exato: true },
  { para: '/produtos', texto: 'Produtos', Icone: Boxes },
  { para: '/estoque-baixo', texto: 'Estoque Baixo', Icone: TriangleAlert },
  { para: '/entrada', texto: 'Entrada', Icone: PackagePlus },
  { para: '/saida', texto: 'Saída', Icone: PackageMinus },
  { para: '/historico', texto: 'Histórico', Icone: History },
];

export default function Layout() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-mar-900 text-white md:min-h-screen md:w-60 md:shrink-0">
        <div className="flex items-center gap-3 px-6 py-5">
          <Store size={26} aria-hidden="true" />
          <div>
            <p className="text-lg font-bold leading-tight">Controle de Estoque</p>
            <p className="text-sm text-mar-100/70">Loja de acessórios</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0" aria-label="Menu principal">
          {links.map(({ para, texto, Icone, exato }) => (
            <NavLink
              key={para}
              to={para}
              end={exato}
              className={({ isActive }) =>
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-white ' +
                (isActive ? 'bg-white/15 text-white' : 'text-mar-100/80 hover:bg-white/10')
              }
            >
              <Icone size={18} aria-hidden="true" />
              {texto}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
