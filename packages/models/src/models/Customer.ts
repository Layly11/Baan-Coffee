import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from 'sequelize'

import { sequelize } from '../sequelize'

import bcrypt from 'bcryptjs'

export class CustomersModel extends Model<
    InferAttributes<CustomersModel>,
    InferCreationAttributes<CustomersModel>
> {
    declare id: CreationOptional<number>
    declare name: string
    declare email: string
    declare password: string
    declare phone: string
    declare image_url:  CreationOptional<string | null>
    declare verified: boolean
    declare isDeleted: boolean
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    public async matchPassword(enteredPassword: string): Promise<boolean> {
        if (!this.password) {
            return false;
        }
        return await bcrypt.compare(enteredPassword, this.password);
    }
}

CustomersModel.init(
    {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            field: 'name',
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            field: 'email',
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        password: {

            field: 'password',
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            field: 'phone',
            type: DataTypes.STRING,
            allowNull: false,
        },
         image_url: {
            field: 'image_url',
            type: DataTypes.STRING,
            allowNull: true,
        },
        verified: {
            field: 'verified',
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isDeleted: {
            field: 'is_deleted',
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            field: 'created_at',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            field: 'updated_at',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: 'customers',
        modelName: 'customers',
        timestamps: true,

        hooks: {
            beforeCreate: async (customer: CustomersModel) => {
                if (customer.password) {
                    const salt = await bcrypt.genSalt(10)
                    customer.password = await bcrypt.hash(customer.password, salt)
                }
            },
            beforeUpdate: async (customer: CustomersModel) => {
                if (customer.changed('password')) {
                    const salt = await bcrypt.genSalt(10)
                    customer.password = await bcrypt.hash(customer.password, salt)
                }
            }
        }
    }
)