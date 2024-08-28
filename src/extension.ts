import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const getAntdComponentNameFromCursor = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const document = editor.document;
		const cursorPosition = editor.selection.active;
		const wordRange = document.getWordRangeAtPosition(cursorPosition, /<\s*a-[a-z-]+/i);

		if (!wordRange) {
			vscode.commands.executeCommand('setContext', 'extension.showAntdDocs', false);
			return;
		}

		const componentText = document.getText(wordRange).trim();
		const componentName = extractComponentName(componentText);
		return componentNameToDocsURL(componentName);
	};

	// Register a command that can be invoked via keyboard shortcut or context menu
	let disposable = vscode.commands.registerCommand('extension.openAntdDocumentation', () => {
		const componentDocsUrl = getAntdComponentNameFromCursor();

		if (componentDocsUrl) {
			vscode.env.openExternal(vscode.Uri.parse(componentDocsUrl));
		} else {
			vscode.window.showErrorMessage('No matching Ant Design Vue component found.');
		}
	});

  context.subscriptions.push(disposable);
}

function componentNameToDocsURL(componentName: string): string | undefined {
	// If there is no a- prefix, its not a valid Ant Design Vue component.
	if (!componentName.startsWith('a-')) {
		return;
	}

	// Chop off the a- prefix and convert to lowercase
	let componentKey = componentName.replace(/^a-/, '').toLowerCase();

	// There are many components that do not have their own page, but are part of a parent page.
	// For example: a-menu-item is part of the a-menu page.
	// This map contains the parent page for such components.
	const componentParentMap: { [key: string]: string } = {
		'breadcrumb-item': 'breadcrumb',
		'form-item': 'form',
		'input-group': 'input',
		'input-search': 'input',
		'input-password': 'input',
		'textarea': 'input',
		'menu-item': 'menu',
		'sub-menu': 'menu',
		'tab-pane': 'tabs',
		'table-column': 'table',
		'table-column-group': 'table',
		'timeline-item': 'timeline',
		'tree-node': 'tree',
		'checkbox-group': 'checkbox',
		'radio-group': 'radio',
		'select-option': 'select',
		'select-opt-group': 'select',
		'tree-select-node': 'tree-select',
		'cascader-panel': 'cascader',
		'cascader-node': 'cascader',
		'cascader-menu': 'cascader',
		'cascader-menu-item': 'cascader',
		'cascader-menu-item-group': 'cascader',
	};

	// If the component is in the map, use the parent page.
	if (componentParentMap[componentKey]) {
		componentKey = componentParentMap[componentKey];
	} 

	componentKey = componentKey.replace(/-/g, '_');

	return `https://www.antdv.com/components/${componentKey}#api`;
  
}

// Function to extract component name from text
function extractComponentName(text: string): string {
  const match = text.match(/<\s*(a-[a-z-]+)/i);
  return match ? match[1] : '';
}

export function deactivate() {}