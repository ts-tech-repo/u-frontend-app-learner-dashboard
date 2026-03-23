import React, { useEffect, useRef } from 'react';

import { reduxHooks } from 'hooks';
import { RequestKeys } from 'data/constants/requests';
import SelectSessionModal from 'containers/SelectSessionModal';
import CoursesPanel from 'containers/CoursesPanel';
import CourseList from 'containers/CourseList';
import DashboardModalSlot from 'plugin-slots/DashboardModalSlot';

import LoadingView from './LoadingView';
import DashboardLayout from './DashboardLayout';
import hooks from './hooks';
import './index.scss';
import { useActiveTab } from '../../ActiveTabContext';

export const Dashboard = () => {
  hooks.useInitializeDashboard();
  const { pageTitle } = hooks.useDashboardMessages();
  const hasCourses = reduxHooks.useHasCourses();
  const initIsPending = reduxHooks.useRequestIsPending(RequestKeys.initialize);
  const showSelectSessionModal = reduxHooks.useShowSelectSessionModal();

  // Get groupedCourses to derive tabNames (now using serialize_courses format)
  const groupedCourses = reduxHooks.useGroupedCoursesData();

  // Get tab names from ordered_courses_label array
  const tabNames = reduxHooks.useOrderedCoursesLabel() || [];

  // Sidebar component with course_name and homeUrl props for the active tab
  const { activeTab, setActiveTab } = useActiveTab();

  // Reset activeTab when tabNames change
  const prevTabNamesRef = useRef([]);
  useEffect(() => {
    if (
      tabNames.length > 0 &&
      JSON.stringify(tabNames) !== JSON.stringify(prevTabNamesRef.current)
    ) {
      setActiveTab(0); // reset to first tab
    }
    prevTabNamesRef.current = tabNames;
  }, [tabNames, setActiveTab]);


  return (
    <div id="dashboard-container" className="d-flex flex-column p-2 pt-0">
      <h1 className="sr-only">{pageTitle}</h1>
      {!initIsPending && (
        <>
          <DashboardModalSlot />
          {(hasCourses && showSelectSessionModal) && <SelectSessionModal />}
        </>
      )}
      <div id="dashboard-content" data-testid="dashboard-content">
        {initIsPending
          ? (<LoadingView />)
          : (
            <DashboardLayout>
              {/* <CoursesPanel /> */}
              <CourseList tabNames={tabNames} />
            </DashboardLayout>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
