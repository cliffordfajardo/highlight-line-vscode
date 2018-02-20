'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var vscode_1 = require("vscode");
function activate(context) {
    return __awaiter(this, void 0, void 0, function () {
        /**
         *
         * @param decorationType - defines our decorations settings.
         */
        function updateDecorations(decorationType, updateAllVisibleEditors) {
            if (updateAllVisibleEditors === void 0) { updateAllVisibleEditors = false; }
            try {
                if (updateAllVisibleEditors) {
                    vscode_1.window.visibleTextEditors.forEach(function (editor) {
                        var currentPosition = editor.selection.active;
                        var currentLine = editor.selection.active.line;
                        var newDecoration = { range: new vscode_1.Range(currentPosition, currentPosition) };
                        editor.setDecorations(decorationType, [newDecoration]);
                    });
                }
                else {
                    vscode_1.window.visibleTextEditors.forEach(function (editor) {
                        if (editor !== vscode_1.window.activeTextEditor)
                            return;
                        var currentPosition = editor.selection.active;
                        var editorHasChangedLines = lastActivePosition.line !== currentPosition.line;
                        var isNewEditor = activeEditor.document.lineCount === 1 && lastActivePosition.line === 0 && lastActivePosition.character == 0;
                        var newDecoration = { range: new vscode_1.Range(currentPosition, currentPosition) };
                        if (editorHasChangedLines || isNewEditor) {
                            editor.setDecorations(decorationType, [newDecoration]);
                        }
                    });
                }
            }
            catch (error) {
                console.error("Error from ' updateDecorations' -->", error);
            }
            finally {
                lastActivePosition = new vscode_1.Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
            }
        }
        var decorationType, activeEditor, lastActivePosition;
        return __generator(this, function (_a) {
            decorationType = getDecorationTypeFromConfig();
            activeEditor = vscode_1.window.activeTextEditor;
            /**
             * This is required. When we create a new tab in our editor, we want
             * to update the activeEditor.
             */
            vscode_1.window.onDidChangeActiveTextEditor(function () {
                try {
                    activeEditor = vscode_1.window.activeTextEditor;
                    updateDecorations(decorationType);
                }
                catch (error) {
                    console.error("Error from ' window.onDidChangeActiveTextEditor' -->", error);
                }
                finally {
                    lastActivePosition = new vscode_1.Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
                }
            });
            /**
             * Any time we move anywhere around our editor, we want to trigger
             * a decoration.
             */
            vscode_1.window.onDidChangeTextEditorSelection(function () {
                activeEditor = vscode_1.window.activeTextEditor;
                updateDecorations(decorationType);
            });
            vscode_1.workspace.onDidChangeConfiguration(function () {
                //clear all decorations
                decorationType.dispose();
                decorationType = getDecorationTypeFromConfig();
                updateDecorations(decorationType, true);
            });
            return [2 /*return*/];
        });
    });
}
exports.activate = activate;
//UTILITIES
function getDecorationTypeFromConfig() {
    var config = vscode_1.workspace.getConfiguration("highlightLine");
    var borderColor = config.get("borderColor");
    var borderWidth = config.get("borderWidth");
    var borderStyle = config.get("borderStyle");
    var backgroundColor = config.get("backgroundColor");
    var decorationType = vscode_1.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: "0 0 " + borderWidth + " 0",
        borderStyle: "" + borderStyle,
        borderColor: borderColor,
        backgroundColor: backgroundColor === "none" ? null : backgroundColor
    });
    return decorationType;
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
