import {
  PropsWithChildren,
  createContext,
  useEffect,
  useContext,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthData = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  profile: any;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  profile: null,
  isAdmin: false,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // console.log("auth session from provider:", session);
      // console.log("logged in user id:", session?.user?.id ?? null);
      setSession(session);

      if (session) {
        // fetch profile
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data || null);
      }
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {

      // check for sessions
      // console.log("auth state change event:", event);
      // console.log("auth state changed session:", session);
      // console.log("auth state changed user id:", session?.user?.id ?? null);
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, loading, profile, isAdmin: profile?.group === "ADMIN" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
