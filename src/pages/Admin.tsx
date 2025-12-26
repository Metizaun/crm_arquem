import { useState } from "react";
import { useCrmUsers } from "@/hooks/useCrmUsers";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Admin() {
  const { users: crmUsers, loading, updateUserRole } = useCrmUsers();
  const { userRole } = useAuth();

  if (userRole !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline", icon: any }> = {
      ADMIN: { variant: "default", icon: Shield },
      VENDEDOR: { variant: "secondary", icon: UserCheck },
      NENHUM: { variant: "outline", icon: User },
    };

    const config = variants[role] || variants.NENHUM;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Administração
        </h1>
        <p className="text-muted-foreground mt-1">
          Configurações e gerenciamento do sistema
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Usuários do Sistema
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Aprove ou gerencie as permissões dos usuários
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : crmUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário cadastrado
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role Atual</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crmUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "Sem nome"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => 
                            updateUserRole(user.id, value as "VENDEDOR" | "ADMIN" | "NENHUM")
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NENHUM">Nenhum</SelectItem>
                            <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Atalhos de Teclado</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Busca global</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Focar busca</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Novo lead</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">N</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Mover lead (com foco)</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">M</kbd>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
