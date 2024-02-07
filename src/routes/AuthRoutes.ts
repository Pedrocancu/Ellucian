import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import AbstractRoutes from "./AbstractRoutes";
import Requests from "../middlewares/Requests";
import { AuthController } from "../controllers/AuthController";

export default class AuthRoutes extends AbstractRoutes<AuthController> {
  constructor(router: Router, controller: AuthController) {
    super(router, controller);
  }

  public initRoutes() {
    this.router.post(
      "/register",
      AuthMiddleware.isUniqueEmail(),
      Requests.validateAuthRegister(),
      Requests.validate,
      (req: any, res: any) => this.controller.registerAuth(req, res)
    );
    this.router.get("/confirm/:token", (req: any, res: any) =>
      this.controller.confirmAuth(req, res)
    );
    this.router.post(
      "/login",
      Requests.validateAuthLogin(),
      Requests.validate,
      (req: any, res: any) => this.controller.loginAuth(req, res)
    );
    this.router.post(
      "/refreshtoken",

      (req: any, res: any) => this.controller.refreshToken(req, res)
    );
    this.router.post("/logout", AuthMiddleware.auth, (req: any, res: any) =>
      this.controller.logoutAuth(req, res)
    );
    this.router.post("/logout/all", AuthMiddleware.auth, (req: any, res: any) =>
      this.controller.logoutAllAuth(req, res)
    );
    this.router.put(
      "/password/reset",
      AuthMiddleware.auth,
      Requests.validatePasswordReset(),
      Requests.validate,
      (req: any, res: any) => this.controller.resetPassword(req, res)
    );

    this.router.post(
      "/password/recover",
      Requests.validateRecoverEmail(),
      Requests.validate,
      AuthMiddleware.emailExists,
      (req: any, res: any) => this.controller.sendRecoverLink(req, res)
    );

    this.router.get("/password/recover/:token", (req: any, res: any) =>
      this.controller.renderRecoverForm(req, res)
    );

    this.router.put(
      "/password/recover",
      Requests.validateRecoverPassword(),
      Requests.validate,
      (req: any, res: any) => this.controller.recoverPassword(req, res)
    );
  }
}
