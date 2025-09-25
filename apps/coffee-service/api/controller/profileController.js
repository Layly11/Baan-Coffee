"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressCustomer = exports.deleteAddressCustomer = exports.createAddressCustomer = exports.fetchAddressBySelected = exports.fetchAddressCustomer = exports.deleteAccount = exports.editProfileDetail = exports.editProfileImage = void 0;
const helpers_1 = require("@coffee/helpers");
const models_1 = require("@coffee/models");
const profile_error_json_1 = __importDefault(require("../constants/errors/profile.error.json"));
const azureBlob_1 = require("../utils/azureBlob");
const editProfileImage = () => async (req, res, next) => {
    try {
        const userId = Number(req.body.userId);
        const file = (req.file) || null;
        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.FILE_TYPE_REQUIRE_IMAGE));
        }
        const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
        const key = `profile-images/user_${userId}/${Date.now()}.${ext}`;
        const imageUrl = await (0, azureBlob_1.uploadToAzureBlob)({
            containerName: process.env.AZURE_STORAGE_PROFILE_CONTAINER_NAME,
            blobPath: key,
            data: file.buffer,
            contentType: file.mimetype
        });
        await models_1.CustomersModel.update({ image_url: imageUrl }, { where: { id: userId, isDeleted: false } });
        res.locals.imageUrl = imageUrl;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.editProfileImage = editProfileImage;
const editProfileDetail = () => async (req, res, next) => {
    try {
        const { id, name, email, phone } = req.body;
        const customer = await models_1.CustomersModel.findOne({
            where: {
                id: id,
                isDeleted: false
            }
        });
        if (!customer) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_CUSTOMER_NOT_FOUND));
        }
        if (name !== null && name !== undefined && name !== '') {
            customer.name = name;
        }
        if (email !== null && email !== undefined && email !== '') {
            customer.email = email;
        }
        if (phone !== null && phone !== undefined && phone !== '') {
            customer.phone = phone;
        }
        await customer.save();
        res.locals.customer = customer;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.editProfileDetail = editProfileDetail;
const deleteAccount = () => async (req, res, next) => {
    const t = await models_1.sequelize.transaction();
    try {
        const customerId = req.user.id;
        if (!customerId) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_CUSTOMER_NOT_FOUND));
        }
        const customer = await models_1.CustomersModel.findByPk(customerId, { transaction: t });
        if (!customer) {
            await t.rollback();
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_CUSTOMER_NOT_FOUND));
        }
        await customer.update({ isDeleted: true }, { transaction: t });
        await t.commit();
        return next();
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
};
exports.deleteAccount = deleteAccount;
const fetchAddressCustomer = () => async (req, res, next) => {
    try {
        const customerId = req.user.id;
        if (!customerId) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_CUSTOMER_NOT_FOUND));
        }
        const addresses = await models_1.AddressModel.findAll({
            where: { customer_id: customerId },
            order: [["createdAt", "ASC"]],
        });
        console.log('Address: ', addresses);
        res.locals.address = addresses;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.fetchAddressCustomer = fetchAddressCustomer;
const fetchAddressBySelected = () => async (req, res, next) => {
    try {
        const id = req.params.id;
        const addresses = await models_1.AddressModel.findByPk(id);
        res.locals.address = addresses;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.fetchAddressBySelected = fetchAddressBySelected;
const createAddressCustomer = () => async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { type, name, house_no: houseNo, village, street, city } = req.body;
        if (!customerId) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_CUSTOMER_NOT_FOUND));
        }
        if (!type || !name || !houseNo || !street || !city) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_REQUIRE_FIELD_ADDRES));
        }
        const address = await models_1.AddressModel.create({
            customer_id: customerId,
            type,
            name,
            house_no: houseNo,
            village,
            street,
            city
        });
        res.locals.address = address;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.createAddressCustomer = createAddressCustomer;
const deleteAddressCustomer = () => async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = await models_1.AddressModel.findByPk(id);
        if (!address) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_ADDRESS_NOT_FOUND));
        }
        await address.destroy();
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteAddressCustomer = deleteAddressCustomer;
const updateAddressCustomer = () => async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = await models_1.AddressModel.findByPk(id);
        if (!address) {
            return next(new helpers_1.ServiceError(profile_error_json_1.default.ERR_ADDRESS_NOT_FOUND));
        }
        await address.update(req.body);
        res.locals.address = address;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.updateAddressCustomer = updateAddressCustomer;
//# sourceMappingURL=profileController.js.map