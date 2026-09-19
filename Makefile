include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-serverctl
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for Server Control (WOL/Sleep/Poweroff)
LUCI_DEPENDS:=+sshpass +etherwake
PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# 仅需声明主包，luci.mk 会自动扫描 po/ 目录生成对应的 i18n 语言包
$(eval $(call BuildPackage,luci-app-serverctl))
