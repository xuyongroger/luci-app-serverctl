# luci-app-serverctl

ImmortalWRT / OpenWrt LuCI 插件 —— 局域网服务器控制（WOL 唤醒 / SSH 休眠·关机 / 定时任务）

## 功能

- **手动控制**：选择服务器后一键 Ping 测试、SSH 测试、WOL 唤醒、SSH 休眠、SSH 关机
- **定时任务**：按 Cron 规则（日期/时/分）自动执行唤醒、休眠或关机
- **服务器维护**：管理局域网服务器列表（名称 / IP / MAC / 用户名 / 密码）

## 依赖

| 包 | 用途 |
|---|---|
| `luci-base` | LuCI 核心 |
| `etherwake` | WOL 唤醒 |
| `sshpass` | 密码式 SSH（非证书） |
| `openssh-client` | SSH 客户端 |

## 安装

```sh
opkg update
opkg install luci-app-serverctl luci-i18n-serverctl-zh_Hans
