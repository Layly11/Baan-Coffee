export enum AuditLogMenuType {
  AUTHEN = 'AUTHEN',
  DASHBOARD = 'DASHBOARD',
  USERS = 'USERS',
  AUDIT_LOG = 'AUDIT_LOG',

}


export enum AuditLogActionType {
  LOGIN = 'LOGIN',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  SEARCH_AUDIT_LOG = 'SEARCH_AUDIT_LOG',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  SEARCH_DASHBOARD = 'SEARCH_DASHBOARD',
  VIEW_DASHBOARD_DETAILS = 'VIEW_DASHBOARD_DETAILS'
}

export const CreateAuditLog = ({
  editorName,
  editorRole,
  action,
  menu,
  destinationType,
  targetName,
  detail,
  eventDateTime,
  staffId,
  staffEmail,
  channel,
  searchCriteria,
  previousValues,
  newValues,
  recordKeyValues,
  isPii
}: any) => {

  const auditLog = {
    menu: menu.toUpperCase(),
    action: action.toUpperCase(),
    source_type: 'STAFF',
    editor_name: editorName,
    editor_role: editorRole,
    destination_type: destinationType?.toUpperCase(),
    detail: detail ? JSON.stringify(detail) : undefined,
    // ---------- PII ----------
    event_date_time: eventDateTime,
    staff_id: staffId || undefined,
    staff_email: staffEmail,
    channel: channel || undefined,
    search_criteria: searchCriteria,
    previous_values: previousValues,
    new_values: newValues,
    record_key_values: recordKeyValues,
    is_pii: isPii,
    // ---------- PII ----------
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (targetName) {
    return {
      ...auditLog,
      target_name: targetName
    }
  }

  return auditLog
}
