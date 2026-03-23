import React from 'react';

import SerializeTabs from '../../components/SerializeTabs';
import PropTypes from 'prop-types';

export const CourseList = ({ tabNames }) => {
  return (
    <div className="course-list-container">
      <SerializeTabs tabNames={tabNames} />
    </div>
  );
};

CourseList.propTypes = {
  tabNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CourseList;
