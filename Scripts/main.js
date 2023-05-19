const BUNDLE_IDENTIFIERS = require("Util/bundle_ids");

exports.activate = function() {
	// Do work when the extension is activated
}

exports.deactivate = function() {
	// Clean up state before the extension is deactivated
}

function getTerminal(workspace) {
	if (workspace.config.get("terminal") != "Global Config") {
		return workspace.config.get("terminal");
	} else {
		return nova.config.get("terminal");
	}
}

nova.commands.register("open.externalterminal", (workspace) => {
	const terminal = BUNDLE_IDENTIFIERS[getTerminal(workspace)];

	let args;

	if (workspace.path) {
		args = [workspace.path, "-b", terminal, "--args", "--working-directory", workspace.path];

		if (terminal == "io.alacritty") args.shift();
	} else {
		args = ["-b", terminal];
	}

	let process = new Process("/usr/bin/open", { args });
	process.onStderr((msg) => console.error(msg));

	process.onDidExit((exitCode) => {
		if (exitCode == 1) {
			let notification = new NotificationRequest("non-zero");

			notification.title = nova.localize(
				"Couldn't find;" + terminal,
			);
			notification.body = nova.localize(
				"Pick another terminal emulator",
			);

			notification.actions = [
				nova.localize("OK", "Dismiss"),
				nova.localize("Pick another"),
			];

			nova.notifications.add(notification).then((reply) => {
				if (reply.actionIdx == 1) {
					switch (workspace.config.get("terminal")) {
						case "Global Config": {
							nova.openConfig();
							break;
						}

						default: {
							workspace.openConfig();
							break;
						}
					}
				}
			});
		}
	});

	process.start();
})
