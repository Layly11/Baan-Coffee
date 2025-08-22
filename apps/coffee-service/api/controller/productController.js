"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByCategory = exports.getCategoryMobile = exports.getBestSeller = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductData = void 0;
const models_1 = require("@coffee/models");
const azureBlob_1 = require("../utils/azureBlob");
const helpers_1 = require("@coffee/helpers");
const product_error_json_1 = __importDefault(require("../constants/errors/product.error.json"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const getProductData = () => async (req, res, next) => {
    try {
        const { categories, limit, offset } = req.query;
        const categoryArray = Array.isArray(categories)
            ? categories
            : typeof categories === 'string'
                ? categories.split(',').map(c => c.trim()).filter(Boolean)
                : [];
        const data = await models_1.ProductModel.findAll({
            include: [
                {
                    model: models_1.CategoriesModel,
                    as: 'category',
                    attributes: ['id', 'name'],
                    ...(categoryArray.length > 0 && {
                        where: {
                            name: categoryArray
                        },
                    })
                }
            ],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']]
        });
        const products = data.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            status: product.status,
            image_url: product.image_url,
            description: product.description,
            category_id: product.category.id || null,
            category_name: product.category?.name || null
        }));
        res.locals.products = products;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getProductData = getProductData;
const createProduct = () => async (req, res, next) => {
    const transaction = await models_1.sequelize.transaction();
    try {
        const { product_name: productName, categories, price, description, is_active: isActive } = req.body;
        const file = (req.file) || null;
        if (price !== undefined && (price > 200 || price < 1)) {
            await transaction.rollback();
            return next(new helpers_1.ServiceError(product_error_json_1.default.ERR_PRICE_CONSTRAINT));
        }
        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            await transaction.rollback();
            return next(new helpers_1.ServiceError(product_error_json_1.default.FILE_TYPE_REQUIRE_IMAGE));
        }
        if (file !== null && file !== undefined && file.size > 2 * 1024 * 1024) {
            await transaction.rollback();
            return next(new helpers_1.ServiceError(product_error_json_1.default.FILE_SIZE_LIMIT));
        }
        if (!productName) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.PRODUCT_NAME_REQUIRE));
        }
        if (!categories) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.CATEGOREIS_REQUIRE));
        }
        if (!price) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.PRICE_REQUIRE));
        }
        if (!isActive) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.IS_ACTIVE_REQUIRE));
        }
        let imageUrl;
        if (file) {
            try {
                const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
                const fileName = `Product_${(0, uuid_1.v4)().substring(0, 8)}${fileExtension}`;
                const blobPath = `${fileName}`;
                imageUrl = await (0, azureBlob_1.uploadToAzureBlob)({
                    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
                    blobPath,
                    data: file.buffer,
                    contentType: file.mimetype
                });
            }
            catch (err) {
                await transaction.commit();
                next(err);
            }
        }
        const newProduct = await models_1.ProductModel.create({
            name: productName,
            price,
            category_id: categories,
            status: isActive,
            image_url: imageUrl,
            description: description
        }, { transaction });
        res.locals.newProduct = newProduct;
        await transaction.commit();
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.createProduct = createProduct;
const updateProduct = () => async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const item = await models_1.ProductModel.findByPk(id);
        if (!item) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.PRODUCT_NOT_FOUND));
        }
        const { product_name: productName, categories, price, description, is_active: isActive, is_remove_image: isRemoveImage } = req.body;
        if (price !== undefined && (price > 200 || price < 1)) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.ERR_PRICE_CONSTRAINT));
        }
        const file = req.file;
        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.FILE_TYPE_REQUIRE_IMAGE));
        }
        if (file !== null && file !== undefined && file.size > 2 * 1024 * 1024) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.FILE_SIZE_LIMIT));
        }
        if (file) {
            const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `Product_${(0, uuid_1.v4)().substring(0, 8)}${fileExtension}`;
            const blobPath = `${fileName}`;
            const image_url = await (0, azureBlob_1.uploadToAzureBlob)({
                containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
                blobPath,
                data: file.buffer,
                contentType: file.mimetype
            });
            item.image_url = image_url;
        }
        if (isRemoveImage === 'true') {
            if (item.image_url) {
                await (0, azureBlob_1.deleteFromAzureImage)({
                    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
                    blobPath: (0, azureBlob_1.parseBlobUrl)(item.image_url).blobName
                });
                item.image_url = null;
            }
        }
        if (productName !== undefined) {
            item.name = productName;
        }
        if (categories !== undefined) {
            const categoryId = Number(categories);
            if (isNaN(categoryId)) {
                return next(new helpers_1.ServiceError(product_error_json_1.default.INVALID_CATEGORY_ID));
            }
            item.category_id = categoryId;
        }
        if (price !== undefined) {
            item.price = price;
        }
        if (description !== undefined) {
            item.description = description;
        }
        if (isActive !== undefined) {
            item.status = isActive;
        }
        await item.save();
        res.locals.item = item;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = () => async (req, res, next) => {
    try {
        const id = req.params.id;
        const item = await models_1.ProductModel.findByPk(id);
        if (!item) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.PRODUCT_NOT_FOUND));
        }
        await models_1.TopProductModel.destroy({ where: { product_id: id } });
        if (item.image_url) {
            try {
                await (0, azureBlob_1.deleteFromAzureImage)({
                    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
                    blobPath: (0, azureBlob_1.parseBlobUrl)(item.image_url).blobName
                });
            }
            catch (err) {
                return next(err);
            }
        }
        await item.destroy();
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProduct = deleteProduct;
const getCategory = () => async (req, res, next) => {
    try {
        const category = await models_1.CategoriesModel.findAll({ attributes: ['id', 'name'] });
        res.locals.category = category;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getCategory = getCategory;
const createCategory = () => async (req, res, next) => {
    try {
        const { category_name: categoryName } = req.body;
        const category = await models_1.CategoriesModel.findAll();
        if (category.length >= 4) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.CATEGORY_LIMIT));
        }
        if (!categoryName) {
            return next(product_error_json_1.default.CATEGORIES_NAME_NOT_FOUND);
        }
        const newCategories = await models_1.CategoriesModel.create({
            name: categoryName
        });
        res.locals.newCategories = newCategories;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.createCategory = createCategory;
const updateCategory = () => async (req, res, next) => {
    try {
        const id = req.params.id;
        const item = await models_1.CategoriesModel.findByPk(id);
        const { category_name: categoryName } = req.body;
        if (!item) {
            return next(product_error_json_1.default.CATEGORIES_NAME_NOT_FOUND);
        }
        item.name = categoryName;
        await item.save();
        res.locals.item = item;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = () => async (req, res, next) => {
    try {
        const id = req.params.id;
        const productsUsingCategory = await models_1.ProductModel.count({ where: { category_id: id } });
        if (productsUsingCategory > 0) {
            return next(new helpers_1.ServiceError(product_error_json_1.default.CATEGORY_IS_IN_USE_BY_SOME_PRODUCT));
        }
        const item = await models_1.CategoriesModel.findByPk(id);
        if (!item) {
            return next(product_error_json_1.default.CATEGORIES_NAME_NOT_FOUND);
        }
        await item.destroy();
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCategory = deleteCategory;
const getBestSeller = () => async (req, res, next) => {
    try {
        const bestSellers = await models_1.TopProductModel.findAll({
            attributes: [
                'id',
                'product_id',
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('total_sold')), 'totalSold'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('total_sales')), 'totalSales'],
            ],
            include: [
                {
                    model: models_1.ProductModel,
                    as: 'product',
                    attributes: ['name', 'price', 'image_url', 'description'],
                    where: { status: 1 }
                },
            ],
            group: ['top_products.id', 'product_id', 'product.id'],
            order: [[sequelize_1.Sequelize.literal('totalSold'), 'DESC']],
        });
        const bestSellerMapping = bestSellers.map((value) => ({
            id: value.id,
            name: value.product.name,
            Desc: value.product.description,
            price: value.product.price,
            imageSource: value.product.image_url
        }));
        res.locals.bestSeller = bestSellerMapping;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getBestSeller = getBestSeller;
const getCategoryMobile = () => async (req, res, next) => {
    try {
        const category = await models_1.CategoriesModel.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: models_1.ProductModel,
                    as: 'products',
                    required: true,
                    where: { status: 1 }
                }
            ]
        });
        const categoryMapped = category.map((cat) => ({
            id: cat.id,
            name: cat.name
        }));
        res.locals.category = categoryMapped;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getCategoryMobile = getCategoryMobile;
const getProductByCategory = () => async (req, res, next) => {
    try {
        const category = await models_1.CategoriesModel.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: models_1.ProductModel,
                    as: 'products',
                    where: { status: 1 }
                }
            ]
        });
        const mappedResult = {};
        for (const categories of category) {
            const categoriesName = categories.name;
            const products = categories.products || [];
            mappedResult[categoriesName] = products.map((product) => ({
                id: product.id,
                title: product.name,
                price: `${product.price} Bath`,
                image: product.image_url,
                desc: product.description,
            }));
        }
        res.locals.productsData = mappedResult;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getProductByCategory = getProductByCategory;
//# sourceMappingURL=productController.js.map