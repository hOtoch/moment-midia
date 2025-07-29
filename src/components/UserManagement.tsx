import { useState } from "react";
import { Users, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  role: string;
}

interface UserManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onUserUpdated: () => void;
}

interface UserFormData {
  name: string;
  role: string;
}

export const UserManagement = ({ open, onOpenChange, users, onUserUpdated }: UserManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    role: "social_media",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      role: "social_media",
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      role: user.role,
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        role: formData.role,
      };

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: "As informações foram atualizadas com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('users')
          .insert(userData);

        if (error) throw error;

        toast({
          title: "Usuário criado",
          description: "O usuário foi adicionado com sucesso!",
        });
      }

      resetForm();
      onUserUpdated();
    } catch (error) {
      toast({
        title: "Erro ao salvar usuário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: "O usuário foi excluído com sucesso!",
      });

      onUserUpdated();
    } catch (error) {
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Gerente';
      case 'social_media':
        return 'Social Media';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-primary text-primary-foreground';
      case 'social_media':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Usuários
          </DialogTitle>
          <DialogDescription>
            Gerencie os usuários da relojoaria Moment.
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Usuários Cadastrados</h3>
              <Button
                onClick={() => setShowForm(true)}
                variant="elegant"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>

                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário cadastrado</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="elegant"
                className="flex-1"
              >
                {loading ? "Salvando..." : editingUser ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        )}

        {!showForm && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};