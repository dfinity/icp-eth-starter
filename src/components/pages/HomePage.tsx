import { useCallback } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'twin.macro';
import useInterval from '../../hooks/utils/useInterval';
import { updateJobs, useJobs } from '../../services/jobService';
import JobStatusView from '../JobStatusView';
import Page from '../utils/Page';

export default function HomePage() {
  // const [selected, setSelected] = useState<JobStatus>();
  const navigate = useNavigate();
  const jobs = useJobs();

  const interval = 5000;

  // Refresh job status
  useInterval(
    () => {
      updateJobs();
    },
    interval,
    interval,
  );

  const onSubmitNewJob = useCallback(() => {
    navigate('/submit');
  }, [navigate]);

  return (
    <Page tw="space-y-4">
      <div tw="font-semibold text-2xl cursor-default">Active jobs</div>
      <div tw="sm:(p-4 bg-[#0002]) space-y-3 min-h-[300px] rounded-xl overflow-y-scroll">
        {jobs !== undefined && (
          <>
            {jobs?.map((status, i) => (
              <JobStatusView key={i} status={status} />
            ))}
            <div
              tw="px-5 py-3 rounded-full select-none cursor-pointer border-[4px] sm:border-0 bg-white hover:opacity-80"
              onClick={onSubmitNewJob}
            >
              <div tw="flex items-center text-xl">
                <div tw="flex-1">Submit new job</div>
                <FaPlusCircle />
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
