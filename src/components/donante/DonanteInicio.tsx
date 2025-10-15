import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, FileText, Droplet } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DonanteInicioProps {
  donante: any;
}

const DonanteInicio = ({ donante }: DonanteInicioProps) => {
  const [stats, setStats] = useState({
    totalDonaciones: 0,
    ultimaDonacion: null as string | null,
    historiaEstado: 'Sin enviar',
  });

  useEffect(() => {
    if (donante) {
      loadStats();
    }
  }, [donante]);

  const loadStats = async () => {
    // Cargar donaciones
    const { data: donaciones } = await supabase
      .from('donaciones')
      .select('*')
      .eq('documento_donante', donante.documento)
      .order('fecha_donacion', { ascending: false });

    // Cargar historia clínica
    const { data: historia } = await supabase
      .from('historias_clinicas')
      .select('estado, fecha_envio')
      .eq('documento_donante', donante.documento)
      .maybeSingle();

    setStats({
      totalDonaciones: donaciones?.length || 0,
      ultimaDonacion: donaciones?.[0]?.fecha_donacion || null,
      historiaEstado: historia?.estado || 'Sin enviar',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            Bienvenido, {donante.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Documento:</strong> {donante.documento}
            </p>
            {donante.tipo_sangre && (
              <p className="text-sm text-muted-foreground">
                <strong>Tipo de sangre:</strong> {donante.tipo_sangre}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplet className="h-4 w-4 text-primary" />
              Total de Donaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.totalDonaciones}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-secondary" />
              Estado Historia Clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${
              stats.historiaEstado === 'Aprobada' ? 'text-green-600' :
              stats.historiaEstado === 'Pendiente' ? 'text-yellow-600' :
              stats.historiaEstado === 'Rechazada' ? 'text-red-600' :
              'text-muted-foreground'
            }`}>
              {stats.historiaEstado}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Última Donación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {stats.ultimaDonacion 
                ? new Date(stats.ultimaDonacion).toLocaleDateString('es-ES')
                : 'Sin donaciones'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonanteInicio;
