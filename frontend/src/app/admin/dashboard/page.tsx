import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard do Administrador</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center p-10">
          <h3 className="text-2xl font-bold tracking-tight">
            Você ainda não adicionou nenhum conteúdo
          </h3>
          <p className="text-sm text-muted-foreground">
            Comece gerenciando usuários ou adicionando novos vídeos e materiais.
          </p>
        </div>
      </div>
    </>
  )
} 