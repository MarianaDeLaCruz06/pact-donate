import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { historiasClinicas } from "@/lib/api";
import { FileText, Eye } from "lucide-react";

interface EntidadHistoriasProps {
  entidad: any;
}

const EntidadHistorias = ({ entidad }: EntidadHistoriasProps) => {
  const { toast } = useToast();
  const [historias, setHistorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistoria, setSelectedHistoria] = useState<any>(null);
  const [observacionesMedicas, setObservacionesMedicas] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    loadHistorias();
  }, []);

  const loadHistorias = async () => {
    try {
      const data = await historiasClinicas.getAll();
      // Transform data to include donante info if needed
      setHistorias(data || []);
    } catch (error) {
      console.error('Error loading historias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevisar = (historia: any) => {
    setSelectedHistoria(historia);
    setObservacionesMedicas(historia.observaciones_medicas || '');
  };

  const handleAprobar = async () => {
    if (!selectedHistoria) return;

    setProcesando(true);

    try {
      await historiasClinicas.update(selectedHistoria.id, {
        estado: 'Aprobada',
        observaciones_medicas: observacionesMedicas,
      });

      toast({
        title: "Historia aprobada",
        description: "La historia clínica ha sido aprobada correctamente",
      });

      setSelectedHistoria(null);
      loadHistorias();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedHistoria) return;

    setProcesando(true);

    try {
      await historiasClinicas.update(selectedHistoria.id, {
        estado: 'Rechazada',
        observaciones_medicas: observacionesMedicas,
      });

      toast({
        title: "Historia rechazada",
        description: "La historia clínica ha sido rechazada",
      });

      setSelectedHistoria(null);
      loadHistorias();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-secondary" />
            Historias Clínicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Cargando...</p>
          ) : historias.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay historias clínicas registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donante</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Fecha de envío</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historias.map((historia) => (
                    <TableRow key={historia.id}>
                      <TableCell>{historia.donantes?.nombre}</TableCell>
                      <TableCell>{historia.donantes?.documento}</TableCell>
                      <TableCell>
                        {new Date(historia.fecha_envio).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          historia.estado === 'Aprobada' ? 'bg-green-100 text-green-800' :
                          historia.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {historia.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevisar(historia)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Revisar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedHistoria} onOpenChange={() => setSelectedHistoria(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Historia Clínica</DialogTitle>
          </DialogHeader>

          {selectedHistoria && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Donante</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoria.donantes?.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Documento</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoria.donantes?.documento}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Edad</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoria.edad || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Peso</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoria.peso ? `${selectedHistoria.peso} kg` : 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Altura</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoria.altura ? `${selectedHistoria.altura} m` : 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Transfusiones previas</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoria.transfusiones_previas ? 'Sí' : 'No'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Enfermedades</p>
                <p className="text-sm text-muted-foreground">{selectedHistoria.enfermedades || 'No especificado'}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Medicamentos</p>
                <p className="text-sm text-muted-foreground">{selectedHistoria.medicamentos || 'No especificado'}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Hábitos personales</p>
                <p className="text-sm text-muted-foreground">{selectedHistoria.habitos_personales || 'No especificado'}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Observaciones del donante</p>
                <p className="text-sm text-muted-foreground">{selectedHistoria.observaciones || 'No especificado'}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones-medicas">Observaciones médicas</Label>
                <Textarea
                  id="observaciones-medicas"
                  value={observacionesMedicas}
                  onChange={(e) => setObservacionesMedicas(e.target.value)}
                  placeholder="Añade observaciones médicas..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={handleRechazar}
                  disabled={procesando}
                >
                  Rechazar
                </Button>
                <Button
                  onClick={handleAprobar}
                  disabled={procesando}
                >
                  Aprobar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EntidadHistorias;
