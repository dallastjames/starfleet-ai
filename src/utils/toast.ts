import { toast } from 'solid-toast';

export function useToast() {
  return {
    success: (message: string, duration: number = 3000) =>
      toast.success(message, {
        duration,
        className: '!bg-secondary !text-white',
      }),
    error: (message: string, duration: number = 5000) =>
      toast.error(message, { duration, className: '!bg-error !text-white' }),
  };
}
