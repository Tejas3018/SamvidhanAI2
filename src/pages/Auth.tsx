import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
 import { Mail, Lock, ArrowRight, Loader2, Sparkles, BookOpen, Gamepad2, MessageCircle, ChevronLeft, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
 import { lovable } from "@/integrations/lovable";
import { LanguageSelector } from "@/components/learn/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
   const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
   const [googleLoading, setGoogleLoading] = useState(false);
   const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

   const handleForgotPassword = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!email) {
       toast({
         title: "Email required",
         description: "Please enter your email address.",
         variant: "destructive",
       });
       return;
     }
 
     setLoading(true);
 
     try {
       const { error } = await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: `${window.location.origin}/reset-password`,
       });
 
       if (error) {
         toast({
           title: "Error",
           description: error.message,
           variant: "destructive",
         });
       } else {
         setResetEmailSent(true);
         toast({
           title: "Check your email",
           description: "We've sent you a password reset link.",
         });
       }
     } catch (error) {
       toast({
         title: "Error",
         description: "An unexpected error occurred. Please try again.",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const handleGoogleSignIn = async () => {
     setGoogleLoading(true);
     try {
       const { error } = await lovable.auth.signInWithOAuth("google", {
         redirect_uri: window.location.origin,
       });
 
       if (error) {
         toast({
           title: "Google sign-in failed",
           description: error.message,
           variant: "destructive",
         });
       }
     } catch (error) {
       toast({
         title: "Error",
         description: "An unexpected error occurred. Please try again.",
         variant: "destructive",
       });
     } finally {
       setGoogleLoading(false);
     }
   };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Constitution Learning. Start your journey!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background mesh-gradient flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-hero opacity-95" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl">📜</span>
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold">Samvidhan</h1>
                <p className="text-white/80">Learn the Constitution</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight">
                Master India's Constitution<br />through gamified learning
              </h2>
              <p className="text-lg text-white/80 max-w-md">
                Join thousands of students preparing for UPSC, SSC, and other competitive exams.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3 pt-4">
              <FeaturePill icon={<BookOpen className="w-4 h-4" />} text="8 Progressive Learning Levels" />
              <FeaturePill icon={<Gamepad2 className="w-4 h-4" />} text="Interactive Games & Quizzes" />
              <FeaturePill icon={<MessageCircle className="w-4 h-4" />} text="AI-Powered Constitution Assistant" />
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
                <span className="text-2xl">📜</span>
              </div>
              <div className="text-left">
                <h1 className="font-display font-bold text-xl">Samvidhan</h1>
                <p className="text-xs text-muted-foreground">Learn the Constitution</p>
              </div>
            </Link>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center lg:justify-start mb-4">
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
               <span className="text-xs font-medium text-primary">
                 {isForgotPassword ? "Password Recovery" : "Start Learning Today"}
               </span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
               {isForgotPassword 
                 ? "Reset your password" 
                 : isLogin 
                   ? "Welcome back" 
                   : "Create your account"}
            </h2>
            <p className="text-muted-foreground mt-2">
               {isForgotPassword
                 ? "Enter your email and we'll send you a reset link"
                 : isLogin 
                   ? "Sign in to continue your learning journey" 
                   : "Join thousands of learners mastering the Constitution"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-card rounded-3xl shadow-elevated border border-border/50 p-6 lg:p-8">
             {isForgotPassword ? (
               <>
                 {/* Back button */}
                 <button
                   onClick={() => {
                     setIsForgotPassword(false);
                     setResetEmailSent(false);
                   }}
                   className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span className="text-sm font-medium">Back to login</span>
                 </button>
 
                 {resetEmailSent ? (
                   <div className="text-center py-6 space-y-4">
                     <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                       <Mail className="w-8 h-8 text-primary" />
                     </div>
                     <h3 className="font-display text-xl font-semibold">Check your email</h3>
                     <p className="text-muted-foreground text-sm">
                       We've sent a password reset link to<br />
                       <span className="font-medium text-foreground">{email}</span>
                     </p>
                     <Button
                       variant="outline"
                       onClick={() => {
                         setResetEmailSent(false);
                         setEmail("");
                       }}
                       className="mt-4"
                     >
                       Try another email
                     </Button>
                   </div>
                 ) : (
                   <form onSubmit={handleForgotPassword} className="space-y-5">
                     <div className="space-y-2">
                       <Label htmlFor="reset-email" className="text-foreground font-medium text-sm">
                         Email Address
                       </Label>
                       <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                         <Input
                           id="reset-email"
                           type="email"
                           placeholder="you@example.com"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="pl-11 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-background transition-all"
                           disabled={loading}
                         />
                       </div>
                     </div>
 
                     <Button
                       type="submit"
                       className="w-full h-12 text-base font-semibold rounded-xl gradient-hero text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-100"
                       disabled={loading}
                     >
                       {loading ? (
                         <>
                           <Loader2 className="h-5 w-5 animate-spin mr-2" />
                           Sending...
                         </>
                       ) : (
                         <>
                           Send Reset Link
                           <ArrowRight className="h-5 w-5 ml-2" />
                         </>
                       )}
                     </Button>
                   </form>
                 )}
               </>
             ) : (
               <>
                 {/* Toggle Tabs */}
                 <div className="flex bg-muted rounded-xl p-1 mb-6">
                   <button
                     onClick={() => setIsLogin(true)}
                     className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                       isLogin
                         ? "bg-background text-foreground shadow-soft"
                         : "text-muted-foreground hover:text-foreground"
                     }`}
                   >
                     Sign In
                   </button>
                   <button
                     onClick={() => setIsLogin(false)}
                     className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                       !isLogin
                         ? "bg-background text-foreground shadow-soft"
                         : "text-muted-foreground hover:text-foreground"
                     }`}
                   >
                     Sign Up
                   </button>
                 </div>
 
                 {/* Form */}
                 <form onSubmit={handleSubmit} className="space-y-5">
                   <div className="space-y-2">
                     <Label htmlFor="email" className="text-foreground font-medium text-sm">
                       Email Address
                     </Label>
                     <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <Input
                         id="email"
                         type="email"
                         placeholder="you@example.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-11 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-background transition-all"
                         disabled={loading}
                       />
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <Label htmlFor="password" className="text-foreground font-medium text-sm">
                         Password
                       </Label>
                       {isLogin && (
                         <button
                           type="button"
                           onClick={() => setIsForgotPassword(true)}
                           className="text-xs text-primary hover:underline font-medium"
                         >
                           Forgot password?
                         </button>
                       )}
                     </div>
                     <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <Input
                         id="password"
                         type="password"
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="pl-11 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-background transition-all"
                         disabled={loading}
                       />
                     </div>
                     {!isLogin && (
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                         Minimum 6 characters required
                       </p>
                     )}
                   </div>
 
                   <Button
                     type="submit"
                     className="w-full h-12 text-base font-semibold rounded-xl gradient-hero text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-100"
                     disabled={loading}
                   >
                     {loading ? (
                       <>
                         <Loader2 className="h-5 w-5 animate-spin mr-2" />
                         Please wait...
                       </>
                     ) : (
                       <>
                         {isLogin ? "Sign In" : "Create Account"}
                         <ArrowRight className="h-5 w-5 ml-2" />
                       </>
                     )}
                   </Button>
                 </form>
 
                 {/* Divider */}
                 <div className="relative my-6">
                   <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-border"></div>
                   </div>
                   <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                   </div>
                 </div>
 
                 {/* Google Sign In */}
                 <Button
                   type="button"
                   variant="outline"
                   onClick={handleGoogleSignIn}
                   disabled={googleLoading || loading}
                   className="w-full h-12 text-base font-medium rounded-xl border-2 hover:bg-muted transition-all"
                 >
                   {googleLoading ? (
                     <Loader2 className="h-5 w-5 animate-spin mr-2" />
                   ) : (
                     <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                       <path
                         fill="#4285F4"
                         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                       />
                       <path
                         fill="#34A853"
                         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                       />
                       <path
                         fill="#FBBC05"
                         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                       />
                       <path
                         fill="#EA4335"
                         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                       />
                     </svg>
                   )}
                   Continue with Google
                 </Button>
 
                 {/* Footer */}
                 <p className="text-center text-sm text-muted-foreground mt-6">
                   {isLogin ? "Don't have an account? " : "Already have an account? "}
                   <button
                     onClick={() => setIsLogin(!isLogin)}
                     className="text-primary hover:underline font-semibold"
                   >
                     {isLogin ? "Sign up" : "Sign in"}
                   </button>
                 </p>
               </>
             )}
          </div>

          {/* Mobile features */}
          <div className="lg:hidden grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className="text-xl mb-1">📚</div>
              <p className="text-[10px] font-medium text-muted-foreground">8 Levels</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className="text-xl mb-1">🎮</div>
              <p className="text-[10px] font-medium text-muted-foreground">Games</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className="text-xl mb-1">🤖</div>
              <p className="text-[10px] font-medium text-muted-foreground">AI Chat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}

export default Auth;
