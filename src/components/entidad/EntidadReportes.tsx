import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { reportes } from "@/lib/api";
import { FileText, Download, Filter, AlertCircle } from "lucide-react";

// Import recharts normally - it's installed
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const EntidadReportes = ({ entidad }: any) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    banco: '',
    tipo_sangre: '',
  });

  useEffect(() => {
    console.log('EntidadReportes mounted, entidad:', entidad);
    // Load report even if entidad is not available yet
    loadReport();
  }, [entidad]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportes.getDonaciones({});
      if (data && data.donaciones) {
        setReportData(data);
      } else {
        setReportData({ donaciones: [], estadisticas: { total_donaciones: 0, total_ml: 0, por_tipo_sangre: {}, por_periodo: {}, por_banco: {} } });
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      setError(error.message || "No se pudo cargar el reporte");
      setReportData(null);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el reporte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportes.getDonaciones(filters);
      if (data && data.donaciones) {
        setReportData(data);
      } else {
        setReportData({ donaciones: [], estadisticas: { total_donaciones: 0, total_ml: 0, por_tipo_sangre: {}, por_periodo: {}, por_banco: {} } });
      }
    } catch (error: any) {
      console.error('Error loading filtered report:', error);
      setError(error.message || "No se pudo cargar el reporte");
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el reporte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      fecha_inicio: '',
      fecha_fin: '',
      banco: '',
      tipo_sangre: '',
    });
    loadReport();
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.donaciones || reportData.donaciones.length === 0) {
      toast({
        title: "Error",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = ['Fecha', 'Donante', 'Tipo Sangre', 'Cantidad (ml)', 'Centro', 'Observaciones'];
      const rows = reportData.donaciones.map((d: any) => [
        new Date(d.fecha_donacion).toLocaleDateString('es-ES'),
        d.donante_nombre || '',
        d.donante_tipo_sangre || '',
        d.cantidad_ml || 0,
        d.centro || '',
        d.observaciones || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_donaciones_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportado",
        description: "Reporte exportado a CSV correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al exportar el reporte",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      window.print();
      toast({
        title: "Exportando",
        description: "Use la función de imprimir de su navegador para guardar como PDF",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al exportar el reporte",
        variant: "destructive",
      });
    }
  };

  const tipoSangreData = reportData?.estadisticas?.por_tipo_sangre 
    ? Object.entries(reportData.estadisticas.por_tipo_sangre).map(([name, value]) => ({
        name,
        value: value as number
      }))
    : [];

  const bancoData = reportData?.estadisticas?.por_banco
    ? Object.entries(reportData.estadisticas.por_banco).map(([name, value]) => ({
        name,
        value: value as number
      }))
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-secondary" />
            Reporte de Donaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filtros</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Input
                  type="date"
                  value={filters.fecha_inicio}
                  onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <Input
                  type="date"
                  value={filters.fecha_fin}
                  onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Banco/Centro</Label>
                <Input
                  value={filters.banco}
                  onChange={(e) => handleFilterChange('banco', e.target.value)}
                  placeholder="Nombre del banco"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Sangre</Label>
                {/* Use '__ALL__' sentinel for the "Todos" option to avoid empty Select.Item value */}
                <Select
                  value={filters.tipo_sangre || '__ALL__'}
                  onValueChange={(v) => handleFilterChange('tipo_sangre', v === '__ALL__' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL__">Todos</SelectItem>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} disabled={loading}>
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
                Limpiar Filtros
              </Button>
              <Button variant="outline" onClick={exportToCSV} disabled={!reportData || !reportData.donaciones || reportData.donaciones.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF} disabled={!reportData || !reportData.donaciones || reportData.donaciones.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando reporte...</p>
            </div>
          ) : reportData && reportData.donaciones && Array.isArray(reportData.donaciones) && reportData.donaciones.length > 0 ? (
            <>
              {/* Statistics */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Donaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.estadisticas?.total_donaciones || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total ML</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(reportData.estadisticas?.total_ml || 0).toLocaleString()} ml</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Promedio por Donación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.estadisticas?.total_donaciones > 0
                        ? Math.round((reportData.estadisticas.total_ml || 0) / reportData.estadisticas.total_donaciones)
                        : 0} ml
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {(tipoSangreData.length > 0 || bancoData.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {tipoSangreData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Donaciones por Tipo de Sangre</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={tipoSangreData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {tipoSangreData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {bancoData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Donaciones por Banco</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={bancoData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalle de Donaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Fecha</th>
                          <th className="text-left p-2">Donante</th>
                          <th className="text-left p-2">Tipo Sangre</th>
                          <th className="text-left p-2">Cantidad (ml)</th>
                          <th className="text-left p-2">Centro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.donaciones.map((donacion: any) => (
                          <tr key={donacion.id} className="border-b">
                            <td className="p-2">
                              {new Date(donacion.fecha_donacion).toLocaleDateString('es-ES')}
                            </td>
                            <td className="p-2">{donacion.donante_nombre || 'N/A'}</td>
                            <td className="p-2">{donacion.donante_tipo_sangre || 'N/A'}</td>
                            <td className="p-2">{donacion.cantidad_ml} ml</td>
                            <td className="p-2">{donacion.centro || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : !loading ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay datos de donaciones para mostrar</p>
              <p className="text-sm text-muted-foreground mt-2">Las donaciones aparecerán aquí una vez que se registren</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default EntidadReportes;
