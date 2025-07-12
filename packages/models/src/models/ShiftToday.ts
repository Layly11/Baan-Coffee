import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey
} from 'sequelize';

import { sequelize } from '../sequelize';
import { DailySummaryModel } from './DailySummary';


export class ShiftTodayModel extends Model<
    InferAttributes<ShiftTodayModel>,
    InferCreationAttributes<ShiftTodayModel>
> {
    declare id: CreationOptional<number>;
    declare summary_id: ForeignKey<DailySummaryModel['id']>;
    declare employee_name: string;
    declare role: string;
    declare start_time: string;
    declare end_time: string;
    declare status: 'checked_in' | 'late' | 'absent';
    declare note: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ShiftTodayModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        summary_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'daily_summary',
                key: 'id',
            },
        },
        employee_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        end_time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('checked_in', 'late', 'absent'),
            allowNull: false
        },
        note: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            field: 'created_at',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            field: 'updated_at',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'shift_today',
        modelName: 'shift_today',
        timestamps: true,
        underscored: true
    }
);
