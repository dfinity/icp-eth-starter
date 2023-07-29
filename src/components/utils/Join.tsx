export interface JoinProps {
  separator(): React.ReactElement;
  children: (React.ReactElement | false | null)[];
}

export function Join({ separator: between, children }: JoinProps) {
  const results: React.ReactElement[] = [];
  children.forEach((element) => {
    if (element) {
      if (results.length) {
        results.push(between());
      }
      results.push(element);
    }
  });
  return <>{...results}</>;
}
