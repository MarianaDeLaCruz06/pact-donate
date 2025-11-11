import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { notificaciones, preferenciasNotificaciones } from "@/lib/api";
import { Bell, BellOff, Check, MapPin, AlertTriangle, Clock, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DonanteNotificaciones = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notificacionesData, setNotificacionesData] = useState<any[]>([]);
  const [preferencias, setPreferencias] = useState({
    recibir_notificaciones: true,
    solo_emergencias: false,
  });

  useEffect(() => {
    loadNotificaciones();
    loadPreferencias();
  }, []);

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const data = await notificaciones.getAll();
      setNotificacionesData(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreferencias = async () => {
    try {
      const data = await preferenciasNotificaciones.get();
      setPreferencias({
        recibir_notificaciones: data.recibir_notificaciones !== false,
        solo_emergencias: data.solo_emergencias || false,
      });
    } catch (error: any) {
      console.error('Error cargando preferencias:', error);
    }
  };

  const handleMarcarLeida = async (id: string) => {
    try {
      await notificaciones.marcarLeida(id);
      loadNotificaciones();
      toast({
        title: "Notificación marcada como leída",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePreferencias = async () => {
    try {
      await preferenciasNotificaciones.update(preferencias);
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificaciones han sido actualizadas",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const notificacionesNoLeidas = notificacionesData.filter(n => !n.leida);
  const notificacionesLeidas = notificacionesData.filter(n => n.leida);
  const notificacionesEmergencia = notificacionesData.filter(n => n.tipo === 'emergencia');

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'emergencia':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'solicitud':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'emergencia':
        return 'destructive';
      case 'solicitud':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notificaciones" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notificaciones">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones ({notificacionesNoLeidas.length})
          </TabsTrigger>
          <TabsTrigger value="preferencias">
            <Settings className="mr-2 h-4 w-4" />
            Preferencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notificaciones">
          <div className="space-y-4">
            {/* Emergency Notifications */}
            {notificacionesEmergencia.filter(n => !n.leida).length > 0 && (
              <Card className="border-red-500 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Emergencias ({notificacionesEmergencia.filter(n => !n.leida).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notificacionesEmergencia
                    .filter(n => !n.leida)
                    .map((notificacion) => (
                      <Card key={notificacion.id} className="bg-red-50 border-red-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTipoIcon(notificacion.tipo)}
                                <h4 className="font-semibold text-red-800">{notificacion.titulo}</h4>
                                <Badge variant="destructive">EMERGENCIA</Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{notificacion.mensaje}</p>
                              {notificacion.ubicacion && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                  <MapPin className="h-3 w-3" />
                                  {notificacion.ubicacion}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {new Date(notificacion.fecha_creacion).toLocaleString('es-ES')}
                              </div>
                            </div>
                            {!notificacion.leida && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarcarLeida(notificacion.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* All Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Todas las Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando notificaciones...</p>
                  </div>
                ) : notificacionesData.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notificacionesData.map((notificacion) => (
                      <Card
                        key={notificacion.id}
                        className={notificacion.leida ? 'bg-muted/50' : ''}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTipoIcon(notificacion.tipo)}
                                <h4 className="font-semibold">{notificacion.titulo}</h4>
                                <Badge variant={getTipoColor(notificacion.tipo) as any}>
                                  {notificacion.tipo}
                                </Badge>
                                {!notificacion.leida && (
                                  <Badge variant="outline" className="bg-blue-100">
                                    Nueva
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notificacion.mensaje}
                              </p>
                              {notificacion.ubicacion && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3" />
                                  {notificacion.ubicacion}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(notificacion.fecha_creacion).toLocaleString('es-ES')}
                              </div>
                            </div>
                            {!notificacion.leida && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarcarLeida(notificacion.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferencias">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recibir-notificaciones" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Recibir Notificaciones
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Activa o desactiva las notificaciones de solicitudes de sangre
                  </p>
                </div>
                <Switch
                  id="recibir-notificaciones"
                  checked={preferencias.recibir_notificaciones}
                  onCheckedChange={(checked) => {
                    setPreferencias({ ...preferencias, recibir_notificaciones: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="solo-emergencias" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Solo Emergencias
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir solo notificaciones de emergencias
                  </p>
                </div>
                <Switch
                  id="solo-emergencias"
                  checked={preferencias.solo_emergencias}
                  onCheckedChange={(checked) => {
                    setPreferencias({ ...preferencias, solo_emergencias: checked });
                  }}
                  disabled={!preferencias.recibir_notificaciones}
                />
              </div>

              <Button onClick={handleUpdatePreferencias} className="w-full">
                Guardar Preferencias
              </Button>

              {!preferencias.recibir_notificaciones && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Las notificaciones están desactivadas. No recibirás alertas de solicitudes de sangre.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonanteNotificaciones;

