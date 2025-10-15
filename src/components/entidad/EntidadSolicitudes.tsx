import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

const EntidadSolicitudes = ({ entidad }: any) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoSangre: '',
    cantidad: '',
    urgencia: '',
    fechaRequerida: '',
    observaciones: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('solicitudes').insert({
        entidad_id: entidad.id,
        tipo_sangre: formData.tipoSangre,
        cantidad_ml: parseInt(formData.cantidad),
        urgencia: formData.urgencia,
        fecha_requerida: formData.fechaRequerida,
        observaciones: formData.observaciones || null,
      });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de sangre ha sido registrada correctamente",
      });

      setFormData({ tipoSangre: '', cantidad: '', urgencia: '', fechaRequerida: '', observaciones: '' });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-secondary" />
          Solicitud de Sangre
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
  );
};

export default EntidadSolicitudes;
