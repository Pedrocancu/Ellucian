import Auth from "../models/Auth";
import { AuthRepository } from "../repositories/AuthRepository";
import { IParams } from "../utils/Interfaces";
import bcrypt from "bcrypt";
import AuthMailService from "./AuthMailService";
import config from "../../app.config";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Response } from "express";
import tools from "../utils/tools";
import { Connection } from "../db/Connection";
import path from "path";

interface IAuth {
  email: string;
  password: string;
}

export class AuthService {
  private authRepo: AuthRepository = new AuthRepository();
  private authMailService: AuthMailService = new AuthMailService();

  basePath: string = config.app.url;

  async createAuth(auth: IAuth) {
    const trans: any = await Connection.getConnectionInstance().getTrans();
    try {
      const emailExists: any = await this.authRepo.find("email", auth.email);
      if (emailExists) {
        throw {
          code: 422,
          message: "El correo ingresado ya está registrado",
        };
      }
      const hashedPWD = await bcrypt.hash(auth.password, 10);
      const newAuth: Auth = await this.authRepo.create(
        {
          email: auth.email,
          password: hashedPWD,
        },
        trans
      );
      await this.sendConfirmation(auth);
      await trans.commit();
      return newAuth;
    } catch (error: any) {
      await trans.rollback();
      throw { code: error.code, message: error.message };
    }
  }

  async sendConfirmation(auth: any) {
    try {
      auth.confirmURL = `${this.basePath}/api/auth/confirm/${tools.getToken(
        auth,
        600
      )}`;
      auth.logo = this.basePath + "/api/public/logo.png";
      auth.image = this.basePath + "/api/public/signup.svg";
      await this.authMailService.sendConfirmation(auth);
    } catch (error: any) {
      throw {
        code: 500,
        message: error.message,
      };
    }
  }

  async confirmAuth(token: any): Promise<any> {
    return new Promise((res: any, rej: any) => {
      jwt.verify(token, config.auth.secret, async (err: any, decoded: any) => {
        const trans = await Connection.getConnectionInstance().getTrans();
        try {
          const auth: any = await this.authRepo.find("email", decoded.email);
          await this.authRepo.update(
            {
              verified_at: new Date(),
              session_id: uuidv4(),
            },
            auth.id,
            trans
          );
          await trans.commit();
          res(true);
          return;
        } catch (error: any) {
          await trans.rollback();
          rej(false);
          return;
        }
      });
    });
  }

  async login(auth: any, res: Response) {
    const trans = await Connection.getConnectionInstance().getTrans();
    try {
      let userAuth = await this.authRepo.findById(auth.id);

      if (
        userAuth &&
        (await this.validateAuthAccount(userAuth, auth.password))
      ) {
        const updateData = { lastlogin: new Date(), status: 1 };
        await this.authRepo.update(updateData, userAuth.id, trans);
        const { token, refreshToken } = this.generateTokens(userAuth);
        tools.setCookie(res, "refreshToken", `${refreshToken}`);
        tools.setCookie(res, "accessToken", `Bearer ${token}`);
        await trans.commit();
        return { user: userAuth, token };
      }
      throw {
        code: 401,
        message: "Contraseña o Id incorrecto",
      };
    } catch (error: any) {
      await trans.rollback();

      throw { code: error.code, message: error.message };
    }
  }

  public generateTokens(userAuth: any) {
    const token = tools.getToken(userAuth.dataValues, config.auth.expiresIn);
    const refreshToken = tools.getToken(
      { email: userAuth.email },
      7 * 24 * 60 * 60
    );
    return { token, refreshToken };
  }

  private async validateAuthAccount(auth: any, pwd: string): Promise<Boolean> {
    const isValidPassword = await bcrypt.compare(
      pwd,
      auth._previousDataValues.password
    );
    const isAccountVerified = auth.verified_at != null;
    if (!isAccountVerified)
      throw { code: 401, message: "Cuenta no verificada" };
    return isValidPassword;
  }

  public async logout(res: Response) {
    tools.setCookie(res, "accessToken", "null");
  }

  public async logoutAll(req: any, res: Response) {
    const trans = await Connection.getConnectionInstance().getTrans();
    try {
      await this.authRepo.update(
        {
          session_id: uuidv4(),
        },
        req.auth.id,
        trans
      );
      tools.setCookie(res, "accessToken", "null");
      await trans.commit();
    } catch (error: any) {
      await trans.rollback();
      throw {
        code: 500,
        message: error.message,
      };
    }
  }

  public async resetPassword(
    authId: number,
    newPassword: string
  ): Promise<any> {
    const trans = await Connection.getConnectionInstance().getTrans();
    try {
      const hashedPWD = await bcrypt.hash(newPassword, 10);
      const updatedAuth = await this.authRepo.update(
        {
          password: hashedPWD,
        },
        authId,
        trans
      );
      await trans.commit();
      return updatedAuth;
    } catch (error: any) {
      await trans.rollback();
      throw {
        code: 500,
        message: error.message,
      };
    }
  }

  public async sendRecoverLink(authEmail: string): Promise<any> {
    try {
      const token = tools.getToken(
        {
          email: authEmail,
        },
        600
      );
      const context = {
        email: authEmail,
        recoverURL: `${this.basePath}/api/auth/password/recover/${token}`,
      };
      await this.authMailService.sendRecoverLink(context);

      return context;
    } catch (error: any) {
      throw {
        code: 500,
        message: error.message,
      };
    }
  }

  async renderRecoverForm(token: string) {
    try {
      const recover = path.join(config.app.views, "recoverPassword.html");
      jwt.verify(token, config.auth.secret, (err: any, decoded: any) => {
        if (err) {
          throw {
            code: 401,
            message: "El token ya no es válido",
          };
        }
      });
      return recover;
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  async recoverPassword(newData: any): Promise<any> {
    try {
      const decoded: any = jwt.verify(
        newData.token,
        config.auth.secret,
        (err: any, decoded: any) => {
          if (err) {
            throw {
              code: 401,
              message: "El token ya no es válido",
            };
          }
          return decoded;
        }
      );
      const auth = await this.authRepo.find("email", decoded.email);
      await this.resetPassword(auth.id, newData.password);
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  public async refreshToken(req: any, res: Response): Promise<any> {
    try {
      const freshToken = tools.getCookies(req)?.refreshToken || "none";
      const decoded: any = jwt.verify(
        freshToken,
        config.auth.secret,
        (err: any, decoded: any) => {
          if (err) {
            throw {
              code: 401,
              message: "Refresh token expirado o inválido",
            };
          }
          return decoded;
        }
      );
      let userAuth = await this.authRepo.find("email", decoded.email, false);
      const { token, refreshToken } = this.generateTokens(userAuth);
      tools.setCookie(res, "refreshToken", `${refreshToken}`);
      tools.setCookie(res, "accessToken", `Bearer ${token}`);
      return { userAuth, token };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }
}
