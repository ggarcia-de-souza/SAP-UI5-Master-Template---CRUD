/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"numen/talentos/ztlnt2021012/test/integration/PhoneJourneys"
	], function() {
		QUnit.start();
	});
});