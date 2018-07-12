// tkokada modified

var Tlv = require("./lldp_tlv");

function Lldp(emitter) {
    this.emitter = emitter;
    this.tlvs = undefined;
}

Lldp.prototype.decode = function (raw_packet, offset) {
    var _offset = offset;
    var tlv;
    this.tlvs = new Array(0);
    do {
      tlv = new Tlv(raw_packet, _offset);
      if (typeof(tlv.payload) != 'undefined') {
        this.tlvs.push(tlv);
      }
      _offset += 2 + tlv.tlv_length;
    } while (tlv.tlv_type !== 0x00);

    if(this.emitter) { this.emitter.emit("lldp", this); }
    return this;
};

Lldp.prototype.decoderName = "lldp";
Lldp.prototype.eventsOnDecode = true;

Lldp.prototype.toString = function () {
    var ret = "LLDP\n";
    for (var i = 0; i < this.tlvs.length; i++) {
        if (this.tlvs[i] === undefined) {
            break;
        }
        ret += " tlv type: " + this.tlvs[i].tlv_type + ", payload: " + this.tlvs[i].payload + "\n";
    }

    return ret;
};

module.exports = Lldp;
