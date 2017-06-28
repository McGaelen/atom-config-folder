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

atom.commands.add 'tree-view', 'tree-view:hide-vcs-ignored-files', ->
  atom.config.set('tree-view.hideVcsIgnoredFiles', true)



atom.commands.add 'tool-panel tree-view', 'tree-view:show-vcs-ignored-files', ->
  atom.config.set('tree-view', hideVcsIgnoredFiles, false)

atom.commands.add 'atom-text-editor', 'markdown:paste-as-link', ->
  return unless editor = atom.workspace.getActiveTextEditor()

  selection = editor.getLastSelection()
  clipboardText = atom.clipboard.read()

  selection.insertText("[#{selection.getText()}](#{clipboardText})")
