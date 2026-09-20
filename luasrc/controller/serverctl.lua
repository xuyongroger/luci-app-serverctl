module("luci.controller.serverctl", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/serverctl") then
		return
	end

	-- 主菜单入口（服务 -> 服务器控制）
	local page = entry({"admin", "services", "serverctl"}, alias("admin", "services", "serverctl", "control"), _("服务器控制"), 60)
	page.dependent = true

	-- 第一个标签页：修改标题为 "手动定时控制"
	entry({"admin", "services", "serverctl", "control"}, cbi("serverctl/control"), _("手动定时控制"), 1).leaf = true

	-- 第二个标签页：修改标题为 "服务器维护"
	entry({"admin", "services", "serverctl", "servers"}, cbi("serverctl/servers"), _("服务器维护"), 2).leaf = true
end
