import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Leaf, Heart, Sparkles, ShoppingCart, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ProductSkeletonGrid } from "@/components/ProductSkeleton";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const produtosQuery = trpc.produtos.listar.useQuery();
  const assinaturasQuery = trpc.produtos.listarAssinaturas.useQuery();


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Box & Health</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/loja">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Loja
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="default">Meu Ritual</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Já sou cliente</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 md:py-48 bg-gradient-to-b from-card to-background relative overflow-hidden">
        {/* Background Image - Integrada no fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/exbox.jpeg"
            alt="Box & Health"
            className="absolute right-0 bottom-0 w-full md:w-2/3 lg:w-1/2 h-full object-cover object-center opacity-90"
            style={{ inlineSize: '-webkit-fill-available' }}
            loading="lazy"
          />
        </div>
        
        {/* Gradient Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/40 to-background pointer-events-none" />
        
        {/* Conteúdo */}
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
            {isAuthenticated ? (
              <Link href="/quiz">
                <Button size="lg" className="text-lg px-8 py-6">
                  Descubra sua Box
                </Button>
              </Link>
            ) : (
              <Link href="/quiz">
                <Button size="lg" className="text-lg px-8 py-6">
                  Descubra sua Box
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Como Funciona
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="kraft-box text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">
                Quiz Emocional
              </h4>
              <p className="text-muted-foreground">
                Responda perguntas sobre seu bem-estar emocional e físico para descobrir qual box é perfeita para você.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="kraft-box text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">
                Recomendação Personalizada
              </h4>
              <p className="text-muted-foreground">
                Receba uma recomendação única baseada em suas respostas e preferências de bem-estar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="kraft-box text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">
                Rituais Botânicos
              </h4>
              <p className="text-muted-foreground">
                Caixas curadas com ingredientes naturais e rituais para potencializar seu bem-estar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos Section - 4 Caixas com Imagens Centralizadas */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Nossas Caixas de Bem-estar
          </h3>
          
          {produtosQuery.isLoading ? (
            <ProductSkeletonGrid count={4} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {produtosQuery.data?.slice(0, 4).map((produto: any, index: number) => (
                <Card key={produto.id} className="overflow-hidden hover:shadow-xl transition-shadow animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Imagem do Produto - Centralizada */}
                  <div className="relative h-64 bg-muted overflow-hidden group flex items-center justify-center">
                    {produto.imagem_url ? (
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Leaf className="w-12 h-12" />
                      </div>
                    )}
                    {/* Badge de Categoria */}
                    <div className="absolute top-4 right-4 bg-accent/90 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {produto.categoria}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">
                      {produto.nome}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {produto.descricao}
                    </p>

                    {/* Preços */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avulsa:</span>
                        <span className="text-lg font-bold text-accent">
                          R$ {produto.precoAvulso}
                        </span>
                      </div>
                      
                      {produto.assinaturas && produto.assinaturas.length > 0 && (
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                            Planos de Assinatura:
                          </p>
                          {produto.assinaturas.map((assinatura: any) => (
                            <div key={assinatura.assinaturaId} className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">{assinatura.nomeAssinatura} ({assinatura.duracaoMeses} meses)</span>
                              <span className="font-semibold text-foreground">R$ {assinatura.precoEspecifico}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Link href={`/checkout`}>
                      <Button className="w-full" size="sm">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar Agora
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Assinaturas Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Planos de Assinatura
          </h3>
          
          {assinaturasQuery.isLoading ? (
            <p className="text-center">Carregando planos...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {assinaturasQuery.data?.map((assinatura: any) => (
                <Card key={assinatura.id} className="p-6">
                  <h4 className="text-xl font-bold mb-2">{assinatura.nome}</h4>
                  <p className="text-muted-foreground mb-4">{assinatura.descricao}</p>
                  <p className="text-accent font-bold text-lg">R$ {assinatura.preco} / {assinatura.duracaoMeses} meses</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Box & Health. Sua curadoria de bem-estar personalizada.</p>
        </div>
      </footer>
    </div>
  );
}
