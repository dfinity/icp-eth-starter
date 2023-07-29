import { useCallback, useMemo, useState } from 'react';
import {
  FaCaretSquareDown,
  FaCaretSquareRight,
  FaRegTrashAlt,
  FaTrash,
} from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import tw from 'twin.macro';
import { useBreakpoint } from '../hooks/utils/useBreakpoint';
import { useInstanceTypes } from '../services/instanceTypeService';
import {
  JobState,
  JobStatus,
  deleteJob,
  useJobOutput,
} from '../services/jobService';
import { displayCycles } from '../utils/cycles';
import { handlePromise } from '../utils/handlers';
import Badge from './Badge';
import { Property } from './JobForm';
import { css, keyframes } from '@emotion/react';
import Tooltip from './utils/Tooltip';

const statusColors: Record<JobState, string> = {
  Idle: '#e9ddd3',
  Running: '#bcdbef',
  Error: '#e8caf1',
  Done: '#c8ebd7',
};

const ToolbarButton = tw.span`flex items-center gap-2 font-bold px-4 py-2 text-sm rounded-full cursor-pointer select-none border-2 bg-[#fff8] border-gray-300 hover:bg-[rgba(0,0,0,.05)]`;

const refreshAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export interface JobStatusViewProps {
  status: JobStatus;
}

export default function JobStatusView({ status }: JobStatusViewProps) {
  const instanceTypes = useInstanceTypes();
  const breakpoint = useBreakpoint();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [viewingOutput, setViewingOutput] = useState(false);
  const [refreshAnimated, setRefreshAnimated] = useState(false);

  const [outputBytes, fetchOutput] = useJobOutput(status);

  const output = useMemo(
    () =>
      outputBytes instanceof Uint8Array
        ? new TextDecoder().decode(outputBytes)
        : outputBytes,
    [outputBytes],
  );

  // const isSelected = !!selected && status.jobId === selected?.jobId;
  const isMobile = breakpoint === 'xs';

  const getInstanceTypeDescription = (
    typeName: string | undefined,
  ): string | undefined => {
    if (!typeName) {
      return;
    }
    if (isMobile) {
      return typeName;
    }
    return (
      instanceTypes?.find((type) => type.name === typeName)?.description ||
      typeName
    );
  };

  const onDelete = useCallback(() => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    handlePromise(
      deleteJob(status.jobId),
      `Deleting job #${status.jobId}...`,
      'Error while deleting job!',
    );
  }, [confirmingDelete, status.jobId]);

  const onCancelDelete = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  const onToggleOutput = useCallback(() => {
    setViewingOutput(!viewingOutput);
  }, [viewingOutput]);

  const onRefresh = useCallback(() => {
    fetchOutput();
    setRefreshAnimated(true);
  }, [fetchOutput]);

  const onRefreshEnd = useCallback(() => {
    setRefreshAnimated(false);
  }, []);

  return (
    <div
      tw="rounded-xl bg-white border-[4px] [&>*]:p-4 sm:[&>*]:p-5"
      css={
        // isSelected
        // ? tw`border-[#0004]` // tw`border-blue-500`
        /* : */ tw`hover:border-[#0003]`
      }
    >
      <div
        tw="flex items-center" //  select-none cursor-pointer
        // onClick={() => setSelected(isSelected ? undefined : status)}
      >
        <div tw="text-xl flex-1 space-x-2">
          {!!status.job?.name && <span>{status.job.name}</span>}
          {<span tw="opacity-60">#{status.jobId}</span>}
        </div>
        <Badge tw="lowercase" color={statusColors[status.state]}>
          {status.state}
        </Badge>
      </div>
      {
        /* !!isSelected && */ <div tw="py-0 space-y-3">
          {!!status.job && (
            <>
              <Property name="Instance type">
                {getInstanceTypeDescription(status.job.instance.typeName)}
              </Property>
              <Property name="Duration">{status.job?.durationSeconds}</Property>
            </>
          )}
          <Property name="Locked cycles">
            {displayCycles(status.lockedCycles)}
          </Property>
          {/* {!!status.outputUri && (
            <div>
              <a
                href={status.outputUri}
                target="_blank"
                rel="noreferrer"
                tw="text-blue-500 font-bold"
              >
                View output
              </a>
            </div>
          )} */}
        </div>
      }
      <div tw="flex items-center">
        <div tw="flex-1">
          <div tw="flex gap-2">
            <ToolbarButton
              tw="text-red-500 border-red-500"
              onClick={onDelete}
              onMouseOut={onCancelDelete}
            >
              {confirmingDelete ? (
                <>
                  <FaRegTrashAlt />
                  Are you sure?
                </>
              ) : (
                <>
                  <FaTrash />
                  Delete
                </>
              )}
            </ToolbarButton>
            {!!status.outputUri && (
              <ToolbarButton
                tw="text-green-600 border-green-600"
                onClick={onToggleOutput}
              >
                {viewingOutput ? <FaCaretSquareDown /> : <FaCaretSquareRight />}
                Output
              </ToolbarButton>
            )}
            {!!viewingOutput && (
              <Tooltip content="Refresh output">
                <ToolbarButton
                  tw="px-2 text-gray-700 border-gray-600"
                  onClick={onRefresh}
                  onAnimationEnd={onRefreshEnd}
                >
                  <IoMdRefresh
                    tw="text-xl"
                    css={[
                      refreshAnimated &&
                        css`
                          animation: ${refreshAnimation} 0.5s ease-out;
                        `,
                    ]}
                  />
                </ToolbarButton>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      {!!viewingOutput && (
        <div tw="pt-0 space-y-4">
          <a
            href={status.outputUri}
            target="_blank"
            rel="noreferrer"
            tw="text-blue-500 font-bold"
          >
            Open in new tab
          </a>
          <div tw="p-4 mt-0 border-2 rounded-xl max-h-[500px] overflow-auto text-sm sm:text-base">
            <pre>
              {output instanceof Error ? (
                <span tw="text-orange-600">{output.message}</span>
              ) : output === undefined ? (
                <span tw="opacity-60">Loading...</span>
              ) : (
                output
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
