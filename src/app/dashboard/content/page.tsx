"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ContentPage() {
  const [platform, setPlatform] = useState<"twitter" | "instagram">("twitter");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate API call to generate content
    setTimeout(() => {
      if (platform === "twitter") {
        setGeneratedContent(
          "¡Descubre cómo la inteligencia artificial está transformando la creación de contenido! 🚀 Nuestras herramientas te permiten mantener tu estilo único mientras ahorras tiempo. #IA #ContenidoDigital"
        );
      } else {
        setGeneratedContent(
          "La revolución de la IA en la creación de contenido ha llegado 🚀\n\nCon nuestras herramientas, puedes mantener tu estilo único mientras ahorras horas de trabajo. La autenticidad se encuentra con la eficiencia.\n\n¿Cómo estás utilizando la IA en tu estrategia de contenido? Cuéntanos en los comentarios 👇\n\n#InteligenciaArtificial #ContenidoDigital #CreadorDeContenido"
        );
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Generación de Contenido</h2>
        <p className="text-muted-foreground">
          Crea contenido personalizado para tus redes sociales basado en tu estilo único.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Crear Contenido</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="space-y-4 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>
                  Configura los parámetros para la generación de contenido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select
                    value={platform}
                    onValueChange={(value) => setPlatform(value as "twitter" | "instagram")}
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Selecciona una plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account">Cuenta</Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Cuenta por defecto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idea">Idea Principal</Label>
                  <Textarea
                    id="idea"
                    placeholder="Escribe la idea principal para tu contenido"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Contexto Adicional (opcional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Proporciona contexto adicional para mejorar la generación"
                    className="min-h-[100px]"
                  />
                </div>

                {platform === "twitter" && (
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Contenido</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Tweet Estándar</SelectItem>
                        <SelectItem value="thread">Hilo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {platform === "instagram" && (
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Contenido</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Post Estándar</SelectItem>
                        <SelectItem value="narrative">Narrativa</SelectItem>
                        <SelectItem value="behindScenes">Behind the Scenes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="length">Longitud</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="length">
                      <SelectValue placeholder="Selecciona una longitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Corto</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="long">Largo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {platform === "instagram" && (
                  <div className="flex items-center space-x-2">
                    <Switch id="include-image" />
                    <Label htmlFor="include-image">Incluir Imagen</Label>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                  {loading ? "Generando..." : "Generar Contenido"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>
                  Vista previa del contenido generado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="rounded-md border p-4">
                    <pre className="whitespace-pre-wrap font-sans">{generatedContent}</pre>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      El contenido generado aparecerá aquí
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {generatedContent && (
                  <>
                    <Button variant="outline">Regenerar</Button>
                    <Button>Copiar</Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Contenido</CardTitle>
              <CardDescription>
                Visualiza y gestiona tu contenido generado anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No hay contenido en el historial
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
