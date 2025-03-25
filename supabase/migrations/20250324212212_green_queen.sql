/*
  # Create users table with personal information

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Links to auth.users
      - `nombre` (text)
      - `apellido_paterno` (text)
      - `apellido_materno` (text)
      - `rut` (text, unique)
      - `curso` (text)
      - `colegio` (text)
      - `fecha_nacimiento` (date)
      - `sexo` (text)
      - `email` (text, unique)
      - `telefono` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for:
      - Users can read and update their own data
      - Admins can read all users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido_paterno text NOT NULL,
  apellido_materno text,
  rut text UNIQUE NOT NULL,
  curso text NOT NULL,
  colegio text NOT NULL,
  fecha_nacimiento date NOT NULL,
  sexo text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraint for valid sexo values
  CONSTRAINT valid_sexo CHECK (sexo IN ('M', 'F', 'O')),

  -- Add constraint for valid RUT format (XX.XXX.XXX-X)
  CONSTRAINT valid_rut CHECK (
    rut ~ '^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$'
  ),

  -- Add constraint for valid email format
  CONSTRAINT valid_email CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),

  -- Add constraint for valid phone format (+56XXXXXXXXX)
  CONSTRAINT valid_telefono CHECK (
    telefono IS NULL OR telefono ~ '^\+56[0-9]{9}$'
  ),

  -- Add constraint for valid birth date (between 1900 and today)
  CONSTRAINT valid_fecha_nacimiento CHECK (
    fecha_nacimiento > '1900-01-01' AND
    fecha_nacimiento <= CURRENT_DATE
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_colegio ON users(colegio);
CREATE INDEX idx_users_curso ON users(curso);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();