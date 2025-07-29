-- Remove campos de email e telefone
ALTER TABLE public.users
DROP COLUMN email,
DROP COLUMN phone;

-- Remove a restrição UNIQUE do email já que o campo foi removido
-- Atualizar dados de exemplo
UPDATE public.users
SET name = 'Maria Silva - Gerente'
WHERE name = 'Maria Silva';

UPDATE public.users
SET name = 'João Santos - Funcionário'
WHERE name = 'João Santos';

UPDATE public.users
SET name = 'Ana Costa - Funcionária'
WHERE name = 'Ana Costa';
