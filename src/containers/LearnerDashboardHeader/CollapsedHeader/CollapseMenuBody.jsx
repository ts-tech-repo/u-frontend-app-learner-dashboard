import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, Badge } from 'ts-paragon';
import { useMasqueradeBarData } from '../../MasqueradeBar/hooks';

import WidgetNavbar from 'containers/WidgetContainers/WidgetNavbar';
import urls from 'data/services/lms/urls';
import { reduxHooks } from 'hooks';
import { COLLAPSED_NAVBAR } from 'widgets/RecommendationsPaintedDoorBtn/constants';

import { findCoursesNavDropdownClicked } from '../hooks';
import messages from '../messages';
import { useActiveTab } from '../../../ActiveTabContext';

export const CollapseMenuBody = ({ isOpen }) => {
  const { formatMessage } = useIntl();
  const siteNameMessage = formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME });
  
  const { authenticatedUser } = React.useContext(AppContext);
  const {
    canMasquerade,
  } = useMasqueradeBarData({ authenticatedUser });

  const dashboard = reduxHooks.useEnterpriseDashboardData();
  const { courseSearchUrl } = reduxHooks.usePlatformSettingsData();

  const exploreCoursesClick = findCoursesNavDropdownClicked(urls.baseAppUrl(courseSearchUrl));

  // Get groupedCourses and tabNames
  const groupedCourses = reduxHooks.useGroupedCoursesData();
  const tabNames = reduxHooks.useOrderedCoursesLabel() || [];
  const { activeTab } = useActiveTab();

  // Get the current tab's courseProvider name
  let courseOrgDisName = '';
  if (groupedCourses && tabNames.length > 0) {
    const tabKey = tabNames[activeTab];
    const tabObj = groupedCourses && groupedCourses[tabKey];
    const tabCourses = tabObj && Array.isArray(tabObj.courses) ? tabObj.courses.flat() : [];
    if (tabCourses.length > 0 && tabCourses[0].courseProvider) {
      courseOrgDisName = tabCourses[0].courseProvider.name;
    }
  }

  return (
    isOpen && (
      <div className="d-flex flex-column shadow-sm nav-small-menu">
        {courseOrgDisName && (
          <Button as="a" variant="inverse-primary" className="courseOrgDisName">
              {courseOrgDisName}
            {courseOrgDisName.includes("National AI Olympiad") && "™"}
          </Button>
        )}
        
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
