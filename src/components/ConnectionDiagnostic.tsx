import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'loading';
  message: string;
}

export function ConnectionDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DiagnosticResult[] = [
      { test: 'Variables de entorno', status: 'loading', message: 'Verificando...' },
      { test: 'Conexión a Supabase', status: 'loading', message: 'Probando conexión...' },
      { test: 'Conectividad de red', status: 'loading', message: 'Verificando red...' },
    ];

    setResults([...tests]);

    // Test 1: Environment variables
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        tests[0] = { 
          test: 'Variables de entorno', 
          status: 'error', 
          message: 'Variables de entorno faltantes en Netlify' 
        };
      } else if (!supabaseUrl.includes('supabase.co')) {
        tests[0] = { 
          test: 'Variables de entorno', 
          status: 'error', 
          message: 'URL de Supabase inválida' 
        };
      } else {
        tests[0] = { 
          test: 'Variables de entorno', 
          status: 'success', 
          message: 'Variables configuradas correctamente' 
        };
      }
      setResults([...tests]);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: Supabase connection
      try {
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        
        if (error && error.message.includes('permission denied')) {
          tests[1] = { 
            test: 'Conexión a Supabase', 
            status: 'success', 
            message: 'Conexión exitosa (permisos configurados)' 
          };
        } else if (error) {
          tests[1] = { 
            test: 'Conexión a Supabase', 
            status: 'error', 
            message: `Error de Supabase: ${error.message}` 
          };
        } else {
          tests[1] = { 
            test: 'Conexión a Supabase', 
            status: 'success', 
            message: 'Conexión exitosa' 
          };
        }
      } catch (fetchError: any) {
        tests[1] = { 
          test: 'Conexión a Supabase', 
          status: 'error', 
          message: `Error de red: ${fetchError.message}` 
        };
      }
      setResults([...tests]);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: Network connectivity
      try {
        const response = await fetch('https://httpbin.org/get', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          tests[2] = { 
            test: 'Conectividad de red', 
            status: 'success', 
            message: 'Conexión a internet funcionando' 
          };
        } else {
          tests[2] = { 
            test: 'Conectividad de red', 
            status: 'error', 
            message: 'Problemas de conectividad' 
          };
        }
      } catch (networkError: any) {
        tests[2] = { 
          test: 'Conectividad de red', 
          status: 'error', 
          message: `Sin conexión a internet: ${networkError.message}` 
        };
      }
      setResults([...tests]);

    } catch (error: any) {
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const hasErrors = results.some(r => r.status === 'error');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-semibold">Diagnóstico de Conexión</h3>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
            {getStatusIcon(result.status)}
            <div className="flex-1">
              <div className="font-medium text-gray-900">{result.test}</div>
              <div className={`text-sm ${
                result.status === 'error' ? 'text-red-600' : 
                result.status === 'success' ? 'text-green-600' : 
                'text-gray-600'
              }`}>
                {result.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasErrors && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="font-medium text-red-800 mb-2">Soluciones sugeridas:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            <li>Verifica que las variables de entorno estén configuradas en Netlify</li>
            <li>Revisa que tu conexión a internet esté funcionando</li>
            <li>Intenta refrescar la página y volver a intentar</li>
            <li>Si persiste, contacta al administrador del sistema</li>
          </ul>
        </div>
      )}

      <button
        onClick={runDiagnostics}
        disabled={isRunning}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isRunning ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Ejecutando diagnóstico...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Ejecutar diagnóstico nuevamente
          </>
        )}
      </button>
    </div>
  );
}