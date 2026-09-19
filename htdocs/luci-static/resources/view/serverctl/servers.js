'use strict';
'require view';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('serverctl', _('Server Information'), _('Maintain and manage your LAN server list here. After saving, it can be selected in the control panel dropdown and scheduled task modals.'));

		s = m.section(form.GridSection, 'server', _('Server List'));
		s.addremove = true;
		s.anonymous = true;
		s.rowcolors = true;

		o = s.option(form.Value, 'name', _('Server Alias'));
		o.rmempty = false;

		o = s.option(form.Value, 'ip', _('IP Address'));
		o.datatype = 'ip4addr';
		o.rmempty = false;

		o = s.option(form.Value, 'mac', _('MAC Address'));
		o.datatype = 'macaddr';
		o.rmempty = false;

		o = s.option(form.Value, 'user', _('SSH Username'));
		o.default = 'root';
		o.rmempty = false;

		o = s.option(form.Value, 'password', _('SSH Password'));
		o.password = true;
		o.rmempty = false;

		return m.render();
	}
});
