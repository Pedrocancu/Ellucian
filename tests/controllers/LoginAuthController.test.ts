import interceptor from "../interceptor";
import { AuthRepository } from "../../src/repositories/AuthRepository";
describe("Testing login functions", () => {
  const auth = {
    id: 100036693,
    email: "100036693@p.uapa.edu.do",
    password: "user1234",
  };
  const authenticated = {
    id: 100038013,
    email: "100038013@p.uapa.edu.do",
    session_id: null,
  };
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("It should login auth", async () => {
    const response = await interceptor
      .getServer()
      .post("/api/auth/login")
      .send(auth);
    expect(response.status).toEqual(200);
    expect(response.body.content).toHaveProperty("token");
    expect(response.headers["set-cookie"].length).toEqual(2);
  });

  test("It must dectect invalid id", async () => {
    const response = await interceptor
      .getServer()
      .post("/api/auth/login")
      .send({ ...auth, id: 23254565 });
    expect(response.status).toEqual(401);
    expect(response.body.content).toContain("Correo");
  });
  test("It must dectect invalid password", async () => {
    const response = await interceptor
      .getServer()
      .post("/api/auth/login")
      .send({ ...auth, password: "wrongpassword" });
    expect(response.status).toEqual(401);
    expect(response.body.content).toContain("Contraseña");
  });

  test("It must dectect unverified auth", async () => {
    const response = await interceptor
      .getServer()
      .post("/api/auth/login")
      .send({ id: 100039838, password: "user1234" });
    expect(response.status).toEqual(401);
    expect(response.body.content).toContain("Cuenta no verificada");
  });

  test("It must catch unknown errors", async () => {
    jest
      .spyOn(AuthRepository.prototype, "find")
      .mockRejectedValue({ message: "Error from mock" });
    const response = await interceptor
      .getServer()
      .post("/api/auth/login")
      .send({ id: 100036693, password: "client11234" });
    expect(response.status).toEqual(500);
  });

  test("It must logout auth", async () => {
    const token = `Bearer ${interceptor.getAuthenticated(
      false,
      authenticated
    )}`;
    const response = await interceptor
      .getServer()
      .post("/api/auth/logout")
      .set("Authorization", token);
    expect(response.status).toEqual(200);
  });

  test("It should catch error on logout all", async () => {
    jest
      .spyOn(AuthRepository.prototype, "update")
      .mockRejectedValue({ message: "Error from mock" });

    const token = `Bearer ${interceptor.getAuthenticated(
      false,
      authenticated
    )}`;
    const response = await interceptor
      .getServer()
      .post("/api/auth/logout/all")
      .set("Authorization", token);
    expect(response.status).toEqual(500);
  });

  test("It must logout all auth", async () => {
    const token = `Bearer ${interceptor.getAuthenticated(
      false,
      authenticated
    )}`;
    const response = await interceptor
      .getServer()
      .post("/api/auth/logout/all")
      .set("Authorization", token);

    expect(response.status).toEqual(200);
  });
});
