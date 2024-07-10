import { useNavigate, useOutletContext } from 'react-router-dom';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { ArrowLeftIcon, HamburgerIcon } from '@leather.io/ui';

import { SwitchAccountOutletContext } from '@shared/switch-account';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid, HeaderGridRightCol } from '@app/components/layout/headers/header-grid';
import { LogoBox } from '@app/components/layout/headers/logo-box';
import { Settings } from '@app/features/settings/settings';

interface MainHeaderProps {
  hideBackButton?: boolean;
  hideLogo?: boolean;
}

export function MainHeader({ hideBackButton = false, hideLogo = false }: MainHeaderProps) {
  const { isShowingSwitchAccount, setIsShowingSwitchAccount } =
    useOutletContext<SwitchAccountOutletContext>();
  const navigate = useNavigate();
  return (
    <>
      <Header paddingLeft={{ base: undefined, sm: 0 }}>
        <HeaderGrid
          leftCol={
            <>
              {!hideBackButton && (
                <HeaderActionButton
                  icon={<ArrowLeftIcon />}
                  onAction={() => navigate(-1)}
                  dataTestId={SharedComponentsSelectors.HeaderBackBtn}
                />
              )}
              {!hideLogo && <LogoBox />}
            </>
          }
          rightCol={
            <HeaderGridRightCol>
              <Settings
                triggerButton={<HamburgerIcon data-testid={SettingsSelectors.SettingsMenuBtn} />}
                toggleSwitchAccount={() => setIsShowingSwitchAccount(!isShowingSwitchAccount)}
              />
            </HeaderGridRightCol>
          }
        />
      </Header>
    </>
  );
}
