'use client';

import { FormErrors } from '@/components/form/form-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { KeyboardEventHandler, MutableRefObject } from 'react';
import { useFormStatus } from 'react-dom';

type FormTextareaProps = {
  textareaRef?: MutableRefObject<HTMLTextAreaElement | null>;
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  defaultValue?: string;
  className?: string;
};

export const FormTextarea = ({
  id,
  label,
  placeholder,
  className,
  required,
  disabled,
  errors,
  textareaRef,
  onBlur,
  onClick,
  onKeyDown,
  defaultValue,
}: FormTextareaProps) => {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-2 w-full">
      <div className="space-y-1 w-full">
        {label && (
          <Label
            htmlFor={id}
            className="text-xs font-semibold text-neutral-700"
          >
            {label}
          </Label>
        )}
        <Textarea
          id={id}
          placeholder={placeholder}
          name={id}
          required={required}
          disabled={disabled ?? pending}
          ref={textareaRef}
          onClick={onClick}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          defaultValue={defaultValue}
          className={cn(
            `resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 
            focus:ring-0 outline-none shadow-sm`,
            className
          )}
          aria-describedby={`${id}-error`}
        />
      </div>
      <FormErrors id={id} errors={errors} />
    </div>
  );
};
