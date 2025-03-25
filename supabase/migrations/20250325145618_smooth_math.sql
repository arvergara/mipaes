CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  missing_fields text[];
  debug_info jsonb;
BEGIN
  -- Store debug information
  debug_info := jsonb_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'metadata', NEW.raw_user_meta_data
  );

  -- Log debug information
  RAISE NOTICE 'Processing new user: %', debug_info;

  -- Validate required metadata fields
  IF NEW.raw_user_meta_data IS NULL THEN
    RAISE EXCEPTION 'User metadata is required';
  END IF;

  -- Check for required fields
  IF NEW.raw_user_meta_data->>'nombre' IS NULL THEN
    missing_fields := array_append(missing_fields, 'nombre');
  END IF;
  IF NEW.raw_user_meta_data->>'apellido_paterno' IS NULL THEN
    missing_fields := array_append(missing_fields, 'apellido_paterno');
  END IF;
  IF NEW.raw_user_meta_data->>'rut' IS NULL THEN
    missing_fields := array_append(missing_fields, 'rut');
  END IF;
  IF NEW.raw_user_meta_data->>'curso' IS NULL THEN
    missing_fields := array_append(missing_fields, 'curso');
  END IF;
  IF NEW.raw_user_meta_data->>'colegio' IS NULL THEN
    missing_fields := array_append(missing_fields, 'colegio');
  END IF;
  IF NEW.raw_user_meta_data->>'fecha_nacimiento' IS NULL THEN
    missing_fields := array_append(missing_fields, 'fecha_nacimiento');
  END IF;
  IF NEW.raw_user_meta_data->>'sexo' IS NULL THEN
    missing_fields := array_append(missing_fields, 'sexo');
  END IF;

  -- If any required fields are missing, raise an exception
  IF array_length(missing_fields, 1) > 0 THEN
    RAISE EXCEPTION 'Missing required fields: %', array_to_string(missing_fields, ', ');
  END IF;

  -- Validate RUT format
  IF NOT (NEW.raw_user_meta_data->>'rut' ~ '^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$') THEN
    RAISE EXCEPTION 'Invalid RUT format. Must be XX.XXX.XXX-X';
  END IF;

  -- Validate phone format if provided
  IF NEW.raw_user_meta_data->>'telefono' IS NOT NULL AND 
     NOT (NEW.raw_user_meta_data->>'telefono' ~ '^\+56[0-9]{9}$') THEN
    RAISE EXCEPTION 'Invalid phone format. Must be +56XXXXXXXXX';
  END IF;

  -- Validate birth date
  BEGIN
    IF (NEW.raw_user_meta_data->>'fecha_nacimiento')::date <= '1900-01-01' OR
       (NEW.raw_user_meta_data->>'fecha_nacimiento')::date > CURRENT_DATE THEN
      RAISE EXCEPTION 'Invalid birth date';
    END IF;
  EXCEPTION
    WHEN others THEN
      RAISE EXCEPTION 'Invalid birth date format. Must be YYYY-MM-DD';
  END;

  -- Validate sex
  IF NOT (NEW.raw_user_meta_data->>'sexo' = ANY (ARRAY['M', 'F', 'O'])) THEN
    RAISE EXCEPTION 'Invalid sex value. Must be M, F, or O';
  END IF;

  -- Check if RUT already exists
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE rut = NEW.raw_user_meta_data->>'rut'
  ) THEN
    RAISE EXCEPTION 'RUT already exists';
  END IF;

  -- Insert into users table
  BEGIN
    INSERT INTO public.users (
      id,
      email,
      nombre,
      apellido_paterno,
      apellido_materno,
      rut,
      curso,
      colegio,
      fecha_nacimiento,
      sexo,
      telefono
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'nombre',
      NEW.raw_user_meta_data->>'apellido_paterno',
      NEW.raw_user_meta_data->>'apellido_materno',
      NEW.raw_user_meta_data->>'rut',
      NEW.raw_user_meta_data->>'curso',
      NEW.raw_user_meta_data->>'colegio',
      (NEW.raw_user_meta_data->>'fecha_nacimiento')::date,
      NEW.raw_user_meta_data->>'sexo',
      NEW.raw_user_meta_data->>'telefono'
    );

    RAISE NOTICE 'Successfully created user record: %', NEW.id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Duplicate user information: %', SQLERRM;
    WHEN others THEN
      RAISE EXCEPTION 'Error creating user record: %', SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error
    RAISE NOTICE 'Error in handle_new_user: % %', SQLERRM, debug_info;
    
    -- Delete the auth.users record if insertion into public.users fails
    DELETE FROM auth.users WHERE id = NEW.id;
    
    -- Re-raise the exception
    RAISE;
END;
$$;