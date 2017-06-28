# Your init script
#
# Atom will evaluate this file each time a new window is opened. It is run
# after packages are loaded/activated and after the previous editor state
# has been restored.
#
# An example hack to log to the console when each text editor is saved.
#
# atom.workspace.observeTextEditors (editor) ->
#   editor.onDidSave ->
#     console.log "Saved! #{editor.getPath()}"
{CompositeDisposable} = require 'atom'

c = atom.config
subscriptions = new CompositeDisposable

# Shows/hides files that are git ignored in the tree view.
subscriptions.add atom.commands.add 'atom-text-editor', 'tree-view:hide-git-ignored-files', ->
    c.set('tree-view.hideVcsIgnoredFiles', true)

subscriptions.add atom.commands.add 'atom-text-editor', 'tree-view:show-git-ignored-files', ->
    c.set('tree-view.hideVcsIgnoredFiles', false)
