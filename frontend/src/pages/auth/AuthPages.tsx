import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store';
import { useState, useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function LoginPage() {
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const res = await authApi.login(data);
      setAuth(res.data.data!.user, res.data.data!.accessToken, res.data.data!.refreshToken);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const message = axiosErr.response?.data?.error
        || (axiosErr.message === 'Network Error' ? 'Cannot reach server. Is the backend running?' : axiosErr.message)
        || 'Login failed';
      setError(message);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Sign In</Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      const res = await authApi.register({ name: data.name, email: data.email, password: data.password });
      setAuth(res.data.data!.user, res.data.data!.accessToken, res.data.data!.refreshToken);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const message = axiosErr.response?.data?.error
        || (axiosErr.message === 'Network Error' ? 'Cannot reach server. Is the backend running?' : axiosErr.message)
        || 'Registration failed';
      setError(message);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start your productivity journey">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        <Input label="Full Name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Create Account</Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email() })),
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setError('');
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Request failed');
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email to receive a reset link">
      {sent ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">If an account exists, a reset link has been sent to your email.</p>
          <Link to="/login" className="text-primary-600 hover:underline text-sm">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Button type="submit" className="w-full" loading={isSubmitting}>Send Reset Link</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(z.object({
      password: z.string().min(8),
      confirmPassword: z.string(),
    }).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })),
  });

  const onSubmit = async (data: { password: string }) => {
    try {
      setError('');
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Enter your new password">
      {success ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">Password reset successful!</p>
          <Link to="/login" className="text-primary-600 hover:underline text-sm">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
          <Input label="New Password" type="password" {...register('password')} error={errors.password?.message} />
          <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          <Button type="submit" className="w-full" loading={isSubmitting}>Reset Password</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout title="Email Verification" subtitle="">
      {status === 'loading' && <p className="text-center">Verifying your email...</p>}
      {status === 'success' && (
        <div className="text-center">
          <p className="text-green-600 mb-4">Email verified successfully!</p>
          <Link to="/login" className="text-primary-600 hover:underline text-sm">Sign in</Link>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <p className="text-red-600 mb-4">Verification failed or link expired.</p>
          <Link to="/login" className="text-primary-600 hover:underline text-sm">Back to login</Link>
        </div>
      )}
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="card p-8">{children}</div>
      </motion.div>
    </div>
  );
}
