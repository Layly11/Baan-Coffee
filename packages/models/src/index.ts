import { UserModel } from './models/User'
import { UserRoleModel } from './models/UserRole'
import { MapUserPermissionModel } from './models/MapUserPermission'
import { MenuPermissionModel } from './models/MenuPermission'
import { DailySummaryModel } from './models/DailySummary';
import { InventoryStatusModel } from './models/InventoryStatus'
import { OrderModel } from './models/Orders';
import { ShiftTodayModel } from './models/ShiftToday';
import { TopProductModel } from './models/TopProduct';


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