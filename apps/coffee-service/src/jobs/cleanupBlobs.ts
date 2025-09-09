import cron from "node-cron";
import { BlobServiceClient } from "@azure/storage-blob";
import { ProductModel, OrderItemModel } from "@coffee/models";
import { parseBlobUrl } from "../utils/azureBlob";
import winston from "../helpers/winston";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_BLOB_CONNECTION || "";
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME!;

/**
 * Cleanup unused/orphan blobs
 */
export const cleanUnusedBlobs = async (): Promise<void> => {
  winston.info("🔄 Starting orphan blob cleanup job...");

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // 1. ดึง blob ทั้งหมดใน container
    const allBlobs: string[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      allBlobs.push(blob.name);
    }

    // 2. ดึงไฟล์ที่ยังใช้งานจาก DB
    const productImages = await ProductModel.findAll({
      attributes: ["image_url"],
    });
    const orderImages = await OrderItemModel.findAll({
      attributes: ["image_url"],
    });

    const usedFiles = new Set<string>();

    const extractBlobName = (url: string | null) => {
      if (!url) return null;
      try {
        return parseBlobUrl(url).blobName;
      } catch {
        return null;
      }
    };

    productImages.forEach((p: any) => {
      const blob = extractBlobName(p.image_url);
      if (blob) usedFiles.add(blob);
    });

    orderImages.forEach((o: any) => {
      const blob = extractBlobName(o.product_image_url);
      if (blob) usedFiles.add(blob);
    });

    // 3. ลบ orphan blobs
    let deletedCount = 0;
    for (const blobName of allBlobs) {
      if (!usedFiles.has(blobName)) {
        await containerClient.deleteBlob(blobName);
        winston.info(`🗑️ Deleted orphan blob: ${blobName}`);
        deletedCount++;
      }
    }

    winston.info(`✅ Cleanup finished. Deleted ${deletedCount} orphan blobs.`);
  } catch (err: any) {
    winston.error(`❌ Error cleaning orphan blobs: ${err.message}`);
  }
};

/**
 * Schedule cleanup job (default: every day at 3 AM)
 */
export const scheduleCleanupJob = () => {
  cron.schedule("*/30 * * * *", async () => {
    await cleanUnusedBlobs();
  });

  winston.info("📅 Cron job scheduled: Cleanup orphan blobs at 03:00 daily");
};
