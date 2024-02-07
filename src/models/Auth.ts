import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { Connection } from "../db/Connection";
import { IModel } from "./IModel";

class Auth
  extends Model<InferAttributes<Auth>, InferCreationAttributes<Auth>>
  implements IModel
{
  declare id: number;
  declare email: string;
  declare password: string;
  declare lastlogin: string;
  declare session_id: string;
  declare status: number;
  declare verified_at: string;
  declare createdAt: string;
  declare updatedAt: string;
  declare deletedAt: string;

  getSearchables() {
    return ["email", "last_login", "verified_at", "status"];
  }
  /* istanbul ignore next */
  getRelations() {
    return [];
  }
}

const connection = Connection.getConnectionInstance();

Auth.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return null;
      },
    },
    lastlogin: {
      type: DataTypes.DATE,
    },

    session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: connection.getConnection(),
    tableName: "auths",
    modelName: "Auth",
    paranoid: true,
  }
);

export default Auth;
