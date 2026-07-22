import React from 'react';
import { useWindowSize, breakpoints } from 'ts-paragon';
import track from 'tracking';
import { StrictDict } from 'utils';
import { linkNames } from 'tracking/constants';

import * as module from './hooks';

export const state = StrictDict({
  isOpen: (val) => React.useState(val), // eslint-disable-line
});

export const useIsCollapsed = () => {
  const size = useWindowSize();

  console.log('windowSize:', size);
  console.log('breakpoints:', breakpoints);
  console.log('window.innerWidth:', window.innerWidth);

  const width = size.width ?? window.innerWidth;

  const bodyWidth =
    typeof document !== "undefined" && document.body
      ? Math.min(document.body.clientWidth, width)
      : width;
  console.log('bodyWidth:', bodyWidth);

  const isCollapsed = (bodyWidth <= breakpoints.large.minWidth);

  console.log('collapsed:', isCollapsed);

  return isCollapsed;
};

export const findCoursesNavClicked = (href) => track.findCourses.findCoursesClicked(href, {
  linkName: linkNames.learnerHomeNavExplore,
});

export const findCoursesNavDropdownClicked = (href) => track.findCourses.findCoursesClicked(href, {
  linkName: linkNames.learnerHomeNavDropdownExplore,
});

export const useLearnerDashboardHeaderData = () => {
  const [isOpen, setIsOpen] = module.state.isOpen(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return {
    isOpen,
    toggleIsOpen,
  };
};

export default {
  useIsCollapsed,
  findCoursesNavClicked,
  findCoursesNavDropdownClicked,
  useLearnerDashboardHeaderData,
};
