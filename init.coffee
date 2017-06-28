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

atom.commands.add 'atom-text-editor', 'tree-view:hide-git-ignored-files', ->
    atom.config.set('tree-view.hideVcsIgnoredFiles', true)


atom.commands.add 'atom-text-editor', 'tree-view:show-git-ignored-files', ->
    atom.config.set('tree-view.hideVcsIgnoredFiles', false)
