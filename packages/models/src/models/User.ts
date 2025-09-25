import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    ForeignKey,
    NonAttribute
} from 'sequelize'

import { sequelize } from '../sequelize'
import { UserRoleModel } from './UserRole'
import bcrypt from 'bcryptjs'


export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    declare id: CreationOptional<number>
    declare username: string
    declare email: string
    declare password: string
    declare status: CreationOptional<boolean>
    declare recent_login: CreationOptional<Date>
    declare last_login: CreationOptional<Date>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    declare role_id: ForeignKey<UserRoleModel['id']>

    declare role: NonAttribute<UserRoleModel>

    public async matchPassword(enteredPassword: string): Promise<boolean> {
        if (!this.password) {
            return false;
        }
        return await bcrypt.compare(enteredPassword, this.password);
    }
}

UserModel.init({
    id: {
        field: 'id',
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    username: {
        field: 'username',
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        field: 'email',
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        field: 'password',
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        field: 'status',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    recent_login: {
        type: DataTypes.DATE(),
        allowNull: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
})

UserModel.beforeSave(async (user, options) => {
  if (user.changed('password')) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
})