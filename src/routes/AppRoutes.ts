import { Router } from "express";
import AbstractRoutes from "./AbstractRoutes";
import AppController from "../controllers/AppController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

export default class AppRoutes extends AbstractRoutes<AppController> {
  constructor(router: Router, controller: AppController) {
    super(router, controller);
  }

  initRoutes(): void {
    this.router.get(
      "/cloudinary/signature",
      AuthMiddleware.auth,
      (req: any, res: any) => {
        this.controller.getCloudSignature(req, res);
      }
    );
  }
}
