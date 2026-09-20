local m, s, s2, e, target, act, h, m_m, server_select

m = Map("serverctl", translate("手动定时控制"), translate("即时控制局域网内的计算机、服务器等设备，或设立无人值守定时唤醒及关机策略。"))

-- 手动控制区
s = m:section(NamedSection, "global", "serverctl", translate("手动控制"))
server_select = s:option(ListValue, "current_server", translate("选择服务器"))
server_select.optional = false

-- 动态读取服务器列表：Value传节点ID(sid)，Label显示别名与IP
m.uci:foreach("serverctl", "server", function(sec)
	local sid = sec[".name"]
	local name = sec.name or sid
	local ip = sec.ip or ""
	server_select:value(sid, string.format("%s (%s)", name, ip))
end)

-- 定时任务区
s2 = m:section(TypedSection, "timer", translate("定时任务区"))
s2.template = "cbi/tblsection"
s2.anonymous = true
s2.addremove = true

e = s2:option(Flag, "enabled", translate("启用"))
e.default = "1"
e.rmempty = false

target = s2:option(ListValue, "server", translate("目标服务器"))
-- 定时任务列表：Value传节点ID(sid)，Label显示别名
m.uci:foreach("serverctl", "server", function(sec)
	local sid = sec[".name"]
	local name = sec.name or sid
	target:value(sid, name)
end)

act = s2:option(ListValue, "action", translate("操作"))
act:value("wake", translate("唤醒 (WOL)"))
act:value("sleep", translate("休眠 (Suspend)"))
act:value("poweroff", translate("关机 (Poweroff)"))

h = s2:option(Value, "hour", translate("小时"))
h.placeholder = "0-23"
h.datatype = "range(0,23)"

m_m = s2:option(Value, "minute", translate("分钟"))
m_m.placeholder = "0-59"
m_m.datatype = "range(0,59)"

return m
