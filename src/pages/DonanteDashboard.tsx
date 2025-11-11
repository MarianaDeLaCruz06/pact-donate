import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogOut, User, FileText, Droplets, Bell } from "lucide-react";
import DonanteInicio from "@/components/donante/DonanteInicio";
import DonanteHistoria from "@/components/donante/DonanteHistoria";
import DonanteDonaciones from "@/components/donante/DonanteDonaciones";
import DonantePerfil from "@/components/donante/DonantePerfil";
import DonanteNotificaciones from "@/components/donante/DonanteNotificaciones";

const DonanteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [donante, setDonante] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const data = await auth.getMe();

      if (!data) {
        toast({
          title: "Error",
          description: "No se encontró tu perfil de donante",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      setDonante(data);
    } catch (error) {
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <div>
              <h1 className="text-2xl font-bold">LifeLink</h1>
              <p className="text-sm text-muted-foreground">Panel de Donante</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="inicio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="inicio">
              <Heart className="mr-2 h-4 w-4" />
              Inicio
            </TabsTrigger>
            <TabsTrigger value="historia">
              <FileText className="mr-2 h-4 w-4" />
              Historia Clínica
            </TabsTrigger>
            <TabsTrigger value="donaciones">
              <Droplets className="mr-2 h-4 w-4" />
              Mis Donaciones
            </TabsTrigger>
            <TabsTrigger value="notificaciones">
              <Bell className="mr-2 h-4 w-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="perfil">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inicio">
            <DonanteInicio donante={donante} />
          </TabsContent>

          <TabsContent value="historia">
            <DonanteHistoria donante={donante} />
          </TabsContent>

          <TabsContent value="donaciones">
            <DonanteDonaciones donante={donante} />
          </TabsContent>

          <TabsContent value="notificaciones">
            <DonanteNotificaciones />
          </TabsContent>

          <TabsContent value="perfil">
            <DonantePerfil donante={donante} onUpdate={checkAuth} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DonanteDashboard;
