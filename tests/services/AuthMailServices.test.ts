import config from "../../app.config";
import AuthMailService from "../../src/services/AuthMailService";
import jwt from "jsonwebtoken";
import tools from "../../src/utils/tools";

describe("Test auth email service", () => {
  const basePath = config.app.url;

  const user = {
    id: 1,
    email: "dev@atriontechsd.com",
    confirmURL: "",
    logo: basePath + "/logo.png",
    image: basePath + "/signup.svg",
  };
  user.confirmURL = `${basePath}/api/auth/confirm/` + tools.getToken(user, 360);
  const authEmailService = new AuthMailService();

  test("It should send confirmation email", async () => {
    const res: any = await authEmailService.sendConfirmation(user);
    expect(res.accepted.length).toBeGreaterThan(0);
  });

  it("Should catch error on sending message", async () => {
    let err;
    try {
      await authEmailService.sendConfirmation({
        ...user,
        email: "wrongemail",
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });
});
