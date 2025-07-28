import { Calendar } from "@/components/ui/calendar";
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
}

interface TaskCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  tasks: Task[];
}

export const TaskCalendar = ({ selectedDate, onDateSelect, tasks }: TaskCalendarProps) => {
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.scheduled_date) return false;
      const taskDate = new Date(task.scheduled_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const hasTasksOnDate = (date: Date) => {
    return getTasksForDate(date).length > 0;
  };

  const getHighPriorityTasksOnDate = (date: Date) => {
    return getTasksForDate(date).filter(task => task.priority === 'high').length;
  };

  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className={cn("p-3 pointer-events-auto")}
        modifiers={{
          hasTasks: (date) => hasTasksOnDate(date),
          highPriority: (date) => getHighPriorityTasksOnDate(date) > 0,
        }}
        modifiersStyles={{
          hasTasks: {
            backgroundColor: 'hsl(var(--accent))',
            fontWeight: 'bold',
          },
          highPriority: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            fontWeight: 'bold',
          },
        }}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-accent"></div>
          <span>Dias com tarefas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Alta prioridade</span>
        </div>
      </div>
    </div>
  );
};