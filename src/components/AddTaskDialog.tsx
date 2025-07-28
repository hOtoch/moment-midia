import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
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
  email: string;
  phone: string | null;
  role: string;
}

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onTaskAdded: () => void;
}

export const AddTaskDialog = ({ open, onOpenChange, users, onTaskAdded }: AddTaskDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_user_id: "",
    scheduled_date: undefined as Date | undefined,
    priority: "medium" as "low" | "medium" | "high",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const { error } = await supabase.from('tasks').insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        assigned_user_id: formData.assigned_user_id || null,
        scheduled_date: formData.scheduled_date ? formData.scheduled_date.toISOString().split('T')[0] : null,
        priority: formData.priority,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        title: "",
        description: "",
        assigned_user_id: "",
        scheduled_date: undefined,
        priority: "medium",
      });

      onTaskAdded();
    } catch (error: any) {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Tarefa
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova tarefa à agenda da relojoaria.
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
                <SelectItem value="">Nenhum responsável</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
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
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};