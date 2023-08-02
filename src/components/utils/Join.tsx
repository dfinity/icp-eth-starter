export interface JoinProps {
  separator(): React.ReactElement;
  children: (React.ReactElement | false | null)[];
}

export function Join({ separator, children }: JoinProps) {
  const results: React.ReactElement[] = [];
  children.forEach((element) => {
    if (element) {
      if (results.length) {
        results.push(separator());
      }
      results.push(element);
    }
  });
  return <>{...results}</>;
}
