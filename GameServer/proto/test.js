var fs = require("fs");
var Schema = require("node-protobuf");
var pb = new Schema(fs.readFileSync('./desc/zone.desc'));

var str = {"total":7,"zone":[{"serv_id":1,"serv_name":"bleach_hb","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1},{"serv_id":2,"serv_name":"bleach_hb1","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1},{"serv_id":3,"serv_name":"bleach_hb2","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1},{"serv_id":4,"serv_name":"bleach_hb3","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1},{"serv_id":5,"serv_name":"bleach_hb4","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1},{"serv_id":6,"serv_name":"bleach_hb5","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1},{"serv_id":7,"serv_name":"bleach_hb6","remote_ip":"","port":5555,"state":1,"recommend_flag":0,"publish_time":1}]};

console.log(str.total);
console.log(str.zone.length);

var tmp = pb.serialize(str, "http.GetZoneList");
console.log(tmp.length);
var obj = pb.parse(tmp, "http.GetZoneList");

console.log(obj.total);
console.log(obj.zone.length);
