import { Request, Response } from "express";
import config from "../../app.config";
import jwt from "jsonwebtoken";
import moment from "moment";
import "moment/locale/es";

class Tool {
  parseOrZero(value: string | number): number {
    if (typeof value == "number") {
      return value;
    }

    const converted = parseInt(value);
    if (isNaN(converted)) {
      return 0;
    }

    return converted;
  }

  setCookie(res: Response, name: string, value: string) {
    res.cookie(name, value, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  getCookies(req: Request) {
    const cookies = req.headers["cookie"];
    if (!cookies) return null;
    return Object.fromEntries(
      cookies.split("; ").map((cookie) => {
        const [name, value] = cookie.split("=");
        return [name, decodeURIComponent(value)];
      })
    );
  }

  getToken(payload: object, expiresIn: number | string): String {
    return jwt.sign(payload, config.auth.secret, {
      expiresIn,
    });
  }

  dateToHuman(date: string): string {
    return moment(date).locale("es").format("DD MMM YYYY, hh:mm:ss A");
  }

  diffDates(start: any, end: any): number {
    start = moment(start);
    end = moment(end);
    return Math.round(moment.duration(end.diff(start)).asDays() * 100) / 100;
  }
  uppercaseFirst(str: string) {
    return `${str[0].toUpperCase()}${str.substring(1)}`;
  }
}

export default new Tool();
