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
							<p>Please set a default folder ID in the plugin settings.</p>
							<p>Go to Tools > Options > New Note to Default Folder</p>
						</div>
					`);
					await dialogs.open(handle);
					return;
				}

				// Generate timestamp for note title
				const now = new Date();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				const year = String(now.getFullYear()).slice(-2);
				let hours = now.getHours();
				const ampm = hours >= 12 ? 'PM' : 'AM';
				hours = hours % 12 || 12;
				const minutes = String(now.getMinutes()).padStart(2, '0');
				const title = `New Note - ${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;

				// Create new note in the default folder
				const note = await joplin.data.post(['notes'], null, {
					parent_id: folderId,
					title: title,
					body: '',
				});

				// Open the newly created note
				await joplin.commands.execute('openNote', note.id);

				// Focus on the note body for immediate typing
				await joplin.commands.execute('focusElementNoteBody');
			},
		});

		// Add the command to the Tools menu with keyboard shortcut
		const shortcut = await joplin.settings.value('keyboardShortcut');
		await joplin.views.menuItems.create('newNoteToDefaultMenuItem', 'newNoteToDefaultFolder', MenuItemLocation.Tools, { accelerator: shortcut });
	},
});
