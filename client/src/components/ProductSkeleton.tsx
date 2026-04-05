import { Card } from "@/components/ui/card";

/**
 * Skeleton Loading Component para produtos
 * Exibe um placeholder animado enquanto os dados estão carregando
 */
export function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Imagem Skeleton */}
      <div className="relative h-64 bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-background to-muted animate-shimmer" />
      </div>

      {/* Conteúdo Skeleton */}
      <div className="p-6 space-y-4">
        {/* Título */}
        <div className="h-6 bg-muted rounded animate-pulse" />

        {/* Descrição */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>

        {/* Preço */}
        <div className="flex gap-4 pt-2">
          <div className="h-5 bg-muted rounded w-24 animate-pulse" />
          <div className="h-5 bg-muted rounded w-24 animate-pulse" />
        </div>

        {/* Botão */}
        <div className="h-10 bg-muted rounded animate-pulse mt-4" />
      </div>
    </Card>
  );
}

/**
 * Grid de Skeletons para exibir enquanto produtos carregam
 */
export function ProductSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
