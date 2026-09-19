include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-serverctl
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for Server Control (WOL/Sleep/Poweroff)
LUCI_DEPENDS:=+sshpass +etherwake
PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# 定义中文语言包子包，符合官方标准
define Package/luci-i18n-serverctl-zh-cn
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=Translation for Server Control in Chinese (Simplified)
  DEFAULT:=($(CONFIG_PACKAGE_luci-app-serverctl) && nls)
  PKGARCH:=all
endef

define Package/luci-i18n-serverctl-zh-cn/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/i18n
	po2lmo po/zh_Hans/serverctl.po $(1)/usr/lib/lua/luci/i18n/serverctl.zh-cn.lmo
endef

$(eval $(call BuildPackage,luci-i18n-serverctl-zh-cn))
