import joplin from 'api';
import { MenuItemLocation, SettingItemType } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		// Register settings section
		await joplin.settings.registerSection('newNoteToDefault', {
			label: 'New Note to Default Folder',
			iconName: 'fas fa-folder',
		});

		// Register settings
		await joplin.settings.registerSettings({
			'defaultFolderId': {
				value: '',
				type: SettingItemType.String,
				section: 'newNoteToDefault',
				public: true,
				label: 'Default Folder ID',
				description: 'The ID of the folder where new notes will be created. To find a folder ID, right-click on a notebook and select "Copy external link", then extract the ID from the URL.',
			},
			'keyboardShortcut': {
				value: 'Ctrl+O',
				type: SettingItemType.String,
				section: 'newNoteToDefault',
				public: true,
				label: 'Keyboard Shortcut',
				description: 'The keyboard shortcut to create a new note in the default folder. Use format like "Ctrl+O", "Ctrl+Shift+N", "CmdOrCtrl+Alt+N". Requires restart to take effect.',
			},
		});

		// Register command to create new note in default folder
		await joplin.commands.register({
			name: 'newNoteToDefaultFolder',
			label: 'New Note in Default Folder',
			execute: async () => {
				const folderId = await joplin.settings.value('defaultFolderId');

				if (!folderId) {
					const dialogs = joplin.views.dialogs;
					const handle = await dialogs.create('errorDialog');
					await dialogs.setHtml(handle, `
						<div style="padding: 20px; text-align: center;">
							<h2>No Default Folder Set</h2>
							<p>Please configure the default folder for new notes:</p>
							<ol style="text-align: left;">
								<li>Go to <strong>Tools → Options → New Note to Default Folder</strong></li>
								<li>Right-click on your desired notebook and select <strong>"Copy external link"</strong></li>
								<li>Paste the link and extract the folder ID (the long string after "://")</li>
								<li>Enter that ID in the "Default Folder ID" setting</li>
							</ol>
						</div>
					`);
					await dialogs.open(handle);
					return;
				}

				try {
					// Verify the folder exists
					await joplin.data.get(['folders', folderId]);
				} catch (error) {
					const dialogs = joplin.views.dialogs;
					const handle = await dialogs.create('errorDialog');
					await dialogs.setHtml(handle, `
						<div style="padding: 20px; text-align: center;">
							<h2>Invalid Folder ID</h2>
							<p>The configured folder ID does not exist or is invalid.</p>
							<p>Please check your settings in <strong>Tools → Options → New Note to Default Folder</strong></p>
							<p style="color: #888; font-size: 0.9em;">Current ID: ${folderId}</p>
						</div>
					`);
					await dialogs.open(handle);
					return;
				}

				// Switch to the default folder, wait for UI, then create new note
				// This uses Joplin's native newNote which auto-titles from first line
				await joplin.commands.execute('openFolder', folderId);
				await new Promise(resolve => setTimeout(resolve, 100));
				await joplin.commands.execute('newNote');
			},
		});

		// Add the command to the Tools menu with keyboard shortcut
		const shortcut = await joplin.settings.value('keyboardShortcut');
		await joplin.views.menuItems.create('newNoteToDefaultMenuItem', 'newNoteToDefaultFolder', MenuItemLocation.Tools, { accelerator: shortcut });
	},
});
