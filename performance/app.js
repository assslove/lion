// 性能测试
//

var	fork = require('child_process').fork;
var cpus = require('os').cpus();

var workers = [];
for (var i = 0; i < cpus.length; ++i) {
    workers.push(fork('./worker.js'));

    workers[i].on("message", function(data) {
        console.log(i + ": " + data);
    });
}


