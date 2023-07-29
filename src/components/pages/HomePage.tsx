import 'twin.macro';
import Page from '../utils/Page';

export default function HomePage() {
  return (
    <Page tw="space-y-4">
      <div tw="font-semibold text-2xl cursor-default">Hello</div>
      <div tw="sm:(p-4 bg-[#0002]) space-y-3 min-h-[300px] rounded-xl overflow-y-scroll">
        {/* TODO */}
      </div>
    </Page>
  );
}
