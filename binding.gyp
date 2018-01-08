{
  "targets": [
    {
      "target_name": "pcap_binding",
      "sources": [ "lib/binding/pcap_binding.cc", "lib/binding/pcap_session.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "link_settings": {
          "libraries": [
              "-lpcap"
          ]
      }
    }
  ]
}
