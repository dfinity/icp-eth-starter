import Tippy, { TippyProps } from '@tippyjs/react';

export interface TooltipProps extends TippyProps {}

export default function Tooltip({
  content,
  duration,
  hideOnClick,
  children,
  ...rest
}: TooltipProps) {
  if (!content && content !== 0) {
    return children ?? null;
  }
  return (
    <Tippy
      content={content}
      duration={duration ?? 100}
      hideOnClick={hideOnClick ?? true}
      {...rest}
    >
      {children}
    </Tippy>
  );
}
