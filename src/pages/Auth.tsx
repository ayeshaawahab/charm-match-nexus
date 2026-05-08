import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Building2, Sparkles } from "lucide-react";

type Role = "brand" | "influencer";

const Auth = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // register
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("brand");
  const [companyName, setCompanyName] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const r = (data.session.user.user_metadata?.role as Role) ?? "brand";
        navigate(r === "influencer" ? "/influencer/dashboard" : "/", { replace: true });
      }
    });
  }, [navigate]);

  const redirectByRole = (r: Role) => {
    navigate(r === "influencer" ? "/influencer/dashboard" : "/", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }
    const r = (data.user?.user_metadata?.role as Role) ?? "brand";
    toast({ title: "Welcome back" });
    redirectByRole(r);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role,
          ...(role === "brand" ? { company_name: companyName } : { social_handle: socialHandle }),
        },
      },
    });
    if (error) {
      setRegisterLoading(false);
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const nowIso = new Date().toISOString();
      try {
        if (role === "influencer") {
          await supabase.from("influencers").insert({
            user_id: userId,
            name: fullName,
            instagram_handle: socialHandle,
            niche: "",
            created_at: nowIso,
          });
        } else {
          await supabase.from("brands").insert({
            user_id: userId,
            name: companyName,
            created_at: nowIso,
          });
        }
        await supabase.from("profiles").insert({
          id: userId,
          email,
          full_name: fullName,
          created_at: nowIso,
        });
      } catch (err) {
        console.error("Profile bootstrap failed", err);
      }
    }
    setRegisterLoading(false);
    if (!data.session) {
      toast({
        title: "Check your email",
        description: "Confirm your email to finish signing up.",
      });
      setTab("login");
      return;
    }
    toast({ title: "Account created" });
    redirectByRole(role);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="tile w-full max-w-md p-7">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            Secure Access
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              MatchEngine
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Sign in or create an account to continue.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full rounded-2xl h-11 bg-muted/60">
            <TabsTrigger value="login" className="rounded-xl">Login</TabsTrigger>
            <TabsTrigger value="register" className="rounded-xl">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="rounded-2xl h-11 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="rounded-2xl h-11 bg-background/60"
                />
              </div>
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-2xl h-11 shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
              >
                {loginLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-5">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input
                  id="full-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-2xl h-11 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl h-11 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl h-11 bg-background/60"
                />
              </div>

              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/60 border border-border/40">
                  {(["brand", "influencer"] as Role[]).map((r) => {
                    const active = role === r;
                    const Icon = r === "brand" ? Building2 : Sparkles;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.45)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {r === "brand" ? "Brand" : "Influencer"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {role === "brand" ? (
                <div className="space-y-2">
                  <Label htmlFor="company">Company name</Label>
                  <Input
                    id="company"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="rounded-2xl h-11 bg-background/60"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="handle">Social handle</Label>
                  <Input
                    id="handle"
                    required
                    placeholder="@yourhandle"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    className="rounded-2xl h-11 bg-background/60"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={registerLoading}
                className="w-full rounded-2xl h-11 shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
              >
                {registerLoading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
