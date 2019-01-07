
function eq(e1, e2) {
    return e1 == e2;
}

function eq1(s, e) {
    return (s.length() == 1) && eq(s[0], e);
}

function member(s, e) {
    for (var i in s) {
        if (eq(s[i], e)) {
            return true;
        }
    }

    return false;
}

function intersection(s1, s2) {
    var s = [];

    for (var i in s1) {
        if (s2.includes(s1[i])) {
            s.push(s1[i]);
        }
    }

    return s;
}

function find_peer(links, e) {
    var s = [];

    for (var i in links) {
        var mac = links[i].mac;
        var fdb = links[i].fdb;
        for (var j in fdb) {
            if (fdb[j].mac.includes(e)) {
                s.push(mac);
            }
        }
    }

    return s;
}

function init(links) {
    for (var i in links) {
        if (links[i].fdb.length == 0) {
            var mac = find_peer(links, links[i].mac);
            if (mac.length > 0) {
                links[i].fdb = [{"port":1, "mac": mac}];
            }
        }
    }

    var m = allmacs(links);

    for (var i in links) {
        for (var j in links[i].fdb) {

            var fdb = links[i].fdb[j];
            var s = [];

            for (var k in fdb.mac) {
                if (m.includes(fdb.mac[k])) {
                    s.push(fdb.mac[k]);
                }
            }

            fdb.mac_orig = JSON.parse(JSON.stringify(fdb.mac));
            fdb.mac_chosen = JSON.parse(JSON.stringify(s));
            fdb.mac = s;
            fdb.peer = undefined;
        }
    }
}

function allmacs(links) {
    var s = [];

    for (var i in links) {
        s.push(links[i].mac);
    }

    return s;
}

function macs(links, mac, port) {
    for (var i in links) {
        if (links[i].mac == mac) {
            var fdb = links[i].fdb;
            for (var j in fdb) {
                if (fdb[j].port == port) {
                    return fdb[j].mac;
                }
            }
        }
    }

    return undefined;
}

function peer(link, port) {
    for (var i in link.fdb) {
        if (link.fdb[i].port == port) {
            return link.fdb[i].peer;
        }
    }

    return undefined;
}

function ports(link) {
    var s = [];

    for (var i in link.fdb) {
        s.push(link.fdb[i].port);
    }

    return s;
}

function fdb(link, port) {
    for (var i in link.fdb) {
        if (link.fdb[i].port == port) {
            return link.fdb[i].mac;
        }
    }

    return [];
}

function sub(m, e) {
    var s = [];

    for (i in m) {
        if (!eq(m[i], e)) {
            s.push(m[i]);
        }
    }

    return s;
}

function remove_except(links, mac, link, port) {
    console.log("remove (", link.mac, port, "):", mac);
    for (var i in links) {
        for (var j in links[i].fdb) {
            if ((link == links[i]) && (links[i].fdb[j].port == port)) {
                continue;
            }

            links[i].fdb[j].mac = sub(links[i].fdb[j].mac, mac);
        }
    }
}

function cond1(links) {
    for (var i in links) {
        var link = links[i];
        for (var j in link.fdb) {
            if(link.fdb[j].peer == undefined && link.fdb[j].mac.length == 1) {
                link.fdb[j].peer = link.fdb[j].mac[0];
                remove_except(links, link.fdb[j].mac[0], link, link.fdb[j].port);
            }
        }
    }
}

function cond2_1(links, li, lj, ps, qs) {
    for (var k in ps) {
        for (var l in qs) {
            if (peer(li, ps[k]) != lj.mac) {
                continue;
            }
            console.log("peer(", li.mac, ",", ps[k], "):", peer(li, ps[k]));
            
            if (!macs(links, lj.mac, qs[l]).includes(li.mac)) {
                continue;
            }
            console.log("macs(links,", lj.mac, ",", qs[l], "):", macs(links, lj.mac, qs[l]));

            for (var m in lj.fdb) {
                if (lj.fdb[m].peer == undefined && lj.fdb[m].port == qs[l]) {
                    lj.fdb[m].peer = li.mac;
                }
            }
        }
    }
}

function cond2(links) {
    for (var i in links) {
        for (var j in links) {
//            mi = links[i].mac;
//            mj = links[j].mac;
            var ps = ports(links[i]);
            var qs = ports(links[j]);

            cond2_1(links, links[i], links[j], ps, qs);
/*
            for (var k in ps) {
                for (var l in qs) {
                    if (peer(links[i], ps[k]) != links[j].mac) {
                        continue;
                    }
                    console.log("hoge", peer(links[i], ps[k]));

                    if (!macs(links, mj, qs[l]).includes(mi)) {
                        continue;
                    }
                    console.log("fuga", macs(links, mj, qs[l]));

                    for (var m in links[j].fdb) {
                        if (links[j].fdb[m].port == qs[l]) {
                            links[j].fdb[m].peer = mi;
                        }
                    }
                }
            }
*/
        }
    }
}

function cond3_1(links, li, lj, ps, qs) {
    for (var k in ps) {
        for (var l in qs) {
            var mip = macs(links, li.mac, ps[k]);
            var mjq = macs(links, lj.mac, qs[l]);

            if (!mip.includes(lj.mac)) {
                continue;
            }

            if (!mjq.includes(li.mac)) {
                continue;
            }

            if (intersection(mip, mjq).length == 0) {
                continue;
            }

            lj.peer = undefined;
        }
    }
}

function cond3(links) {
    for (var i in links) {
        for (var j in links) {
            var ps = ports(links[i]);
            var qs = ports(links[j]);

            cond3_1(links, links[i], links[j], ps, qs);
        }
    }
}

/*
init(links);
console.log(links[0].fdb);

console.log(member(links[3].fdb[0].mac, '00:00:00:00:01:02'));
console.log(member(links[3].fdb[1].mac, '00:00:00:00:01:02'));
console.log(member(links[3].fdb[2].mac, '00:00:00:00:01:02'));
console.log(intersection(
  ['00:00:00:00:01:01', '00:00:00:00:01:03'],
  ['00:00:00:00:01:03', '00:00:00:00:01:02']
));

var ms = allmacs(links);

console.log(ms);

for (var i in links) {
    var link = links[i];
    for (var j in link.fdb) {
        var mac = link.fdb[j].mac;
        console.log(mac.length);
        if ((mac.length == 1) && ms.includes(mac[0])) {
            console.log(mac[0]);
        }
    }
}

console.log(ports(links[0]));
console.log(ports(links[1]));
console.log(ports(links[2]));
console.log(fdb(links[3], 1));

cond1(links);
cond2(links);

for (var i in links) {
    var link = links[i];
    for (var j in link.fdb) {
        console.log(link.mac, link.fdb[j].port, link.fdb[j].peer, link.fdb[j].mac);
    }
}

console.log(links);

// console.log(macs(links, "00:00:00:00:01:01", 1));
// console.log(macs(links, "00:00:00:00:01:02", 1));
// console.log(macs(links, "00:00:00:00:02:01", 1));
// console.log(macs(links, "00:00:00:00:02:02", 1));
*/

function update(links) {
    for (var i in links) {
        for (var j in links[i].fdb) {
            if (links[i].fdb[j].peer) {
                links[i].fdb[j].mac = [links[i].fdb[j].peer];
            } else {
                links[i].fdb[j].mac = [];
            }
        }
    }
}

function TopologyGen(links) {
    links = JSON.parse(JSON.stringify(links));
//    for (var i in links) {
//        links[i].raw = JSON.parse(JSON.stringify(links[i]));
//    }
    init(links);
    cond1(links);cond2(links);cond1(links);
    cond2(links);
    update(links);
    return links;
}

module.exports = TopologyGen;
