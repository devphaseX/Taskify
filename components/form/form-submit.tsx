'use client';

import { useFormStatus } from 'react-dom';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type FormSubmitProps = {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'primary';
};

export const FormSubmit = ({
  disabled,
  children,
  className,
  variant,
}: FormSubmitProps) => {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={disabled || pending}
      variant={variant}
      type="submit"
      size="sm"
      className={cn(className)}
    >
      {children}
    </Button>
  );
};
