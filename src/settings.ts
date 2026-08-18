import { App, PluginSettingTab, Setting } from 'obsidian';
import ZeroFlickerPlugin from './main';

export interface ZeroFlickerSettings {
    viewModeKey: string;
}

export const DEFAULT_SETTINGS: ZeroFlickerSettings = {
    viewModeKey: 'view',
};

export class ZeroFlickerSettingTab extends PluginSettingTab {
    plugin: ZeroFlickerPlugin;

    constructor(app: App, plugin: ZeroFlickerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Zero-Flicker View Mode Settings' });

        new Setting(containerEl)
            .setName('Frontmatter Key')
            .setDesc('The property name used in your frontmatter (default is "view")')
            .addText((text) =>
                text
                    .setPlaceholder('view')
                    .setValue(this.plugin.settings.viewModeKey)
                    .onChange(async (value) => {
                        this.plugin.settings.viewModeKey = value.trim() || 'view';
                        await this.plugin.saveSettings();
                    })
            );
    }
}