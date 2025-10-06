import cron from "node-cron";
import { Op } from "sequelize";
import dayjs from "dayjs";
import { AuditLogModel } from "@coffee/models"

// รันทุกวันที่ 1 เวลา 02:00 น.
cron.schedule("0 2 1 * *", async () => {
  console.log(`[CRON] Cleanup Audit Log เริ่มทำงาน: ${new Date().toISOString()}`);

  try {
    const cutoffDate = dayjs().subtract(1, "month").toDate();

    const deleted = await AuditLogModel.destroy({
      where: {
        created_at: {
          [Op.lt]: cutoffDate
        }
      }
    });

    console.log(`[CRON] ลบ Audit Log ${deleted} แถวที่เก่ากว่า ${cutoffDate}`);
  } catch (err) {
    console.error("[CRON] Cleanup Audit Log ล้มเหลว:", err);
  }
});
