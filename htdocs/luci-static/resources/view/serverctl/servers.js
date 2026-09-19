'use strict';
'require view';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		// 将页面标题修改为“服务器信息”
		m = new form.Map('serverctl', _('服务器信息'), _('在此处维护和管理您的局域网服务器清单。保存后即可在控制面板的下拉列表和定时任务弹窗中选用。'));

		s = m.section(form.GridSection, 'server', _('服务器列表'));
		s.addremove = true;
		s.anonymous = true;
		s.rowcolors = true;

		o = s.option(form.Value, 'name', _('服务器别名'));
		o.rmempty = false;

		o = s.option(form.Value, 'ip', _('IP 地址'));
		o.datatype = 'ip4addr';
		o.rmempty = false;

		o = s.option(form.Value, 'mac', _('MAC 地址'));
		o.datatype = 'macaddr';
		o.rmempty = false;

		o = s.option(form.Value, 'user', _('SSH 用户名'));
		o.default = 'root';
		o.rmempty = false;

		o = s.option(form.Value, 'password', _('SSH 密码'));
		o.password = true;
		o.rmempty = false;

		return m.render();
	}
});
