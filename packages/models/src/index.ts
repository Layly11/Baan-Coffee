import { UserModel } from './models/User'
import { UserRoleModel } from './models/UserRole'
import { MapUserPermissionModel } from './models/MapUserPermission'
import { MenuPermissionModel } from './models/MenuPermission'
import { DailySummaryModel } from './models/DailySummary';
import { InventoryStatusModel } from './models/InventoryStatus'
import { OrderModel } from './models/Orders';
import { ShiftTodayModel } from './models/ShiftToday';
import { TopProductModel } from './models/TopProduct';
import { CategoriesModel } from './models/Categories';
import { ProductModel } from './models/Product';
import { CustomersModel } from './models/Customer';
import { AddressModel } from './models/Address';

UserModel.belongsTo(UserRoleModel,{
    foreignKey: 'role_id',
    as: 'role'
})


MapUserPermissionModel.belongsTo(MenuPermissionModel, {
    foreignKey: 'menu_id',
    as: 'menu'
})

MapUserPermissionModel.belongsTo(UserRoleModel, {
    foreignKey: 'role_id',
    as: 'role'
})

DailySummaryModel.hasMany(InventoryStatusModel, {
  foreignKey: 'summary_id',
  as: 'inventory_statuses',
});
InventoryStatusModel.belongsTo(DailySummaryModel, {
  foreignKey: 'summary_id',
  as: 'daily_summary',
});

DailySummaryModel.hasMany(OrderModel, {
  foreignKey: 'summary_id',
  as: 'orders',
});
OrderModel.belongsTo(DailySummaryModel, {
  foreignKey: 'summary_id',
  as: 'daily_summary',
});

DailySummaryModel.hasMany(ShiftTodayModel, {
  foreignKey: 'summary_id',
  as: 'shifts',
});
ShiftTodayModel.belongsTo(DailySummaryModel, {
  foreignKey: 'summary_id',
  as: 'daily_summary',
});

DailySummaryModel.hasMany(TopProductModel, {
  foreignKey: 'summary_id',
  as: 'top_products',
});
TopProductModel.belongsTo(DailySummaryModel, {
  foreignKey: 'summary_id',
  as: 'daily_summary',
});


CategoriesModel.hasMany(ProductModel, {
  foreignKey: 'category_id',
  as: 'products',
});

ProductModel.belongsTo(CategoriesModel, {
  foreignKey: 'category_id',
  as: 'category',
});

TopProductModel.belongsTo(ProductModel, {
    foreignKey: 'product_id',
    as: 'product'
});

ProductModel.hasMany(TopProductModel, {
  foreignKey: 'product_id',
  as: 'topProducts'
});

CustomersModel.hasMany(AddressModel, {
  foreignKey: 'customer_id',
  as: 'address'  
})

AddressModel.belongsTo(CustomersModel, {
  foreignKey: 'customer_id',
  as: 'customers'
})





export * from './sequelize'
export * from './models/User'
export * from './models/UserRole'
export * from './models/MenuPermission'
export * from './models/MapUserPermission'
export * from './models/DailySummary';
export * from './models/InventoryStatus';
export * from './models/Orders';
export * from './models/ShiftToday';
export * from './models/TopProduct'; 
export * from './models/Categories'; 
export * from './models/Product'; 
export * from './models/Customer'
export * from './models/Address'
