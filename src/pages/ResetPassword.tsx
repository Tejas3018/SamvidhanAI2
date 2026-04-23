 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useToast } from "@/hooks/use-toast";
 import { Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";
 import { Link } from "react-router-dom";
 
 const ResetPassword = () => {
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const navigate = useNavigate();
   const { toast } = useToast();
 
   useEffect(() => {
     // Check if we have access token in URL (from email link)
     const hashParams = new URLSearchParams(window.location.hash.substring(1));
     const accessToken = hashParams.get("access_token");
     const type = hashParams.get("type");
 
     if (!accessToken || type !== "recovery") {
       toast({
         title: "Invalid reset link",
         description: "This password reset link is invalid or has expired.",
         variant: "destructive",
       });
       navigate("/auth");
     }
   }, [navigate, toast]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (password.length < 6) {
       toast({
         title: "Password too short",
         description: "Password must be at least 6 characters.",
         variant: "destructive",
       });
       return;
     }
 
     if (password !== confirmPassword) {
       toast({
         title: "Passwords don't match",
         description: "Please make sure both passwords are the same.",
         variant: "destructive",
       });
       return;
     }
 
     setLoading(true);
 
     try {
       const { error } = await supabase.auth.updateUser({ password });
 
       if (error) {
         toast({
           title: "Reset failed",
           description: error.message,
           variant: "destructive",
         });
       } else {
         setSuccess(true);
         toast({
           title: "Password updated!",
           description: "Your password has been successfully reset.",
         });
         setTimeout(() => navigate("/"), 2000);
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
 
   if (success) {
     return (
       <div className="min-h-screen bg-background mesh-gradient flex items-center justify-center p-6">
         <div className="w-full max-w-md text-center space-y-6">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
             <CheckCircle className="w-10 h-10 text-primary" />
           </div>
           <h2 className="font-display text-2xl font-bold">Password Reset Successful!</h2>
           <p className="text-muted-foreground">Redirecting you to the app...</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background mesh-gradient flex items-center justify-center p-6">
       <div className="w-full max-w-md space-y-8">
         {/* Header */}
         <div className="text-center">
           <Link to="/" className="inline-flex items-center gap-3 mb-6">
             <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
               <span className="text-2xl">📜</span>
             </div>
             <div className="text-left">
               <h1 className="font-display font-bold text-xl">Samvidhan</h1>
               <p className="text-xs text-muted-foreground">Learn the Constitution</p>
             </div>
           </Link>
           <h2 className="font-display text-2xl font-bold text-foreground">
             Set New Password
           </h2>
           <p className="text-muted-foreground mt-2">
             Enter your new password below
           </p>
         </div>
 
         {/* Form Card */}
         <div className="bg-card rounded-3xl shadow-elevated border border-border/50 p-6 lg:p-8">
           <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-2">
               <Label htmlFor="password" className="text-foreground font-medium text-sm">
                 New Password
               </Label>
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
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">
                 Confirm New Password
               </Label>
               <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input
                   id="confirmPassword"
                   type="password"
                   placeholder="••••••••"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="pl-11 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-background transition-all"
                   disabled={loading}
                 />
               </div>
               <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                 Minimum 6 characters required
               </p>
             </div>
 
             <Button
               type="submit"
               className="w-full h-12 text-base font-semibold rounded-xl gradient-hero text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-100"
               disabled={loading}
             >
               {loading ? (
                 <>
                   <Loader2 className="h-5 w-5 animate-spin mr-2" />
                   Updating...
                 </>
               ) : (
                 <>
                   Reset Password
                   <ArrowRight className="h-5 w-5 ml-2" />
                 </>
               )}
             </Button>
           </form>
 
           <p className="text-center text-sm text-muted-foreground mt-6">
             Remember your password?{" "}
             <Link to="/auth" className="text-primary hover:underline font-semibold">
               Sign in
             </Link>
           </p>
         </div>
       </div>
     </div>
   );
 };
 
 export default ResetPassword;