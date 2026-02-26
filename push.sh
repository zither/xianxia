#!/bin/bash
# 自动递增版本号并推送

cd /home/potted/.picoclaw/workspace/xianxia

# 读取当前版本号
VERSION=$(grep -oP '版本: \K[0-9.]+' game.js)
IFS='.' read -ra V <<< "$VERSION"
MAJOR=${V[0]}
MINOR=${V[1]}
PATCH=${V[2]}

# 递增补丁版本
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# 更新 game.js 中的版本号
sed -i "s/版本: $VERSION/版本: $NEW_VERSION/" game.js

# 更新 index.html 中的版本号
sed -i "s/v$VERSION/v$NEW_VERSION/" index.html

# 提交并推送
git add -A
git commit -m "release: v$NEW_VERSION"
python3 push.py

echo "已发布版本 v$NEW_VERSION"
