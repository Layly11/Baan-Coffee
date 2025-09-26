"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCleanupJob = exports.cleanUnusedBlobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const storage_blob_1 = require("@azure/storage-blob");
const models_1 = require("@coffee/models");
const azureBlob_1 = require("../utils/azureBlob");
const winston_1 = __importDefault(require("../helpers/winston"));
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION || "";
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;
const cleanUnusedBlobs = async () => {
    winston_1.default.info("🔄 Starting orphan blob cleanup job...");
    try {
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        const allBlobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            allBlobs.push(blob.name);
        }
        const productImages = await models_1.ProductModel.findAll({
            attributes: ["image_url"],
        });
        const orderImages = await models_1.OrderItemModel.findAll({
            attributes: ["image_url"],
        });
        const usedFiles = new Set();
        const extractBlobName = (url) => {
            if (!url)
                return null;
            try {
                return (0, azureBlob_1.parseBlobUrl)(url).blobName;
            }
            catch {
                return null;
            }
        };
        productImages.forEach((p) => {
            const blob = extractBlobName(p.image_url);
            if (blob)
                usedFiles.add(blob);
        });
        orderImages.forEach((o) => {
            const blob = extractBlobName(o.image_url);
            if (blob)
                usedFiles.add(blob);
        });
        let deletedCount = 0;
        for (const blobName of allBlobs) {
            if (!usedFiles.has(blobName)) {
                await containerClient.deleteBlob(blobName);
                winston_1.default.info(`🗑️ Deleted orphan blob: ${blobName}`);
                deletedCount++;
            }
        }
        winston_1.default.info(`✅ Cleanup finished. Deleted ${deletedCount} orphan blobs.`);
    }
    catch (err) {
        winston_1.default.error(`❌ Error cleaning orphan blobs: ${err.message}`);
    }
};
exports.cleanUnusedBlobs = cleanUnusedBlobs;
const scheduleCleanupJob = () => {
    node_cron_1.default.schedule("0 3 1 * *", async () => {
        await (0, exports.cleanUnusedBlobs)();
    });
    winston_1.default.info("📅 Cron job scheduled: Cleanup orphan blobs monthly on the 1st at 03:00");
};
exports.scheduleCleanupJob = scheduleCleanupJob;
//# sourceMappingURL=cleanupBlobs.js.map