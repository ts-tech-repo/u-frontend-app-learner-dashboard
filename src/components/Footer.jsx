import React from "react";
import messages from "./footerMessages";
import { useIntl } from "@edx/frontend-platform/i18n";
import { getConfig } from "@edx/frontend-platform";

const Footer = () => {
  const { formatMessage } = useIntl();

    React.useEffect(() => {
    const appendFooterContent = () => {
      if (!document.querySelector(".faq_tag")) {
        const footerElement = document.querySelector(
          "footer.footer .flex-grow-1",
        );
        if (footerElement) {

          const poweredByEdx = document.createElement("a");
          poweredByEdx.className = "edx-tag";
          poweredByEdx.href = "https://open.edx.org";
          poweredByEdx.innerHTML = `
            <img src="https://logos.openedx.org/open-edx-logo-tag.png" alt="Powered by Open edX" width="175">
          `;
          footerElement.appendChild(poweredByEdx);

          if (!document.querySelector("footer.footer p")) {
            const footerNote = document.createElement("p");
            footerNote.textContent = `© ${siteName}. All rights reserved except where noted. edX, Open edX, and their respective logos are registered trademarks of edX Inc.`;
            document.querySelector("footer.footer").appendChild(footerNote);
          }
        }
      }
    };

    const intervalId = setInterval(() => {
      if (
        $("footer.footer .flex-grow-1").length &&
        $("footer.footer .flex-grow-1").is(":empty")
      ) {
        appendFooterContent();
        clearInterval(intervalId);
      }
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer role="contentinfo" className="footer d-flex border-top py-3 px-4">
      <div className="container-fluid d-flex">
        {/* Logo */}
        <a
          className="d-block"
          href={getConfig().LMS_BASE_URL}
          aria-label={formatMessage(messages["footer.logo.ariaLabel"])}
        >
          <img
            style={{ maxHeight: 45 }}
            src={getConfig().LOGO_TRADEMARK_URL}
            alt={formatMessage(messages["footer.logo.altText"])}
          />
        </a>

        <div className="flex-grow-1" style={{justifyContent: "end"}} />
      </div>
    </footer>
  );
};

export default Footer;
