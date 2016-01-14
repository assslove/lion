/**
 * @brief 脏词过滤模块
 *        利用字典树脏词进行处理
 * Created by bin.hou on 2016/1/13.
 */

var configJson = require('config.json');

module.exports = function(confName) {
    return new Dirty(confName);
}


function Dirty(confName) {
    this.confName = confName;
    this.trieTree = {};
}

Dirty.prototype.init = function() {
    var words = configJson(this.confName).data;
    for (var i in words) {
        this.insert(words[i]);
    }
}

Dirty.prototype.insert = function(word) {
    var root = this.trieTree;
    if (word.length == 0) return ;
    for (var i in word) {
        var ch = word[i];
        if (root[ch] == undefined) { // no ch
            root[ch] = {};
        }
        root = root[ch];
    }

    root["nil"] = 1;
}

Dirty.prototype.replaceDirty = function(target) {
    var root = this.trieTree;
    var len = target.length;
    for (var i = 0; i < len; ++i) {
        for (var j = i; j < len; ++j) {
            var ch = target[j];
            if (root[ch] == undefined) { //没有
                break;
            } else {
                if (root[ch]["nil"] == 1) { //匹配到 i-j字符置成*
                    var substr = target.substring(i, j+1);
                    var newstr = new Array(j-i+2).join('*');
                    target = target.replace(new RegExp(substr, 'g'), newstr);
                    i = j;
                } else { //下一次循环
                    root = root[ch];
                }
            }
        }
        root = this.trieTree;
    }

    return target;
}

Dirty.prototype.checkDrity = function(target) {

}

Dirty.prototype.printTrieTree = function() {
    console.log(JSON.stringify(this.trieTree, null, '\t'));
}