'use client';
import { useAction } from 'next-safe-action/hook';
import { createBoardAction } from '@/actions/board';
import { useRef } from 'react';
import { FormInput } from '@/components/form/form-input';
import { FormSubmit } from '@/components/form/form-submit';

const CreateBoardForm = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const {
    execute: create,
    status,
    result,
  } = useAction(createBoardAction, {
    onSuccess: () => {
      formRef.current?.reset();
    },
  });

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.target as HTMLFormElement);
        create({ title: form.get('title') as string });
      }}
      ref={formRef}
    >
      <FormInput
        id="title"
        label="Board Title"
        placeholder="Enter a board title"
        required
        fieldsError={result.validationError}
      />
      <FormSubmit disabled={status === 'executing'}>Save</FormSubmit>
    </form>
  );
};

export { CreateBoardForm };
