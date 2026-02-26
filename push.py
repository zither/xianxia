#!/usr/bin/env python3
"""
Git Push 工具 - 仅限 xianxia 目录使用
"""
import os
import sys
import subprocess

ALLOWED_DIR = "xianxia"

def git_push():
    # 获取当前工作目录
    current_dir = os.getcwd()
    
    # 检查是否在允许的目录
    if not current_dir.endswith(ALLOWED_DIR) and ALLOWED_DIR not in current_dir:
        print(f"❌ 错误：此脚本仅限在 {ALLOWED_DIR} 目录使用")
        print(f"当前目录: {current_dir}")
        sys.exit(1)
    
    # 检查是否是 git 仓库
    if not os.path.isdir('.git'):
        print("❌ 错误：当前目录不是 Git 仓库")
        sys.exit(1)
    
    # 执行 git push
    print(f"📤 正在推送 {ALLOWED_DIR} 仓库...")
    try:
        result = subprocess.run(['git', 'push'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ 推送成功！")
            print(result.stdout)
        else:
            print("❌ 推送失败！")
            print(result.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"❌ 执行错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    git_push()
