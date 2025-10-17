import { FC } from 'react';
import { useFormStatus } from 'react-dom';

const buttonClasses = 'bg-blue-600 text-white rounded px-3 py-2 font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const SubmitButton: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClasses} disabled={pending}>
      {pending ? 'Loading...' : children}
    </button>
  );
};

export default SubmitButton;