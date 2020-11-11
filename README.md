# node_htip README.md

# What is node_htip
node_htip is a software implementing TTC standard HTIP (JJ-300.00v3) on node.js.
Currently, main functionalities of this software are to visualize a network topology and check device information by collecting HTIP L2 Agent, HTIP L3 Agent and ARP information.

node_htip captures layer 2 frames based on [node_pcap](https://github.com/node-pcap/node_pcap).

# Requirements
node_htip requires

* node.js
* npm
* web browser (to check topology visualizer)

# Installation
node_htip requires node.js (and npm).
Please install them at first.

Next step, please install npm packages

    npm install .

To compile the native code bindings, do this:

    node-gyp configure build

# Getting started
node_htip uses express which is a web application framework for node.js.
To check the topology visualizer, simply run following command:

    npm start

## LICENSE
MIT license, Copyright (c) 2018 Takashi OKADA.
