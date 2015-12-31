// 性能测试
//

var	fork = require('child_process').fork;
var cpus = require('os').cpus();

var workers = [];
for (var i = 0; i < cpus.length; ++i) {
    var worker = fork('./worker.js');

//    workers.push(worker);
//    workers[i].on("message", function(data) {
//        console.log(i + ": " + data);
//    });
}


