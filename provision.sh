#!/bin/bash

# git clone https://github.com/gotbingo/runner
# cd runner
# ./provision.sh
# sudo su

apt update
apt install npm -y
npm i -g npm
npm i -g n
n latest
npm i
node worker.js