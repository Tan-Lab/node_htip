
function eq(e1, e2) {
    return e1 == e2;
}

function is_empty(s) {
    return s.length === 0;
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

function for_each_fdb(links, func) {
    for (var i in links) {
        var link = links[i];
        for (var j in link.fdb) {
            var fdb = link.fdb[j];
            func(link, fdb);
        }
    }
}

function find_adjacent(links, link, fdb) {
    var mac = link.mac;
    var selected = [];


    for_each_fdb(links, function(adj_link, adj_fdb) {
        if (fdb.mac.includes(adj_link.mac)) {
            if (adj_fdb.mac.includes(mac) && is_empty(intersection(adj_fdb.mac, fdb.mac))) {
                selected.push(adj_link.mac);
            }
        }
    });

/*
    if (is_empty(selected)) {
        for_each_fdb(links, function(adj_link, adj_fdb) {
            if (adj_fdb.mac.includes(mac)) {
                selected.push(adj_link.mac);
            }
        });
    }
*/

    return selected;
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
            // HTIP End Device or HTIP Manager
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

function update(links) {
    for_each_fdb(links, function(link, fdb) {
        fdb.mac = fdb.peer;
    });
}

function TopologyGen(links) {
    links = JSON.parse(JSON.stringify(links));

    init(links);

    for_each_fdb(links, function(link, fdb) {
        fdb.peer = find_adjacent(links, link, fdb);
    });

    update(links);

    return links;
}

module.exports = TopologyGen;
