import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { solicitudes as solicitudesAPI } from "@/lib/api";
import { AlertCircle, Plus, Calendar, Clock, AlertTriangle } from "lucide-react";

const EntidadSolicitudes = ({ entidad }: any) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [formData, setFormData] = useState({
    tipoSangre: '',
    cantidad: '',
    urgencia: '',
    fechaRequerida: '',
    observaciones: '',
    ubicacion: '',
  });
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState({
    tipoSangre: '',
    cantidad: '',
    observaciones: '',
    ubicacion: '',
  });

  useEffect(() => {
    if (entidad) {
      loadSolicitudes();
    }
  }, [entidad]);

  const loadSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const data = await solicitudesAPI.getAll();
      setSolicitudes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las solicitudes",
        variant: "destructive",
      });
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await solicitudesAPI.create({
        tipo_sangre: formData.tipoSangre,
        cantidad_ml: parseInt(formData.cantidad),
        urgencia: formData.urgencia,
        fecha_requerida: formData.fechaRequerida,
        observaciones: formData.observaciones || null,
        ubicacion: formData.ubicacion || null,
      });

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de sangre ha sido registrada correctamente",
      });

      setFormData({ tipoSangre: '', cantidad: '', urgencia: '', fechaRequerida: '', observaciones: '', ubicacion: '' });
      loadSolicitudes(); // Recargar la lista
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await solicitudesAPI.createEmergency({
        tipo_sangre: emergencyData.tipoSangre,
        cantidad_ml: parseInt(emergencyData.cantidad),
        observaciones: emergencyData.observaciones || null,
        ubicacion: emergencyData.ubicacion || null,
      });

      toast({
        title: "🚨 Alerta de Emergencia Enviada",
        description: `La alerta ha sido enviada a ${response.donantes_notificados || 0} donantes compatibles`,
      });

      setEmergencyData({ tipoSangre: '', cantidad: '', observaciones: '', ubicacion: '' });
      setEmergencyDialogOpen(false);
      loadSolicitudes(); // Recargar la lista
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Crítica': return 'destructive';
      case 'Alta': return 'destructive';
      case 'Media': return 'default';
      case 'Baja': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completada': return 'default';
      case 'En proceso': return 'secondary';
      case 'Pendiente': return 'outline';
      case 'Cancelada': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Button */}
      <Card className="border-red-500 border-2">
        <CardContent className="pt-6">
          <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="w-full">
                <AlertTriangle className="mr-2 h-5 w-5" />
                🚨 BOTÓN DE EMERGENCIA 🚨
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Solicitud de Emergencia
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEmergencySubmit} className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ Esta acción enviará una alerta inmediata a todos los donantes compatibles
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de sangre requerido *</Label>
                  <Select 
                    value={emergencyData.tipoSangre} 
                    onValueChange={(v) => setEmergencyData({ ...emergencyData, tipoSangre: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad requerida (ml) *</Label>
                  <Input
                    type="number"
                    value={emergencyData.cantidad}
                    onChange={(e) => setEmergencyData({ ...emergencyData, cantidad: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Input
                    value={emergencyData.ubicacion}
                    onChange={(e) => setEmergencyData({ ...emergencyData, ubicacion: e.target.value })}
                    placeholder="Ubicación de la emergencia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    value={emergencyData.observaciones}
                    onChange={(e) => setEmergencyData({ ...emergencyData, observaciones: e.target.value })}
                    placeholder="Detalles de la emergencia"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEmergencyDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="destructive" disabled={loading}>
                    {loading ? "Enviando..." : "🚨 Enviar Alerta de Emergencia"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crear">
            <Plus className="mr-2 h-4 w-4" />
            Crear Solicitud
          </TabsTrigger>
          <TabsTrigger value="ver">
            <AlertCircle className="mr-2 h-4 w-4" />
            Ver Solicitudes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crear">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-6 w-6 text-secondary" />
                Nueva Solicitud de Sangre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de sangre</Label>
                    <Select value={formData.tipoSangre} onValueChange={(v) => setFormData({ ...formData, tipoSangre: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(tipo => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad requerida (ml)</Label>
                    <Input
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nivel de urgencia</Label>
                    <Select value={formData.urgencia} onValueChange={(v) => setFormData({ ...formData, urgencia: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha requerida</Label>
                    <Input
                      type="date"
                      value={formData.fechaRequerida}
                      onChange={(e) => setFormData({ ...formData, fechaRequerida: e.target.value })}
                      required
                    />
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Input
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      placeholder="Ubicación donde se requiere la sangre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    />
                  </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar solicitud"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ver">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-secondary" />
                Solicitudes Creadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSolicitudes ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando solicitudes...</p>
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay solicitudes creadas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo Sangre</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Urgencia</TableHead>
                        <TableHead>Fecha Requerida</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitudes.map((solicitud) => (
                        <TableRow key={solicitud.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {solicitud.tipo_sangre}
                              {solicitud.es_emergencia && (
                                <Badge variant="destructive" className="text-xs">
                                  🚨 EMERGENCIA
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{solicitud.cantidad_ml} ml</TableCell>
                          <TableCell>
                            <Badge variant={getUrgenciaColor(solicitud.urgencia) as any}>
                              {solicitud.urgencia}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(solicitud.fecha_requerida).toLocaleDateString('es-ES')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEstadoColor(solicitud.estado) as any}>
                              {solicitud.estado || 'Pendiente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="space-y-1">
                              {solicitud.ubicacion && (
                                <div className="text-xs text-muted-foreground">
                                  📍 {solicitud.ubicacion}
                                </div>
                              )}
                              <div className="truncate">
                                {solicitud.observaciones || '-'}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EntidadSolicitudes;
