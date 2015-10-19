var ProtoBuf = require("protobufjs");

var builder = ProtoBuf.loadProtoFile("./code.proto");

console.log(builder.getChildren('game.Type'));
