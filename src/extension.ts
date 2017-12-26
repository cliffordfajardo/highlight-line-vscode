
'use strict'
import { commands, ExtensionContext, window, workspace, Range, Position} from 'vscode'
import { setTimeout } from 'timers';

export async function activate(context: ExtensionContext) {
    /*NOTE: we should only create 1 declaration type object once, as done here.
      If we recreate it in 'updateDecorations' each time, when we removeDecorations,
      they will reference diff objects.
    */
    let decorationType = getDecorationTypeFromConfig();
    let activeEditor = window.activeTextEditor;
    let lastActivePosition;


    /**
     * This is required. When we create a new tab in our editor, we want
     * to update the activeEditor.
     */
    window.onDidChangeActiveTextEditor(() => {
        try {
            activeEditor = window.activeTextEditor
            updateDecorations(decorationType)
        } catch (error){
            console.error("Error from ' window.onDidChangeActiveTextEditor' -->", error)
        } finally {
            lastActivePosition = new Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
        }
    })

    /**
     * Any time we move anywhere around our editor, we want to trigger
     * a decoration.
     */
    window.onDidChangeTextEditorSelection(() => {
        activeEditor = window.activeTextEditor;   
        updateDecorations(decorationType);
    })
    /**
     * 
     * @param decorationType - defines our decorations settings.
     */
    function updateDecorations(decorationType, updateAllVisibleEditors=false) {
        try {
            if (updateAllVisibleEditors) {
                window.visibleTextEditors.forEach((editor) => {
                    const currentPosition = editor.selection.active;
                    const currentLine = editor.selection.active.line;
                    const newDecoration = { range: new Range(currentPosition, currentPosition) };
                    editor.setDecorations(decorationType, [newDecoration]);
                });
            }

            //edit only currently active editor
            else {
                window.visibleTextEditors.forEach((editor) => {
                    if(editor !== window.activeTextEditor) return;
                    
                    const currentPosition = editor.selection.active
                    const editorHasChangedLines = lastActivePosition.line !== currentPosition.line
                    const isNewEditor = activeEditor.document.lineCount === 1 && lastActivePosition.line === 0 && lastActivePosition.character == 0;
                    const newDecoration = { range: new Range(currentPosition, currentPosition) }
                    
                    if(editorHasChangedLines || isNewEditor){
                        editor.setDecorations(decorationType, [newDecoration])
                    }
                });
            }
        } 
        catch (error){
            console.error("Error from ' updateDecorations' -->", error)
        } finally {
            lastActivePosition = new Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
        }


    }

    workspace.onDidChangeConfiguration(() => {
        //clear all decorations
        decorationType.dispose();
        decorationType = getDecorationTypeFromConfig();
        updateDecorations(decorationType, true)
    })
}



//UTILITIES
function getDecorationTypeFromConfig() {
    const config = workspace.getConfiguration("highlightLine")
    const borderColor = config.get("borderColor");
    const borderWidth = config.get("borderWidth");
    const borderStyle = config.get("borderStyle");
    const decorationType = window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: `0 0 ${borderWidth} 0`,
        borderStyle: `${borderStyle}`, //TODO: file bug, this shouldn't throw a lint error.
        borderColor
    })
    return decorationType;
}


// this method is called when your extension is deactivated
export function deactivate() {
}