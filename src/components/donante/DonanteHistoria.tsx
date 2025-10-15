import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileCheck } from "lucide-react";

interface DonanteHistoriaProps {
  donante: any;
}

const DonanteHistoria = ({ donante }: DonanteHistoriaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historia, setHistoria] = useState<any>(null);
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
    const { data } = await supabase
      .from('historias_clinicas')
      .select('*')
      .eq('documento_donante', donante.documento)
      .maybeSingle();

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        documento_donante: donante.documento,
        edad: parseInt(formData.edad) || null,
        peso: parseFloat(formData.peso) || null,
        altura: parseFloat(formData.altura) || null,
        enfermedades: formData.enfermedades || null,
        medicamentos: formData.medicamentos || null,
        transfusiones_previas: formData.transfusiones_previas,
        habitos_personales: formData.habitos_personales || null,
        observaciones: formData.observaciones || null,
        fecha_ultima_donacion: formData.fecha_ultima_donacion || null,
        estado: 'Pendiente',
      };

      if (historia) {
        const { error } = await supabase
          .from('historias_clinicas')
          .update(dataToSave)
          .eq('id', historia.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('historias_clinicas')
          .insert(dataToSave);

        if (error) throw error;
      }

      toast({
        title: "Historia clínica guardada",
        description: "Tu historia clínica ha sido registrada correctamente. Estado: Pendiente de revisión médica.",
      });

      loadHistoria();
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

  return (
    <Card>
      <CardHeader>
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
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default DonanteHistoria;
