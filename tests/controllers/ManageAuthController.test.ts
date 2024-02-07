import path from "path";
import { AuthRepository } from "../../src/repositories/AuthRepository";
import AuthMailService from "../../src/services/AuthMailService";
import tools from "../../src/utils/tools";
import interceptor from "../interceptor";

describe("Testing manage auth account", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  const auth = {
    id: 100035685,
    email: "100035685@p.uapa.edu.do",
    session_id: null,
  };

  const newPassword = {
    password: "newPassword1234",
    password_confirmation: "newPassword1234",
  };
  test("It should change password", async () => {
    const token = `Bearer ${interceptor.getAuthenticated(true, auth)}`;
    const response = await interceptor
      .getServer()
      .put("/api/auth/password/reset")
      .set("Authorization", token)
      .send(newPassword);
    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual("Contraseña actualizada");
  });

  test("It should catch error 500 on change password", async () => {
    const token = `Bearer ${interceptor.getAuthenticated(true, {
      id: 100039160,
      email: "100039160@p.uapa.edu.do",
      session_id: null,
    })}`;
    jest.spyOn(AuthRepository.prototype, "update").mockRejectedValue({});
    const response = await interceptor
      .getServer()
      .put("/api/auth/password/reset")
      .set("Authorization", token)
      .send(newPassword);
    expect(response.status).toEqual(500);
  });

  test("It should catch error 422 on change password", async () => {
    const token = `Bearer ${interceptor.getAuthenticated(true, {
      id: 100039160,
      email: "100039160@p.uapa.edu.do",
      session_id: null,
    })}`;
    jest.spyOn(AuthRepository.prototype, "update").mockRejectedValue({});
    const response = await interceptor
      .getServer()
      .put("/api/auth/password/reset")
      .set("Authorization", token)
      .send({ password: "password", password_confirmation: "password1" });
    expect(response.status).toEqual(422);
  });

  test("It should send recover link", async () => {
    const body = { email: "100036693@p.uapa.edu.do" };
    const response = await interceptor
      .getServer()
      .post("/api/auth/password/recover")
      .send(body);
    expect(response.status).toEqual(200);
  });

  test("It should catch error 500 on send recover link", async () => {
    const body = { email: "100036693@p.uapa.edu.do" };
    jest
      .spyOn(AuthMailService.prototype, "sendRecoverLink")
      .mockRejectedValue({});
    const response = await interceptor
      .getServer()
      .post("/api/auth/password/recover")
      .send(body);
    expect(response.status).toEqual(500);
  });

  test("It should render recover form", async () => {
    const body = { email: "admin@atriontechsd.com" };
    const token = tools.getToken(body, 720);

    const response = await interceptor
      .getServer()
      .get(`/api/auth/password/recover/${token}`);
    expect(response.status).toEqual(200);
  });

  test("It should catch error 401 on render recover form", async () => {
    const response = await interceptor
      .getServer()
      .get(`/api/auth/password/recover/bad`);
    expect(response.status).toEqual(401);
  });

  test("It should recover password", async () => {
    const token = tools.getToken({ email: "100036693@p.uapa.edu.do" }, 60);
    const body = {
      token,
      password: "admin1234",
      password_confirmation: "admin1234",
    };

    const response = await interceptor
      .getServer()
      .put("/api/auth/password/recover")
      .send(body);
    expect(response.status).toEqual(200);
  });

  test("It should catch error 500 recover password", async () => {
    const token = tools.getToken({ email: "100036693@p.uapa.edu.do" }, 60);
    const body = {
      token,
      password: "password123",
      password_confirmation: "password123",
    };
    jest.spyOn(AuthRepository.prototype, "update").mockRejectedValue({});

    const response = await interceptor
      .getServer()
      .put("/api/auth/password/recover")
      .send(body);
    expect(response.status).toEqual(500);
  });

  test("It should catch invalid token recover password", async () => {
    const token = tools.getToken({ email: "100036693@p.uapa.edu.do" }, 0);
    const body = {
      token,
      password: "password123",
      password_confirmation: "password123",
    };

    const response = await interceptor
      .getServer()
      .put("/api/auth/password/recover")
      .send(body);
    expect(response.status).toEqual(401);
  });
});
