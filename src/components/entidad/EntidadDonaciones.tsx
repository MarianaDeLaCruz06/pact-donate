import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { donaciones as donacionesAPI, donantes } from "@/lib/api";
import { Droplets, Plus, Calendar, User } from "lucide-react";

const EntidadDonaciones = ({ entidad }: any) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [donaciones, setDonaciones] = useState<any[]>([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  const [formData, setFormData] = useState({
    documento: '',
    nombreDonante: '',
    tipoSangre: '',
    fecha: '',
    cantidad: '',
    observaciones: '',
  });

  useEffect(() => {
    if (entidad) {
      loadDonaciones();
    }
  }, [entidad]);

  const loadDonaciones = async () => {
    setLoadingDonaciones(true);
    try {
      const data = await donacionesAPI.getAll();
      // Filter by entidad centro
      const filtered = data.filter((d: any) => d.centro === entidad.nombre);
      setDonaciones(filtered || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las donaciones",
        variant: "destructive",
      });
    } finally {
      setLoadingDonaciones(false);
    }
  };

  const handleBuscarDonante = async () => {
    if (!formData.documento) return;

    try {
      const data = await donantes.getByDocumento(formData.documento);
      setFormData({ ...formData, nombreDonante: data.nombre, tipoSangre: data.tipo_sangre || '' });
    } catch (error: any) {
      toast({
        title: "Donante no encontrado",
        description: error.message || "El documento ingresado no pertenece a ningún donante registrado.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await donacionesAPI.create({
        documento_donante: formData.documento,
        fecha_donacion: formData.fecha,
        cantidad_ml: parseInt(formData.cantidad),
        centro: entidad.nombre,
        observaciones: formData.observaciones || null,
      });

      toast({
        title: "Donación registrada",
        description: "La donación ha sido registrada correctamente",
      });

      setFormData({ documento: '', nombreDonante: '', tipoSangre: '', fecha: '', cantidad: '', observaciones: '' });
      loadDonaciones(); // Recargar la lista
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="registrar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrar">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Donación
          </TabsTrigger>
          <TabsTrigger value="ver">
            <Droplets className="mr-2 h-4 w-4" />
            Ver Donaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-6 w-6 text-secondary" />
                Registrar Nueva Donación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Documento del donante</Label>
                    <Input
                      value={formData.documento}
                      onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                      placeholder="Número de documento"
                      required
                    />
                  </div>
                  <Button type="button" onClick={handleBuscarDonante} className="mt-8">
                    Buscar
                  </Button>
                </div>

                {formData.nombreDonante && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p><strong>Nombre:</strong> {formData.nombreDonante}</p>
                    {formData.tipoSangre && <p><strong>Tipo de sangre:</strong> {formData.tipoSangre}</p>}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de donación</Label>
                    <Input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad (ml)</Label>
                    <Input
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      placeholder="Ej: 450"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales"
                  />
                </div>

                <Button type="submit" disabled={loading || !formData.nombreDonante}>
                  {loading ? "Registrando..." : "Registrar donación"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ver">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-6 w-6 text-secondary" />
                Donaciones Registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDonaciones ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando donaciones...</p>
                </div>
              ) : donaciones.length === 0 ? (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay donaciones registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donante</TableHead>
                        <TableHead>Tipo Sangre</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donaciones.map((donacion) => (
                        <TableRow key={donacion.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {donacion.donantes?.nombre || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {donacion.donantes?.tipo_sangre || 'No especificado'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(donacion.fecha_donacion).toLocaleDateString('es-ES')}
                            </div>
                          </TableCell>
                          <TableCell>{donacion.cantidad_ml} ml</TableCell>
                          <TableCell>
                            <Badge variant={donacion.estado === 'Completada' ? 'default' : 'secondary'}>
                              {donacion.estado || 'Completada'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {donacion.observaciones || '-'}
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

export default EntidadDonaciones;
