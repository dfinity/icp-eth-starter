import { FaSignOutAlt } from 'react-icons/fa';
import useIdentity, { logout } from '../../services/userService';
import { handlePromise } from '../../utils/handlers';
import LoginArea, { LoginAreaButton } from '../LoginArea';
import WalletArea from '../WalletArea';
import Page from '../utils/Page';
import 'twin.macro';

export default function ProfilePage() {
  const user = useIdentity();

  return (
    <Page>
      {user ? (
        <>
          <div tw="flex flex-col md:flex-row items-center">
            <div tw="flex-1 pb-4 text-xl text-gray-600">
              Signed in with principal:
              <span tw="block text-sm font-bold mt-1">
                {user.client.getIdentity().getPrincipal().toString()}
              </span>
            </div>
            <div tw="flex flex-col items-center mt-3 sm:mt-0">
              <LoginAreaButton
                tw="flex gap-1 items-center text-base px-4"
                onClick={() =>
                  handlePromise(logout(), undefined, 'Error while signing out!')
                }
              >
                <FaSignOutAlt />
                <span tw="font-semibold select-none ml-1">Sign out</span>
              </LoginAreaButton>
            </div>
          </div>
          <hr tw="my-5" />
          <WalletArea />
        </>
      ) : (
        <LoginArea />
      )}
    </Page>
  );
}
