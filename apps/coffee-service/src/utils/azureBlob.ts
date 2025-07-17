import {
    BlobServiceClient,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
    StorageSharedKeyCredential,
    SASProtocol
} from '@azure/storage-blob'

import winston from '../helpers/winston'
import { v4 as uuidv4 } from 'uuid'

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION || ''

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

export const uploadToAzureBlob = async (buffer: Buffer, originalName: string): Promise<string> => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(containerName)

    const blobName = `${uuidv4()}-${originalName}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' }
    })
    winston.info(`Upload file success Container name: ${process.env.AZURE_STORAGE_CONTAINER_NAME}, Result URL: ${blockBlobClient.url}`)
    return blockBlobClient.url
}

export const getBlobSasToken = (blobName: string) => {
    const accountName = process.env.AZURE_ACCOUNT_NAME!
    const accountKey = process.env.AZURE_ACCESS_KEY!
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
    const expiresOn = new Date(new Date().valueOf() + 3600 * 1000)

      const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn,
      protocol: SASProtocol.Https
    },
    sharedKeyCredential
  ).toString()

  return sasToken
}


// const getBlobUrlSas = async (blobUrl: string) => {
//   if (!blob.blobServiceClient) {
//     throw new Error('BlobServiceClient is not initialized. Call initialBlob() first.')
//   }

//   if (!process.env.AZURE_STORAGE_CONTAINER_NAME) {
//     throw new Error('AZURE_STORAGE_CONTAINER_NAME environment variable is not set.')
//   }

//   const containerClient = blob.blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME)
//   const blockBlobClient = containerClient.getBlockBlobClient(blobUrl)

//   const permissions = new ContainerSASPermissions()
//   permissions.read = true

//   const blobUrlSas = await blockBlobClient.generateSasUrl({
//     expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
//     permissions
//   })

//   return blobUrlSas
// }