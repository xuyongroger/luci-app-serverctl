'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require ui';
'require dom';

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

		// 手动控制区：使用 inline-flex 配合 gap 紧凑挨在一起，并整体居中
		var serverSelect = E('select', { 'class': 'cbi-input-select' }, [
			E('option', { value: '' }, _('-- 请选择操作的服务器 --'))
		]);

		var serverInfo = E('div', { 'class': 'cbi-value', 'style': 'margin-top: 15px; display: none; justify-content: center;' }, [
			E('div', { 'id': 'srv_info_display', 'style': 'padding: 10px; background: var(--background-alt); border-radius: 4px; text-align: center;' })
		]);

		servers.forEach(function(srv) {
			serverSelect.appendChild(E('option', { value: srv.name }, srv.name + ' (' + srv.ip + ')'));
		});

		var btnAction = function(action) {
			return function(ev) {
				var sname = serverSelect.value;
				if (!sname) {
					ui.addNotification(null, E('p', _('请先从下拉列表选择一台服务器。')), 'warning');
					return;
				}
				var btn = ev.target;
				btn.disabled = true;
				ui.showModal(_('正在执行'), [ E('p', { class: 'spinning' }, _('指令发送中，请稍候...')) ]);

				callAction(sname, action).then(function(res) {
					ui.hideModal();
					if (res && res.code === 0) {
						ui.addNotification(null, E('p', res.msg), 'info');
					} else {
						ui.addNotification(null, E('p', (res && res.msg) ? res.msg : _('操作失败')), 'error');
					}
				}).catch(function(e) {
					ui.hideModal();
					ui.addNotification(null, E('p', _('系统请求异常: ') + e.message), 'error');
				}).finally(function() {
					btn.disabled = false;
				});
			};
		};

		// 按钮容器居中对齐
		var actionButtons = E('div', { 'class': 'cbi-value', 'style': 'margin-top: 15px; text-align: center;' }, [
			E('button', { 'class': 'btn cbi-button-action', 'click': btnAction('ping') }, _('Ping 测试')), ' ',
			E('button', { 'class': 'btn cbi-button-action', 'click': btnAction('sshtest') }, _('SSH 测试')), ' ',
			E('button', { 'class': 'btn cbi-button-apply', 'click': btnAction('wake') }, _('唤醒 (WOL)')), ' ',
			E('button', { 'class': 'btn cbi-button-reset', 'click': btnAction('sleep') }, _('休眠')), ' ',
			E('button', { 'class': 'btn cbi-button-negative', 'click': btnAction('poweroff') }, _('关机'))
		]);

		serverSelect.addEventListener('change', function(ev) {
			var sname = ev.target.value;
			if (!sname) {
				serverInfo.style.display = 'none';
				return;
			}
			var s = servers.filter(function(x) { return x.name === sname; })[0];
			if (s) {
				document.getElementById('srv_info_display').innerHTML = 
					'<strong>' + _('名称:') + '</strong> ' + s.name + '&nbsp;&nbsp;|&nbsp;&nbsp;' +
					'<strong>' + _('IP:') + '</strong> ' + s.ip + '&nbsp;&nbsp;|&nbsp;&nbsp;' +
					'<strong>' + _('MAC:') + '</strong> ' + s.mac + '&nbsp;&nbsp;|&nbsp;&nbsp;' +
					'<strong>' + _('用户:') + '</strong> ' + s.user;
				serverInfo.style.display = 'block';
			}
		});

		// 核心改动：legend 改为“手动控制”，并用 gap: 10px 让文字与下拉框紧挨在一起居中
		var manualControlDom = E('fieldset', { 'class': 'cbi-section' }, [
			E('legend', _('手动控制')),
			E('div', { 'class': 'cbi-value', 'style': 'text-align: center; display: flex; justify-content: center; align-items: center; gap: 10px;' }, [
				E('span', { 'style': 'font-weight: 500;' }, _('选择服务器')),
				serverSelect
			]),
			serverInfo,
			actionButtons
		]);

		// 定时任务区
		m = new form.Map('serverctl');

		s = m.section(form.GridSection, 'task', _('定时任务区'));
		s.addremove = true;
		s.anonymous = true;
		s.modaltitle = function(section_id) { return _('编辑定时任务'); };

		o = s.option(form.Flag, 'enabled', _('启用'));
		o.rmempty = false;
		o.default = '1';

		o = s.option(form.ListValue, 'server', _('目标服务器'));
		if (servers.length === 0) {
			o.value('', _('未配置服务器 (请前往服务器维护标签页添加)'));
		} else {
			servers.forEach(function(srv) {
				o.value(srv.name, srv.name);
			});
		}
		o.rmempty = false;

		o = s.option(form.ListValue, 'action', _('执行动作'));
		o.value('wake', _('唤醒 (WOL)'));
		o.value('sleep', _('休眠'));
		o.value('poweroff', _('关机'));
		o.rmempty = false;

		o = s.option(form.Value, 'hour', _('小时'));
		o.datatype = 'range(0,23)';
		o.default = '8';
		o.rmempty = false;
		o.description = _('0 - 23');

		o = s.option(form.Value, 'min', _('分钟'));
		o.datatype = 'range(0,59)';
		o.default = '30';
		o.rmempty = false;
		o.description = _('0 - 59');

		return m.render().then(function(mapNode) {
			return E('div', [
				E('h2', { 'class': 'cbi-map-title' }, _('手动与定时控制')),
				E('div', { 'class': 'cbi-map-descr' }, _('即时控制局域网内挂载 Ubuntu26.04 的软路由及设备，或设立无人值守定时唤醒及关机策略。')),
				manualControlDom,
				mapNode
			]);
		});
	}
});
