"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Twitter, Instagram } from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccountPlatform, setNewAccountPlatform] = useState<"twitter" | "instagram">("twitter");

  const handleCreateAccount = () => {
    // In a real app, this would save the account to a database
    setAccounts([
      ...accounts,
      {
        id: Date.now().toString(),
        name: `Mi cuenta de ${newAccountPlatform === "twitter" ? "Twitter" : "Instagram"}`,
        platform: newAccountPlatform,
        createdAt: new Date(),
      },
    ]);
    setShowNewAccount(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cuentas</h2>
          <p className="text-muted-foreground">
            Gestiona tus cuentas de redes sociales para la generación de contenido.
          </p>
        </div>
        <Button onClick={() => setShowNewAccount(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Cuenta
        </Button>
      </div>

      {showNewAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Cuenta</CardTitle>
            <CardDescription>
              Configura una nueva cuenta para la generación de contenido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Select
                value={newAccountPlatform}
                onValueChange={(value) => setNewAccountPlatform(value as "twitter" | "instagram")}
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
              <Label htmlFor="name">Nombre de la Cuenta</Label>
              <Input id="name" placeholder="Mi cuenta de Twitter" />
            </div>

            {newAccountPlatform === "twitter" && (
              <div className="space-y-2">
                <Label htmlFor="reference-tweets">Tweets de Referencia</Label>
                <Textarea
                  id="reference-tweets"
                  placeholder="Pega aquí algunos tweets que representen tu estilo de escritura (uno por línea)"
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  Estos tweets se utilizarán para analizar tu estilo y generar contenido similar.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowNewAccount(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAccount}>Crear Cuenta</Button>
          </CardFooter>
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay cuentas configuradas</CardTitle>
            <CardDescription>
              Crea una cuenta para comenzar a generar contenido personalizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[300px] items-center justify-center">
            <Button onClick={() => setShowNewAccount(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Cuenta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {account.name}
                </CardTitle>
                {account.platform === "twitter" ? (
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Creada el {account.createdAt.toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Gestionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
