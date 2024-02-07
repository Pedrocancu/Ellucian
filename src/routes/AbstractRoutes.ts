import { Router } from "express";

export default abstract class AbstractRoutes<T> {
  router: Router;
  controller: T;
  abstract initRoutes(): void;
  constructor(router: Router, controller: any) {
    this.router = router;
    this.controller = controller;
  }
}
