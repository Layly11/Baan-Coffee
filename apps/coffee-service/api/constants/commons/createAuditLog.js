"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLog = exports.AuditLogActionType = exports.AuditLogMenuType = void 0;
var AuditLogMenuType;
(function (AuditLogMenuType) {
    AuditLogMenuType["AUTHEN"] = "AUTHEN";
    AuditLogMenuType["DASHBOARD"] = "DASHBOARD";
    AuditLogMenuType["USERS"] = "USERS";
    AuditLogMenuType["AUDIT_LOG"] = "AUDIT_LOG";
    AuditLogMenuType["PRODUCT_MENU"] = "PRODUCT_MENU";
    AuditLogMenuType["ORDER_MANAGEMENT"] = "ORDER_MANAGEMENT";
    AuditLogMenuType["CUSTOMER"] = "CUSTOMER";
})(AuditLogMenuType || (exports.AuditLogMenuType = AuditLogMenuType = {}));
var AuditLogActionType;
(function (AuditLogActionType) {
    AuditLogActionType["LOGIN"] = "LOGIN";
    AuditLogActionType["LOGIN_FAILURE"] = "LOGIN_FAILURE";
    AuditLogActionType["LOGOUT"] = "LOGOUT";
    AuditLogActionType["VIEW_AUDIT_LOG"] = "VIEW_AUDIT_LOG";
    AuditLogActionType["SEARCH_AUDIT_LOG"] = "SEARCH_AUDIT_LOG";
    AuditLogActionType["VIEW_DASHBOARD"] = "VIEW_DASHBOARD";
    AuditLogActionType["SEARCH_DASHBOARD"] = "SEARCH_DASHBOARD";
    AuditLogActionType["VIEW_DASHBOARD_DETAILS"] = "VIEW_DASHBOARD_DETAILS";
    AuditLogActionType["VIEW_PRODUCT"] = "VIEW_PRODUCT";
    AuditLogActionType["CREATE_PRODUCT"] = "CREATE_PRODUCT";
    AuditLogActionType["EDIT_PRODUCT"] = "EDIT_PRODUCT";
    AuditLogActionType["DELETE_PRODUCT"] = "DELETE_PRODUCT";
    AuditLogActionType["VIEW_ORDERS"] = "VIEW_ORDERS";
    AuditLogActionType["SEARCH_ORDERS"] = "SEARCH_ORDERS";
    AuditLogActionType["VIEW_ORDERS_INVOICE"] = "VIEW_ORDERS_INVOICE";
    AuditLogActionType["DOWNLOAD_ORDER_INVOICE"] = "DOWNLOAD_ORDER_INVOICE";
    AuditLogActionType["EDIT_ORDER_STATUS"] = "EDIT_ORDER_STATUS";
    AuditLogActionType["VIEW_CUSTOMER"] = "VIEW_CUSTOMER";
    AuditLogActionType["SEARCH_CUSTOMER"] = "SEARCH_CUSTOMER";
    AuditLogActionType["VIEW_CUSTOMER_ORDER"] = "VIEW_CUSTOMER_ORDER";
    AuditLogActionType["EDIT_CUSTOMER"] = "EDIT_CUSTOMER";
    AuditLogActionType["DELETE_CUSTOMER"] = "DELETE_CUSTOMER";
    AuditLogActionType["VIEW_USER"] = "VIEW_USER";
    AuditLogActionType["SEARCH_USER"] = "SEARCH_USER";
    AuditLogActionType["CREATE_USER"] = "CREATE_USER";
    AuditLogActionType["DELETE_USER"] = "DELETE_USER";
    AuditLogActionType["EDIT_USER"] = "EDIT_USER";
    AuditLogActionType["RESET_PASSWORD_USER"] = "RESET_PASSWORD_USER";
})(AuditLogActionType || (exports.AuditLogActionType = AuditLogActionType = {}));
const CreateAuditLog = ({ editorName, editorRole, action, menu, destinationType, targetName, detail, eventDateTime, staffId, staffEmail, channel, searchCriteria, previousValues, newValues, recordKeyValues, isPii }) => {
    const auditLog = {
        menu: menu.toUpperCase(),
        action: action.toUpperCase(),
        source_type: 'STAFF',
        editor_name: editorName,
        editor_role: editorRole,
        destination_type: destinationType?.toUpperCase(),
        detail: detail ? JSON.stringify(detail) : undefined,
        event_date_time: eventDateTime,
        staff_id: staffId || undefined,
        staff_email: staffEmail,
        channel: channel || undefined,
        search_criteria: searchCriteria,
        previous_values: previousValues,
        new_values: newValues,
        record_key_values: recordKeyValues,
        is_pii: isPii,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    if (targetName) {
        return {
            ...auditLog,
            target_name: targetName
        };
    }
    return auditLog;
};
exports.CreateAuditLog = CreateAuditLog;
//# sourceMappingURL=createAuditLog.js.map