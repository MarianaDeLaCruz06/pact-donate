import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

const EntidadPerfil = ({ entidad }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-secondary" />
          Perfil de la Entidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre de la entidad</Label>
          <Input value={entidad.nombre} disabled />
        </div>

        <div className="space-y-2">
          <Label>Correo electrónico</Label>
          <Input value={entidad.correo} disabled />
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Fecha de registro:</strong>{" "}
            {new Date(entidad.fecha_registro).toLocaleDateString('es-ES')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntidadPerfil;
