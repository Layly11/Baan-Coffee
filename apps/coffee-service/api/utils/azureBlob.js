"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolderPrefix = exports.deleteFromAzureImage = exports.parseBlobUrl = exports.getblobUrlSas = exports.getBlobSasToken = exports.uploadToAzureBlob = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const winston_1 = __importDefault(require("../helpers/winston"));
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const uploadToAzureBlob = async ({ containerName, blobPath, data, contentType }) => {
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobPath);
    await blobClient.uploadData(data, {
        blobHTTPHeaders: { blobContentType: contentType }
    });
    winston_1.default.info(`Upload file success Container name: ${process.env.AZURE_STORAGE_CONTAINER_NAME}, Result URL: ${blobClient.url}`);
    return blobClient.url;
};
exports.uploadToAzureBlob = uploadToAzureBlob;
const getBlobSasToken = (blobName) => {
    const accountName = process.env.AZURE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_ACCESS_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
    const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
    const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
        containerName,
        blobName,
        permissions: storage_blob_1.BlobSASPermissions.parse('r'),
        expiresOn,
        protocol: storage_blob_1.SASProtocol.Https
    }, sharedKeyCredential).toString();
    return sasToken;
};
exports.getBlobSasToken = getBlobSasToken;
const getblobUrlSas = async (blobName) => {
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const permissions = new storage_blob_1.ContainerSASPermissions();
    permissions.read = true;
    const blobUrlSas = await blockBlobClient.generateSasUrl({
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
        permissions
    });
    return blobUrlSas;
};
exports.getblobUrlSas = getblobUrlSas;
const parseBlobUrl = (blobUrl) => {
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 1) {
        throw new Error('Invalid Blob URL. Cannot extract container and blob name.');
    }
    const containerName = pathParts.shift();
    const blobName = decodeURIComponent(pathParts.join('/'));
    return { containerName, blobName };
};
exports.parseBlobUrl = parseBlobUrl;
const deleteFromAzureImage = async ({ containerName, blobPath }) => {
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobPath);
    await blobClient.deleteIfExists();
};
exports.deleteFromAzureImage = deleteFromAzureImage;
const deleteFolderPrefix = async ({ containerName, prefix, }) => {
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        console.log(`Deleting blob: ${blob.name}`);
        await containerClient.deleteBlob(blob.name);
    }
};
exports.deleteFolderPrefix = deleteFolderPrefix;
//# sourceMappingURL=azureBlob.js.map