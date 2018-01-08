// tkokada modified

/*
 * The MIT License (MIT)
 * Copyright (c) 2014 Ahamed Nafeez
 *
 * https://github.com/skepticfx/arpjs/blob/master/LICENSE
 */

var spawn = require("child_process").spawn;

// Works on Mac.
// TODO: Linux - Ubuntu et al.

function getArpTable (callback, ifname) {
  var arp;
  if (ifname === null) {
    arp = spawn("arp", ["-a"]);
  } else {
    arp = spawn("arp", ["-a", "-i", ifname]);
  }
  var arpStr = [];

  arp.stdout.setEncoding("utf8");
  arp.stdout.on("data", function (data) {
    arpStr.push(data);
  });
  arp.on("close", function () {
    callback(null, parseArpTable(arpStr));
  });
}



// Parse ARP details from table
// TODO: Validate and format IP and MAC Addresses
function parseArpTable (arpStr) {
  var arpArr = [];
  var arpt = arpStr.join();
  arpt = arpt.split("\n");
  var x;
  for (x in arpt) {
    if (arpt.hasOwnProperty(x)) {
      var entry = arpt[x];
      var arpObj = {};

      // Get the IP from the "(1.2.3.4)" fromat
      var ipStart = entry.indexOf("(");
      if (ipStart === -1) {
        continue;
      }
      var ipEnd = entry.indexOf(")");
      var ip = entry.slice(ipStart + 1, ipEnd);
      arpObj.ip = ip;

      // Get the Corresponding MAC Addres by splitting
      var mac = entry.split(" ")[3];

      // make sure MAC addresses are in lowercase
      mac = mac.toLowerCase();

      // make sure octets have a leading zero
      var macSplited = mac.split(":");
      for (var i in macSplited) {
        if (macSplited.hasOwnProperty(i) && macSplited[i].length === 1) {
            macSplited[i] = "0" + macSplited[i];
        }
      }

      // join octets again
      mac = macSplited.join(":");

      arpObj.mac = mac;

      arpArr.push(arpObj);
    }
  }

  return arpArr;
}

exports.table = getArpTable;
