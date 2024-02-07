import { Model, ModelStatic } from "sequelize";
import Scope from "../utils/scopes";
import { IParams } from "../utils/Interfaces";
import { Connection } from "../db/Connection";
import tools from "../utils/tools";

export class BaseRepository<T extends Model> {
  protected model;
  private primaryKeyName: string;

  constructor(model: ModelStatic<T>) {
    this.model = model;
    this.primaryKeyName = this.model.primaryKeyAttribute;
  }

  protected async safeRun(method: () => Promise<any>): Promise<any> {
    try {
      return await method();
    } catch (error) {
      throw error;
    }
  }

  public async getAll(params: IParams): Promise<any> {
    return this.safeRun(() => Scope.get(this.model, params));
  }

  public async find(
    key: string,
    value: string | number | Boolean,
    withTrashed?: boolean,
    params?: any
  ): Promise<any> {
    return this.safeRun(() =>
      Scope.get(this.model, {
        ...params,
        page: null,
        perpage: null,
        order: null,
        desc: null,
        search: null,
        scopes: null,
        limit: 1,
        filter: [`${key}:${value}`],
        withtrashed: withTrashed,
      })
    );
  }

  public async findById(
    dataId: number,
    params?: any,
    withTrashed?: boolean
  ): Promise<any> {
    return this.safeRun(() =>
      this.find("id", tools.parseOrZero(dataId), withTrashed, params)
    );
  }

  public async first(): Promise<T> {
    return this.safeRun(() => {
      const params: Object = {
        order: [this.model.primaryKeyAttribute],
      };
      return this.model.findOne(params);
    });
  }

  public async last(): Promise<T> {
    return this.safeRun(() => {
      const params: Object = {
        order: [[this.model.primaryKeyAttribute, "DESC"]],
      };
      return this.model.findOne(params);
    });
  }

  public async create(data: any, trans: any): Promise<T> {
    return this.safeRun(() => this.model.create(data, { transaction: trans }));
  }

  public async update(
    data: any,
    primaryKey: string | number,
    trans: any
  ): Promise<T> {
    return this.safeRun(async () => {
      const dataToUpdate = await this.find(this.primaryKeyName, primaryKey);
      return dataToUpdate.update(data, { transaction: trans });
    });
  }

  public async delete(primaryKey: string | number, trans: any): Promise<T> {
    return this.safeRun(async () => {
      const dataToDelete = await this.find(this.primaryKeyName, primaryKey);
      return dataToDelete.destroy({ transaction: trans });
    });
  }

  public async restore(primaryKey: string | number, trans: any): Promise<T> {
    return this.safeRun(async () => {
      const dataToRestore = await this.find(
        this.primaryKeyName,
        primaryKey,
        true
      );
      return dataToRestore.restore({ transaction: trans });
    });
  }

  public async forceDelete(
    primaryKey: string | number,
    trans: any
  ): Promise<T> {
    return this.safeRun(async () => {
      const dataToForceDelete = await this.find(
        this.primaryKeyName,
        primaryKey,
        true
      );
      return dataToForceDelete.destroy({
        force: true,
        transaction: trans,
      });
    });
  }
}
