import {Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import bcrypt from 'bcryptjs'


export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    declare id: CreationOptional<number>
    declare username: string
    declare email: string
    declare password: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

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
    username: {
        field: 'username',
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    createdAt: {
        field: 'createdAt',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        field: 'updatedAt',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
})

UserModel.beforeSave(async (user: UserModel) => {
    if (user.password) {
         const salt = await bcrypt.genSalt(10);
         user.password = await bcrypt.hash(user.password, salt);
    }
})