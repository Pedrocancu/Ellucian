import { Model, ModelStatic, Op } from "sequelize";
import { IParams } from "./Interfaces";
import tools from "./tools";

class Scope {
  inclusiones: any = null;

  operators: any = {
    eq: Op.eq,
    ne: Op.ne,
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    and: Op.and,
    or: Op.or,
    bet: Op.between,
  };
  paginate(perPage: number, page: number): object {
    const startIndex: number = (page - 1) * perPage;
    const pagination: object = {
      offset: tools.parseOrZero(startIndex),
      limit: tools.parseOrZero(perPage),
    };
    return pagination;
  }

  limit(limit: number): object {
    return { limit: tools.parseOrZero(limit) };
  }

  search(search: string, cols: Array<string>): object {
    if (cols.length > 0) {
      return {
        [Op.or]: cols.map((col) => {
          return {
            [col]: {
              [Op.like]: `%${search}%`,
            },
          };
        }),
      };
    }
    return {};
  }

  fields(fields: string, cols: Array<string>): Object {
    let selections = fields.split(",");
    selections = selections.filter((sel) => cols.includes(sel) || sel == "id");
    if (selections.length > 0) {
      return { attributes: selections };
    } else {
      return {};
    }
  }

  //Filter format fied:op:value:union
  filter(filter: Array<string>, cols: Array<string>): object {
    let filtered: any = {};
    const and: any = [];
    const or: any = [];
    const conditions: any = {};
    if (!Array.isArray(filter)) return {};
    filter.forEach((f) => {
      const parts: Array<string> = f.split(":");

      if (parts.length === 2 && (cols.includes(parts[0]) || parts[0] == "id")) {
        conditions[parts[0]] = parts[1];
      } else if (
        parts.length === 3 &&
        (cols.includes(parts[0]) || parts[0] == "id") &&
        Object.keys(this.operators).includes(parts[1])
      ) {
        conditions[parts[0]] = {
          [this.operators[parts[1]]]: parts[2].split("."),
        };
      } else if (
        parts.length === 4 &&
        (cols.includes(parts[0]) || parts[0] == "id") &&
        Object.keys(this.operators).includes(parts[1])
      ) {
        const filt = {
          [parts[0]]: { [this.operators[parts[1]]]: parts[2] },
        };
        if (parts[3] == "or") {
          or.push(filt);
        } else {
          and.push(filt);
        }
      } else {
        return;
      }
    });

    filtered = conditions;
    if (and.length > 0) {
      filtered[Op.and] = and;
    }
    if (or.length > 0) {
      filtered[Op.or] = or;
    }
    return filtered;
  }

  include<T extends typeof Model<any, any>>(
    includes: string,
    model: T
  ): object {
    let included = {};
    const associations = new (model as any)().getRelations();
    let inclusions: Array<any> = includes.split(",");
    inclusions = inclusions.filter((i) =>
      associations.find((ass: string) => ass == i)
    );

    inclusions.forEach((incl, key) => {
      if (incl.includes(".")) {
        inclusions[key] = this.recursiveInclude(incl.split("."), 0);
      }
    });
    included = {
      include: inclusions,
    };
    return included;
  }

  recursiveInclude(incl: Array<any>, level: number): any {
    if (level >= incl.length - 1) return { association: incl[level] };
    return {
      association: incl[level],
      include: this.recursiveInclude(incl, level + 1),
    };
  }

  order(cols: string[], field: string, desc?: Boolean): object {
    desc = desc?.toString().toLowerCase() == "true";
    if (cols.includes(field)) {
      if (Boolean(desc)) {
        return { order: [[field, "DESC"]] };
      }
      return { order: [field] };
    }
    return {};
  }

  withTrashed(paranoid: boolean | string): object {
    return {
      paranoid: paranoid != "true" && paranoid != true,
    };
  }

  onlyTrashed(trashed: boolean | string): object {
    if (trashed == true || trashed == "true") {
      return {
        [Op.and]: {
          deletedAt: {
            [Op.not]: null,
          },
        },
      };
    }
    return {};
  }

  withScopes(scopes: string, modelScopes: Array<String>): Array<string> {
    return scopes.split(",").filter((scope) => modelScopes.includes(scope));
  }

  getPaginationProps(page: number, perpage: number, result: any): object {
    const lastPage = Math.ceil(result.count / perpage);

    return {
      ...result,
      lastPage,
      nextPage: page < lastPage ? Number(page) + 1 : null,
      prevPage: page > 1 ? Number(page) - 1 : null,
      currentPage: Number(page),
    };
  }

  getQuery<T extends Model<any, any>>(
    params: IParams,
    cols: Array<string>,
    model: ModelStatic<T>
  ): Object {
    const fields = Object.keys(model.getAttributes());
    if (!params.page && (!params.limit || params.limit > 1000)) {
      params.limit === 1000;
    }
    const query: any = {
      ...(params.page && params.perpage
        ? this.paginate(params.perpage, params.page)
        : {}),

      ...(params.include ? this.include(params.include, model) : {}),
      ...(params.limit ? this.limit(params.limit) : {}),
      ...(params.fields ? this.fields(params.fields, fields) : {}),
      ...(params.order ? this.order(cols, params.order, params.desc) : {}),
      ...(params.withtrashed ? this.withTrashed(params.withtrashed) : {}),
    };

    query.where = {
      ...(params.search ? this.search(params.search, cols) : {}),
      [Op.and]: params.filter ? this.filter(params.filter, cols) : [],
      ...(params.onlytrashed ? this.onlyTrashed(params.onlytrashed) : {}),
    };
    return query;
  }
  private loadScopes<T extends Model>(
    model: ModelStatic<T>,
    params: IParams
  ): ModelStatic<T> {
    const modelScopes = model.options.scopes;
    if (params.scopes && modelScopes) {
      const scopes = Object.keys(modelScopes);
      model = model.scope(this.withScopes(params.scopes, scopes));
    }
    return model;
  }

  private async loadResults<T extends Model>(
    model: ModelStatic<T>,
    params: IParams,
    args: any
  ): Promise<any> {
    let result = null;
    if (params.limit && params.limit == 1) {
      result = await model.findOne(args);
    } else {
      result = await model.findAndCountAll(args);
    }
    if (params.page && params.perpage) {
      result = this.getPaginationProps(params.page, params.perpage, result);
    }
    return result;
  }
  async get<T extends Model>(
    model: ModelStatic<T>,
    params: IParams
  ): Promise<any> {
    const cols = new (model as any)().getSearchables();
    const args = this.getQuery(params, cols, model);
    model = this.loadScopes(model, params);

    const result = this.loadResults(model, params, args);

    return result;
  }
}

export default new Scope();
