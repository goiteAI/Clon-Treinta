import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const AuthScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      let success = false;
      if (isLoginView) {
        success = await login(email, password);
        if (!success) setError('Email o contraseña incorrectos.');
      } else {
        if (!name) {
             setError('Por favor ingresa tu nombre.');
             setIsLoading(false);
             return;
        }
        success = await signup(name, email, password);
        if (!success) setError('Este correo electrónico ya está en uso.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const switchView = (isLogin: boolean) => {
      setIsLoginView(isLogin);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600">Bienvenido</h1>
            <p className="text-slate-500">Gestiona tu negocio de forma fácil y gratis.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex border-b mb-6">
            <button
              onClick={() => switchView(true)}
              className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${isLoginView ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => switchView(false)}
              className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${!isLoginView ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400'}`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="text-sm font-medium text-slate-600">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-600">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-green-300 flex items-center justify-center"
            >
              {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>}
              {isLoading ? 'Procesando...' : (isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
