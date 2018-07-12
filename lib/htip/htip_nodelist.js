// tkokada

var HtipNodeList = function() {
  if (!(this instanceof HtipNodeList)) {
    return new HtipNodeList();
  }
  this.list = [];
};

function filter_callback(element, index, array) {
  return array.indexOf(element) !== array.lastIndexOf(element);
}

HtipNodeList.prototype.check_exist = function(node) {
  for (var i = 0; i < this.list.length; i++) {
    if (typeof(node.ip) != 'undefined' && node.ip !== null) {
      if (node.ip === this.list[i].ip) {
        return i;
      }
    }
    if (typeof(node.mac) != 'undefined' && node.mac !== null && this.list[i].mac !== null) {
      if (node.mac === this.list[i].mac) {
        return i;
      }
    }
    if (node.maclist.length > 0 && this.list[i].maclist.length === 0) {
      if (this.list[i].mac in node.maclist) {
        return i;
      }
    } else if (node.maclist.length === 0 && this.list[i].maclist.length > 0) {
      if (node.mac in this.list[i].maclist) {
        return i;
      }
    } else if (node.maclist.length > 0 && this.list[i].maclist.length > 0) {
      var orlist = node.maclist.concat(this.list[i].maclist).filter(filter_callback);
      if (orlist.length > 0) {
        return i;
      }
    }
    if (typeof(node.chassis_id) != 'undefined' && node.chassis_id !== null) {
      if (node.chassis_id === this.list[i].chassis_id) {
        return i;
      }
    }
  }
  return -1;
};

HtipNodeList.prototype.update = function() {
  // Delete expired node
  this.list = this.list.filter(function(v) {
    var date = new Date();
    return date.getTime() <= v.expire.getTime();
  });
  for (var i = 0; i < this.list.length; i++) {
    if (!(this.list[i].htip_type in ["HTIP_Manager", "HTIP_NW", "HTIP_L2_Agent", "HTIP_L3_Agent", "ARP", "Unknown"])) {
      this.list[i].htip_type = "Unknown";
    }
  }
};

HtipNodeList.prototype.get = function() {
  return this.list;
};

HtipNodeList.prototype.add = function(node) {
  this.update();
  var exist = this.check_exist(node);
  if (exist >= 0) {
    if (node.maclist.length > 0) {
      var orlist = this.list[exist].maclist.concat(node.maclist);
      this.list[exist].maclist = orlist.filter(function(x, i, self) {
        return self.indexOf(x) === i;
      });
    }
    if (this.list[exist].ip === null && node.ip !== null) {
      this.list[exist].ip = node.ip;
    }
    if (!(node.htip_type in ["HTIP_Manager", "HTIP_NW", "HTIP_L2_Agent", "HTIP_L3_Agent", "ARP", "Unknown"])) {
      node.htip_type = "Unknown";
    }
    if (this.list[exist].htip_type === "HTIP_NW") {
      if (node.htip_type === "HTIP_Manager") {
        this.list[exist].htip_type = node.htip_type;
      }
    } else if (this.list[exist].htip_type === "HTIP_L2_Agent" || this.list[exist].htip_type === "HTIP_L3_Agent") {
      if (node.htip_type in ["HTIP_Manager", "HTIP_NW"]) {
        this.list[exist].htip_type = node.htip_type;
      }
    } else if (this.list[exist].htip_type === "ARP") {
      if (node.htip_type in ["HTIP_Manager", "HTIP_NW", "HTIP_L2_Agent", "HTIP_L3_Agent"]) {
        this.list[exist].htip_type = node.htip_type;
      }
    } else if (this.list[exist].htip_type === "Unknown") {
      if (node.htip_type in ["HTIP_Manager", "HTIP_NW", "HTIP_L2_Agent", "HTIP_L3_Agent", "ARP"]) {
        this.list[exist].htip_type = node.htip_type;
      }
    }
    if (node.htip_type === "HTIP_Manager") {
      this.list[exist].htip_type = node.htip_type;
    }
    if (this.list[exist].chassis_id === null && node.chassis_id !== null) {
      this.list[exist].chassis_id = node.chassis_id;
    }
    if (this.list[exist].port_id === null && node.port_id !== null) {
      this.list[exist].port_id = node.port_id;
    }
    if (this.list[exist].ttl === null && node.ttl !== null) {
      this.list[exist].ttl = node.ttl;
    }
    if (this.list[exist].port_desc === null && node.port_desc !== null) {
      this.list[exist].port_desc = node.port_desc;
    }
    if (this.list[exist].device_category === null && node.device_category !== null) {
      this.list[exist].device_category = node.device_category;
    }
    if (this.list[exist].manufacturer_code === null && node.manufacturer_code !== null) {
      this.list[exist].manufacturer_code = node.manufacturer_code;
    }
    if (this.list[exist].model_name === null && node.model_name !== null) {
      this.list[exist].model_name = node.model_name;
    }
    if (this.list[exist].model_number === null && node.model_number !== null) {
      this.list[exist].model_number = node.model_number;
    }
    if (this.list[exist].fdb !== null && node.fdb !== null) {
      if (this.list[exist].fdb.length === 0 && node.fdb.length > 0) {
        this.list[exist].fdb = node.fdb;
      }
    }
    this.list[exist].expire = node.expire;
  } else {
    this.list.push(node);
  }
};

HtipNodeList.prototype.print = function() {
  for (var i = 0; i < this.list.length; i++) {
    console.log("HtipNodeList:");
    console.log("  IP: " + this.list[i].ip + ", MAC: " + this.list[i].mac + ", Type: " + this.list[i].htip_type);
  }
};

module.exports = HtipNodeList;
