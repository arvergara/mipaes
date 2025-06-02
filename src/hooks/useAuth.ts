import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Error al obtener la sesión');
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Verify user data exists in usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error verifying user data:', userError);
          
          // If user profile doesn't exist, try to create it from auth metadata
          if (userError.code === 'PGRST116') { // No rows returned
            console.log('User profile not found, attempting to create...');
            
            const metadata = session.user.user_metadata;
            if (metadata && metadata.nombre && metadata.rut) {
              try {
                const { error: insertError } = await supabase
                  .from('usuarios')
                  .insert({
                    id: session.user.id,
                    nombre: metadata.nombre,
                    apellido_paterno: metadata.apellido_paterno,
                    apellido_materno: metadata.apellido_materno || null,
                    rut: metadata.rut,
                    curso: metadata.curso,
                    colegio: metadata.colegio,
                    fecha_nacimiento: metadata.fecha_nacimiento,
                    sexo: metadata.sexo,
                    telefono: metadata.telefono || null
                  });
                
                if (insertError) {
                  console.error('Error creating user profile:', insertError);
                  toast.error('Error al crear perfil de usuario');
                } else {
                  console.log('User profile created successfully');
                  toast.success('¡Bienvenido! Perfil creado exitosamente');
                }
              } catch (createError) {
                console.error('Exception creating user profile:', createError);
                toast.error('Error al configurar tu cuenta');
              }
            } else {
              toast.error('Datos de usuario incompletos');
            }
          } else {
            toast.error('Error al verificar datos de usuario');
          }
        } else {
          console.log('User profile verified successfully');
        }
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}