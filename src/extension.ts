
'use strict';
import { commands, ExtensionContext, window, workspace, Range, Position } from 'vscode';
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
            activeEditor = window.activeTextEditor;
            updateDecorations(decorationType);
        } catch (error){
            console.error("Error from ' window.onDidChangeActiveTextEditor' -->", error);
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
                    if(editor !== window.activeTextEditor || lastActivePosition == undefined) return;

                    const currentPosition = editor.selection.active;
                    const editorHasChangedLines = lastActivePosition.line !== currentPosition.line;
                    const isNewEditor = activeEditor.document.lineCount === 1 && lastActivePosition.line === 0 && lastActivePosition.character == 0;
                    const newDecoration = { range: new Range(currentPosition, currentPosition) };

                    if(editorHasChangedLines || isNewEditor){
                        editor.setDecorations(decorationType, [newDecoration]);
                    }
                });
            }
        }
        catch (error){
            console.error("Error from ' updateDecorations' -->", error);
        } finally {
            if (activeEditor != undefined) {
                lastActivePosition = new Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
            }
        }


    }

    workspace.onDidChangeConfiguration(() => {
        //clear all decorations
        decorationType.dispose();
        decorationType = getDecorationTypeFromConfig();
        updateDecorations(decorationType, true);
    })
}



//UTILITIES
function getDecorationTypeFromConfig() {
    const config = workspace.getConfiguration("highlightLine");
    let value = {
        isWholeLine: true,
        borderWidth: `0 0 2px 0`,
        borderStyle: `solid`, //TODO: file bug, this shouldn't throw a lint error.
        borderColor: `red`
    };
    let allStyles;
    allStyles = config.get("allStyles");
    if (allStyles.highPriority) {
        value.borderColor = config.get("borderColor");
        value.borderStyle = config.get("borderStyle");
        value.borderWidth = `0 0 ${config.get("borderWidth")} 0`;
        value = Object.assign(value, allStyles);
    } else {
        value = Object.assign(allStyles, value);
        value.borderColor = config.get("borderColor");
        value.borderStyle = config.get("borderStyle");
        value.borderWidth = `0 0 ${config.get("borderWidth")} 0`;
    }
    const decorationType = window.createTextEditorDecorationType(value);
    return decorationType;
}


// this method is called when your extension is deactivated
export function deactivate() {
}