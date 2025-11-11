import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, FileText, Droplet, Calendar, Users, Award, TrendingUp, Clock, AlertCircle, CheckCircle, Info, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { donaciones, solicitudes } from "@/lib/api";

interface DonanteInicioProps {
  donante: any;
}

const DonanteInicio = ({ donante }: DonanteInicioProps) => {
  const [stats, setStats] = useState({
    totalDonaciones: 0,
    ultimaDonacion: null as string | null,
    historiaEstado: 'Sin enviar',
    vidasSalvadas: 0,
    proximaDonacion: null as string | null,
    totalMl: 0,
    centrosVisitados: 0,
  });

  const [solicitudesRecientes, setSolicitudesRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (donante) {
      loadStats();
      loadSolicitudesRecientes();
    }
  }, [donante]);

  const loadStats = async () => {
    try {
      // Cargar donaciones
      const donacionesData = await donaciones.getAll();
      
      // Cargar historia clínica
      const { historiasClinicas } = await import('@/lib/api');
      let historia = null;
      try {
        historia = await historiasClinicas.getByDocumento(donante.documento);
      } catch (e) {
        // Historia no existe aún
      }

      const totalMl = donacionesData?.reduce((sum: number, d: any) => sum + d.cantidad_ml, 0) || 0;
      const centrosUnicos = new Set(donacionesData?.map((d: any) => d.centro)).size;
      
      // Calcular próxima donación (mínimo 56 días entre donaciones)
      const ultimaDonacion = donacionesData?.[0]?.fecha_donacion;
      const proximaDonacion = ultimaDonacion 
        ? new Date(new Date(ultimaDonacion).getTime() + 56 * 24 * 60 * 60 * 1000)
        : null;

      setStats({
        totalDonaciones: donacionesData?.length || 0,
        ultimaDonacion: ultimaDonacion || null,
        historiaEstado: historia?.estado || 'Sin enviar',
        vidasSalvadas: (donacionesData?.length || 0) * 3,
        proximaDonacion: proximaDonacion?.toISOString().split('T')[0] || null,
        totalMl: totalMl,
        centrosVisitados: centrosUnicos,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSolicitudesRecientes = async () => {
    try {
      if (!donante.tipo_sangre) {
        setSolicitudesRecientes([]);
        return;
      }
      const data = await solicitudes.getAll();
      // Filter by blood type (backend should handle this, but just in case)
      const filtered = data.filter((s: any) => s.tipo_sangre === donante.tipo_sangre).slice(0, 3);
      setSolicitudesRecientes(filtered);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
    }
  };

  const getHistoriaBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Aprobada': return 'default';
      case 'Pendiente': return 'secondary';
      case 'Rechazada': return 'destructive';
      default: return 'outline';
    }
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Crítica': return 'text-red-600';
      case 'Alta': return 'text-orange-600';
      case 'Media': return 'text-yellow-600';
      case 'Baja': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const canDonate = () => {
    if (!stats.ultimaDonacion) return true;
    const lastDonation = new Date(stats.ultimaDonacion);
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 56;
  };

  const getDaysUntilNextDonation = () => {
    if (!stats.ultimaDonacion) return 0;
    const lastDonation = new Date(stats.ultimaDonacion);
    const nextDonation = new Date(lastDonation.getTime() + 56 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysUntil = Math.ceil((nextDonation.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysUntil);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">¡Bienvenido, {donante.nombre}!</h1>
              <p className="text-sm text-muted-foreground font-normal">
                Gracias por ser parte de nuestra comunidad de héroes
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Documento:</span>
                <span className="font-medium">{donante.documento}</span>
              </div>
              {donante.tipo_sangre && (
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Tipo de sangre:</span>
                  <Badge variant="outline" className="font-bold text-red-600">
                    {donante.tipo_sangre}
                  </Badge>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">{stats.vidasSalvadas}</div>
              <div className="text-sm text-muted-foreground">Vidas salvadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Donaciones</p>
                <p className="text-3xl font-bold text-primary">{stats.totalDonaciones}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Droplet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                {stats.totalMl} ml donados
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado Historia</p>
                <Badge variant={getHistoriaBadgeVariant(stats.historiaEstado)} className="mt-1">
                  {stats.historiaEstado}
                </Badge>
              </div>
              <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                {stats.historiaEstado === 'Aprobada' ? 'Listo para donar' : 
                 stats.historiaEstado === 'Pendiente' ? 'En revisión' : 
                 'Requiere atención'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Donación</p>
                <p className="text-lg font-semibold">
                  {stats.ultimaDonacion 
                    ? new Date(stats.ultimaDonacion).toLocaleDateString('es-ES')
                    : 'Sin donaciones'
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                {stats.ultimaDonacion ? 
                  `${Math.floor((new Date().getTime() - new Date(stats.ultimaDonacion).getTime()) / (1000 * 60 * 60 * 24))} días atrás` :
                  'Primera donación pendiente'
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Centros Visitados</p>
                <p className="text-3xl font-bold text-green-600">{stats.centrosVisitados}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                Diferentes centros
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Donation Status */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Estado de Donación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {canDonate() ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">¡Puedes donar ahora!</p>
                  <p className="text-sm text-green-600">
                    Han pasado más de 56 días desde tu última donación. Estás listo para salvar más vidas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Próxima donación disponible</p>
                    <p className="text-sm text-yellow-600">
                      Puedes donar nuevamente en {getDaysUntilNextDonation()} días
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiempo restante</span>
                    <span>{getDaysUntilNextDonation()} días</span>
                  </div>
                  <Progress 
                    value={Math.max(0, ((56 - getDaysUntilNextDonation()) / 56) * 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Blood Requests */}
      {solicitudesRecientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Solicitudes Recientes para tu Tipo de Sangre ({donante.tipo_sangre})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {solicitudesRecientes.map((solicitud) => (
                <div key={solicitud.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-red-600" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800">
                        Se necesita {solicitud.cantidad_ml}ml de sangre {solicitud.tipo_sangre}
                      </p>
                      <p className="text-sm text-red-600">
                        Urgencia: <span className={getUrgenciaColor(solicitud.urgencia)}>{solicitud.urgencia}</span> • 
                        Requerida: {new Date(solicitud.fecha_requerida).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {solicitud.urgencia}
                  </Badge>
                </div>
              ))}
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  Ver todas las solicitudes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Actualizar Historia</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Programar Donación</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Info className="h-6 w-6" />
              <span>Ver Consejos</span>
            </Button>
          </div>
          </CardContent>
        </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-6 w-6" />
            Consejos para Donantes
          </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Antes de donar</p>
                  <p className="text-sm text-blue-600">Descansa bien, come saludable y mantente hidratado</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Después de donar</p>
                  <p className="text-sm text-blue-600">Evita ejercicio intenso por 24 horas</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Frecuencia</p>
                  <p className="text-sm text-blue-600">Puedes donar cada 56 días (hombres) o 84 días (mujeres)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Impacto</p>
                  <p className="text-sm text-blue-600">Cada donación puede salvar hasta 3 vidas</p>
                </div>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default DonanteInicio;
