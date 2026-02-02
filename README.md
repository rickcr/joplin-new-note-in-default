# Joplin Plugin
A plugin that allows with a shortcut to start a note (ctrl-o)  in a default folder (regardless of what
folder you have currently selected.) 

While I'm working, I often don't know what folder I really want 
the note to end up in, so I created a "_misc" folder ('_inbox' is another good name) and when I 
activate the shortcut (ctrl-o) a new note is started with the current time stamp in this folder.

# Note
I just vibe coded this with Claude but it works well enough for me.

I don't really know TypeScript (but code in Java/Go) so someone else free to make this better.

# Usage
In Tools -> Options -> Plugins

set the id of the default folder you want notes to be created in when you activate the shortcut.

# TODO
- make short-cut configurable? (I plan to use ctrl-o so just hardcoded it)
- make the note title have an override in settings 
- have an option to default to title that the user starts with for editing (vs body)
