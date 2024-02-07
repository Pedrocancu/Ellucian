import jwt from "jsonwebtoken";
import config from "../../app.config";
import express from "express";
import AuthMiddleware from "../../src/middlewares/AuthMiddleware";
import interceptor from "../interceptor";
import tools from "../../src/utils/tools";
import { AuthRepository } from "../../src/repositories/AuthRepository";

const setToken = (payload: object): string => {
  return jwt.sign(payload, config.auth.secret);
};
const res = interceptor.mockResponse();
const req = express.request;

describe("Testing Authmiddleware", () => {
  afterEach(() => {
    req.headers.authorization = undefined;
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });
  test("It should pass auth middleware", async () => {
    const auth = {
      id: 100036693,
      email: "100036693@p.uapa.edu.do",
      session_id: null,
    };
    req.headers.authorization = "Bearer " + setToken(auth);
    const next = jest.fn();

    await AuthMiddleware.auth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("It should catch if token is missing", async () => {
    const next = jest.fn();
    req.cookies = {};
    await AuthMiddleware.auth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("It should catch if session_id is wrong", async () => {
    const auth = {
      id: 100036693,
      email: "100036693@p.uapa.edu.do",
      session_id: 1,
    };
    req.headers.authorization = "Bearer " + setToken(auth);
    const next = jest.fn();

    await AuthMiddleware.auth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("It should catch if token is wrong", async () => {
    const next = jest.fn();

    req.headers.authorization = "Bearer ";
    await AuthMiddleware.auth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("It should validate on existing email", async () => {
    const next = jest.fn();
    const req = {
      body: { email: "100036693@p.uapa.edu.do" },
    };

    await AuthMiddleware.emailExists(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("It should validate not existing email", async () => {
    const next = jest.fn();
    const req = {
      body: { email: "wrongemail@example.com" },
    };

    await AuthMiddleware.emailExists(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      content: "Este correo no tiene ninguna cuenta asociada",
    });
  });

  test("It should catch error 500 on emailsExist middlw", async () => {
    const next = jest.fn();
    const req = {
      body: { email: "wrongemail@example.com" },
    };
    jest.spyOn(AuthRepository.prototype, "find").mockRejectedValue({});

    await AuthMiddleware.emailExists(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      content: undefined,
    });
  });

  it("It should refresh token", async () => {
    const auth = {
      id: 100036693,
      email: "100036693@p.uapa.edu.do",
      session_id: null,
    };
    const token = tools.getToken(auth, -1);
    const refreshToken = tools.getToken(auth, 72000);
    const response = await interceptor
      .getServer()
      .post("/api/auth/refreshtoken")
      .set("Cookie", `accessToken=${token}; refreshToken=${refreshToken}`);
    expect(response.status).toEqual(200);
  });

  it("It should catch error 401 on refresh token", async () => {
    const response = await interceptor
      .getServer()
      .post("/api/auth/refreshtoken");
    expect(response.status).toEqual(401);
  });
});
