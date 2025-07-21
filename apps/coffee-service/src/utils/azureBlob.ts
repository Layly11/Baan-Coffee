import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  SASProtocol,
  ContainerSASPermissions
} from '@azure/storage-blob'

import winston from '../helpers/winston'
import { v4 as uuidv4 } from 'uuid'

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION || ''

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

export const uploadToAzureBlob = async ({ containerName, blobPath, data, contentType }: { containerName: string, blobPath: string, data: Buffer, contentType: string }): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
  const containerClient = blobServiceClient.getContainerClient(containerName)

  const blobClient = containerClient.getBlockBlobClient(blobPath)

  await blobClient.uploadData(data, {
    blobHTTPHeaders: { blobContentType: contentType }
  })
  winston.info(`Upload file success Container name: ${process.env.AZURE_STORAGE_CONTAINER_NAME}, Result URL: ${blobClient.url}`)
  return blobClient.url
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

export const getblobUrlSas = async (blobName: string) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
  const containerClient = blobServiceClient.getContainerClient(containerName)

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const permissions = new ContainerSASPermissions()
  permissions.read = true

   const blobUrlSas = await blockBlobClient.generateSasUrl({
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
    permissions
  })
  
  return blobUrlSas
}

export const parseBlobUrl = (blobUrl: string) => {
  const url = new URL(blobUrl)

  const pathParts = url.pathname.split('/').filter(Boolean)

  if (pathParts.length < 1) {
    throw new Error('Invalid Blob URL. Cannot extract container and blob name.')
  }

  const containerName = pathParts.shift()!
  const blobName = decodeURIComponent(pathParts.join('/'))

  return { containerName, blobName }
}


export const deleteFromAzureImage = async ({ containerName, blobPath }: { containerName: string, blobPath: string }) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
  const containerClient = blobServiceClient.getContainerClient(containerName)

  const blobClient = containerClient.getBlockBlobClient(blobPath)
  await blobClient.deleteIfExists()
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