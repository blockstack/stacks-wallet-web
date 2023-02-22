import ExploreAppsPopupDone from '@assets/images/onboarding/steps/explore-apps-light-done-sm.png';
import ExploreAppsFullDone from '@assets/images/onboarding/steps/explore-apps-light-done.png';
import ExploreAppsPopup from '@assets/images/onboarding/steps/explore-apps-light-sm.png';
import ExploreAppsFull from '@assets/images/onboarding/steps/explore-apps-light.png';

import { SuggestedFirstSteps } from '@shared/models/onboarding-types';

import { SuggestedFirstStep } from './suggested-first-step';

interface ExploreAppsStepProps {
  isComplete: boolean;
  onSelectStep(): void;
}
export function ExploreAppsStep({ isComplete, onSelectStep }: ExploreAppsStepProps) {
  return (
    <SuggestedFirstStep
      action="Explore apps"
      body="Try Bitcoin-secured apps for finance, NFTs, blogging and more"
      imageFull={ExploreAppsFull}
      imageFullDone={ExploreAppsFullDone}
      imagePopup={ExploreAppsPopup}
      imagePopupDone={ExploreAppsPopupDone}
      isComplete={isComplete}
      isExternalRoute
      key={SuggestedFirstSteps.ExploreApps}
      onClick={onSelectStep}
      title="Explore apps"
    />
  );
}
