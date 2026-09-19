'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require ui';

var callAction = rpc.declare({
	object: 'serverctl',
	method: 'execute',
	params: [ 'server', 'action' ],
	expect: { '': {} }
});

return view.extend({
	load: function() {
		return uci.load('serverctl');
	},

	render: function(data) {
		var m, s, o;
		var servers = uci.sections('serverctl', 'server');

		var serverSelect = E('select', { 'class': 'cbi-input-select' }, [
			E('option', { value: '' }, _('-- Please select a server --'))
		]);

		var serverInfo = E('div', { 'class': 'cbi-value', 'style': 'margin-top: 15px; display: none; justify-content: center;' }, [
			E('div', { 'id': 'srv_info_display', 'style': 'padding: 10px; background: var(--background-alt); border-radius: 4px; text-align: center;' })
		]);

		servers.forEach(function(srv) {
			var val = srv['.name'] || srv.name;
			var label = (srv.name || srv['.name']) + (srv.ip ? ' (' + srv.ip + ')' : '');
			serverSelect.appendChild(E('option', { value: val }, label));
		});

		var btnAction = function(action) {
			return function(ev) {
				var sval = serverSelect.value;
				if (!sval) {
					ui.addNotification(null, E('p', _('Please select a server from the list first.')), 'warning');
					return;
				}
				var btn = ev.target;
				btn.disabled = true;
				ui.showModal(_('Executing'), [ E('p', { class: 'spinning' }, _('Sending command, please wait...')) ]);

				callAction(sval, action).then(function(res) {
					ui.hideModal();
					if (res && res.code === 0) {
						ui.addNotification(null, E('p', res.msg), 'info');
					} else {
						ui.addNotification(null, E('p', (res && res.msg) ? res.msg : _('Operation failed')), 'error');
					}
				}).catch(function(e) {
					ui.hideModal();
					ui.addNotification(null, E('p', _('System request error: ') + e.message), 'error');
				}).finally(function() {
					btn.disabled = false;
				});
			};
		};

		var actionButtons = E('div', { 'class': 'cbi-value', 'style': 'margin-top: 15px; text-align: center;' }, [
			E('button', { 'class': 'btn cbi-button-action', 'click': btnAction('ping') }, _('Ping Test')), ' ',
			E('button', { 'class': 'btn cbi-button-action', 'click': btnAction('sshtest') }, _('SSH Test')), ' ',
			E('button', { 'class': 'btn cbi-button-apply', 'click': btnAction('wake') }, _('Wake (WOL)')), ' ',
			E('button', { 'class': 'btn cbi-button-reset', 'click': btnAction('sleep') }, _('Sleep')), ' ',
			E('button', { 'class': 'btn cbi-button-negative', 'click': btnAction('poweroff') }, _('Power Off'))
		]);

		serverSelect.addEventListener('change', function(ev) {
			var sval = ev.target.value;
			if (!sval) {
				serverInfo.style.display = 'none';
				return;
			}
			var s = servers.filter(function(x) { return x['.name'] === sval || x.name === sval; })[0];
			if (s) {
				document.getElementById('srv_info_display').innerHTML = 
					'<strong>' + _('Name:') + '</strong> ' + (s.name || '-') + '&nbsp;&nbsp;|&nbsp;&nbsp;' +
					'<strong>' + _('IP:') + '</strong> ' + (s.ip || '-') + '&nbsp;&nbsp;|&nbsp;&nbsp;' +
					'<strong>' + _('MAC:') + '</strong> ' + (s.mac || '-') + '&nbsp;&nbsp;|&nbsp;&nbsp;' +
					'<strong>' + _('User:') + '</strong> ' + (s.user || '-');
				serverInfo.style.display = 'block';
			}
		});

		var manualControlDom = E('fieldset', { 'class': 'cbi-section' }, [
			E('legend', _('Manual Control')),
			E('div', { 'class': 'cbi-value', 'style': 'text-align: center; display: flex; justify-content: center; align-items: center; gap: 10px;' }, [
				E('span', { 'style': 'font-weight: 500;' }, _('Select Server')),
				serverSelect
			]),
			serverInfo,
			actionButtons
		]);

		m = new form.Map('serverctl');

		s = m.section(form.GridSection, 'task', _('Scheduled Tasks Section'));
		s.addremove = true;
		s.anonymous = true;
		s.modaltitle = function(section_id) { return _('Edit Scheduled Task'); };

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;
		o.default = '1';

		o = s.option(form.ListValue, 'server', _('Target Server'));
		if (servers.length === 0) {
			o.value('', _('No server configured (Please add in Server Information tab)'));
		} else {
			servers.forEach(function(srv) {
				o.value(srv['.name'] || srv.name, srv.name || srv['.name']);
			});
		}
		o.rmempty = false;

		o = s.option(form.ListValue, 'action', _('Action'));
		o.value('wake', _('Wake (WOL)'));
		o.value('sleep', _('Sleep'));
		o.value('poweroff', _('Power Off'));
		o.rmempty = false;

		o = s.option(form.Value, 'hour', _('Hour'));
		o.datatype = 'range(0,23)';
		o.default = '8';
		o.rmempty = false;
		o.description = _('0 - 23');

		o = s.option(form.Value, 'min', _('Minute'));
		o.datatype = 'range(0,59)';
		o.default = '30';
		o.rmempty = false;
		o.description = _('0 - 59');

		return m.render().then(function(mapNode) {
			return E('div', [
				E('h2', { 'class': 'cbi-map-title' }, _('Manual Control')),
				E('div', { 'class': 'cbi-map-descr' }, _('Instantly control computers, servers and other devices in the LAN, or set unattended scheduled wake and shutdown strategies.')),
				manualControlDom,
				mapNode
			]);
		});
	}
});
