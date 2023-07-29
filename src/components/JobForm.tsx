import { useMemo, useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { getJobScriptExamples } from '../services/exampleService';
import { Instance, useInstanceSearch } from '../services/instanceService';
import {
  InstanceType,
  useInstanceTypes,
} from '../services/instanceTypeService';
import { Job } from '../services/jobService';
import CodeEditor from './CodeEditor';
import Tooltip from './utils/Tooltip';

// TODO: refactor
export const FormContainer = styled.form`
  ${tw`w-full flex flex-col gap-4`}

  label {
    ${tw`flex flex-col gap-2 w-full text-xl font-semibold`}
    > * {
      ${tw`text-lg font-normal`}
    }
  }

  input[type='text'],
  input[type='number'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

export function Property({
  name,
  tooltip,
  children,
}: {
  name: string;
  tooltip?: string;
  children?: React.ReactNode;
}) {
  if (!children) {
    return null;
  }
  return (
    <div tw="flex gap-4 w-full">
      <Tooltip content={tooltip}>
        <div tw="font-bold flex-1">{name}</div>
      </Tooltip>
      {children}
    </div>
  );
}

const ExampleButton = styled.div<{ selected?: boolean }>(({ selected }) => [
  tw`inline-block px-4 py-2 bg-white border-2 rounded-xl hover:bg-[#FFF8] hover:border-[#0002]`,
  !selected ? tw`cursor-pointer` : tw`opacity-60`,
]);

export interface JobFormProps {
  initial?: Job;
  onSubmit?(info: Job): void | Promise<void>;
}

export default function JobForm({ initial, onSubmit }: JobFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<
    Job | (Omit<Job, 'instance'> & { instance: undefined })
  >(
    () =>
      initial || {
        name: undefined,
        inputScript: undefined,
        inputUris: [],
        durationSeconds: undefined,
        instance: undefined,
      },
  );
  const instanceTypes = useInstanceTypes();
  const [instanceType, setInstanceType] = useState<InstanceType>();
  const examples = getJobScriptExamples();
  const [customScript, setCustomScript] = useState<string>('');

  const search: Instance = useMemo(
    () => ({
      typeName: instanceType?.name,
    }),
    [instanceType?.name],
  );

  const instances = useInstanceSearch(search);

  const patch = (partialJob: Partial<Job>) => setJob({ ...job, ...partialJob });

  const isValid = !!job.instance;

  return (
    <FormContainer
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting) {
          if (isValid) {
            const promise = onSubmit?.(job);
            if (promise) {
              setSubmitting(true);
              promise.finally(() => setSubmitting(false));
            }
          }
        }
      }}
    >
      <label>
        Job name
        <input
          tw="mb-0 p-2 rounded-lg"
          type="text"
          // placeholder="Optional"
          value={job.name || ''}
          onChange={(e) => patch({ name: e.target.value || undefined })}
        />
      </label>
      <div>
        <label>Instance type</label>
        <div tw="flex flex-col gap-2 mt-2">
          {instanceTypes?.map((type) => (
            <div
              key={type.name}
              tw="flex gap-3 cursor-pointer sm:text-lg"
              onClick={(e) => {
                e.stopPropagation();
                setInstanceType(type);
              }}
            >
              <input
                type="radio"
                checked={instanceType?.name === type.name}
                onChange={() => {}}
              />
              {type.description}
            </div>
          ))}
          {!!instanceTypes ? (
            !instanceTypes?.length && (
              <div tw="opacity-60">(No instance types found)</div>
            )
          ) : (
            <div tw="opacity-60 text-lg">Loading...</div>
          )}
        </div>
        {!!instanceType && (
          <div tw="p-3 mt-3 mb-2 space-y-2 h-[300px] rounded-xl overflow-y-scroll bg-[#0002]">
            {instances?.map((instance, i) => (
              <div
                key={i}
                tw="p-3 rounded-xl bg-white border-[4px] select-none cursor-pointer"
                css={
                  instance.id === job.instance?.id
                    ? tw`border-blue-500`
                    : tw`hover:border-[#0003]`
                }
                onClick={() =>
                  patch({
                    instance:
                      instance.id === job.instance?.id ? undefined : instance,
                  })
                }
              >
                <div tw="text-lg font-bold">{instance.typeName}</div>
                <Property name="Storage (GB)">
                  {instance.availableStorageGbs || 0}
                </Property>
                <Property name="Cost per second (TC/s)">
                  {+(instance.cyclesPerSecond || 0) / 1e12}
                </Property>
                <Property name="Network cost (TC/GB)">
                  {+(instance.cyclesPerNetworkGb || 0) / 1e12}
                </Property>
                <Property name="Output cost (TC/s/GB)">
                  {+(instance.cyclesPerSecondPerOutputGb || 0) / 1e12}
                </Property>
              </div>
            ))}
          </div>
        )}
      </div>
      {!!job.instance && (
        <>
          <label>
            Duration (seconds)
            <input
              tw="mb-0 p-2 rounded-lg"
              type="number"
              min={0}
              step={1}
              placeholder="0"
              value={job.durationSeconds ?? ''}
              onChange={(e) =>
                patch({
                  durationSeconds:
                    +e.target.value > 0 ? +e.target.value : undefined,
                })
              }
            />
          </label>
          <label>
            Workflow URIs
            <div tw="flex flex-col gap-2">
              {[...job.inputUris, ''].map((link, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder="Paste URI here"
                  value={link}
                  onChange={(e) => {
                    const newLink = e.target.value;
                    const newUris = [...job.inputUris];
                    if (newLink) {
                      newUris[i] = newLink;
                    } else {
                      newUris.splice(i, 1);
                    }
                    patch({
                      inputUris: newUris,
                    });
                  }}
                />
              ))}
            </div>
          </label>
          <label>
            Workflow script
            <div tw="[&>*]:(mr-1 mb-1)">
              {examples.map((example, i) => (
                <ExampleButton
                  key={i}
                  selected={job.inputScript === example.script}
                  onClick={() => {
                    // if (job.inputScript !== example.script) {
                    //   setCustomScript(job.inputScript || '');
                    // }
                    patch({ inputScript: example.script });
                  }}
                >
                  {example.name}
                </ExampleButton>
              ))}
              {!!customScript && job.inputScript !== customScript && (
                <ExampleButton
                  onClick={() => {
                    patch({ inputScript: customScript });
                    // setCustomScript(undefined);
                  }}
                >
                  Custom
                </ExampleButton>
              )}
            </div>
            <CodeEditor
              language="bash"
              // placeholder=""
              value={job.inputScript || ''}
              onChange={(value) => {
                patch({ inputScript: value || undefined });
                setCustomScript(value);
              }}
            />
          </label>
        </>
      )}
      {isValid && (
        <button
          tw="mt-5 w-full px-8 py-3 bg-[#fff8] bg-primary text-white hover:(bg-primary opacity-90) font-bold text-xl rounded-xl"
          type="submit"
        >
          {initial ? 'Save Changes' : 'Submit'}
        </button>
      )}
    </FormContainer>
  );
}
