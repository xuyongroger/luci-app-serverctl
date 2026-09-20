include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-serverctl
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for Server Power Control
LUCI_PKGARCH:=all
# 严格声明编译与运行依赖：加入 lua, lucihttp 以及运行时需要的 wol, etherwake, sshpass
LUCI_DEPENDS:=+luci-base +lua +luci-compat +lucihttp +wol +etherwake +sshpass

# 引入官方 LuCI 编译打包规则
include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
