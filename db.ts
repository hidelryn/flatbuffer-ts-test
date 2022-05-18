import {
  createConnection,
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
} from "mysql2/promise";

import { ReqUser } from "./flat-buffer/users/req-user";

async function dbConn() {
  try {
    const connection = await createConnection({
      host: "localhost",
      user: "root",
      database: "test",
    });

    return connection;
  } catch (err) {
    throw err;
  }
}

export async function UserSave(params: ReqUser): Promise<number> {
  try {
    let connection = await dbConn();

    let [result, _]: [ResultSetHeader, FieldPacket[]] =
      await connection.execute(
        `insert into fbs_users(name, gender, first_phone_number,
          second_phone_number, third_phone_number, create_at)
        values (?, ?, ?, ?, ?, ?);`,
        [
          params.name(),
          params.gender(),
          params.phone()?.first(),
          params.phone()?.second(),
          params.phone()?.third(),
          new Date().getTime(),
        ]
      );

    return result.insertId;
  } catch (err) {
    throw err;
  }
}

export interface Users extends RowDataPacket {
  id: number;
  name: string;
  gender: number;
  first_phone_number: number;
  second_phone_number: number;
  third_phone_number: number;
  create_at: number;
}

export async function GetUsers() {
  try {
    let connection = await dbConn();
    let [results, _]: [Users[], FieldPacket[]] = await connection.query(
      `select * from fbs_users;`
    );
    
    return results;
    
  } catch (err) {
    throw err;
  }
}
