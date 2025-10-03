import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  CreateOptions
} from 'sequelize'

import { sequelize } from '../sequelize'

export class AuditLogModel extends Model<
InferAttributes<AuditLogModel>,
InferCreationAttributes<AuditLogModel>
> {
  declare id: CreationOptional<number>
  declare source_type: string
  declare menu: string
  declare destination_type: CreationOptional<string>
  declare editor_name: CreationOptional<string>
  declare editor_role: CreationOptional<string>
  declare target_name: CreationOptional<string>
  declare action: string
  declare detail: CreationOptional<string>
  declare event_date_time: CreateOptions<Date>
  declare staff_id: CreateOptions<string>
  declare staff_email: CreateOptions<string>
  declare channel: CreateOptions<string>
  declare search_criteria: CreateOptions<string>
  declare previous_values: CreateOptions<string>
  declare new_values: CreateOptions<string>
  declare record_key_values: CreateOptions<string>
  declare is_pii: CreateOptions<string>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

AuditLogModel.init(
  {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    source_type: {
      field: 'source_type',
      type: DataTypes.STRING(45),
      allowNull: true
    },
    menu: {
      field: 'menu',
      type: DataTypes.STRING(45),
      allowNull: true
    },
    destination_type: {
      field: 'destination_type',
      type: DataTypes.STRING(45),
      allowNull: true
    },
    editor_name: {
      field: 'editor_name',
      type: DataTypes.STRING(255),
      allowNull: true
    },
    editor_role: {
      field: 'editor_role',
      type: DataTypes.STRING(255),
      allowNull: true
    },
    target_name: {
      field: 'target_name',
      type: DataTypes.STRING(255),
      allowNull: true
    },
    action: {
      field: 'action',
      type: DataTypes.STRING(45),
      allowNull: true
    },
    detail: {
      field: 'detail',
      type: DataTypes.TEXT,
      allowNull: true
    },
    event_date_time: {
      type: DataTypes.DATE(),
      allowNull: true
    },
    staff_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    staff_email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    channel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    search_criteria: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previous_values: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    new_values: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    record_key_values: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_pii: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'audit_log',
    tableName: 'audit_log', 
    underscored: true
  }
)
