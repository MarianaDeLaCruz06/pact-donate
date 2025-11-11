import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { historiasClinicas } from "@/lib/api";
import { FileCheck, Edit, Save, X, Calendar, User, Weight, Ruler, Pill, Heart, Activity } from "lucide-react";

interface DonanteHistoriaProps {
  donante: any;
}

const DonanteHistoria = ({ donante }: DonanteHistoriaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historia, setHistoria] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    edad: '',
    peso: '',
    altura: '',
    enfermedades: '',
    medicamentos: '',
    transfusiones_previas: false,
    habitos_personales: '',
    observaciones: '',
    fecha_ultima_donacion: '',
  });

  useEffect(() => {
    loadHistoria();
  }, [donante]);

  const loadHistoria = async () => {
    try {
      const data = await historiasClinicas.getByDocumento(donante.documento);
      if (data) {
        setHistoria(data);
        setFormData({
          edad: data.edad?.toString() || '',
          peso: data.peso?.toString() || '',
          altura: data.altura?.toString() || '',
          enfermedades: data.enfermedades || '',
          medicamentos: data.medicamentos || '',
          transfusiones_previas: data.transfusiones_previas || false,
          habitos_personales: data.habitos_personales || '',
          observaciones: data.observaciones || '',
          fecha_ultima_donacion: data.fecha_ultima_donacion || '',
        });
      }
    } catch (error) {
      console.error('Error loading historia:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurar datos originales
    if (historia) {
      setFormData({
        edad: historia.edad?.toString() || '',
        peso: historia.peso?.toString() || '',
        altura: historia.altura?.toString() || '',
        enfermedades: historia.enfermedades || '',
        medicamentos: historia.medicamentos || '',
        transfusiones_previas: historia.transfusiones_previas || false,
        habitos_personales: historia.habitos_personales || '',
        observaciones: historia.observaciones || '',
        fecha_ultima_donacion: historia.fecha_ultima_donacion || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        edad: parseInt(formData.edad) || null,
        peso: parseFloat(formData.peso) || null,
        altura: parseFloat(formData.altura) || null,
        enfermedades: formData.enfermedades || null,
        medicamentos: formData.medicamentos || null,
        transfusiones_previas: formData.transfusiones_previas,
        habitos_personales: formData.habitos_personales || null,
        observaciones: formData.observaciones || null,
        fecha_ultima_donacion: formData.fecha_ultima_donacion || null,
      };

      await historiasClinicas.create(dataToSave);

      toast({
        title: "Historia clínica guardada",
        description: "Tu historia clínica ha sido registrada correctamente. Estado: Pendiente de revisión médica.",
      });

      await loadHistoria();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la historia clínica",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Aprobada': return 'default';
      case 'Pendiente': return 'secondary';
      case 'Rechazada': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Historia Clínica
            </CardTitle>
            <CardDescription>
              {historia 
                ? `Estado: ${historia.estado} ${historia.observaciones_medicas ? `- ${historia.observaciones_medicas}` : ''}`
                : 'Completa tu historia clínica para poder donar'
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {historia && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!historia ? (
          // Primera vez - mostrar formulario
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  placeholder="Ej: 25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  placeholder="Ej: 70.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (m)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.01"
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  placeholder="Ej: 1.75"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_ultima_donacion">Fecha última donación</Label>
                <Input
                  id="fecha_ultima_donacion"
                  type="date"
                  value={formData.fecha_ultima_donacion}
                  onChange={(e) => setFormData({ ...formData, fecha_ultima_donacion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfermedades">Enfermedades o condiciones médicas</Label>
              <Textarea
                id="enfermedades"
                value={formData.enfermedades}
                onChange={(e) => setFormData({ ...formData, enfermedades: e.target.value })}
                placeholder="Describe cualquier enfermedad o condición médica relevante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos actuales</Label>
              <Textarea
                id="medicamentos"
                value={formData.medicamentos}
                onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                placeholder="Lista de medicamentos que tomas actualmente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfusiones">¿Has recibido transfusiones previas?</Label>
              <Select
                value={formData.transfusiones_previas.toString()}
                onValueChange={(value) => setFormData({ ...formData, transfusiones_previas: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitos">Hábitos personales</Label>
              <Textarea
                id="habitos"
                value={formData.habitos_personales}
                onChange={(e) => setFormData({ ...formData, habitos_personales: e.target.value })}
                placeholder="Ej: Fumo, bebo alcohol ocasionalmente, hago ejercicio regularmente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones adicionales</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Cualquier información adicional que consideres relevante"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar historia clínica"}
            </Button>
          </form>
        ) : isEditing ? (
          // Modo edición
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  placeholder="Ej: 25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  placeholder="Ej: 70.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (m)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.01"
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  placeholder="Ej: 1.75"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_ultima_donacion">Fecha última donación</Label>
                <Input
                  id="fecha_ultima_donacion"
                  type="date"
                  value={formData.fecha_ultima_donacion}
                  onChange={(e) => setFormData({ ...formData, fecha_ultima_donacion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfermedades">Enfermedades o condiciones médicas</Label>
              <Textarea
                id="enfermedades"
                value={formData.enfermedades}
                onChange={(e) => setFormData({ ...formData, enfermedades: e.target.value })}
                placeholder="Describe cualquier enfermedad o condición médica relevante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos actuales</Label>
              <Textarea
                id="medicamentos"
                value={formData.medicamentos}
                onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                placeholder="Lista de medicamentos que tomas actualmente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfusiones">¿Has recibido transfusiones previas?</Label>
              <Select
                value={formData.transfusiones_previas.toString()}
                onValueChange={(value) => setFormData({ ...formData, transfusiones_previas: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitos">Hábitos personales</Label>
              <Textarea
                id="habitos"
                value={formData.habitos_personales}
                onChange={(e) => setFormData({ ...formData, habitos_personales: e.target.value })}
                placeholder="Ej: Fumo, bebo alcohol ocasionalmente, hago ejercicio regularmente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones adicionales</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Cualquier información adicional que consideres relevante"
              />
            </div>
          </form>
        ) : (
          // Modo solo lectura
          <div className="space-y-6">
            {/* Estado */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <span className="font-medium">Estado:</span>
              </div>
              <Badge variant={getEstadoBadgeVariant(historia.estado)}>
                {historia.estado}
              </Badge>
            </div>

            {/* Información básica */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Edad</p>
                    <p className="font-medium">{historia.edad || 'No especificada'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Weight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="font-medium">{historia.peso ? `${historia.peso} kg` : 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Altura</p>
                    <p className="font-medium">{historia.altura ? `${historia.altura} m` : 'No especificada'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Última donación</p>
                    <p className="font-medium">{formatDate(historia.fecha_ultima_donacion)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transfusiones previas</p>
                    <p className="font-medium">{historia.transfusiones_previas ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información detallada */}
            {(historia.enfermedades || historia.medicamentos || historia.habitos_personales || historia.observaciones) && (
              <div className="space-y-4">
                {historia.enfermedades && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Enfermedades o condiciones médicas
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {historia.enfermedades}
                    </p>
                  </div>
                )}

                {historia.medicamentos && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Medicamentos actuales
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {historia.medicamentos}
                    </p>
                  </div>
                )}

                {historia.habitos_personales && (
                  <div>
                    <h4 className="font-medium mb-2">Hábitos personales</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {historia.habitos_personales}
                    </p>
                  </div>
                )}

                {historia.observaciones && (
                  <div>
                    <h4 className="font-medium mb-2">Observaciones adicionales</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {historia.observaciones}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Observaciones médicas */}
            {historia.observaciones_medicas && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Observaciones médicas</h4>
                <p className="text-sm text-blue-700">{historia.observaciones_medicas}</p>
              </div>
            )}

            {/* Fechas */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Enviada: {formatDate(historia.fecha_envio)}</p>
              {historia.fecha_revision && (
                <p>Revisada: {formatDate(historia.fecha_revision)}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonanteHistoria;
