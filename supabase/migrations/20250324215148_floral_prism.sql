/*
  # Fix user registration and login

  1. Changes
    - Drop and recreate user creation trigger with better error handling
    - Add validation for required metadata fields
    - Ensure proper error messages for missing data

  2. Security
    - Maintain existing RLS policies
    - Keep all data validations
*/

-- First, drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  missing_fields text[];
BEGIN
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
  IF (NEW.raw_user_meta_data->>'fecha_nacimiento')::date <= '1900-01-01' OR
     (NEW.raw_user_meta_data->>'fecha_nacimiento')::date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Invalid birth date';
  END IF;

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

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Delete the auth.users record if insertion into public.users fails
    DELETE FROM auth.users WHERE id = NEW.id;
    RAISE;
END;
$$ language 'plpgsql';

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add index for better login performance
CREATE INDEX IF NOT EXISTS idx_users_id_email ON users(id, email);