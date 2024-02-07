import Auth from "../../src/models/Auth";
import scopes from "../../src/utils/scopes";
import Scope from "../../src/utils/scopes";

describe("Test scope functions", () => {
  test("It should return pagination object", () => {
    const pagination: any = Scope.paginate(10, 2);
    expect(typeof pagination).toBe("object");
    expect(pagination.offset).toEqual(10);
    expect(pagination.limit).toEqual(10);
  });

  test("It should return limit object", () => {
    const limitation: any = Scope.limit(5);
    expect(limitation.limit).toEqual(5);
  });

  test("It should return search for Auth", () => {
    let cols = ["email", "name"];
    const search = "com";
    let searching: any = Scope.search(search, cols);
    expect(Reflect.ownKeys(searching).length).toBeGreaterThan(0);
    cols = [];
    searching = Scope.search(search, cols);
    expect(Reflect.ownKeys(searching).length).toBe(0);
  });

  test("It should return fields attributes", () => {
    let cols = ["email", "id"];
    interface iSelection {
      attributes?: Array<string>;
    }
    let selections: iSelection = Scope.fields("id,email, name", cols);
    expect(selections.attributes).toBeDefined();
    selections = Scope.fields("name, age", cols);
    expect(selections.attributes).not.toBeDefined();
  });

  test("It should return filter", () => {
    interface iFilter {
      id?: number;
    }
    let filters = ["id:71", "name"];
    let cols = ["email", "id"];
    let filtered: iFilter = Scope.filter(filters, cols);
    expect(Object.keys(filtered).length).toBeGreaterThan(0);
    filters = ["name:Pedro"];
    filtered = Scope.filter(filters, cols);
    expect(Object.keys(filtered).length).toEqual(0);
  });

  test("It should return include", () => {
    interface iInclude {
      include?: Array<string>;
    }
    const include = "product,role.auths";
    const included: iInclude = Scope.include(include, Auth);
    expect(included.include?.length).toEqual(0);
  });

  test("It should order field", () => {
    const cols = ["email", "id"];
    let ordered: any = Scope.order(cols, "email");
    expect(ordered.order).toBeDefined();
    expect(ordered.order.length).toEqual(1);
    ordered = Scope.order(cols, "email", true);
    expect(ordered.order).toBeDefined();
    expect(ordered.order[0].length).toEqual(2);
    ordered = Scope.order(cols, "name", true);
    expect(ordered.order).not.toBeDefined();
  });

  test("It should return paranoid true", () => {
    const result: any = Scope.withTrashed(true);
    expect(result.paranoid).toEqual(false);
  });

  test("It should return scopes filtereds", () => {
    const fakeScopes = "active,deleted,old";
    const modelScopes = ["deleted"];
    const filtered = Scope.withScopes(fakeScopes, modelScopes);
    expect(filtered).toEqual(["deleted"]);
  });

  test("It should get query", async () => {
    const params = {
      page: 1,
      perpage: 10,
      search: "com",
      filter: ["id:2"],
      include: "product",
      limit: 2,
      fields: "email,name",
      order: "email",
      desc: true,
      scopes: "checkOrder",
    };

    const expectedKeys = [
      "offset",
      "limit",
      "include",
      "attributes",
      "order",
      "where",
    ];
    const cols = ["id", "email"];
    let query: any = Scope.getQuery(params, cols, Auth);
    expect(Object.keys(query).length).toBeGreaterThan(0);
    expect(Object.keys(query)).toEqual(expectedKeys);
    expect(query.offset).toEqual(0);
    expect(query.limit).toEqual(2);
    expect(query.order[0]).toEqual(["email", "DESC"]);
  });

  test("It should return pagination object with props", () => {
    const result = {
      count: 100,
      rows: [],
    };

    const pagination: any = scopes.getPaginationProps(5, 10, result);
    expect(pagination.lastPage).toEqual(10);
    expect(pagination.nextPage).toEqual(6);
    expect(pagination.prevPage).toEqual(4);
    expect(pagination.currentPage).toEqual(5);
  });
});
