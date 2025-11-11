import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogOut, FileText, Droplets, AlertCircle, User, BarChart3, Search, Package } from "lucide-react";
import EntidadHistorias from "@/components/entidad/EntidadHistorias";
import EntidadDonaciones from "@/components/entidad/EntidadDonaciones";
import EntidadSolicitudes from "@/components/entidad/EntidadSolicitudes";
import EntidadPerfil from "@/components/entidad/EntidadPerfil";
import EntidadReportes from "@/components/entidad/EntidadReportes";
import EntidadBusquedaSangre from "@/components/entidad/EntidadBusquedaSangre";
import EntidadInventario from "@/components/entidad/EntidadInventario";

const EntidadDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [entidad, setEntidad] = useState<any>(null);

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
          description: "No se encontró tu perfil de entidad",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      setEntidad(data);
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
          <Heart className="w-12 h-12 text-secondary animate-pulse mx-auto mb-4" />
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
            <Heart className="w-8 h-8 text-secondary" fill="currentColor" />
            <div>
              <h1 className="text-2xl font-bold">LifeLink</h1>
              <p className="text-sm text-muted-foreground">Panel de Entidad</p>
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
        <Tabs defaultValue="historias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="historias">
              <FileText className="mr-2 h-4 w-4" />
              Historias
            </TabsTrigger>
            <TabsTrigger value="donaciones">
              <Droplets className="mr-2 h-4 w-4" />
              Donaciones
            </TabsTrigger>
            <TabsTrigger value="solicitudes">
              <AlertCircle className="mr-2 h-4 w-4" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="reportes">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="busqueda">
              <Search className="mr-2 h-4 w-4" />
              Búsqueda
            </TabsTrigger>
            <TabsTrigger value="inventario">
              <Package className="mr-2 h-4 w-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="perfil">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historias">
            <EntidadHistorias entidad={entidad} />
          </TabsContent>

          <TabsContent value="donaciones">
            <EntidadDonaciones entidad={entidad} />
          </TabsContent>

          <TabsContent value="solicitudes">
            <EntidadSolicitudes entidad={entidad} />
          </TabsContent>

          <TabsContent value="reportes">
            <EntidadReportes entidad={entidad} />
          </TabsContent>

          <TabsContent value="busqueda">
            <EntidadBusquedaSangre />
          </TabsContent>

          <TabsContent value="inventario">
            <EntidadInventario entidad={entidad} />
          </TabsContent>

          <TabsContent value="perfil">
            <EntidadPerfil entidad={entidad} onUpdate={checkAuth} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EntidadDashboard;
