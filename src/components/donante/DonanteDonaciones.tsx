import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Droplets } from "lucide-react";

interface DonanteDonacionesProps {
  donante: any;
}

const DonanteDonaciones = ({ donante }: DonanteDonacionesProps) => {
  const [donaciones, setDonaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonaciones();
  }, [donante]);

  const loadDonaciones = async () => {
    const { data } = await supabase
      .from('donaciones')
      .select('*')
      .eq('documento_donante', donante.documento)
      .order('fecha_donacion', { ascending: false });

    setDonaciones(data || []);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          Mis Donaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : donaciones.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aún no has registrado donaciones
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cantidad (ml)</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donaciones.map((donacion) => (
                  <TableRow key={donacion.id}>
                    <TableCell>
                      {new Date(donacion.fecha_donacion).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{donacion.cantidad_ml} ml</TableCell>
                    <TableCell>{donacion.centro || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {donacion.estado}
                      </span>
                    </TableCell>
                    <TableCell>{donacion.observaciones || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonanteDonaciones;
