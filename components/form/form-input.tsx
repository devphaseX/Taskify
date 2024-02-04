'use client';

import { MutableRefObject } from 'react';
import { Label } from '../ui/label';
import { Input } from '@/components/ui/input';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';
import { FormErrors } from './form-error';

type FormInputProps = {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  fieldsError?: Record<string, string[] | undefined>;
  onBlur?: () => void;
};

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  placeholder,
  required,
  disabled,
  defaultValue = '',
  className,
  inputRef,
  fieldsError,
  onBlur,
}) => {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {label ? (
          <Label
            htmlFor={id}
            className="text-xs font-semibold text-neutral-700"
          >
            {label}
          </Label>
        ) : null}
        <Input
          name={id}
          id={id}
          onBlur={onBlur}
          defaultValue={defaultValue}
          ref={inputRef}
          type={type}
          disabled={disabled || pending}
          placeholder={placeholder}
          required={required}
          className={cn('text-sm px-2 py-1 h-7', className)}
          aria-describedby={`${id}-error`}
        />
      </div>
      <FormErrors id={id} errors={fieldsError} />
    </div>
  );
};
