import React from 'react';
import PropTypes from 'prop-types';
import './SerializeCourses.scss';
import messages from '../../src/containers/LearnerDashboardHeader/messages';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

const IMAGE_HEIGHT = 160;
const IMAGE_WIDTH = '100%';

const extractCourseCode = (homeUrl) => {
  if (!homeUrl) return '';
  const match = homeUrl.match(/course-v1:([^/]+)/);
  if (match && match[1]) {
    const parts = match[1].split('+');
    if (parts.length > 1) {
      return parts[1];
    }
  }
  return '';
};

const SerializeCourses = ({ courses, tabNames }) => {
  const { formatMessage } = useIntl();
  const siteNameMessage = formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME });

  const showBorderTop = courses && courses.length > 0 && tabNames && tabNames.length > 1;
  return (
    <div className={`d-flex pt-4 flex-wrap${showBorderTop ? ' border-top' : ''}`}>
      {courses && courses.length > 0 ? (
        courses.map((course, idx) => {
          if (!course || !course.courseName) return null;
          const {
            bannerImgSrc,
            courseName,
            homeUrl,
            shortDescription,
            resumeUrl,
            isStarted,
            isStaff,
          } = course;
          // Log the homeUrl for debugging
          return (
            <div className="new-card-div" key={idx}>
              <div className="card h-100">
              {isStarted || isStaff ? (
                    <a href={resumeUrl || homeUrl} className="course-title-link" rel="noopener noreferrer" style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH}}>
                      <img
                        src={bannerImgSrc}
                        alt="course thumbnail"
                        className="card-img-top"
                        style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                      /> 
                    </a>
                    ) : (
                    <img
                      src={bannerImgSrc}
                      alt="course thumbnail"
                      className="card-img-top"
                      style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                    />
                  )}
                <div className="card-body d-flex flex-column">
                {siteNameMessage === "IIT Kanpur eMasters Degree" && 
                  <p>{extractCourseCode(homeUrl)}</p>
                }
                  {isStarted || isStaff ? (
                    <a href={resumeUrl || homeUrl} className="course-title-link" rel="noopener noreferrer">
                      <h4 className="card-title fw-semibold mb-2">{courseName}</h4>
                    </a>
                  ) : (
                    <h4 className="card-title fw-semibold mb-2">{courseName}</h4>
                  )}
                  {shortDescription && (
                    <p className="card-text">{shortDescription}</p>
                  )}
                  {!isStarted && !isStaff ? (
                    <button
                      className="btn btn-primary mt-auto px-4 py-2 fw-medium comingup"
                      style={{ fontSize: 15 }}
                      disabled
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15"><path fill="white" d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"></path></svg>&nbsp;&nbsp;
                      Coming Up
                    </button>
                  ) : resumeUrl ? (
                    <a
                      href={resumeUrl}
                      rel="noopener noreferrer"
                      className="btn btn-primary mt-auto px-4 py-2 fw-medium"
                      style={{ fontSize: 15 }}
                    >
                      Resume
                    </a>
                  ) : (
                    <a
                      href={homeUrl}
                      rel="noopener noreferrer"
                      className="btn btn-primary mt-auto px-4 py-2 fw-medium"
                      style={{ fontSize: 15 }}
                    >
                      View Course
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div>No courses found.</div>
      )}
    </div>
  );
};

SerializeCourses.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({
    bannerImgSrc: PropTypes.string,
    courseName: PropTypes.string,
    homeUrl: PropTypes.string,
    shortDescription: PropTypes.string,
  })),
};

SerializeCourses.defaultProps = {
  courses: [],
};

export default SerializeCourses; 