import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Droplets } from "lucide-react";

const EntidadDonaciones = ({ entidad }: any) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    documento: '',
    nombreDonante: '',
    tipoSangre: '',
    fecha: '',
    cantidad: '',
    observaciones: '',
  });

  const handleBuscarDonante = async () => {
    if (!formData.documento) return;

    const { data } = await supabase
      .from('donantes')
      .select('nombre, tipo_sangre')
      .eq('documento', formData.documento)
      .maybeSingle();

    if (data) {
      setFormData({ ...formData, nombreDonante: data.nombre, tipoSangre: data.tipo_sangre || '' });
    } else {
      toast({
        title: "Donante no encontrado",
        description: "El documento ingresado no pertenece a ningún donante registrado.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('donaciones').insert({
        documento_donante: formData.documento,
        fecha_donacion: formData.fecha,
        cantidad_ml: parseInt(formData.cantidad),
        centro: entidad.nombre,
        observaciones: formData.observaciones || null,
      });

      if (error) throw error;

      toast({
        title: "Donación registrada",
        description: "La donación ha sido registrada correctamente",
      });

      setFormData({ documento: '', nombreDonante: '', tipoSangre: '', fecha: '', cantidad: '', observaciones: '' });
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
          <Droplets className="h-6 w-6 text-secondary" />
          Registrar Donación
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
  );
};

export default EntidadDonaciones;
