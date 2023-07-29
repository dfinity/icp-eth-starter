import { FaCircleNotch, FaQuestion } from 'react-icons/fa';
import tw from 'twin.macro';
import { displayCycles, localizeCycles } from '../utils/cycles';
import Tooltip from './utils/Tooltip';

export interface CyclesAmountProps {
  amount: number | string | bigint | undefined;
  loading?: boolean;
  topLabel?: React.ReactNode;
  bottomLabel?: React.ReactNode;
  onClick?: (() => void) | undefined;
}

export default function CyclesAmount({
  amount,
  loading,
  topLabel,
  bottomLabel,
  onClick,
}: CyclesAmountProps) {
  return (
    <Tooltip
      content={
        amount !== undefined ? `${localizeCycles(amount)} cycles` : undefined
      }
    >
      <div
        tw="flex flex-col gap-3 items-center justify-center bg-[#000A] text-white text-3xl w-[200px] h-[200px] rounded-full select-none"
        css={[!!onClick && tw`cursor-pointer`]}
        onClick={onClick}
      >
        {!!topLabel && <span tw="text-2xl opacity-60">{topLabel}</span>}
        {amount === undefined ? (
          loading ? (
            <FaCircleNotch tw="text-4xl animate-spin ease-linear [animation-duration: 2s] opacity-60" />
          ) : (
            <FaQuestion tw="text-4xl opacity-60" />
          )
        ) : (
          displayCycles(amount)
        )}
        {!!bottomLabel && <span tw="text-2xl opacity-60">{bottomLabel}</span>}
      </div>
    </Tooltip>
  );
}
