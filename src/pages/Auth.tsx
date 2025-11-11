import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, UserCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'donante' | 'entidad'>('donante');

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register donante state
  const [regDonanteDocumento, setRegDonanteDocumento] = useState("");
  const [regDonanteNombre, setRegDonanteNombre] = useState("");
  const [regDonanteEmail, setRegDonanteEmail] = useState("");
  const [regDonantePassword, setRegDonantePassword] = useState("");
  const [regDonanteConfirm, setRegDonanteConfirm] = useState("");

  // Register entidad state
  const [regEntidadNombre, setRegEntidadNombre] = useState("");
  const [regEntidadEmail, setRegEntidadEmail] = useState("");
  const [regEntidadPassword, setRegEntidadPassword] = useState("");
  const [regEntidadConfirm, setRegEntidadConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await auth.login(loginEmail, loginPassword);
      const user = auth.getUser();
      
      if (user.tipo === 'donante') {
        navigate('/donante');
      } else {
        navigate('/entidad');
      }

      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Verifica tus credenciales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDonante = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regDonanteDocumento || !regDonanteNombre || !regDonanteEmail || !regDonantePassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (regDonantePassword !== regDonanteConfirm) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await auth.register({
        email: regDonanteEmail,
        password: regDonantePassword,
        tipo: 'donante',
        nombre: regDonanteNombre,
        documento: regDonanteDocumento,
      });

      toast({
        title: "Cuenta creada",
        description: "Cuenta creada correctamente. Redirigiendo...",
      });

      // Limpiar formulario
      setRegDonanteDocumento("");
      setRegDonanteNombre("");
      setRegDonanteEmail("");
      setRegDonantePassword("");
      setRegDonanteConfirm("");

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/donante');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEntidad = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regEntidadNombre || !regEntidadEmail || !regEntidadPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (regEntidadPassword !== regEntidadConfirm) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await auth.register({
        email: regEntidadEmail,
        password: regEntidadPassword,
        tipo: 'entidad',
        nombre: regEntidadNombre,
      });

      toast({
        title: "Cuenta creada",
        description: "Cuenta creada correctamente. Redirigiendo...",
      });

      // Limpiar formulario
      setRegEntidadNombre("");
      setRegEntidadEmail("");
      setRegEntidadPassword("");
      setRegEntidadConfirm("");

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/entidad');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-primary mr-2" fill="currentColor" />
            <h1 className="text-4xl font-bold">LifeLink</h1>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Ingresa tus credenciales</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button
                      type="button"
                      variant={userType === 'donante' ? 'default' : 'outline'}
                      onClick={() => setUserType('donante')}
                      className="w-full"
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Donante
                    </Button>
                    <Button
                      type="button"
                      variant={userType === 'entidad' ? 'secondary' : 'outline'}
                      onClick={() => setUserType('entidad')}
                      className="w-full"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Entidad
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Iniciando..." : "Iniciar sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>Selecciona tu tipo de cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="donante" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="donante">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Donante
                    </TabsTrigger>
                    <TabsTrigger value="entidad">
                      <Building2 className="mr-2 h-4 w-4" />
                      Entidad
                    </TabsTrigger>
                  </TabsList>

                  {/* Registro Donante */}
                  <TabsContent value="donante">
                    <form onSubmit={handleRegisterDonante} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-donante-documento">Documento de identidad *</Label>
                        <Input
                          id="reg-donante-documento"
                          value={regDonanteDocumento}
                          onChange={(e) => setRegDonanteDocumento(e.target.value)}
                          required
                          placeholder="Ej: 1234567890"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-donante-nombre">Nombre completo *</Label>
                        <Input
                          id="reg-donante-nombre"
                          value={regDonanteNombre}
                          onChange={(e) => setRegDonanteNombre(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-donante-email">Correo electrónico *</Label>
                        <Input
                          id="reg-donante-email"
                          type="email"
                          value={regDonanteEmail}
                          onChange={(e) => setRegDonanteEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-donante-password">Contraseña *</Label>
                        <Input
                          id="reg-donante-password"
                          type="password"
                          value={regDonantePassword}
                          onChange={(e) => setRegDonantePassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-donante-confirm">Confirmar contraseña *</Label>
                        <Input
                          id="reg-donante-confirm"
                          type="password"
                          value={regDonanteConfirm}
                          onChange={(e) => setRegDonanteConfirm(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Registro Entidad */}
                  <TabsContent value="entidad">
                    <form onSubmit={handleRegisterEntidad} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-entidad-nombre">Nombre de la entidad *</Label>
                        <Input
                          id="reg-entidad-nombre"
                          value={regEntidadNombre}
                          onChange={(e) => setRegEntidadNombre(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-entidad-email">Correo electrónico *</Label>
                        <Input
                          id="reg-entidad-email"
                          type="email"
                          value={regEntidadEmail}
                          onChange={(e) => setRegEntidadEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-entidad-password">Contraseña *</Label>
                        <Input
                          id="reg-entidad-password"
                          type="password"
                          value={regEntidadPassword}
                          onChange={(e) => setRegEntidadPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-entidad-confirm">Confirmar contraseña *</Label>
                        <Input
                          id="reg-entidad-confirm"
                          type="password"
                          value={regEntidadConfirm}
                          onChange={(e) => setRegEntidadConfirm(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
