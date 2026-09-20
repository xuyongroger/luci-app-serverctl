#
# Copyright (C) 2024 The LuCI Team <luci@lists.subsignal.org>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

PKG_LICENSE:=Apache-2.0

LUCI_TITLE:=LuCI Server Control (WOL/SSH)
LUCI_DEPENDS:=+luci-base +etherwake +sshpass +openssh-client

PKG_MAINTAINER:=admin <admin@example.com>

# --- postinst: 注册 cron 定时任务 ---
define Package/luci-app-serverctl/postinst
[ -n "$${IPKG_INSTROOT}" ] || { \
	rm -f /tmp/luci-indexcache.*; \
	rm -rf /tmp/luci-modulecache/; \
	/etc/init.d/rpcd reload 2>/dev/null; \
	mkdir -p /etc/crontabs; \
	touch /etc/crontabs/root; \
	grep -q "serverctl-cron" /etc/crontabs/root 2>/dev/null || \
		echo "* * * * * /usr/sbin/serverctl-cron" >> /etc/crontabs/root; \
	/etc/init.d/cron restart 2>/dev/null; \
	exit 0; \
}
endef

# --- prerm: 卸载时移除 cron 定时任务 ---
define Package/luci-app-serverctl/prerm
[ -n "$${IPKG_INSTROOT}" ] || { \
	if [ -f /etc/crontabs/root ]; then \
		sed -i '/serverctl-cron/d' /etc/crontabs/root; \
	fi; \
	/etc/init.d/cron restart 2>/dev/null; \
	exit 0; \
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
