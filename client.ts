import * as flatbuffers from "flatbuffers";
import axios from "axios";
import { ReqUser } from "./flat-buffer/users/req-user";
import { Gender } from "./flat-buffer/users/gender";
import { Phone } from "./flat-buffer/users/phone";
import { ResUser } from "./flat-buffer/users/res-user";
import crypto from "crypto";
import { ResUserList } from "./flat-buffer/users/res-user-list";

let builder = new flatbuffers.Builder();
let myName = builder.createString(crypto.randomUUID());
ReqUser.startReqUser(builder);
ReqUser.addName(builder, myName);
ReqUser.addGender(
  builder,
  Math.round(Math.random()) === 0 ? Gender.female : Gender.male
);
ReqUser.addPhone(
  builder,
  Phone.createPhone(builder, 8210, getRandom(3), getRandom(4))
);
let end = ReqUser.endReqUser(builder);
builder.finish(end);

let ab = builder.asUint8Array();
let buf = Buffer.from(ab);

// save();
allUsers();

async function save() {
  try {
    const { data } = await axios({
      method: "post",
      url: "http://localhost:3000/save",
      data: buf,
      headers: { "Content-Type": "application/octet-stream" },
      responseType: "arraybuffer",
    });

    let byte = new Uint8Array(data);
    let resBuf = new flatbuffers.ByteBuffer(byte);
    let result = ResUser.getRootAsResUser(resBuf);

    console.log("result.id", result.id());
    console.log("result.name", result.name());
    console.log(
      "result.phone",
      result.phone()?.first() +
        "-" +
        result.phone()?.second() +
        "-" +
        result.phone()?.third()
    );
    console.log("result.create_at", Number(result.createAt()));
  } catch (err) {
    console.log(err);
  }
}

async function allUsers() {
  try {
    const { data } = await axios({
      method: "post",
      url: "http://localhost:3000/findAll",
    //   data: buf,
      headers: { "Content-Type": "application/octet-stream" },
      responseType: "arraybuffer",
    });

    let byte = new Uint8Array(data);
    let resBuf = new flatbuffers.ByteBuffer(byte);
    let results = ResUserList.getRootAsResUserList(resBuf);

    console.log('len', results.usersLength())
    for (let i = 0; i < results.usersLength(); i++) {
      let result = results.users(i);
      console.log("result.id", result?.id());
      console.log("result.name", result?.name());
      console.log(
        "result.phone",
        result?.phone()?.first() +
          "-" +
          result?.phone()?.second() +
          "-" +
          result?.phone()?.third()
      );
      console.log("result.create_at", Number(result?.createAt()));
    }
  } catch (err) {
    console.log(err);
  }
}

function getRandom(length: number) {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
}
