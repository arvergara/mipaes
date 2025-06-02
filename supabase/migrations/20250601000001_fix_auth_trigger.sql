-- ============================================================================
-- CORRECCIÓN DEL TRIGGER DE CREACIÓN AUTOMÁTICA DE USUARIOS
-- ============================================================================

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Función corregida para insertar perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_metadata JSONB;
BEGIN
    -- Obtener metadata del usuario
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Verificar que tenemos los datos necesarios
    IF user_metadata ? 'nombre' AND 
       user_metadata ? 'apellido_paterno' AND 
       user_metadata ? 'rut' AND
       user_metadata ? 'curso' AND
       user_metadata ? 'colegio' AND
       user_metadata ? 'fecha_nacimiento' AND
       user_metadata ? 'sexo' THEN
       
        -- Insertar perfil de usuario
        INSERT INTO usuarios (
            id,
            nombre,
            apellido_paterno,
            apellido_materno,
            rut,
            curso,
            colegio,
            fecha_nacimiento,
            sexo,
            telefono
        ) VALUES (
            NEW.id,
            user_metadata->>'nombre',
            user_metadata->>'apellido_paterno',
            NULLIF(user_metadata->>'apellido_materno', ''),
            user_metadata->>'rut',
            user_metadata->>'curso',
            user_metadata->>'colegio',
            (user_metadata->>'fecha_nacimiento')::DATE,
            user_metadata->>'sexo',
            NULLIF(user_metadata->>'telefono', '')
        );
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar
        RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- FUNCIÓN PARA CREAR PERFIL MANUALMENTE (si falla el trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    metadata JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Insertar perfil si no existe
    INSERT INTO usuarios (
        id,
        nombre,
        apellido_paterno,
        apellido_materno,
        rut,
        curso,
        colegio,
        fecha_nacimiento,
        sexo,
        telefono
    ) VALUES (
        user_id,
        metadata->>'nombre',
        metadata->>'apellido_paterno',
        NULLIF(metadata->>'apellido_materno', ''),
        metadata->>'rut',
        metadata->>'curso',
        metadata->>'colegio',
        (metadata->>'fecha_nacimiento')::DATE,
        metadata->>'sexo',
        NULLIF(metadata->>'telefono', '')
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in create_user_profile for %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLÍTICA ADICIONAL PARA DEBUGGING
-- ============================================================================

-- Permitir que los usuarios vean si tienen perfil
CREATE OR REPLACE FUNCTION user_has_profile(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM usuarios WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;