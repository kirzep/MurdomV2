// app/components/ui/Spinner.tsx
import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
  );
};

export default Spinner;
