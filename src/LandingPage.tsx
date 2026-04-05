import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-[#3A3A3A] font-sans antialiased">
      <nav className="py-6 px-10 flex justify-between items-center bg-[#F4EEE0]">
        <span className="font-serif text-2xl tracking-tighter font-semibold">Box & Health</span>
        <a href="https://wa.me/5521999999999" className="text-xs tracking-widest uppercase border-b border-[#3A3A3A] pb-1 font-semibold hover:opacity-70 transition-all">Contato</a>
      </nav>

      <section className="pt-12 pb-24 px-6 bg-gradient-to-b from-[#F4EEE0] to-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left order-2 md:order-1">
            <span className="uppercase tracking-[0.3em] text-[10px] font-bold mb-4 block text-[#8B5E3C]">Curadoria Exclusiva</span>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] mb-6">
              Sua casa, <br/><span className="italic text-[#8B5E3C]">seu santuário.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-10 leading-relaxed font-light">
              Itens selecionados de casa, banho e cuidado pessoal para transformar sua rotina em um momento de pausa real.
            </p>
            <a href="https://wa.me/5521999999999" className="bg-[#3A3A3A] text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black transition-all">
              Quero a minha Box
            </a>
          </div>

          <div className="flex-1 order-1 md:order-2 relative">
            <div className="absolute inset-0 bg-[#E6D5C3] rounded-full filter blur-3xl opacity-20 -z-10"></div>
            <img src="produto.jpg" alt="Box and Health Produto" className="rounded-2xl shadow-2xl w-full" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: "✨", title: "Personalização", desc: "Cada detalhe é pensado para quem vai receber." },
            { icon: "🛁", title: "Banho Boutique", desc: "A experiência de um spa de luxo no seu banheiro." },
            { icon: "🚚", title: "Entrega no RJ", desc: "Envio cuidadoso e pronto para presentear." },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="h-12 w-12 bg-[#F4EEE0] rounded-full flex items-center justify-center mb-4 text-xl">{item.icon}</div>
              <h3 className="font-serif text-2xl italic mb-2">{item.title}</h3>
              <p className="opacity-70 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#F4EEE0] py-16 px-6 text-center border-t border-[#E6D5C3]">
        <h2 className="font-serif text-3xl mb-8">Transforme sua rotina hoje.</h2>
        <p className="text-[10px] uppercase tracking-widest opacity-40">© 2026 Box & Health | Por Personalizados da Rô</p>
      </footer>
    </div>
  );
};

export default LandingPage;
