import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useActiveTab } from '../ActiveTabContext';
import { reduxHooks } from 'hooks';
import { getConfig } from '@edx/frontend-platform';
import SerializeCourses from './SerializeCourses';
import './SerializeTabs.scss';

const MOBILE_BREAKPOINT = 768;

const SerializeTabs = ({ tabNames }) => {
  const { activeTab, setActiveTab } = useActiveTab();
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  console.log('[SerializeTabs] Props: tabNames =', tabNames);
  console.log('[SerializeTabs] ActiveTab =', activeTab, 'IsMobile =', isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      console.log('[SerializeTabs] Window resized, isMobile =', mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const groupedCourses = reduxHooks.useGroupedCoursesData();
  console.log('[SerializeTabs] groupedCourses =', groupedCourses);

  // Get the tab object by index instead of tab name
  const groupedCoursesArr = groupedCourses ? Object.values(groupedCourses) : [];
  const tabObj = groupedCoursesArr[activeTab];
  console.log('[SerializeTabs] tabObj for activeTab', activeTab, '=', tabObj);

  // Flatten the courses array if present
  const tabCourses = tabObj && Array.isArray(tabObj.courses)
    ? tabObj.courses.flat()
    : [];
  console.log('[SerializeTabs] tabCourses =', tabCourses);

  // In your component, update the mapping:
  const lmsBaseUrl = getConfig().LMS_BASE_URL;

  const serializeCoursesData = tabCourses.map(courseObj => {
    const rawResumeUrl = courseObj.courseRun?.resumeUrl;
    const rawbannerImgSrc = courseObj.course.bannerImgSrc;

    const resolveUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('https')) return url;        // already absolute
      return `${lmsBaseUrl}${url}`;                  // prepend LMS base
    };

    return {
      bannerImgSrc: resolveUrl(rawbannerImgSrc),
      courseName: courseObj.course.courseName,
      homeUrl: courseObj.courseRun?.homeUrl || '',
      shortDescription: courseObj.course.shortDescription,
      courseNumber: courseObj.course.courseNumber,
      isStarted: courseObj.courseRun?.isStarted,
      resumeUrl: resolveUrl(rawResumeUrl),           // now absolute
      isStaff: courseObj.enrollment.coursewareAccess?.isStaff,
    };
  });
  console.log('[SerializeTabs] serializeCoursesData =', serializeCoursesData);

  return (
    <div className="grouped-tabs-container">
      {tabNames.length > 1 && (
        isMobile ? (
          <select
            className="form-select mb-2"
            value={activeTab}
            onChange={e => {
              const idx = Number(e.target.value);
              console.log('[SerializeTabs] Select changed, new activeTab =', idx);
              setActiveTab(idx);
            }}
          >
            {tabNames.map((tab, idx) => (
              <option key={tab} value={idx}>{tab}</option>
            ))}
          </select>
        ) : (
          <div className="grouped-tabs mb-2 gap-1">
            {tabNames.map((tab, idx) => (
              <button
                key={tab}
                className={`grouped-tab-btn ${idx === activeTab ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => {
                  console.log('[SerializeTabs] Button clicked, set activeTab =', idx);
                  setActiveTab(idx);
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )
      )}

      {groupedCourses && (
        <SerializeCourses courses={serializeCoursesData} tabNames={tabNames} />
      )}
    </div>
  );
};

SerializeTabs.propTypes = {
  tabNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SerializeTabs; 