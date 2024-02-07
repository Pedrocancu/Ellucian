import { Sequelize } from "sequelize";
import config from "../../app.config";

export class Connection {
  private static instance: Connection | null = null;
  private static connection: Sequelize;

  private static trans: any;
  /* Para evitar que se puedan crear instancias con el "new" */
  private constructor() {
    if (Connection.connection == null) {
      Connection.connection = new Sequelize(
        config.db[config.app.env],
        config.db.user,
        config.db.password,
        {
          dialect: config.db.dialect,
          host: config.db.host,
          logging: config.db.logging,
        }
      );
    }
  }

  public static getConnectionInstance(): Connection {
    if (Connection.instance == null) {
      Connection.instance = new Connection();
    }
    return Connection.instance;
  }

  public getConnection(): Sequelize {
    return Connection.connection;
  }

  public async getTrans() {
    return await Connection.connection.transaction();
  }
}
