// TODO: Remove this wrapper later it is temprorary.
export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-screen h-screen">{children}</div>;
};
