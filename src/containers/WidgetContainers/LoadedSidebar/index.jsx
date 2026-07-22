import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { get } from 'data/services/lms/utils';
import './LoadedSidebar.scss';
import AttendanceReport from './AttendanceReport';
import { AppContext } from '@edx/frontend-platform/react';
import CryptoJS from 'crypto-js';
import useMasqueradeBarData from '../../MasqueradeBar/hooks';

let quicklinksCache = {};


export const WidgetSidebar = ({ setSidebarShowing, course_name, course_number, homeUrl }) => {
  const { authenticatedUser } = React.useContext(AppContext);
  const username = authenticatedUser?.username;
  const email = authenticatedUser?.email;

   const { isMasquerading, masqueradeUser } = useMasqueradeBarData({
    authenticatedUser,
  });

  const [quicklinks, setQuicklinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [erroralma, setErroralma] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [needHelpImgLoading, setNeedHelpImgLoading] = useState(false);
  const peerProfileFormRef = useRef(null);
  const [visibleQuicklinks, setVisibleQuicklinks] = useState([]);
  const [docLinks, setDocLinks] = useState([]);

  const MOBILE_BREAKPOINT = 480;
  const [isMobile, setIsMobile] = useState(Math.min(document.body?.clientWidth ?? window.innerWidth, window.innerWidth) < MOBILE_BREAKPOINT);
  const [quicklinksModalOpen, setQuicklinksModalOpen] = useState(false);

   const getHref = (link) => {
    if (!isMasquerading || !masqueradeUser) {
      return link.text;
    }
    const separator = link.text.includes("?") ? "&" : "?";
    return `${link.text}${separator}user=${masqueradeUser}`;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(Math.min(document.body?.clientWidth ?? window.innerWidth, window.innerWidth) < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // google_sync alert on load
  useEffect(() => {

      console.log( 'ALL sessionStorage:', sessionStorage);

      const syncStatus =
          sessionStorage.getItem(
              'google_sync_status'
          );

      console.log(
          'google_sync_status:',
          syncStatus
      );

      if (syncStatus === 'true' || syncStatus === 'false') {

          const toast = document.createElement('div');

          toast.innerText = syncStatus === 'true' ? 'Sessions synced successfully'  : 'Failed to sync sessions';

          toast.style.position = 'fixed';
          toast.style.bottom = '20px';
          toast.style.right = '20px';
          toast.style.background = syncStatus === 'true' ? '#198754'  : '#dc3545';
          toast.style.color = '#fff';
          toast.style.padding = '12px 18px';
          toast.style.borderRadius = '8px';
          toast.style.fontSize = '14px';
          toast.style.fontWeight = '500';
          toast.style.boxShadow =
              '0 4px 12px rgba(0,0,0,0.15)';
          toast.style.zIndex = '999999';

          document.body.appendChild(toast);

          setTimeout(() => {

              toast.remove();

          }, 5000);

          sessionStorage.removeItem(
              'google_sync_status'
          );
      }

  }, []);

  // Extract org from homeUrl
  const extractOrg = (url) => {
    if (url && typeof url === 'string') {
      const match = url.match(/course-v1:([^+]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return '';
  };

  useEffect(() => {
    const org = extractOrg(homeUrl);
    const cacheKey = `${course_number}|${org}`;
    
    if (!course_number || !org) return;
    setLoading(true);
    setError(null);
    setQuicklinks(null);

    if (quicklinksCache[cacheKey]) {
      setQuicklinks(quicklinksCache[cacheKey]);
      setLoading(false);
      return;
    }
    const url = `/api/learner_home/get_quicklinks_details?course_number=${encodeURIComponent(course_number)}&org=${encodeURIComponent(org)}`;
    get(url)
      .then((response) => {
        quicklinksCache[cacheKey] = response.data;
        setQuicklinks(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load quicklinks');
        setLoading(false);
      });
  }, [course_number, homeUrl]);
  
  useEffect(() => {
    if (
      quicklinks &&
      quicklinks.data &&
      Array.isArray(quicklinks.data.quicklinks) &&
      quicklinks.data.quicklinks.length > 0
    ) {
      setVisibleQuicklinks([]);
      quicklinks.data.quicklinks.forEach((_, idx) => {
        setTimeout(() => {
          setVisibleQuicklinks(prev => [...prev, idx]);
        }, idx * 100);
      });
  
      // Check for post-login-popup
      const postLoginLink = quicklinks.data.quicklinks.find(link => link.type === 'post-login-popup');
      if (postLoginLink) {
        const stored = sessionStorage.getItem('postLoginPopupShownAt');
        const now = new Date();
  
        if (!stored || new Date(stored) < now) {
          // Show modal directly (no timeout)
          setModalContent({
            type: postLoginLink.type,
            name: postLoginLink.display_name || postLoginLink.name,
            text: postLoginLink.text || '',
          });
          setModalOpen(true);
  
          // Save 12-hour future timestamp
          const future = new Date();
          future.setHours(future.getHours() + 12);
          sessionStorage.setItem('postLoginPopupShownAt', future.toISOString());
        }
      }
    }
  }, [quicklinks]);  

  const handleLinkClick = (e, link) => {
    if (link.type !== 'new-tab') {
      e.preventDefault();

      // if (link.type === 'calendar') {
      //     window.open(link.text, '_blank', 'noopener,noreferrer');
      //     return;
      // }

       //open iframe modal for calendar type
      if (link.type === 'calendar' || link.type === "UpgradeBatch") {
          setIframeLoading(true);

          setModalContent({
              type: 'iframe',
              text: link.text,
              name: link.display_name || link.name,
          });

          setModalOpen(true);

          return;
      }

      // Special handling for Peer Profile
      if (link.type === 'peerProfile' || link.type === 'peer_profile_updated') {
        // Extract course_id from homeUrl
        let courseId = '';
        if (homeUrl && typeof homeUrl === 'string') {
          const match = homeUrl.match(/course-v1:([^/]+)/);
          if (match && match[1]) {
            courseId = `course-v1:${match[1]}`;
          }
        }
        if (!courseId) {
          setError('Could not extract course ID from homeUrl');
          return;
        }
        setIframeLoading(true);
        setModalContent({ type: link.type, courseId });
        setModalOpen(true);
        return;
      }
      // Special handling for Need Help?
      if (link.type === 'popup') {
        setNeedHelpImgLoading(true);
      } else {
        setNeedHelpImgLoading(false);
      }

      if (['certificate', 'transcript', 'alma'].includes(link.type)) {
        setIframeLoading(true);
        setModalContent({ type: link.type, name: link.display_name || link.name, text: link.text });
        setModalOpen(true);
      
        let endpoint = '';
        let payload = {};
      
        if (link.type === 'certificate') {
          endpoint = '/extras/certificates';
          payload = {
            org: extractOrg(homeUrl),
            cohort_name: course_name,
            username,
          };
        } else if (link.type === 'transcript') {
          endpoint = '/extras/transcripts';
          payload = {
            org: extractOrg(homeUrl),
            cohort_name: course_name,
            username,
          };
        } else if (link.type === 'alma') {
          endpoint = '/extras/almaconnect';
          payload = { email, org: extractOrg(homeUrl) };
        }
      
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken('csrftoken'),
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            if (link.type === 'alma') {
              if (data?.url && data.url.trim() !== '') {
                setModalOpen(false);
                window.open(data.url, "_blank")
              } else {
                setErroralma('Report not found');
              }
            } else {
              setDocLinks(data.filepaths || []);
            }
            setIframeLoading(false);
          })
          .catch(() => {
            setErroralma(`Failed to fetch ${link.type}`);
            setIframeLoading(false);
          });
      
        return;
      }      
            
      if (['attendance', 'gradebook', 'iframe','alma','popupLinks','popupText', 'post-login-popup'].includes(link.type)) {
        setIframeLoading(true);
        setModalContent({
          type: link.type,
          name: link.display_name || link.name,
          text: link.text || '',
        });
        setModalOpen(true);
        return;
      }

      setModalContent(link); // Pass the whole link object
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  useEffect(() => {
    if (modalOpen && modalContent?.type?.startsWith('peer') && peerProfileFormRef.current) {
      peerProfileFormRef.current.submit();
    }
  }, [modalOpen, modalContent]);

  // Your quicklinks list rendering function
  const renderQuicklinksList = () => (
    <div className="quicklinks-list border rounded p-3">
      {quicklinks.data.quicklinks.map((link, idx) =>
        visibleQuicklinks.includes(idx) ? (
          <a
            key={link.id || link.name}
            href={link.text?.length > 0 ? getHref(link) : link.text}
            {...(link.type === "new-tab"
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            {...(isMasquerading ? { "data-user": masqueradeUser } : {})}
            className="quicklink-anchor quicklink-fade-in"
            onClick={
              link.type !== "new-tab"
                ? (e) => handleLinkClick(e, link)
                : undefined
            }
          >
            {/* {link.name} */}
            {link.display_name || link.name}
          </a>
        ) : null,
      )}
    </div>
  );

  // Modal for mobile quicklinks
  const renderQuicklinksModal = () => (
    <div className="loaded-sidebar-modal-overlay" onClick={() => setQuicklinksModalOpen(false)}>
      <div className="loaded-sidebar-modal" onClick={e => e.stopPropagation()}>
        <button className="loaded-sidebar-modal-close" onClick={() => setQuicklinksModalOpen(false)}>&times;</button>
        <div className="loaded-sidebar-modal-content">
          {renderQuicklinksList()}
        </div>
      </div>
    </div>
  );
  function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name + '=')) {
        return decodeURIComponent(trimmed.substring(name.length + 1));
      }
    }
    return '';
  }
  
  return (
    <div className="widget-sidebar">
      {isMobile && quicklinks?.data?.quicklinks.length > 0 && (
        <>
          <button
            className="mobile-quicklinks-btn position-fixed"
            onClick={() => setQuicklinksModalOpen(true)}
            aria-label="Show Quicklinks"
          >
            Quicklinks <i className="triangle-left"></i>
          </button>
          {quicklinksModalOpen && renderQuicklinksModal()}
        </>
      )}
      <div className="d-flex flex-column">
        {loading && (
          <div className="d-flex justify-content-center align-items-center py-3">
            <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
          </div>
        )}
        {error && <div className="text-danger">{error}</div>}
        {!isMobile && quicklinks?.data?.quicklinks.length > 0 && renderQuicklinksList()}
        {modalOpen && (
          <div className="loaded-sidebar-modal-overlay" onClick={closeModal}>
            <div
              className="loaded-sidebar-modal"
              style={modalContent?.type === 'popup' ? { width: 'fit-content' } : {}}
              onClick={e => e.stopPropagation()}
            >
              <button className="loaded-sidebar-modal-close" onClick={closeModal}>&times;</button>
              <div className="loaded-sidebar-modal-content">
                {modalContent?.type === 'popup' ? (
                  <>
                    {needHelpImgLoading && (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                        <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
                      </div>
                    )}
                    <img
                      src={modalContent.text}
                      alt="img"
                      className={`img-fluid mx-auto d-block${needHelpImgLoading ? ' d-none' : ''}`}
                      style={{ maxHeight: '60vh' }}
                      onLoad={() => setNeedHelpImgLoading(false)}
                      onError={() => setNeedHelpImgLoading(false)}
                    />
                  </>
                ) : modalContent && modalContent.type === 'attendance' ? (
                  <>
                    <AttendanceReport
                      course_name={course_name}
                      homeUrl={homeUrl}
                      cohort_name={quicklinks.data.cohort.name}
                      name={modalContent.name}
                      description={modalContent.text}
                    />
                  </>
                ) : modalContent && modalContent.type === 'gradebook' ? (
                  <>
                    {iframeLoading && (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                        <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
                      </div>
                    )}
                    <iframe 
                      src={`/extras/gradebook?site=${encodeURIComponent(extractOrg(homeUrl))}`}
                      className={`w-100 border-0 rounded ${iframeLoading ? 'd-none' : 'd-block'}`}
                      style={{ height: '70vh' }}
                      title="Gradebook"
                      onLoad={() => setIframeLoading(false)}
                      onError={() => {
                        setIframeLoading(false);
                        setError('Failed to load gradebook');
                      }}
                    />
                    {modalContent.text &&
                      modalContent.text
                        .split('|')
                        .map((line, idx) => (
                          <p key={idx} className="small mb-1 fw-bold text-black">
                            {line.trim()}
                          </p>
                        ))}
                  </>
                ) : modalContent?.type === 'iframe' || modalContent?.type === 'post-login-popup' ? (
                  <>
                    {iframeLoading && (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                        <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
                      </div>
                    )}
                    <iframe 
                      src={modalContent.text}
                      className={`w-100 border-0 rounded ${iframeLoading ? 'd-none' : 'd-block'}`}
                      style={{ height: '70vh' }}
                      title="iframe"
                      onLoad={() => setIframeLoading(false)}
                      onError={() => {
                        setIframeLoading(false);
                        setError('Failed to load');
                      }}
                    />
                  </>
                ) : modalContent?.type === 'peerProfile' || modalContent?.type === 'peer_profile_updated' ? (
                  <>
                    {iframeLoading && (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                        <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
                      </div>
                    )}
                    <form
                      ref={peerProfileFormRef}
                      action="/extras/get_peer_profiles"
                      method="POST"
                      target="peerProfileIframe"
                      style={{ display: 'none' }}
                    >
                      <input type="hidden" name="csrfmiddlewaretoken" value={getCSRFToken()} />
                      <input type="hidden" name="course_id" value={modalContent.courseId} />
                    </form>

                    <iframe
                      name="peerProfileIframe"
                      className={`w-100 border-0 rounded ${iframeLoading ? 'd-none' : 'd-block'}`}
                      style={{ height: '70vh' }}
                      title="Peer Profile"
                      onLoad={() => setIframeLoading(false)}
                      onError={() => {
                        setIframeLoading(false);
                        setError('Failed to load peer profile');
                      }}
                    />
                  </>
                  ) : modalContent?.type === 'alma' ? (
                    <>
                        {iframeLoading && (
                          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
                          </div>
                        )}
                        <p className='text-center alma'>{erroralma}</p>
                    </>
                  ) : (modalContent?.type === 'certificate' || modalContent?.type === 'transcript') ? (
                    <>
                      {iframeLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                          <i className="fa-solid fa-spinner fa-spin fa-2x text-primary" aria-label="Loading"></i>
                        </div>
                      ) : (
                        <div className="p-3 certificate-wrapper">
                          <h4 className="text-center mb-3">{modalContent.name}</h4>
                          {docLinks.length > 0 ? (
                            <ul className="text-center">
                              {docLinks.map((path, idx) => {
                                const hash = CryptoJS.MD5(path + 'dingdong').toString();
                                const base = modalContent.type === 'certificate' ? 'certificates' : 'transcripts';
                                const fullUrl = `https://cdn.exec.talentsprint.com/${base}/${hash}/${path}`;
                                return (
                                  <li key={idx}>
                                    <a
                                      href={fullUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline"
                                    >
                                      Link {idx + 1}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-muted text-center">Not found.</p>
                          )}
                        </div>
                      )}
                    </>                  
                 ) : modalContent?.type === 'popupLinks' ? (
                    <section
                      className="popupLinks"
                    >
                      <h4 className="text-black text-center text-lg font-semibold mb-4">
                        {modalContent.name}
                      </h4>
                      <ul>
                        {modalContent.text?.split(',').map((item, index) => {
                          const parts = item.split(':');
                          const url = parts.length > 1 ? parts.slice(1).join(':').trim() : parts[0].trim();
                          const label = parts[0].trim() || `Link ${index + 1}`;
                          return (
                            <li key={index}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                {label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                ) : modalContent?.type === 'popupText' ? (
                    <div className="p-3">
                      <p className="text-center">{modalContent.text}</p>
                    </div>
                  ) : null }
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

WidgetSidebar.propTypes = {
  setSidebarShowing: PropTypes.func.isRequired,
  course_name: PropTypes.string,
  homeUrl: PropTypes.string,
};

export default WidgetSidebar;