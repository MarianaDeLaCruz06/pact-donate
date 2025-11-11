import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { busquedaSangre } from "@/lib/api";
import { Search, X, Droplets, MapPin, Building, AlertCircle } from "lucide-react";

const EntidadBusquedaSangre = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tipo_sangre: '',
    ciudad: '',
    departamento: '',
    cantidad_minima: '',
    entidad_id: '',
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    console.log('EntidadBusquedaSangre mounted');
    // Update active filters
    const active: string[] = [];
    if (filters.tipo_sangre) active.push('tipo_sangre');
    if (filters.ciudad) active.push('ciudad');
    if (filters.departamento) active.push('departamento');
    if (filters.cantidad_minima) active.push('cantidad_minima');
    if (filters.entidad_id) active.push('entidad_id');
    setActiveFilters(active);
  }, [filters]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchFilters: any = {};
      if (filters.tipo_sangre) searchFilters.tipo_sangre = filters.tipo_sangre;
      if (filters.ciudad) searchFilters.ciudad = filters.ciudad;
      if (filters.departamento) searchFilters.departamento = filters.departamento;
      if (filters.cantidad_minima) searchFilters.cantidad_minima = parseInt(filters.cantidad_minima);
      if (filters.entidad_id) searchFilters.entidad_id = filters.entidad_id;

      const data = await busquedaSangre.buscar(searchFilters);
      
      if (data && data.resultados) {
        setResultados(Array.isArray(data.resultados) ? data.resultados : []);
        
        if (data.mensaje && data.resultados.length === 0) {
          toast({
            title: "Sin resultados",
            description: data.mensaje,
          });
        }
      } else {
        setResultados([]);
      }
    } catch (error: any) {
      console.error('Error in search:', error);
      setError(error.message || "Error al buscar sangre");
      setResultados([]);
      toast({
        title: "Error",
        description: error.message || "Error al buscar sangre",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const removeFilter = (key: string) => {
    setFilters({ ...filters, [key]: '' });
  };

  const clearAllFilters = () => {
    setFilters({
      tipo_sangre: '',
      ciudad: '',
      departamento: '',
      cantidad_minima: '',
      entidad_id: '',
    });
    setResultados([]);
    setError(null);
  };

  const getFilterLabel = (key: string): string => {
    const labels: any = {
      tipo_sangre: 'Tipo de Sangre',
      ciudad: 'Ciudad',
      departamento: 'Departamento',
      cantidad_minima: 'Cantidad Mínima',
      entidad_id: 'Entidad',
    };
    return labels[key] || key;
  };

  const getFilterValue = (key: string): string => {
    return filters[key as keyof typeof filters] || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-secondary" />
            Búsqueda de Sangre
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Sangre</Label>
                {/* Radix Select requires non-empty values for Select.Item. We use '__ALL__' as a sentinel for the "Todos" option
                    and map it to an empty string when updating filters. */}
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

              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={filters.ciudad}
                  onChange={(e) => handleFilterChange('ciudad', e.target.value)}
                  placeholder="Nombre de la ciudad"
                />
              </div>

              <div className="space-y-2">
                <Label>Departamento</Label>
                <Input
                  value={filters.departamento}
                  onChange={(e) => handleFilterChange('departamento', e.target.value)}
                  placeholder="Nombre del departamento"
                />
              </div>

              <div className="space-y-2">
                <Label>Cantidad Mínima (ml)</Label>
                <Input
                  type="number"
                  value={filters.cantidad_minima}
                  onChange={(e) => handleFilterChange('cantidad_minima', e.target.value)}
                  placeholder="Cantidad mínima requerida"
                />
              </div>

              <div className="space-y-2">
                <Label>Entidad/Banco</Label>
                <Input
                  value={filters.entidad_id}
                  onChange={(e) => handleFilterChange('entidad_id', e.target.value)}
                  placeholder="ID o nombre de entidad"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Buscando..." : "Buscar"}
              </Button>
              <Button variant="outline" onClick={clearAllFilters} disabled={loading}>
                Limpiar Todo
              </Button>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {activeFilters.map((key) => (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {getFilterLabel(key)}: {getFilterValue(key)}
                    <button
                      onClick={() => removeFilter(key)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Buscando...</p>
            </div>
          ) : resultados.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {resultados.length} resultado(s) encontrado(s)
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resultados.map((resultado) => (
                  <Card key={resultado.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Droplets className="h-5 w-5 text-red-500" />
                        {resultado.tipo_sangre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{resultado.entidad_nombre || 'N/A'}</span>
                      </div>
                      {resultado.ciudad && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{resultado.ciudad}{resultado.departamento ? `, ${resultado.departamento}` : ''}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Cantidad disponible:</span>
                          <span className="font-bold text-lg">{(resultado.cantidad_ml || 0).toLocaleString()} ml</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Unidades:</span>
                          <span className="font-semibold">{resultado.cantidad_unidades || 0}</span>
                        </div>
                      </div>
                      {resultado.fecha_actualizacion && (
                        <div className="text-xs text-muted-foreground pt-2">
                          Última actualización: {new Date(resultado.fecha_actualizacion).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : !loading ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {activeFilters.length > 0 
                  ? "No hay unidades disponibles con los criterios especificados"
                  : "Ingrese filtros y haga clic en 'Buscar' para encontrar unidades de sangre disponibles"}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default EntidadBusquedaSangre;
