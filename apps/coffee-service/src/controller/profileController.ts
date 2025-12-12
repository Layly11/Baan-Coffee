import { ServiceError } from "@coffee/helpers";
import { AddressModel, CustomersModel, sequelize } from "@coffee/models";
import { NextFunction, Request, Response } from "express";
import ProfileMasterError from '../constants/errors/profile.error.json'
import path from "path";
import { v4 as uuidv4 } from 'uuid'
import { deleteFolderPrefix, uploadToAzureBlob } from "../utils/azureBlob";
import { Op } from 'sequelize';



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


        await CustomersModel.update({ image_url: imageUrl }, { where: { id: userId, isDeleted: false } })

        res.locals.imageUrl = imageUrl
        return next()

    } catch (err) {
        next(err)
    }
}

export const editProfileDetail = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, name, email, phone } = req.body

        const customer = await CustomersModel.findOne({
            where: {
                id: id,
                isDeleted: false
            }
        })


        if (!customer) {
            return next(new ServiceError(ProfileMasterError.ERR_CUSTOMER_NOT_FOUND));
        }

        if (name !== null && name !== undefined && name !== '') {
            customer.name = name
        }
        const emailExist =  await CustomersModel.findOne({
            where: {
                email,
                id: {[Op.ne]: id}
            }
        })

        if(emailExist) {
            return next(new ServiceError(ProfileMasterError.ERR_EMAIL_ALREADY_EXISTS));
        }
        
        if (email !== null && email !== undefined && email !== '') {
            customer.email = email
        }

        const phoneExist = await CustomersModel.findOne({
            where: {
                phone,
                id: {[Op.ne]: id}
            }
        })
        if(phoneExist) {
            return next(new ServiceError(ProfileMasterError.ERR_PHONE_ALREADY_EXISTS));
        }

        if (phone !== null && phone !== undefined && phone !== '' ) {
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

        await customer.update({ isDeleted: true }, { transaction: t });

        await t.commit();
        return next()
    } catch (err) {
        await t.rollback();
        next(err)
    }
}

export const fetchAddressCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req.user as any).id
        if (!customerId) {
            return next(new ServiceError(ProfileMasterError.ERR_CUSTOMER_NOT_FOUND));
        }

        const addresses = await AddressModel.findAll({
            where: { customer_id: customerId },
            order: [["createdAt", "ASC"]],
        })


        res.locals.address = addresses

        return next()
    } catch (err) {
        next(err)
    }
}


export const fetchAddressBySelected = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        const addresses = await AddressModel.findByPk(id)

        res.locals.address = addresses

        return next()
    } catch (err) {
        next(err)
    }
}



export const createAddressCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req.user as any).id
        const {
            type,
            name,
            house_no: houseNo,
            village,
            street,
            city
        } = req.body as any
        if (!customerId) {
            return next(new ServiceError(ProfileMasterError.ERR_CUSTOMER_NOT_FOUND));
        }

        if (!type || !name || !houseNo || !street || !city) {
            return next(new ServiceError(ProfileMasterError.ERR_REQUIRE_FIELD_ADDRES));
        }

        const address = await AddressModel.create({
            customer_id: customerId,
            type,
            name,
            house_no: houseNo,
            village,
            street,
            city
        })
        res.locals.address = address

        return next()
    } catch (err) {
        next(err)
    }
}

export const deleteAddressCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const address = await AddressModel.findByPk(id)

        if (!address) {
            return next(new ServiceError(ProfileMasterError.ERR_ADDRESS_NOT_FOUND));
        }

        await address.destroy()

        return next()
    } catch (err) {
        next(err)
    }
} 

export const  updateAddressCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const address = await AddressModel.findByPk(id)

        if (!address) {
            return next(new ServiceError(ProfileMasterError.ERR_ADDRESS_NOT_FOUND));
        }

        await address.update(req.body);

        res.locals.address = address
        
        return next()
    } catch (err) {
        next(err)
    }
} 