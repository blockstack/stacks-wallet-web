import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  SuggestedFirstSteps,
  SuggestedFirstStepsStatus,
  SuggestedFirstStepStatus,
} from '@shared/models/onboarding-types';

interface OnboardingState {
  hideSteps: boolean;
  hasSkippedFundAccount: boolean;
  stepsStatus: SuggestedFirstStepsStatus;
}

const initialState: OnboardingState = {
  hideSteps: false,
  hasSkippedFundAccount: false,
  stepsStatus: {
    [SuggestedFirstSteps.BackUpSecretKey]: SuggestedFirstStepStatus.Complete,
    [SuggestedFirstSteps.AddFunds]: SuggestedFirstStepStatus.Incomplete,
    [SuggestedFirstSteps.ExploreApps]: SuggestedFirstStepStatus.Incomplete,
    [SuggestedFirstSteps.BuyNft]: SuggestedFirstStepStatus.Incomplete,
  },
};

export const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    hideSuggestedFirstSteps(state, action: PayloadAction<boolean>) {
      state.hideSteps = action.payload;
    },
    userSkippedFundingAccount(state, action: PayloadAction<boolean>) {
      state.hasSkippedFundAccount = action.payload;
    },
    userCompletedSuggestedFirstStep(state, action: PayloadAction<{ step: SuggestedFirstSteps }>) {
      state.stepsStatus[action.payload.step] = SuggestedFirstStepStatus.Complete;
    },
  },
});
