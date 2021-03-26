
function eq(e1, e2) {
    return e1 == e2;
}

function eq1(s, e) {
    return (s.length() == 1) && eq(s[0], e);
}

function is_empty(s) {
    return s.length === 0;
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

function product(s1, s2) {
    var s = [];

    for (var i in s1) {
        for (var j in s2) {
            s.push([s1[i], s2[j]]);
        }
    }

    return s;
}

function for_each_fdb(links, func) {
    for (var i in links) {
        var link = links[i];
        for (var j in link.fdb) {
            var fdb = link.fdb[j];
            func(link, fdb);
        }
    }
}

function for_each_product(s1, s2, func) {
    var p = product(s1, s2);

    for (var i in p) {
        func(p[i][0], p[i][1]);
    }
}

function find_peer(links, mac) {
    var peers = [];

    for_each_fdb(links, function(link, fdb) {
        if (fdb.mac.includes(mac)) {
            peers.push(link.mac);
        }
    });

    return peers;
}

function init(links) {
    for (var i in links) {
        if (is_empty(links[i].fdb)) {
            // HTIP end device
            var macs = find_peer(links, links[i].mac);
            if (macs.length > 0) {
                links[i].fdb = [{"port":1, "mac": macs}];
            }
/*
        } else {
            var found = false;

            for (var j in links[i].fdb) {
                for (var k in links) {
                    if (links[k].type == "HTIP_NW") {
                        found |= links[i].fdb[j].mac.includes(links[k].mac)
                    }
                }
            }

            if (!found) {
                var macs = [];
                for (var j in links) {
                    for (var k in links[j].fdb) {
                        if (links[j].fdb[k].mac.includes(links[i].mac)) {
                            macs.push(links[j].mac);
                        }
                    }
                }
                links[i].fdb.push({"port":links[i].fdb.length + 1, "mac":  macs});
            }
*/
        }
    }

    var m = allmacs(links);

    for_each_fdb(links, function(link, fdb) {
        var s = [];

        for (var k in fdb.mac) {
            if (m.includes(fdb.mac[k])) {
                s.push(fdb.mac[k]);
            }
        }

        fdb.mac_orig = JSON.parse(JSON.stringify(fdb.mac));
        fdb.mac_chosen = JSON.parse(JSON.stringify(s));
        fdb.mac = s;
        fdb.peer = [];
    });
}

function allmacs(links) {
    var s = [];

    for (var i in links) {
        s.push(links[i].mac);
    }

    return s;
}

/*
function macs(links, mac, port) {
    var res = undefined;

    for_each_fdb(links, function(link, fdb) {
        if ((link.mac == mac) && (fdb.port == port)) {
            res = fdb.mac;
        }
    });

    return res;
}
*/

function port2fdb(link, port) {
    for (var i in link.fdb) {
        if (link.fdb[i].port == port) {
            return link.fdb[i];
        }
    }

    return undefined;
}

function port2mac(link, port) {
    for (var i in link.fdb) {
        if (link.fdb[i].port == port) {
            return link.fdb[i].mac;
        }
    }

    return [];
}

function port2peer(link, port) {
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

function is_subset(s, s1) {
    for (var i in s1) {
        if (!member(s, s1[i])) {
            return false;
        }
    }

    return true;
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

function macs_except(link, port) {
    var macs = [];

    for (var i in link.fdb) {
        if (link.fdb[i] == port) {
            continue;
        }

        macs += link.fdb[i].mac;
    }

    return macs;
}

function remove_mac(links, mac) {
    for_each_fdb(links, function(link, fdb) {
        fdb.mac = sub(fdb.mac, mac);
    });
}

function cond1(links) {
    var found = [];

    for_each_fdb(links, function(link, fdb) {
        if(fdb.peer.length == 0 && fdb.mac.length == 1) {
            var mac = fdb.mac[0];
            found.push(mac);
            fdb.peer = [mac];
            remove_mac(links, mac);
            fdb.mac.push(mac);
        }
    });

/*
    for (var i in found) {
        remove_mac(links, found[i]);
    }
*/
}

function cond2_1(links, link1, link2, ps1, ps2) {
    for_each_product(ps1, ps2, function(p1, p2) {
        var peer1 = port2peer(link1, p1);

        if (!peer1.includes(link2.mac)) {
            return;
        }

        var macs2 = port2mac(link2, p2)

        if (!macs2.includes(link1.mac)) {
            return;
        }

        var fdb2 = port2fdb(link2, p2);
        fdb2.peer = [link1.mac];
        fdb2.mac = [link1.mac];
    });
}

function cond2(links) {
    for_each_product(links, links, function(link1, link2) {
        if (link1 !=  link2) {
            var ps1 = ports(link1);
            var ps2 = ports(link2);
            cond2_1(links, link1, link2, ps1, ps2);
        }
    });
}

function cond3_1(links, link1, link2, ps1, ps2) {
    for_each_product(ps1, ps2, function(p1, p2) {
        var macs1 = intersection(allmacs(), port2mac(link1, p1));
        var macs2 = intersection(allmacs(), port2mac(link2, p2));

        if (!macs1.includes(link2.mac)) {
            return;
        }

        if (!macs2.includes(link1.mac)) {
            return;
        }

        if (intersection(macs1, macs2).length != 0) {
            return;
        }

//        var fdb1 = port2fdb(link1, p1);
//        fdb1.mac = sub(fdb1.mac, link2.mac);

        var fdb1 = port2fdb(link1, p1);
        fdb1.peer = sub(fdb1.peer, link2.mac);
    });
}

function cond3(links) {
    for_each_product(links, links, function(link1, link2) {
        if (link1 !=  link2) {
            var ps1 = ports(link1);
            var ps2 = ports(link2);
            cond3_1(links, link1, link2, ps1, ps2);
        }
    });
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
            links[i].fdb[j].mac = links[i].fdb[j].peer;
        }
    }
}

function TopologyGen(links) {
    links = JSON.parse(JSON.stringify(links));

    init(links);

    var str = JSON.stringify(links);

    for (var i=0; i<1000; i++) {
        cond1(links);
        cond2(links);
        cond3(links);

        var newstr = JSON.stringify(links);
        if (str == newstr) {
            break;
        }
        str = newstr;
    }

    update(links);
    return links;
}

module.exports = TopologyGen;
