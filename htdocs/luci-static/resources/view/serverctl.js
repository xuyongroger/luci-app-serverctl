'use strict';
'require view';
'require fs';
'require uci';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('serverctl', _('Server Control'),
			_('Manage LAN servers: Wake-on-LAN, SSH control, and scheduled tasks.'));

		m.tab('control', _('Manual/Scheduled Control'));
		m.tab('servers', _('Server Maintenance'));

		// ==================== 选项卡一：手动/定时控制 ====================

		// ---- 功能区域一：手动控制 ----
		s = m.section(form.TypedSection);
		s.title = _('Manual Control');
		s.tab('control', _('Manual/Scheduled Control'));
		s.anonymous = true;
		s.cfgsections = function() { return [ '_manual' ]; };

		o = s.taboption('control', form.DummyValue, 'manual_control', _('Server Control'));
		o.load = function() {
			var sections = uci.sections('serverctl', 'server');

			if (!sections || sections.length === 0) {
				this.default = E('div', { 'style': 'text-align:center;padding:20px;color:#999;' },
					_('No servers configured. Please add servers in the "Server Maintenance" tab.'));
				return;
			}

			// 下拉列表
			var select = E('select', { 'class': 'cbi-input cbi-input-select' });
			sections.forEach(function(sec) {
				var name = uci.get('serverctl', sec, 'name') || sec;
				var ip = uci.get('serverctl', sec, 'ip') || '';
				select.appendChild(E('option', { 'value': sec },
					name + (ip ? ' (' + ip + ')' : '')));
			});

			// 信息展示区
			var infoDiv = E('div', { 'style': 'margin:10px auto;' });

			function updateInfo() {
				var sec = select.value;
				var rows = [
					[_('Name'),       uci.get('serverctl', sec, 'name')      || sec],
					[_('IP Address'), uci.get('serverctl', sec, 'ip')        || '-'],
					[_('MAC Address'),uci.get('serverctl', sec, 'mac')       || '-'],
					[_('Username'),   uci.get('serverctl', sec, 'username')  || '-'],
					[_('Password'),   uci.get('serverctl', sec, 'password')  || '-']
				];
				infoDiv.innerHTML = '';
				var table = E('table', { 'class': 'table' });
				rows.forEach(function(r) {
					table.appendChild(E('tr', {}, [
						E('td', { 'style': 'text-align:right;font-weight:bold;' }, r[0]),
						E('td', { 'style': 'text-align:left;' }, r[1])
					]));
				});
				infoDiv.appendChild(table);
			}

			updateInfo();
			select.addEventListener('change', updateInfo);

			// 功能按钮
			var buttonsDiv = E('div', { 'style': 'text-align:center;margin-top:15px;' });

			function doAction(action, title, confirmMsg) {
				var sec = select.value;
				var ip = uci.get('serverctl', sec, 'ip');
				var mac = uci.get('serverctl', sec, 'mac') || '';
				var username = uci.get('serverctl', sec, 'username') || '';
				var password = uci.get('serverctl', sec, 'password') || '';

				if (confirmMsg && !confirm(confirmMsg)) return;

				fs.exec_direct('/usr/sbin/serverctl',
					[action, ip, mac, username, password],
					{ timeout: 30000 }
				).then(function(result) {
					if (result.exit === 0) {
						ui.addNotification(null, title + ' ' + _('succeeded.'), 'spinned');
					} else {
						ui.addNotification(null, title + ' ' + _('failed:') + ' ' +
							(result.stdout || result.stderr || ''), 'error');
					}
				});
			}

			var actions = [
				[_('Ping Test'), 'ping',     null],
				[_('SSH Test'),  'ssh_test', null],
				[_('Wake'),      'wake',     null],
				[_('Sleep'),     'sleep',    _('Are you sure you want to suspend this server?')],
				[_('Shutdown'),  'shutdown', _('Are you sure you want to shut down this server?')]
			];

			actions.forEach(function(a) {
				var btn = E('button', { 'class': 'btn', 'type': 'button',
					'style': 'margin:0 5px;' }, a[0]);
				btn.addEventListener('click', function() {
					doAction(a[1], a[0], a[2]);
				});
				buttonsDiv.appendChild(btn);
			});

			// 组装（全部居中）
			this.default = E('div', { 'style': 'text-align:center;padding:10px;' }, [
				E('div', { 'style': 'margin-bottom:10px;' }, [
					E('label', { 'style': 'margin-right:10px;' }, [(_('Server') + ': ')]),
					select
				]),
				infoDiv,
				buttonsDiv
			]);
		};

		// ---- 功能区域二：定时任务 ----
		s = m.section(form.TypedSection, 'task', _('Scheduled Tasks'),
			_('Configure scheduled wake/sleep/shutdown tasks.'));
		s.tab('control', _('Manual/Scheduled Control'));
		s.addremove = true;

		o = s.option(form.ListValue, 'server', _('Server'));
		o.rmempty = false;
		(function() {
			var secs = uci.sections('serverctl', 'server');
			if (secs) {
				secs.forEach(function(sec) {
					var name = uci.get('serverctl', sec, 'name') || sec;
					o.value(sec, name);
				});
			}
		})();

		o = s.option(form.ListValue, 'action', _('Action'));
		o.rmempty = false;
		o.value('wake',     _('Wake'));
		o.value('sleep',    _('Sleep'));
		o.value('shutdown', _('Shutdown'));

		o = s.option(form.Value, 'day', _('Day'),
			_('Cron day: 1-7 (1=Monday), ranges like 1-5, or * for daily'));
		o.placeholder = '1-7';
		o.validate = function(section, value) {
			if (!value) return true;
			return value.match(/^(\*|[1-7](-[1-7])?)(,[1-7](-[1-7])?)*$/);
		};

		o = s.option(form.Value, 'hour', _('Hour'), _('0-23, or * for every hour'));
		o.placeholder = '0-23';
		o.validate = function(section, value) {
			if (!value) return true;
			return value.match(/^(\*|[0-9]|1[0-9]|2[0-3])$/);
		};

		o = s.option(form.Value, 'minute', _('Minute'), _('0-59, or * for every minute'));
		o.placeholder = '0-59';
		o.validate = function(section, value) {
			if (!value) return true;
			return value.match(/^(\*|[0-9]|[1-5][0-9])$/);
		};

		// ==================== 选项卡二：服务器维护 ====================

		s = m.section(form.TypedSection, 'server', _('Server List'),
			_('Manage the list of LAN servers.'));
		s.tab('servers', _('Server Maintenance'));
		s.addremove = true;

		o = s.option(form.Value, 'name', _('Name'), _('Server name/label'));
		o.rmempty = false;

		o = s.option(form.Value, 'ip', _('IP Address'), _('Server IP address'));
		o.rmempty = false;
		o.datatype = 'ip4';

		o = s.option(form.Value, 'mac', _('MAC Address'),
			_('Server MAC address (for WOL)'));
		o.rmempty = false;
		o.datatype = 'macaddr';

		o = s.option(form.Value, 'username', _('Username'), _('SSH username'));
		o.rmempty = false;
		o.default = 'root';

		o = s.option(form.Password, 'password', _('Password'), _('SSH password'));
		o.rmempty = true;

		return m.render();
	}
});
