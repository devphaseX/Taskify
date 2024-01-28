const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {children}
    </div>
  );
};

export default AuthLayout;
