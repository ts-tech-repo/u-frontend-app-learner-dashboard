import React from "react";

import { useIntl } from "@edx/frontend-platform/i18n";
import { MenuIcon, Close } from "ts-paragon/icons";
import { IconButton, Icon } from "ts-paragon";

import { useLearnerDashboardHeaderData, useIsCollapsed } from "../hooks";

import CollapseMenuBody from "./CollapseMenuBody";
import BrandLogo from "../BrandLogo";

import messages from "../messages";
import { useActiveTab } from '../../../ActiveTabContext';
import { reduxHooks } from 'hooks';

export const CollapsedHeader = () => {
  const { formatMessage } = useIntl();
  const isCollapsed = useIsCollapsed();
  const { isOpen, toggleIsOpen } = useLearnerDashboardHeaderData();

  // Get groupedCourses and tabNames
  const groupedCourses = reduxHooks.useGroupedCoursesData();
  const tabNames = reduxHooks.useOrderedCoursesLabel() || [];
  const { activeTab } = useActiveTab();

  // Get the current tab's courseProvider name
  let courseDisName = '';
  if (groupedCourses && tabNames.length > 0) {
    const tabKey = tabNames[activeTab];
    const tabObj = groupedCourses && groupedCourses[tabKey];
    const tabCourses = tabObj && Array.isArray(tabObj.courses) ? tabObj.courses.flat() : [];
    if (tabCourses.length > 0 && tabCourses[0].courseProvider) {
      courseDisName = tabCourses[0].course.courseName;
    }
  }

  return (
    isCollapsed && (
      <>
        <header className="d-flex shadow-sm align-items-center learner-variant-header">
          <IconButton
            invertColors
            isActive
            src={isOpen ? Close : MenuIcon}
            iconAs={Icon}
            alt={
              isOpen
                ? formatMessage(messages.collapseMenuOpenAltText)
                : formatMessage(messages.collapseMenuClosedAltText)
            }
            onClick={toggleIsOpen}
            variant="primary"
            className="p-4"
          />
          <BrandLogo />
          {courseDisName && (
              <div className="courseOrgDisName">
                {courseDisName && (
                  <div className="courseOrgDisName">
                    {courseDisName}
                    {courseDisName.includes("National AI Olympiad") && "™"}
                  </div>
                )}
              </div>
            )}
        </header>
        <CollapseMenuBody isOpen={isOpen} />
      </>
    )
  );
};

CollapsedHeader.propTypes = {};

export default CollapsedHeader;
