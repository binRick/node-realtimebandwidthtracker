#!/usr/bin/env

var bw = require('./');


bw.Watch(function(json) {
    console.log(JSON.stringify(json));
});