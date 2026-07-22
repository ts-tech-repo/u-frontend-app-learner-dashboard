import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Button } from "ts-paragon";

import urls from "data/services/lms/urls";
import { reduxHooks } from "hooks";
import { useActiveTab } from "../../../ActiveTabContext";

import AuthenticatedUserDropdown from "./AuthenticatedUserDropdown";
import { useIsCollapsed, findCoursesNavClicked } from "../hooks";
import messages from "../messages";
import BrandLogo from "../BrandLogo";

export const ExpandedHeader = () => {
  const { formatMessage } = useIntl();
  const siteNameMessage = formatMessage(messages["with.site.name"], {
    siteName: getConfig().SITE_NAME,
  });

  const { courseSearchUrl } = reduxHooks.usePlatformSettingsData();
  const isCollapsed = useIsCollapsed();

  const exploreCoursesClick = findCoursesNavClicked(
    urls.baseAppUrl(courseSearchUrl),
  );

  // Get groupedCourses and tabNames
  const groupedCourses = reduxHooks.useGroupedCoursesData();
  const tabNames = reduxHooks.useOrderedCoursesLabel() || [];

  // Use activeTab from context
  const { activeTab } = useActiveTab();

  // Get the current tab's courseProvider name
  let courseOrgDisName = "";
  if (groupedCourses && tabNames.length > 0) {
    const groupedCoursesArr = Object.values(groupedCourses);
    const tabObj = groupedCoursesArr[activeTab];
    const tabCourses =
      tabObj && Array.isArray(tabObj.courses) ? tabObj.courses.flat() : [];
    if (tabCourses.length > 0 && tabCourses[0].courseProvider) {
      courseOrgDisName = tabCourses[0].courseProvider.name;
    }
  }

  return (
    !isCollapsed && (
      <>
        <header className="d-flex shadow-sm align-items-center learner-variant-header pl-4">
          <div className="flex-grow-1 d-flex align-items-center">
            <BrandLogo />

            {/* Show course provider name for active tab */}
            {courseOrgDisName && (
              <div className="courseOrgDisName">
                {courseOrgDisName && (
                  <div className="courseOrgDisName">
                    {courseOrgDisName}
                    {courseOrgDisName.includes("National AI Olympiad") && "™"}
                  </div>
                )}
              </div>
            )}

            <span className="flex-grow-1" />
          </div>

          <AuthenticatedUserDropdown />
        </header>
      </>
    )
  );
};

ExpandedHeader.propTypes = {};

export default ExpandedHeader;
