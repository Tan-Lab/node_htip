// tkokada modified

var EthernetAddr = require("./ethernet_addr");
var HtipTlv = require("./htip_tlv");

var ChassisIdTlv = function(raw_packet, offset, len) {
  if (!(this instanceof ChassisIdTlv)) {
      return new ChassisIdTlv(raw_packet, offset);
  }
  this.subtype = raw_packet.readUInt8(offset);
  // Currently, the chassis id is assumed as 6 octets MAC address.
  if (this.subtype === 4 && len === 7) {
    var ether = new EthernetAddr(raw_packet, offset + 1);
    this.chassisid = ether.toString();
  } else {
    this.chassisid = null;
  }
};

ChassisIdTlv.prototype.toString = function () {
    return "subtype: " + this.subtype + ", chassis id: " + this.chassisid;
};

var PortIdTlv = function(raw_packet, offset, len) {
  if (!(this instanceof PortIdTlv)) {
      return new PortIdTlv(raw_packet, offset);
  }
  this.subtype = raw_packet.readUInt8(offset);
  // Currently, the data is assumed as 6 octets MAC address.
  if (this.subtype === 3 && len === 7) {
    var ether = new EthernetAddr(raw_packet, offset + 1);
    this.portid = ether.toString();
  } else {
    this.portid = raw_packet.toString("ascii", offset + 1, offset + len);
  }
};

PortIdTlv.prototype.toString = function () {
    return "subtype: " + this.subtype + ", port id: " + this.portid;
};

var TtlTlv = function(raw_packet, offset, len) {
  if (!(this instanceof TtlTlv)) {
      return new TtlTlv(raw_packet, offset);
  }
  if (len !== 2) {
    console.log("TTL TLV should have two octets value.");
  }
  this.ttl = raw_packet.readUInt16BE(offset);
};

TtlTlv.prototype.toString = function () {
    return "ttl: " + this.ttl;
};

var PortDescTlv = function(raw_packet, offset, len) {
  if (!(this instanceof PortDescTlv)) {
      return new PortDescTlv(raw_packet, offset);
  }
  this.portdesc = raw_packet.toString("ascii", offset, offset + len);
};

PortDescTlv.prototype.toString = function () {
    return "port desc: " + this.portdesc;
};

var Tlv = function(raw_packet, offset) {
  if (!(this instanceof Tlv)) {
      return new Tlv(raw_packet, offset);
  }
  this.tlv_type = raw_packet.readUInt8(offset) >>> 1;
  this.tlv_length = raw_packet.readUInt16BE(offset) & 511;
  switch (this.tlv_type) {
  case 0x00: // End Of LLDPDU
      this.payload = null;
      break;
  case 0x01: // Chassis ID
      this.payload = new ChassisIdTlv(raw_packet, offset + 2, this.tlv_length);
      break;
  case 0x02: // Port ID
      this.payload = new PortIdTlv(raw_packet, offset + 2, this.tlv_length);
      break;
  case 0x03: // Time to Live
      this.payload = new TtlTlv(raw_packet, offset + 2, this.tlv_length);
      break;
  case 0x04: // Port Description
      this.payload = new PortDescTlv(raw_packet, offset + 2, this.tlv_length);
      break;
  case 0x7f: // Organazation specific
      this.payload = new HtipTlv(raw_packet, offset + 2, this.tlv_length);
      break;
  default:
      console.log("node_pcap: LLDP() - Don't know how to decode TLV type " + this.tlv_type);
  }
};

Tlv.prototype.toString = function () {
    return "tlv_type: " + this.tlv_type + ", tlv_len: " + this.tlv_length + "payload: " + this.payload;
};

module.exports = Tlv;
