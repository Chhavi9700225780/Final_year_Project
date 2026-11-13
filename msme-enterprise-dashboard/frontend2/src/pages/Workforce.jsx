
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import "./styles/Workforce.css";

const ROLES = ["admin", "manager", "operator", "viewer"];
const INVITABLE_ROLES = ["manager", "operator", "viewer"];

export default function Workforce({ user }) {
  // ======================================================
  // STATE
  // ======================================================

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "viewer",
  });

  const isAdmin = user?.role === "admin";

  // ======================================================
  // LOAD MEMBERS
  // ======================================================

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/settings/team");
      setMembers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load workforce data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================================================
  // LOAD INVITATIONS
  // ======================================================

  const loadInvitations = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setInvitationLoading(true);

      const response = await API.get("/invitations");
      setInvitations(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load invitations."
      );
    } finally {
      setInvitationLoading(false);
    }
  }, [isAdmin]);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (isAdmin) {
      loadInvitations();
    }
  }, [isAdmin, loadInvitations]);

  // ======================================================
  // REFRESH
  // ======================================================

  const refreshWorkforce = () => {
    loadMembers();

    if (isAdmin) {
      loadInvitations();
    }
  };

  // ======================================================
  // SEND INVITATION
  // ======================================================

  const handleInviteChange = (event) => {
    const { name, value } = event.target;

    setInviteForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const sendInvitation = async (event) => {
    event.preventDefault();

    try {
      setSendingInvitation(true);
      setMessage("");
      setError("");

      await API.post("/invitations", {
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim().toLowerCase(),
        role: inviteForm.role,
      });

      setMessage(
        `Invitation sent successfully to ${inviteForm.email.trim()}.`
      );

      setInviteForm({
        name: "",
        email: "",
        role: "viewer",
      });

      await loadInvitations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send invitation. Please try again."
      );
    } finally {
      setSendingInvitation(false);
    }
  };

  // ======================================================
  // CANCEL INVITATION
  // ======================================================

  const cancelInvitation = async (invitationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this invitation?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(invitationId);
      setMessage("");
      setError("");

      await API.delete(`/invitations/${invitationId}`);

      setInvitations((current) =>
        current.map((invitation) =>
          invitation._id === invitationId
            ? { ...invitation, status: "cancelled" }
            : invitation
        )
      );

      setMessage("Invitation cancelled successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not cancel invitation."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ======================================================
  // UPDATE MEMBER ROLE
  // ======================================================

  const updateRole = async (memberId, role) => {
    try {
      setUpdatingId(memberId);
      setMessage("");
      setError("");

      await API.put(`/settings/team/${memberId}/role`, { role });

      setMembers((current) =>
        current.map((member) =>
          member._id === memberId
            ? { ...member, role }
            : member
        )
      );

      setMessage("Member role updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update member role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // ACTIVATE / DEACTIVATE MEMBER
  // ======================================================

  const toggleStatus = async (member) => {
    const nextStatus = !member.isActive;

    try {
      setUpdatingId(member._id);
      setMessage("");
      setError("");

      await API.put(`/settings/team/${member._id}/status`, {
        isActive: nextStatus,
      });

      setMembers((current) =>
        current.map((item) =>
          item._id === member._id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      setMessage(
        nextStatus ? "Member activated." : "Member deactivated."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update member status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // FILTER MEMBERS
  // ======================================================

  const filteredMembers = members.filter((member) => {
    const query = search.toLowerCase();

    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.role?.toLowerCase().includes(query)
    );
  });

  // ======================================================
  // STATISTICS
  // ======================================================

  const activeCount = members.filter(
    (member) => member.isActive
  ).length;

  const inactiveCount = members.length - activeCount;

  const adminCount = members.filter(
    (member) => member.role === "admin"
  ).length;

  const pendingInvitations = invitations.filter(
    (invitation) =>
      invitation.status === "pending" &&
      new Date(invitation.expiresAt) > new Date()
  );

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="workforce-page">

      {/* PAGE HEADER */}

      <div className="workforce-heading">
        <div>
          <div className="workforce-eyebrow">
            MSME / ORGANIZATION / PERSONNEL
          </div>

          <h1>WORKFORCE MANAGEMENT</h1>

          <p>
            Manage company members, access roles and account status.
          </p>
        </div>

        <button
          className="workforce-refresh"
          onClick={refreshWorkforce}
          disabled={loading || invitationLoading}
        >
          ↻ REFRESH
        </button>
      </div>

      {/* STATISTICS */}

      <div className="workforce-stats">
        <div className="workforce-stat">
          <span>TOTAL MEMBERS</span>
          <strong>{members.length}</strong>
        </div>

        <div className="workforce-stat">
          <span>ACTIVE MEMBERS</span>
          <strong className="wf-green">{activeCount}</strong>
        </div>

        <div className="workforce-stat">
          <span>INACTIVE MEMBERS</span>
          <strong className="wf-red">{inactiveCount}</strong>
        </div>

        <div className="workforce-stat">
          <span>ADMINISTRATORS</span>
          <strong className="wf-amber">{adminCount}</strong>
        </div>
      </div>

      {/* NOTIFICATIONS */}

      {message && (
        <div className="workforce-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="workforce-message error">
          {error}
        </div>
      )}

      {/* INVITATION MANAGEMENT - ADMIN ONLY */}

      {isAdmin && (
        <>
          <section className="workforce-panel wf-invite-panel">

            <div className="workforce-panel-header">
              <div>
                <h2>INVITE TEAM MEMBER</h2>
                <span>
                  ORGANIZATION ACCESS · EMAIL INVITATION
                </span>
              </div>

              <span className="workforce-live">
                <i /> ADMIN ACCESS
              </span>
            </div>

            <form
              className="wf-invite-form"
              onSubmit={sendInvitation}
            >
              <div className="wf-invite-field">
                <label htmlFor="invite-name">FULL NAME</label>

                <input
                  id="invite-name"
                  type="text"
                  name="name"
                  placeholder="Enter member name"
                  value={inviteForm.name}
                  onChange={handleInviteChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="wf-invite-field">
                <label htmlFor="invite-email">EMAIL ADDRESS</label>

                <input
                  id="invite-email"
                  type="email"
                  name="email"
                  placeholder="member@company.com"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                  required
                />
              </div>

              <div className="wf-invite-field">
                <label htmlFor="invite-role">ACCESS ROLE</label>

                <select
                  id="invite-role"
                  name="role"
                  value={inviteForm.role}
                  onChange={handleInviteChange}
                >
                  {INVITABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="wf-send-invite"
                disabled={sendingInvitation}
              >
                {sendingInvitation
                  ? "SENDING..."
                  : "SEND INVITATION →"}
              </button>
            </form>
          </section>

          {/* PENDING INVITATIONS */}

          <section className="workforce-panel">

            <div className="workforce-panel-header">
              <div>
                <h2>TEAM INVITATIONS</h2>
                <span>
                  INVITATION HISTORY · ACCOUNT ACTIVATION
                </span>
              </div>

              <span className="workforce-live">
                <i /> {pendingInvitations.length} PENDING
              </span>
            </div>

            {invitationLoading ? (
              <div className="workforce-empty">
                LOADING INVITATIONS...
              </div>
            ) : invitations.length === 0 ? (
              <div className="workforce-empty">
                NO INVITATIONS FOUND
              </div>
            ) : (
              <div className="workforce-table-wrap">
                <table className="workforce-table">
                  <thead>
                    <tr>
                      <th>INVITED MEMBER</th>
                      <th>EMAIL ADDRESS</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>EXPIRES</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invitations.map((invitation) => {
                      const isExpired =
                        invitation.status === "pending" &&
                        new Date(invitation.expiresAt) <= new Date();

                      const status = isExpired
                        ? "expired"
                        : invitation.status;

                      return (
                        <tr key={invitation._id}>
                          <td>
                            <div className="wf-member">
                              <div className="wf-avatar">
                                {invitation.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </div>

                              <strong>{invitation.name}</strong>
                            </div>
                          </td>

                          <td>{invitation.email}</td>

                          <td>
                            <span
                              className={`wf-role role-${invitation.role}`}
                            >
                              {invitation.role?.toUpperCase()}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`wf-status wf-invite-status ${status}`}
                            >
                              {status.toUpperCase()}
                            </span>
                          </td>

                          <td>
                            {invitation.expiresAt
                              ? new Date(
                                  invitation.expiresAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td>
                            {invitation.status === "pending" &&
                              !isExpired && (
                                <button
                                  className="wf-action deactivate"
                                  disabled={
                                    cancellingId === invitation._id
                                  }
                                  onClick={() =>
                                    cancelInvitation(invitation._id)
                                  }
                                >
                                  {cancellingId === invitation._id
                                    ? "CANCELLING..."
                                    : "CANCEL"}
                                </button>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* COMPANY PERSONNEL */}

      <section className="workforce-panel">

        <div className="workforce-panel-header">
          <div>
            <h2>COMPANY PERSONNEL</h2>
            <span>
              REGISTERED USERS · LIVE DATABASE
            </span>
          </div>

          <span className="workforce-live">
            <i /> {members.length} RECORDS
          </span>
        </div>

        <div className="workforce-toolbar">
          <input
            type="search"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <span>
            {isAdmin ? "ADMIN ACCESS" : "READ ONLY"}
          </span>
        </div>

        {loading ? (
          <div className="workforce-empty">
            LOADING PERSONNEL DATA...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="workforce-empty">
            NO MEMBERS FOUND
          </div>
        ) : (
          <div className="workforce-table-wrap">
            <table className="workforce-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>EMAIL ADDRESS</th>
                  <th>ACCESS ROLE</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                  {isAdmin && <th>ACTIONS</th>}
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => {
                  const isSelf =
                    String(member._id) ===
                    String(user?._id || user?.id);

                  return (
                    <tr key={member._id}>
                      <td>
                        <div className="wf-member">
                          <div className="wf-avatar">
                            {member.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <strong>{member.name}</strong>

                          {isSelf && <small>YOU</small>}
                        </div>
                      </td>

                      <td>{member.email}</td>

                      <td>
                        {isAdmin && !isSelf ? (
                          <select
                            value={member.role}
                            disabled={updatingId === member._id}
                            onChange={(event) =>
                              updateRole(
                                member._id,
                                event.target.value
                              )
                            }
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`wf-role role-${member.role}`}
                          >
                            {member.role?.toUpperCase()}
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`wf-status ${
                            member.isActive ? "active" : "inactive"
                          }`}
                        >
                          {member.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        {member.createdAt
                          ? new Date(
                              member.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {isAdmin && (
                        <td>
                          <button
                            className={`wf-action ${
                              member.isActive
                                ? "deactivate"
                                : "activate"
                            }`}
                            disabled={
                              isSelf || updatingId === member._id
                            }
                            onClick={() => toggleStatus(member)}
                            title={
                              isSelf
                                ? "You cannot deactivate your own account"
                                : ""
                            }
                          >
                            {updatingId === member._id
                              ? "SAVING..."
                              : member.isActive
                              ? "DEACTIVATE"
                              : "ACTIVATE"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!isAdmin && (
        <p className="workforce-note">
          Your current role allows you to view workforce information.
          Contact your company administrator to change member permissions.
        </p>
      )}
    </div>
  );
}
