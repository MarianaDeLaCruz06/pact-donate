import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Droplet, Building2, TrendingUp, Users, Shield, Zap, ArrowRight, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import donanteIcon from "@/assets/donante-icon.png";
import entidadIcon from "@/assets/entidad-icon.png";
import impactoIcon from "@/assets/impacto-icon.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/90" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent/30 rounded-full blur-xl animate-pulse delay-2000" />
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/30">
            <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
            <span className="text-sm font-medium">Plataforma #1 en donación de sangre</span>
          </div>

          {/* Main heading */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <Heart className="w-20 h-20 text-white mr-4 animate-pulse" fill="currentColor" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              LifeLink
            </h1>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Salvando vidas
            <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
              juntos
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Conectamos donantes de sangre con entidades médicas de manera inteligente, 
            <span className="font-semibold text-white"> facilitando el proceso de donación</span> y 
            <span className="font-semibold text-white"> ayudando a salvar vidas</span>.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-blue-200">Vidas salvadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">1,200+</div>
              <div className="text-sm text-blue-200">Donantes activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-blue-200">Entidades médicas</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-blue-50 text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              <Heart className="mr-2 h-5 w-5" fill="currentColor" />
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver cómo funciona
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Características principales
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Por qué elegir <span className="text-primary">LifeLink</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma diseñada para hacer la donación de sangre más eficiente, segura y accesible para todos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Para Donantes */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <img src={donanteIcon} alt="Donante" className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-primary group-hover:text-primary/80 transition-colors">
                    Para Donantes
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Registra tu información, mantén tu historia clínica actualizada y recibe notificaciones cuando tu donación pueda salvar una vida.
                  </p>
                  <div className="space-y-2 mb-6 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Registro rápido y seguro
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Historial médico digital
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Notificaciones inteligentes
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                    onClick={() => navigate('/auth')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ser Donante
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Para Entidades */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-secondary/5 to-secondary/10">
              <CardContent className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <img src={entidadIcon} alt="Entidad" className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-secondary group-hover:text-secondary/80 transition-colors">
                    Para Entidades
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Gestiona solicitudes de sangre, revisa historias clínicas de donantes y registra donaciones de manera eficiente y segura.
                  </p>
                  <div className="space-y-2 mb-6 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Gestión centralizada
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Historiales verificados
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Reportes detallados
                    </div>
                  </div>
                  <Button 
                    variant="secondary"
                    className="w-full hover:bg-secondary/90 transition-all duration-300 hover:scale-105"
                    onClick={() => navigate('/auth')}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Registrar Entidad
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Impacto Real */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <img src={impactoIcon} alt="Impacto" className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-accent group-hover:text-accent/80 transition-colors">
                    Impacto Real
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Cada donación puede salvar hasta 3 vidas. Únete a nuestra comunidad y sé parte del cambio que el mundo necesita.
                  </p>
                  <div className="space-y-2 mb-6 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      1 donación = 3 vidas
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Impacto medible
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Comunidad solidaria
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                    <p className="text-2xl font-bold text-primary">1 donación = 3 vidas</p>
                    <p className="text-sm text-gray-600 mt-1">Tu impacto real</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nuestro impacto en números
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Cada día trabajamos para conectar más vidas y crear un mundo más saludable.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Vidas salvadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">1,200+</div>
              <div className="text-blue-200">Donantes activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Entidades médicas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-200">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ¿Listo para hacer la diferencia?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Únete a nuestra comunidad y comienza a salvar vidas hoy mismo. 
            El proceso es simple, seguro y tu impacto será inmediato.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              <Heart className="mr-2 h-5 w-5" fill="currentColor" />
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Más información
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-8 h-8 text-primary" fill="currentColor" />
                <span className="text-2xl font-bold">LifeLink</span>
              </div>
              <p className="text-gray-400">
                Conectando vidas a través de la donación de sangre de manera segura y eficiente.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Donantes</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Registro</li>
                <li>Historia clínica</li>
                <li>Donaciones</li>
                <li>Perfil</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Entidades</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Solicitudes</li>
                <li>Historiales</li>
                <li>Donaciones</li>
                <li>Reportes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>info@lifelink.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Soporte 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 LifeLink. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
