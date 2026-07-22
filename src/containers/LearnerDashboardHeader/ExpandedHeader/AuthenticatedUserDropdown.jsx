import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { AppContext } from "@edx/frontend-platform/react";
import { Dropdown, AvatarButton } from "ts-paragon";

export const AuthenticatedUserDropdown = () => {
  const { authenticatedUser } = React.useContext(AppContext);

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
              Account
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item href={getConfig().LOGOUT_URL}>
              Sign Out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
};

AuthenticatedUserDropdown.propTypes = {};

export default AuthenticatedUserDropdown;