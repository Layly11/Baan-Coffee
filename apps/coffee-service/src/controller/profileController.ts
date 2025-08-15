import { ServiceError } from "@coffee/helpers";
import { CustomersModel, sequelize } from "@coffee/models";
import { NextFunction, Request, Response } from "express";
import ProfileMasterError from '../constants/errors/profile.error.json'
import path from "path";
import { v4 as uuidv4 } from 'uuid'
import { deleteFolderPrefix, uploadToAzureBlob } from "../utils/azureBlob";


export const editProfileImage = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.body.userId);
        const file = (req.file!) || null

        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            return next(new ServiceError(ProfileMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }
        const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
        const key = `profile-images/user_${userId}/${Date.now()}.${ext}`;

        const imageUrl = await uploadToAzureBlob({
            containerName: process.env.AZURE_STORAGE_PROFILE_CONTAINER_NAME!,
            blobPath: key,
            data: file.buffer,
            contentType: file.mimetype
        })


        await CustomersModel.update({ image_url: imageUrl }, { where: { id: userId } })

        res.locals.imageUrl = imageUrl
        return next()

    } catch (err) {
        next(err)
    }
}

export const editProfileDetail = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, name, email, phone } = req.body

        const customer = await CustomersModel.findByPk(id)


        if (!customer) {
            return next(new ServiceError(ProfileMasterError.ERR_CUSTOMER_NOT_FOUND));
        }

        if (name !== null && name !== undefined && name !== '') {
            customer.name = name
        }
        if (email !== null && email !== undefined && email !== '') {
            customer.email = email
        }
        if (phone !== null && phone !== undefined && phone !== '') {
            customer.phone = phone
        }

        await customer.save()

        res.locals.customer = customer
        return next()
    } catch (err) {
        next(err)
    }
}


export const deleteAccount = () => async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const customerId = (req.user as any).id
        if (!customerId) {
            return next(new ServiceError(ProfileMasterError.ERR_CUSTOMER_NOT_FOUND));
        }

        const customer = await CustomersModel.findByPk(customerId, { transaction: t })
        if (!customer) {
            await t.rollback();
            return next(new ServiceError(ProfileMasterError.ERR_CUSTOMER_NOT_FOUND));
        }

        const profileImg = customer.image_url

        console.log("ProfileIMAGE: ", profileImg)
        await customer.destroy({ force: true, transaction: t })

        if (profileImg) {
            const prefix = `profile-images/user_${customerId}/`;
            await deleteFolderPrefix({
                containerName: process.env.AZURE_STORAGE_PROFILE_CONTAINER_NAME!,
                prefix

            })
        }

        await t.commit();
        return next()
    } catch (err) {
        await t.rollback();
        next(err)
    }
}