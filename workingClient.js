#!/usr/bin/env node

var watchr = require('watchr'),
    clear = require('clear'),
    trim = require('trim'),
    path = require('path'),
    c = require('chalk'),
    pj = require('prettyjson'),
    fs = require('fs'),
    _ = require('underscore');

var file = '/tmp/fastnetmon.dat';

watchr.watch({
    paths: [file],
    listeners: {
        log: function(logLevel) {
            var p = path.parse(file);
            fs.readFile(file, function(e, s) {
                var outputLines = s.toString().split('\n').map(function(l) {
                    return trim(trim(l).replace(/\t/g, ' ').replace(/\s+/g, ' '));
                }).filter(function(l) {
                    return l && l.length > 0 && l.split('FastNetMon').length == 1;
                });
                var s = {
                    outputLines: outputLines,
                };
                var Stats = {
                    ipRates: [],
                    internal: '',
                    outgoing: '',
                    incoming: '',
                    other: '',
                };
                _.each(s.outputLines, function(Line) {
                    if (Line.split('Outgoing').length == 2)
                        return Stats.outgoing = Line;
                    if (Line.split('Incoming').length == 2)
                        return Stats.incoming = Line;
                    if (Line.split('Internal').length == 2)
                        return Stats.internal = Line;
                    if (Line.split('Other').length == 2)
                        return Stats.other = Line;
                    if (Line.split('pps').length == 2 && Line.split('mbps').length == 2)
                        return Stats.ipRates.push(Line);
                });
                Stats.ipRates = Stats.ipRates.filter(function(l) {
                    return l && l.length > 0;
                });
                Stats.ipRates = Stats.ipRates.map(function(l) {
                    return l.split(' ');
                }).map(function(a) {
                    return {
                        ip: a[0],
                        pps: a[1],
                        mbps: a[3],
                        flows: a[5],
                    };
                });

                Stats.internal = Stats.internal.split(' ');
                Stats.outgoing = Stats.outgoing.split(' ');
                Stats.incoming = Stats.incoming.split(' ');
                Stats.other = Stats.other.split(' ');
                Stats.other = {
                    pps: Stats.other[2],
                    mbps: Stats.other[4],
                };
                Stats.internal = {
                    pps: Stats.internal[2],
                    mbps: Stats.internal[4],
                };
                Stats.incoming = {
                    pps: Stats.incoming[2],
                    mbps: Stats.incoming[4],
                    flows: Stats.incoming[6],
                };
                Stats.outgoing = {
                    pps: Stats.outgoing[2],
                    mbps: Stats.outgoing[4],
                    flows: Stats.outgoing[6],
                };
                clear();
                Stats.ipRates = Stats.ipRates;
                Stats.ipRates = _.sortBy(Stats.ipRates, 'mbps');

                console.log(JSON.stringify(Stats));
                return;

                console.log(pj.render(Stats, {
                    inlineArrays: true
                }));
            });
        },
        error: function(err) {
            console.log('an error occured:', err);
        },
        watching: function(err, watcherInstance, isWatching) {
            if (err) throw err;
        },
        change: function(changeType, filePath, fileCurrentStat, filePreviousStat) {}
    },
    next: function(err, watchers) {
        if (err) throw err;
    }
});
