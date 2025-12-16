"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const dayjs_1 = __importDefault(require("dayjs"));
const models_1 = require("@coffee/models");
node_cron_1.default.schedule("0 2 1 * *", async () => {
    console.log(`[CRON] Cleanup Audit Log เริ่มทำงาน: ${new Date().toISOString()}`);
    try {
        const cutoffDate = (0, dayjs_1.default)().subtract(1, "month").toDate();
        const deleted = await models_1.AuditLogModel.destroy({
            where: {
                created_at: {
                    [sequelize_1.Op.lt]: cutoffDate
                }
            }
        });
        console.log(`[CRON] ลบ Audit Log ${deleted} แถวที่เก่ากว่า ${cutoffDate}`);
    }
    catch (err) {
        console.error("[CRON] Cleanup Audit Log ล้มเหลว:", err);
    }
});
//# sourceMappingURL=cleanupAuditLog.js.map