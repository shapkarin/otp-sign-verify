'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useConnectWithOtp, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import type { UserProfile as SdkUser } from '@dynamic-labs/types';
import clsx from 'clsx';

import SubmitButton from './submitButton';
import useSWIWE from '@/hooks/useSIWE';

// TODO: move to utilities
const truncateAddress = (address?: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const inputClasses = 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';

// Reusable form input
const FormInput: FC<{ name: string; type: string; placeholder: string; defaultValue?: string; required?: boolean }> = ({
  name,
  type,
  placeholder,
  defaultValue,
  required = false,
}) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    defaultValue={defaultValue}
    className={inputClasses}
    autoComplete={type === 'email' ? 'email' : undefined}
    required={required}
  />
);

// Email step (now with action and useFormStatus)
const EmailStep: FC<{ 
  email?: string; 
  error: string | null;
  action: (formData: FormData) => void;
  // onChangeEmail: () => void;
}> = ({ email, error, action, 
  // onChangeEmail
}) => (
  
  <form action={action} className="flex flex-col gap-4">
    {/* `action={action}` can be replaced with onSubmit={submit(handle, onError)}, getValues and etc */}
    {error && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{error}</div>}
    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
      Enter your email:
    </label>
    <FormInput name="email" type="email" placeholder="Email" defaultValue={email} required />
    <SubmitButton>Submit</SubmitButton>
  </form>
);

// OTP step (similar)
const OtpStep: FC<{ 
  email: string;
  error: string | null;
  action: (formData: FormData) => void;
  onChangeEmail: () => void;
}> = ({ email, error, action, onChangeEmail }) => {
  const { pending } = useFormStatus();
  return (
    <form action={action} className="flex flex-col gap-4">
      {error && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{error}</div>}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Email: <b>{email}</b></span>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-blue-600 underline text-xs hover:text-blue-800 cursor-pointer"
          disabled={pending} // Respect pending
        >
          Change email
        </button>
      </div>
      <FormInput name="otp" type="text" placeholder="OTP" required />
      <SubmitButton>Submit</SubmitButton>
    </form>
  );
};

// User step
const UserStep: FC<{ user: SdkUser; action: (payload: FormData) => void; message: string }> = ({ user, action, message }) => (
  <>
    <ul className="space-y-2 mb-4">
      <li><b>Address:</b> {truncateAddress(user.verifiedCredentials?.[0]?.address)}</li>
      <li><b>Email:</b> {user.email}</li>
    </ul>
      {message ? <form action={action} className="flex flex-col gap-4">
        <label htmlFor="message">Message to sign: </label>
        <textarea
          id="message"
          name="message"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          defaultValue={message}
          rows={13}
        />
        <SubmitButton>
          Test signature
        </SubmitButton>
      </form> : 'generating message to sign'}
    <details className="mb-4" open>
      <summary className="cursor-pointer font-medium text-sm mb-2" aria-label="Toggle authenticated user info">
        Authenticated user info:
      </summary>
      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border border-gray-200 max-h-40 overflow-y-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </details>
  </>
);

const ConnectWithOtpView: FC = () => {
  const { user } = useDynamicContext();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();
  const { message, verrifyMessageAction } = useSWIWE();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');

  // TODO: move to auth flow hooks, add logout
  const resetToEmail = useCallback(() => {
    setStep('email');
    setEmail('');
  }, []);

  const emailAction = useCallback(async (currentState: string | null, formData: FormData): Promise<string | null> => {
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);
    try {
      await connectWithEmail(emailValue);
      setStep('otp');
      return null;
    } catch (err) {
      console.warn(err);
      return 'Failed to send email. Please try again.';
    }
  }, [connectWithEmail]);

  const OtpAction = useCallback(async (currentState: string | null, formData: FormData): Promise<string | null> => {
    const otp = formData.get('otp') as string;
    try {
      await verifyOneTimePassword(otp);
      return null;
    } catch (err) {
      console.warn(err);
      return 'Invalid OTP. Please check and try again.';
    }
  }, [verifyOneTimePassword]);

  // Apply useActionState for each form action, without initial state
  const [emailResult, emailDispatch] = useActionState(emailAction, null);
  const [otpResult, otpDispatch] = useActionState(OtpAction, null);
  const [signAndVerifyResult, signAndVerifyDispatch] = useActionState(verrifyMessageAction, null);

  // Steps
  const stepsConfig = useMemo(() => ({
    email: {
      Component: EmailStep,
      props: {
        email,
        error: emailResult,
        action: emailDispatch,
        onChangeEmail: resetToEmail, // TODO: remove that, by using Component(EmailStep, { props })
      },
    },
    otp: {
      Component: OtpStep,
      props: {
        email,
        error: otpResult,
        action: otpDispatch,
        onChangeEmail: resetToEmail,
      },
    },
  }), [email, emailResult, emailDispatch, otpResult, otpDispatch, resetToEmail]);

  const CurrentStep = stepsConfig[step];

  return (
    <div className={clsx('mt-10 bg-white rounded shadow p-6 space-y-6', !user && '')}>
      {!user ? (
        CurrentStep && <CurrentStep.Component {...CurrentStep.props} />
      ) : (
        <>
          {signAndVerifyResult && <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border border-gray-200 max-h-40 overflow-y-auto max-w-md mx-auto">{signAndVerifyResult}</pre>}
          <UserStep user={user} action={signAndVerifyDispatch} message={message} />
        </>
      )}
    </div>
  );
};

export default ConnectWithOtpView;