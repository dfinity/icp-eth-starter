import { ReactNode } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const TagDiv = styled.div<BadgeProps>((p) => [
  tw`px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap lowercase`,
  { background: p.color || defaultBadgeColor },
]);

export const defaultBadgeColor = '#e1dceb';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  children: ReactNode;
}

export default function Badge({ color, children, ...rest }: BadgeProps) {
  return (
    <TagDiv color={color} {...rest}>
      {children}
    </TagDiv>
  );
}
