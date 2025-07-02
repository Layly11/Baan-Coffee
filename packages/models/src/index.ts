import { UserModel } from './models/User'
import { UserRoleModel } from './models/UserRole'
import { MapUserPermissionModel } from './models/MapUserPermission'
import { MenuPermissionModel } from './models/MenuPermission'
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



export * from './sequelize'
export * from './models/User'
export * from './models/UserRole'
export * from './models/MenuPermission'
export * from './models/MapUserPermission'