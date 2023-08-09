import 'twin.macro';
import useIdentity from '../../services/userService';
import LoginArea from '../LoginArea';
import WalletArea from '../WalletArea';
import Page from '../utils/Page';

export default function SubmitPage() {
  const user = useIdentity();

  return <Page>{user ? <WalletArea /> : <LoginArea />}</Page>;
}
