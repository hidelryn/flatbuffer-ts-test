import express from "express";
import * as flatbuffers from "flatbuffers";
import { UserSave, Users, GetUsers } from "./db";
import { ReqUser } from "./flat-buffer/users/req-user";
import { ResUser } from "./flat-buffer/users/res-user";
import { ResUserList } from "./flat-buffer/users/res-user-list";
import bodyParser from "body-parser";
import { Gender } from "./flat-buffer/users/gender";
import { Phone } from "./flat-buffer/users/phone";

const app = express();
app.use(bodyParser.raw());
const PORT = 3000;

app.post("/save", async (req: express.Request, res: express.Response) => {
  let byte = new Uint8Array(req.body);
  let buf = new flatbuffers.ByteBuffer(byte);
  let params = ReqUser.getRootAsReqUser(buf);
  try {
    let id = await UserSave(params);
    let result = userFB(params, id);
    res.end(Buffer.from(result));
  } catch (err) {
    res.send(err);
  }
});

app.post(
  "/findAll",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let queryResults = await GetUsers();
      let results = userListFB(queryResults);
      res.end(Buffer.from(results));
    } catch (err) {
      console.log(err)
      res.send(err);
    }
  }
);

function userListFB(users: Users[]) {
  let builder = new flatbuffers.Builder();
  let userEndList: number[] = [];
  users.forEach((user) => {
    let name = builder.createString(user.name);
    ResUser.startResUser(builder);
    ResUser.addId(builder, user.id);
    ResUser.addCreateAt(builder, BigInt(user.create_at));
    ResUser.addGender(
      builder,
      user.gender === 0 ? Gender.male : Gender.female
    );
    ResUser.addName(builder, name);
    ResUser.addPhone(
      builder,
      Phone.createPhone(
        builder,
        user.first_phone_number,
        user.second_phone_number,
        user.third_phone_number
      )
    );
    let resUserEnd = ResUser.endResUser(builder);
    userEndList.push(resUserEnd);
  });
  let userVectorEnd = ResUserList.createUsersVector(builder, userEndList);
  ResUserList.startResUserList(builder);
  ResUserList.addUsers(builder, userVectorEnd);
  let end = ResUserList.endResUserList(builder);

  builder.finish(end);
  let result = builder.asUint8Array();

  return result;
}

function userFB(params: ReqUser, id: number): Uint8Array {
  let builder = new flatbuffers.Builder();
  let myName = builder.createString(params.name());
  ResUser.startResUser(builder);
  ResUser.addId(builder, id);
  ResUser.addCreateAt(builder, BigInt(new Date().getTime()));
  ResUser.addGender(
    builder,
    params.gender() === 0 ? Gender.male : Gender.female
  );
  ResUser.addName(builder, myName);
  ResUser.addPhone(
    builder,
    Phone.createPhone(
      builder,
      params.phone()?.first() || 0,
      params.phone()?.second() || 0,
      params.phone()?.third() || 0
    )
  );
  let end = ResUser.endResUser(builder);
  builder.finish(end);
  let result = builder.asUint8Array();

  return result;
}

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
