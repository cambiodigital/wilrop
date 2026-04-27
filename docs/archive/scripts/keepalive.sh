#!/bin/bash
cd /home/z/my-project
while true; do
  if ! lsof -i :3000 > /dev/null 2>&1; then
    echo "[$(date)] Starting dev server..." >> /home/z/my-project/dev.log
    rm -rf .next
    npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
    echo "[$(date)] Server stopped, restarting in 2s..." >> /home/z/my-project/dev.log
    sleep 2
  fi
  sleep 3
done
