import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserRole = "NENHUM" | "VENDEDOR" | "ADMIN";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isPendingApproval: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca a role em segundo plano, sem travar a tela
  const fetchUserRoleBackground = async (userId: string) => {
    try {
      // Usa .select direto na tabela (mais robusto que RPC)
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!error && data) {
        console.log("✅ Admin verificado em background:", data.role);
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error("Erro silencioso ao buscar role:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Função de inicialização rápida
    const initAuth = async () => {
      try {
        // 1. Pega a sessão (Login)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // 2. O PULO DO GATO: Libera a tela IMEDIATAMENTE!
          // Não esperamos a role para deixar o usuário entrar.
          setLoading(false);

          // 3. Busca a role depois (em background)
          if (currentSession?.user) {
            fetchUserRoleBackground(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error("Erro no Auth Init:", error);
        if (mounted) setLoading(false); // Garante liberação mesmo com erro
      }
    };

    initAuth();

    // Listener para Login/Logout em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Garante que o loading saia imediatamente ao trocar de estado
        setLoading(false); 

        if (currentSession?.user) {
          // Busca role em background novamente
          fetchUserRoleBackground(currentSession.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Erro ao fazer login", { description: error.message });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectUrl, data: { name } }
    });
    if (error) toast.error("Erro ao criar conta", { description: error.message });
    else toast.success("Conta criada!", { description: "Aguarde aprovação." });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const isPendingApproval = userRole === "NENHUM";

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut, isPendingApproval }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}