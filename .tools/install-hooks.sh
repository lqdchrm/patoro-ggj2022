#!/bin/bash
rm ./.git/hooks/post-receive
ln -s ./.tools/post-receive ./.git/hooks/post-receive
chmod +x ./.tools/post-receive
