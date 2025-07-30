import { useState, useEffect } from "react";
import { Calendar, Plus, Users, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCalendar } from "@/components/TaskCalendar";
import { TaskList } from "@/components/TaskList";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { UserManagement } from "@/components/UserManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_user_id: string | null;
  scheduled_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  phone: string | null;
  role: string;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          users (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTaskAdded = () => {
    loadTasks();
    setIsTaskDialogOpen(false);
    toast({
      title: "Tarefa criada",
      description: "A tarefa foi adicionada com sucesso!",
    });
  };

  const handleTaskUpdated = () => {
    loadTasks();
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    toast({
      title: "Tarefa atualizada",
      description: "A tarefa foi atualizada com sucesso!",
    });
  };

  const handleOpenAddDialog = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleUserUpdated = () => {
    loadUsers();
    toast({
      title: "Usuários atualizados",
      description: "As alterações foram salvas com sucesso!",
    });
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.scheduled_date) return false;
      // Corrige o problema de fuso horário ao criar a data a partir de uma string YYYY-MM-DD
      // new Date('2023-10-26') é interpretado como UTC, o que pode causar um dia de diferença.
      // new Date('2023/10/26') é interpretado como local.
      const taskDate = new Date(task.scheduled_date.replace(/-/g, "/"));
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getUnscheduledTasks = () => {
    return tasks.filter(task => !task.scheduled_date);
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.completed).length;
  };

  const getTotalTasksCount = () => {
    return tasks.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-secondary">
      {/* Header */}
      <header className="gradient-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-script font-bold text-primary mb-2">
                Moment Mídia
              </h1>
              <p className="text-muted-foreground">
                Agenda de Tarefas
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setShowAddTask(true)}
                variant="elegant"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
              <Button
                onClick={() => setShowUserManagement(true)}
                variant="soft"
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Usuários
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getTotalTasksCount()}</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getCompletedTasksCount()}</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Data</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getUnscheduledTasks().length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card className="gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                tasks={tasks}
              />
            </CardContent>
          </Card>

          {/* Task Lists */}
          <div className="space-y-6">
            {/* Tasks for selected date */}
            {selectedDate && (
              <Card className="gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle>
                    Tarefas para {selectedDate.toLocaleDateString('pt-BR')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList
                    tasks={getTasksForDate(selectedDate)}
                    onToggleComplete={toggleTaskCompletion}
                    onDelete={deleteTask}
                    onEdit={handleOpenEditDialog}
                  />
                </CardContent>
              </Card>
            )}

            {/* Unscheduled tasks */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle>Tarefas sem Data</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={getUnscheduledTasks()}
                  onToggleComplete={toggleTaskCompletion}
                  onDelete={deleteTask}
                  onEdit={handleOpenEditDialog}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        users={users}
        onTaskAdded={handleTaskAdded}
        onTaskUpdated={handleTaskUpdated}
        taskToEdit={editingTask}
      />

      <UserManagement
        open={showUserManagement}
        onOpenChange={setShowUserManagement}
        users={users}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default Index;