include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-serverctl
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for Server Control (WOL/Sleep/Poweroff)
LUCI_DEPENDS:=+sshpass +etherwake
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
