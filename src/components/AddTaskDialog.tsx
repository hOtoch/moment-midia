import { useState, useEffect } from "react";
import { CalendarIcon, Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_user_id: string | null;
  scheduled_date: string | null;
  priority: 'low' | 'medium' | 'high';
}

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onTaskAdded: () => void;
  onTaskUpdated: () => void;
  taskToEdit: Task | null;
}

const initialFormData = {
  title: "",
  description: "",
  assigned_user_id: "none",
  scheduled_date: undefined as Date | undefined,
  priority: "medium" as "low" | "medium" | "high",
};

export const AddTaskDialog = ({ open, onOpenChange, users, onTaskAdded, onTaskUpdated, taskToEdit }: AddTaskDialogProps) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!taskToEdit;

  useEffect(() => {
    if (open) {
      if (isEditMode && taskToEdit) {
        setFormData({
          title: taskToEdit.title,
          description: taskToEdit.description || "",
          assigned_user_id: taskToEdit.assigned_user_id || "none",
          // Corrige o problema de fuso horário ao criar a data a partir de uma string YYYY-MM-DD
          scheduled_date: taskToEdit.scheduled_date ? new Date(taskToEdit.scheduled_date.replace(/-/g, "/")) : undefined,
          priority: taskToEdit.priority,
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [open, taskToEdit, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        assigned_user_id: formData.assigned_user_id === "none" ? null : formData.assigned_user_id,
        scheduled_date: formData.scheduled_date ? formData.scheduled_date.toISOString().split('T')[0] : null,
        priority: formData.priority,
      };

      if (isEditMode && taskToEdit) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskToEdit.id);
        if (error) throw error;
        onTaskUpdated();
      } else {
        const { error } = await supabase.from('tasks').insert(taskData);
        if (error) throw error;
        onTaskAdded();
      }
      
      // O formulário será resetado pelo useEffect quando o diálogo for fechado/reaberto.
      
    } catch (error) {
      toast({
        title: isEditMode ? "Erro ao atualizar tarefa" : "Erro ao criar tarefa",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">            
            {isEditMode ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditMode ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os detalhes da tarefa abaixo." : "Adicione uma nova tarefa à agenda da relojoaria."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a tarefa (opcional)..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Responsável</Label>
            <Select
              value={formData.assigned_user_id}
              onValueChange={(value) => setFormData({ ...formData, assigned_user_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum responsável</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({getRoleLabel(user.role)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Agendada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduled_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date ? (
                    format(formData.scheduled_date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data (opcional)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_date}
                  onSelect={(date) => setFormData({ ...formData, scheduled_date: date })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                {formData.scheduled_date && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, scheduled_date: undefined })}
                      className="w-full"
                    >
                      Remover data
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} variant="elegant">
              {loading ? (isEditMode ? "Salvando..." : "Criando...") : (isEditMode ? "Salvar Alterações" : "Criar Tarefa")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};