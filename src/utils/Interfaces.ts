export interface IParams {
  limit?: number;
  search?: string;
  order?: string;
  desc?: boolean;
  filter?: string[];
  include?: string;
  page?: number;
  perpage?: number;
  fields?: string;
  scopes?: string;
  withtrashed?: boolean;
  onlytrashed?: boolean;
  op?: string;
}

export interface IUser {
  id?: number;
  name: string;
  email: string;
  lastname: string;
  phone: string;
  address: string;
  institute_id?: number;
  auth_id?: number;
  career_id?: number;
}
export interface IInstitute {
  name: string;
  sigla: string;
}

export interface IImage {
  url: string;
  caption: string;
  imageableId?: number;
  imageableType?: string;
}

export enum CGrade {
  pregrade = "Pregrado",
  grade = "Grado",
  master = "Mastería",
  doctor = "Doctorado",
  diplome = "Diplomado",
  other = "Otro",
}

export interface ICareer {
  name: string;
  sigla: string;
  grade: CGrade;
}

export enum OStatus {
  pending = "Pendiente",
  process = "Proceso",
  refused = "Rechazado",
  completed = "Completado",
  canceled = "Cancelado",
}

export enum OType {
  tarea = "Tarea",
  tesis = "Tesis",
  mono = "Monográfico",
  tesina = "Tesina",
  proyecto = "Proyecto",
  otro = "Otro",
}
export interface IOrder {
  title: string;
  description: string;
  due_at: string;
  done_at?: string;
  price?: number;
  status: OStatus;
  type: OType;
  client_id: number;
  tasks: Array<ITask>;
}

export interface ITask {
  title: string;
  due_at: string;
  order_id?: number;
}
