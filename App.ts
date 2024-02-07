import config from "./app.config";
import { App } from "./src/AppInit";
import AppController from "./src/controllers/AppController";
import { AuthController } from "./src/controllers/AuthController";
import response from "./src/utils/response";
const PORT = config.app.port;

const controllers = [new AuthController(), new AppController()];

const app = new App(controllers, PORT);

app.app.use("/api/*", (req: any, res: any) => {
  response.error(res, 404, "Not Found");
});
export default app;
app.listen();
