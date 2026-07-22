import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Button } from 'ts-paragon';

import WidgetNavbar from 'containers/WidgetContainers/WidgetNavbar';
import { reduxHooks } from 'hooks';
import { COLLAPSED_NAVBAR } from 'widgets/RecommendationsPaintedDoorBtn/constants';


import messages from '../messages';

export const CollapseMenuBody = ({ isOpen }) => {
  const { formatMessage } = useIntl();

  const { authenticatedUser } = React.useContext(AppContext);

  const dashboard = reduxHooks.useEnterpriseDashboardData();

  return (
    isOpen && (
      <div className="d-flex flex-column shadow-sm nav-small-menu">
        
        <WidgetNavbar placement={COLLAPSED_NAVBAR} />
        {authenticatedUser && (
          <>
            {!!dashboard && (
              <Button as="a" href={dashboard.url} variant="inverse-primary">
                {formatMessage(messages.dashboard)}
              </Button>
            )}
            <Button
              as="a"
              href={`${getConfig().LMS_BASE_URL}/account/`}
              variant="inverse-primary"
            >
              {formatMessage(messages.account)}
            </Button>
            <Button
              as="a"
              href={getConfig().LOGOUT_URL}
              variant="inverse-primary"
            >
              {formatMessage(messages.signOut)}
            </Button>
          </>
        )}
      </div>
    )
  );
};

CollapseMenuBody.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default CollapseMenuBody;
