-- Criar tabela de usuários
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'social_media',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela users (todos podem ver e gerenciar usuários)
CREATE POLICY "Anyone can view users" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update users" 
ON public.users 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete users" 
ON public.users 
FOR DELETE 
USING (true);

-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  scheduled_date DATE,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela tasks
CREATE POLICY "Anyone can view tasks" 
ON public.tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tasks" 
ON public.tasks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns usuários exemplo
INSERT INTO public.users (name, email, role) VALUES
('Maria Silva', 'maria@moment.com', 'manager'),
('João Santos', 'joao@moment.com', 'social_media'),
('Ana Costa', 'ana@moment.com', 'social_media');