-- Cria a função que gerencia novos usuários assinados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  user_name_text TEXT;
BEGIN
  -- Cria uma empresa padrão para o usuário
  INSERT INTO public.companies (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', 'Minha Empresa') || ' Hub',
    REPLACE(LOWER(COALESCE(NEW.raw_user_meta_data->>'name', 'empresa_aleatoria_' || substr(NEW.id::text, 1, 6))), ' ', '-')
  )
  RETURNING id INTO new_company_id;

  -- Pega o nome do json raw_user_meta_data se existir (enviado pelo frontend)
  user_name_text := NEW.raw_user_meta_data->>'name';

  -- Insere o usuário na tabela public.users conectado à empresa recém-criada
  INSERT INTO public.users (id, company_id, email, name, role)
  VALUES (
    NEW.id,
    new_company_id,
    NEW.email,
    user_name_text,
    'admin' -- Define como admin já que foi o criador da empresa
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Aciona a função (gatilho / trigger) toda vez que um usuário for cadastrado em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
