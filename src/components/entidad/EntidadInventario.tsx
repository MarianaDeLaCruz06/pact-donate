import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { inventario } from "@/lib/api";
import { Package, Plus, Minus, RefreshCw, Droplets } from "lucide-react";

const EntidadInventario = ({ entidad }: any) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inventarioData, setInventarioData] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [operation, setOperation] = useState<'agregar' | 'despachar' | 'actualizar'>('agregar');
  const [formData, setFormData] = useState({
    cantidad_ml: '',
    cantidad_unidades: '',
  });

  useEffect(() => {
    if (entidad) {
      loadInventario();
    }
  }, [entidad]);

  const loadInventario = async () => {
    setLoading(true);
    try {
      const data = await inventario.getAll();
      setInventarioData(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el inventario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item: any, op: 'agregar' | 'despachar' | 'actualizar') => {
    setSelectedItem(item);
    setOperation(op);
    setFormData({
      cantidad_ml: '',
      cantidad_unidades: '',
    });
    setDialogOpen(true);
  };

  const handleUpdateInventario = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      await inventario.update(selectedItem.id, {
        cantidad_ml: formData.cantidad_ml ? parseInt(formData.cantidad_ml) : undefined,
        cantidad_unidades: formData.cantidad_unidades ? parseInt(formData.cantidad_unidades) : undefined,
        tipo_operacion: operation,
      });

      toast({
        title: "Inventario actualizado",
        description: "El inventario ha sido actualizado correctamente",
      });

      setDialogOpen(false);
      loadInventario();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar inventario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOperationLabel = (op: string): string => {
    switch (op) {
      case 'agregar': return 'Agregar';
      case 'despachar': return 'Despachar';
      case 'actualizar': return 'Actualizar';
      default: return op;
    }
  };

  // Initialize inventory for all blood types if empty
  const initializeInventory = async () => {
    // This would typically be done on the backend, but for now we'll just show a message
    toast({
      title: "Información",
      description: "El inventario se actualiza automáticamente cuando se registran donaciones",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-secondary" />
              Inventario de Sangre
            </CardTitle>
            <Button variant="outline" onClick={loadInventario} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && inventarioData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando inventario...</p>
            </div>
          ) : inventarioData.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay inventario registrado</p>
              <Button onClick={initializeInventory}>
                Inicializar Inventario
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Sangre</TableHead>
                    <TableHead>Cantidad (ml)</TableHead>
                    <TableHead>Unidades</TableHead>
                    <TableHead>Centro</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventarioData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-red-500" />
                          {item.tipo_sangre}
                        </div>
                      </TableCell>
                      <TableCell>{item.cantidad_ml.toLocaleString()} ml</TableCell>
                      <TableCell>
                        <Badge variant={item.cantidad_unidades > 0 ? 'default' : 'secondary'}>
                          {item.cantidad_unidades}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.centro || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(item.fecha_actualizacion).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(item, 'agregar')}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(item, 'despachar')}
                            disabled={item.cantidad_ml === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Cards */}
          {inventarioData.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total ML</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {inventarioData.reduce((sum, item) => sum + (item.cantidad_ml || 0), 0).toLocaleString()} ml
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {inventarioData.reduce((sum, item) => sum + (item.cantidad_unidades || 0), 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tipos Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {inventarioData.filter(item => item.cantidad_ml > 0).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {getOperationLabel(operation)} Inventario - {selectedItem?.tipo_sangre}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Inventario Actual</p>
              <p className="text-lg">{selectedItem?.cantidad_ml.toLocaleString()} ml</p>
              <p className="text-sm text-muted-foreground">{selectedItem?.cantidad_unidades} unidades</p>
            </div>

            <div className="space-y-2">
              <Label>Cantidad (ml) {operation === 'agregar' ? 'a agregar' : operation === 'despachar' ? 'a despachar' : ''}</Label>
              <Input
                type="number"
                value={formData.cantidad_ml}
                onChange={(e) => setFormData({ ...formData, cantidad_ml: e.target.value })}
                placeholder="Cantidad en ml"
              />
            </div>

            <div className="space-y-2">
              <Label>Cantidad de Unidades {operation === 'agregar' ? 'a agregar' : operation === 'despachar' ? 'a despachar' : ''}</Label>
              <Input
                type="number"
                value={formData.cantidad_unidades}
                onChange={(e) => setFormData({ ...formData, cantidad_unidades: e.target.value })}
                placeholder="Número de unidades"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateInventario} disabled={loading}>
                {loading ? "Actualizando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntidadInventario;

