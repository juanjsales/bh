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
      <section className="py-20 md:py-32 bg-gradient-to-b from-card to-background relative overflow-hidden">
        {/* Background Image - Integrada no fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663492755131/Vruftkpt8c5NfqaQ9bJ7wu/banner-box-kraft-TGhScygmCN47jr2Dt8qDYM.webp"
            alt="Box & Health"
            className="absolute right-0 bottom-0 w-full md:w-2/3 lg:w-1/2 h-auto object-contain opacity-90"
            loading="lazy"
          />
        </div>
        
        {/* Gradient Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/40 to-background pointer-events-none" />
        
        {/* Conteúdo */}
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Sua Curadoria de Bem-estar Personalizada
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Descubra as caixas de rituais botânicos e místicos especialmente selecionadas para você. 
              Cada box é uma jornada de bem-estar e autocuidado.
            </p>
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
                          R$ {produto.preco_avulso}
                        </span>
                      </div>
                      {produto.preco_assinatura && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Assinatura:</span>
                          <span className="text-lg font-bold text-accent">
                            R$ {produto.preco_assinatura}
                            <span className="text-xs text-muted-foreground ml-1">/mês</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {isAuthenticated ? (
                      <Link href="/loja">
                        <Button className="w-full" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Adicionar à Loja
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/quiz">
                        <Button className="w-full" size="sm">
                          Fazer Quiz para Começar
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
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

      {/* Subscription Options Section - 3 Planos Centralizados */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Escolha seu Modelo de Assinatura
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Compra Avulsa Card */}
            <Card className="p-8 relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-foreground mb-2">Compra Avulsa</h4>
                  <p className="text-muted-foreground">Sem compromisso</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Compre quando quiser</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Sem compromisso</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Entrega rápida</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Link href="/quiz">
                  <Button className="w-full" variant="outline">
                    Começar
                  </Button>
                </Link>
              ) : (
                <Link href="/quiz">
                  <Button className="w-full" variant="outline">
                    Começar
                  </Button>
                </Link>
              )}
            </Card>

            {/* Assinatura Trimestral */}
            <Card className="p-8 relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-foreground mb-2">Trimestral</h4>
                  <p className="text-muted-foreground">Economize 10%</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Desconto de 10%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Entrega a cada 3 meses</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Cancele quando quiser</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Link href="/quiz">
                  <Button className="w-full" variant="outline">
                    Começar
                  </Button>
                </Link>
              ) : (
                <Link href="/quiz">
                  <Button className="w-full" variant="outline">
                    Começar
                  </Button>
                </Link>
              )}
            </Card>

            {/* Assinatura Mensal - Destaque */}
            <Card className="p-8 relative border-2 border-accent bg-accent/5">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-foreground mb-2">Mensal</h4>
                  <p className="text-muted-foreground">Economize 15%</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Desconto de 15%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Entrega mensal</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Prioridade</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Link href="/quiz">
                  <Button className="w-full">
                    Começar Agora
                  </Button>
                </Link>
              ) : (
                <Link href="/quiz">
                  <Button className="w-full">
                    Começar Agora
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h3 className="text-3xl font-bold mb-6 text-foreground">
            Pronto para começar?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra qual box de bem-estar é perfeita para você. Leva apenas 5 minutos!
          </p>
          {isAuthenticated ? (
            <Link href="/quiz">
              <Button size="lg" className="text-lg px-8 py-6">
                Fazer Quiz Agora
              </Button>
            </Link>
          ) : (
            <Link href="/quiz">
              <Button size="lg" className="text-lg px-8 py-6">
                Fazer Quiz Agora
              </Button>
            </Link>
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
