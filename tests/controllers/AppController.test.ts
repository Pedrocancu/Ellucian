import interceptor from "../interceptor";
import { v2 as cloudinary } from "cloudinary";

describe("Testing functions on app controller", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("It should return signature for cloudinary", async () => {
    const token = `Bearer ${interceptor.getAuthenticated()}`;
    const response = await interceptor
      .getServer()
      .get("/api/app/cloudinary/signature")
      .set("Authorization", token);
    expect(response.status).toEqual(200);
    expect(typeof response.body.content.signature).toEqual("string");
  });

  test("No auth shouldn't get signature", async () => {
    const response = await interceptor
      .getServer()
      .get("/api/app/cloudinary/signature");
    expect(response.status).toEqual(401);
  });

  test("It should catch error 500", async () => {
    const token = `Bearer ${interceptor.getAuthenticated()}`;
    jest.spyOn(cloudinary.utils, "api_sign_request").mockImplementation(() => {
      throw new Error();
    });
    const response = await interceptor
      .getServer()
      .get("/api/app/cloudinary/signature")
      .set("Authorization", token);
    expect(response.status).toEqual(500);
  });
});
