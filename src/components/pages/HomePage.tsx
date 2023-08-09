import 'twin.macro';
import Page from '../utils/Page';
import { usePublicHistory } from '../../services/historyService';

export default function HomePage() {
  const history = usePublicHistory();

  return (
    <Page tw="space-y-4">
      <div tw="font-semibold text-2xl cursor-default">Hello</div>
      <div tw="sm:(p-4 bg-[#0002]) space-y-3 min-h-[300px] rounded-xl overflow-y-scroll">
        {history
          ?.filter((event) => '' in event)
          .map((event, i) => (
            <div key={i}></div>
          ))}
      </div>
    </Page>
  );
}
