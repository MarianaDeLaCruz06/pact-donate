import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface DonantePerfilProps {
  donante: any;
  onUpdate: () => void;
}

const DonantePerfil = ({ donante, onUpdate }: DonantePerfilProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tipoSangre, setTipoSangre] = useState(donante.tipo_sangre || '');

  const handleUpdateTipoSangre = async () => {
    if (!tipoSangre) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de sangre",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('donantes')
        .update({ tipo_sangre: tipoSangre })
        .eq('documento', donante.documento);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu tipo de sangre ha sido actualizado",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
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
          <User className="h-6 w-6 text-primary" />
          Mi Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Documento de identidad</Label>
            <Input value={donante.documento} disabled />
          </div>

          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input value={donante.nombre} disabled />
          </div>

          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <Input value={donante.correo} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-sangre">Tipo de sangre</Label>
            <Select value={tipoSangre} onValueChange={setTipoSangre}>
              <SelectTrigger id="tipo-sangre">
                <SelectValue placeholder="Selecciona tu tipo de sangre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {tipoSangre !== donante.tipo_sangre && (
          <Button onClick={handleUpdateTipoSangre} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar tipo de sangre"}
          </Button>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Fecha de registro:</strong>{" "}
            {new Date(donante.fecha_registro).toLocaleDateString('es-ES')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonantePerfil;
