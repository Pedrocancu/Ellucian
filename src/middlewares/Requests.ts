import { NextFunction, Request, Response } from "express";
import {
  ValidationChain,
  body,
  param,
  validationResult,
} from "express-validator";
import response from "../utils/response";
import { CGrade, OStatus, OType } from "../utils/Interfaces";
import moment from "moment";
class Requests {
  public validate(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages: any = {};
      Object.values(errors.mapped()).forEach((err: any) => {
        messages[err.path] = err.msg;
      });
      response.error(res, 422, messages);
      return messages;
    }
    next();
  }
  public validateAuthRegister(): Array<ValidationChain> {
    return [
      body("email", "Se requiere un correo electrónico").not().isEmpty(),
      body("email", "El formato del correo no es válido").isEmail(),
      body("password", "Se requiere una contraseña").exists(),
      body("password", "La contraseña debe estar entre 6 y 25").isLength({
        min: 6,
        max: 25,
      }),
    ];
  }

  public validateAuthLogin(): Array<ValidationChain> {
    return [
      body("id", "Debe ingresar su id de login").exists(),
      body("password", "Se requiere una contraseña").exists(),
    ];
  }

  public validatePasswordReset(): Array<ValidationChain> {
    return [
      body("password", "Se requiere la nueva contraseña").notEmpty(),
      body("password", "La contraseña debe estar entre 6 y 25").isLength({
        min: 6,
        max: 25,
      }),
      body("password_confirmation", "Se requiere la confirmación").notEmpty(),
      body("password_confirmation", "Las contraseñas no coinciden").custom(
        (value, { req }) => {
          return value === req.body.password;
        }
      ),
    ];
  }

  public validateRecoverEmail(): Array<ValidationChain> {
    return [
      body("email", "Se requiere el correo electrónico").notEmpty(),
      body("email", "El formato del correo no es válido").isEmail(),
    ];
  }
  public validateRecoverPassword(): Array<ValidationChain> {
    return [
      ...this.validatePasswordReset(),
      body("token", "Se requiere el token de validación").notEmpty(),
    ];
  }
}

export default new Requests();
