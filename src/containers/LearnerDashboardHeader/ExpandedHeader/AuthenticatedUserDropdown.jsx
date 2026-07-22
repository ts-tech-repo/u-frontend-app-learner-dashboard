import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { AppContext } from "@edx/frontend-platform/react";
import { AvatarButton, Dropdown, Badge } from "ts-paragon";

import messages from "../messages";

export const AuthenticatedUserDropdown = () => {
  const { authenticatedUser } = React.useContext(AppContext);
  const { formatMessage } = useIntl();

  return (
    <>
      {authenticatedUser && (
        <Dropdown className="user-dropdown pr4">
          <Dropdown.Toggle
            as={AvatarButton}
            src={authenticatedUser.profileImage}
            id="user"
            variant="light"
            className="p-4"
          >
            <span data-hj-suppress className="d-md-inline">
              {authenticatedUser.username}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-right">
            <Dropdown.Item href={getConfig().ACCOUNT_SETTINGS_URL}>
              {formatMessage(messages.account)}
            </Dropdown.Item>
            <Dropdown.Item href={getConfig().LOGOUT_URL}>
              {formatMessage(messages.signOut)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
};

AuthenticatedUserDropdown.propTypes = {};

export default AuthenticatedUserDropdown;
