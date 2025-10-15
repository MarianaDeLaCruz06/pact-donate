import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Droplet, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import donanteIcon from "@/assets/donante-icon.png";
import entidadIcon from "@/assets/entidad-icon.png";
import impactoIcon from "@/assets/impacto-icon.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-16 h-16 text-primary mr-3" fill="currentColor" />
            <h1 className="text-5xl md:text-6xl font-bold">LifeLink</h1>
          </div>
          
          <p className="text-2xl md:text-3xl font-semibold mb-3">
            Salvando vidas juntos
          </p>
          
          <p className="text-xl md:text-2xl mb-6 text-gray-200">
            Conectando vidas a través de la donación de sangre
          </p>
          
          <p className="max-w-2xl mx-auto text-lg mb-8 text-gray-300">
            LifeLink conecta donantes de sangre con entidades médicas, facilitando el proceso de donación y ayudando a salvar vidas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Iniciar sesión
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/auth')}
            >
              Comenzar ahora
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="text-white hover:bg-white/20"
              onClick={() => document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Más información
            </Button>
          </div>
        </div>
      </section>

      {/* Información Section */}
      <section id="info" className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Para Donantes */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <img src={donanteIcon} alt="Donante" className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Para Donantes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Registra tu información, mantén tu historia clínica actualizada y recibe notificaciones cuando tu donación pueda salvar una vida.
                </p>
                <Button 
                  className="mt-6"
                  onClick={() => navigate('/auth')}
                >
                  Ser Donante
                </Button>
              </CardContent>
            </Card>

            {/* Para Entidades */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center">
                    <img src={entidadIcon} alt="Entidad" className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-secondary">Para Entidades</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gestiona solicitudes de sangre, revisa historias clínicas de donantes y registra donaciones de manera eficiente y segura.
                </p>
                <Button 
                  variant="secondary"
                  className="mt-6"
                  onClick={() => navigate('/auth')}
                >
                  Registrar Entidad
                </Button>
              </CardContent>
            </Card>

            {/* Impacto Real */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                    <img src={impactoIcon} alt="Impacto" className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-accent">Impacto Real</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cada donación puede salvar hasta 3 vidas. Únete a nuestra comunidad y sé parte del cambio que el mundo necesita.
                </p>
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <p className="text-3xl font-bold text-primary">1 donación = 3 vidas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">© 2025 LifeLink. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
