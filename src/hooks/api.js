import React from 'react';

import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging'; 
import { getConfig } from '@edx/frontend-platform'; 

import { RequestKeys } from 'data/constants/requests';
import { post } from 'data/services/lms/utils';
import api from 'data/services/lms/api';

import * as reduxHooks from 'data/redux/hooks';
import * as module from './api';
import urls from 'data/services/lms/urls';

const { useMakeNetworkRequest } = reduxHooks;

export const useNetworkRequest = (action, args) => {
  const makeNetworkRequest = useMakeNetworkRequest();
  return (...actionsArgs) => makeNetworkRequest({
    promise: action(...actionsArgs),
    ...args,
  });
};

/**
 * initialize the app, loading ora and course metadata from the api, and loading the initial
 * submission list data.
 */
export const useInitializeApp = () => {
  const loadData = reduxHooks.useLoadData();
  return module.useNetworkRequest(api.initializeList, {
    requestKey: RequestKeys.initialize,
    onSuccess: async ({ data }) => {
      const config = getConfig();
      console.log('[useInitializeApp] config =', config);
      
      const enabled = config.ENABLE_POST_LOGIN_PTC === undefined ? true : config.ENABLE_POST_LOGIN_PTC;

      console.log('[useInitializeApp] postLoginPTC enabled =', enabled);

      if (enabled) {
        try {
          const response = await api.getPostLoginPtc();
          console.log('[useInitializeApp] postLoginPTC =', response);
          const resp_data = response.data;
          if (resp_data.error === false) {
            const data = resp_data.data;
            window.ptcMandatory = data.mandatory;
            window.ptcURL = data.url;
            window.ptcSubmitted = false;
            window.ptcContainerHeight = data.container_height;
            window.ptcContainerWidth = data.container_width;
          }
          else {
            window.ptcMandatory = false;
            window.ptcURL = '';
            window.ptcSubmitted = false;
            window.ptcContainerHeight = 0;
            window.ptcContainerWidth = 0;
          }
        }
        catch (error) {
          logError(error);
        }
      }
      loadData(data);
    },
    onFailure: (error) => {
      logError(error);
    },
  });
};

export const useNewEntitlementEnrollment = (cardId) => {
  const { uuid } = reduxHooks.useCardEntitlementData(cardId);
  const onSuccess = module.useInitializeApp();
  return module.useNetworkRequest(
    (selection) => api.updateEntitlementEnrollment({ uuid, courseId: selection }),
    { onSuccess, requestKey: RequestKeys.newEntitlementEnrollment },
  );
};

export const useSwitchEntitlementEnrollment = (cardId) => {
  const { uuid } = reduxHooks.useCardEntitlementData(cardId);
  const onSuccess = module.useInitializeApp();
  const action = (selection) => api.updateEntitlementEnrollment({ uuid, courseId: selection });
  return module.useNetworkRequest(
    action,
    { onSuccess, requestKey: RequestKeys.switchEntitlementSession },
  );
};

export const useLeaveEntitlementSession = (cardId) => {
  const { uuid, isRefundable } = reduxHooks.useCardEntitlementData(cardId);
  const onSuccess = module.useInitializeApp();
  return module.useNetworkRequest(
    () => api.deleteEntitlementEnrollment({ uuid, isRefundable }),
    { onSuccess, requestKey: RequestKeys.leaveEntitlementSession },
  );
};

export const useUnenrollFromCourse = (cardId) => {
  const { courseId } = reduxHooks.useCardCourseRunData(cardId);
  return module.useNetworkRequest(
    () => api.unenrollFromCourse({ courseId }),
    { requestKey: RequestKeys.unenrollFromCourse },
  );
};

export const useMasqueradeAs = () => {
  const loadData = reduxHooks.useLoadData();
  return module.useNetworkRequest(
    (user) => api.initializeList({ user }),
    { onSuccess: ({ data }) => loadData(data), requestKey: RequestKeys.masquerade },
  );
};

export const useClearMasquerade = () => {
  const clearRequest = reduxHooks.useClearRequest();
  const initializeApp = module.useInitializeApp();
  return () => {
    clearRequest(RequestKeys.masquerade);
    initializeApp();
  };
};

export const useUpdateEmailSettings = (cardId) => {
  const { courseId } = reduxHooks.useCardCourseRunData(cardId);
  return module.useNetworkRequest(
    (enable) => api.updateEmailSettings({ courseId, enable }),
    { requestKey: RequestKeys.updateEmailSettings },
  );
};

export const useSendConfirmEmail = () => {
  const { sendEmailUrl } = reduxHooks.useEmailConfirmationData();
  return () => post(sendEmailUrl);
};

export const useCreateCreditRequest = (cardId) => {
  const { providerId } = reduxHooks.useCardCreditData(cardId);
  const { authenticatedUser: { username } } = React.useContext(AppContext);
  const { courseId } = reduxHooks.useCardCourseRunData(cardId);
  return () => api.createCreditRequest({ providerId, courseId, username });
};
