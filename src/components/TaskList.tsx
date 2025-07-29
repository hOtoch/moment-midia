import { CheckCircle2, Circle, Trash2, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-destructive text-destructive-foreground';
    case 'medium':
      return 'bg-primary text-primary-foreground';
    case 'low':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return 'Média';
  }
};

export const TaskList = ({ tasks, onToggleComplete, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className={cn(
          "transition-smooth hover:shadow-soft",
          task.completed && "opacity-60"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => onToggleComplete(task.id, task.completed)}
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {task.description && (
                  <p className={cn(
                    "text-sm text-muted-foreground mt-1",
                    task.completed && "line-through"
                  )}>
                    {task.description}
                  </p>
                )}
                
                {task.users && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{task.users.name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};