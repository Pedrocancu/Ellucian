import Auth from "../models/Auth";
import { BaseRepository } from "./BaseRepository";

export class AuthRepository extends BaseRepository<Auth> {
  constructor() {
    super(Auth);
  }
}
