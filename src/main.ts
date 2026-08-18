import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import {
    DEFAULT_SETTINGS,
    ZeroFlickerSettings,
    ZeroFlickerSettingTab,
} from './settings';

export default class ZeroFlickerPlugin extends Plugin {
    settings!: ZeroFlickerSettings;
    private originalOpenFile!: typeof WorkspaceLeaf.prototype.openFile;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ZeroFlickerSettingTab(this.app, this));

        this.originalOpenFile = WorkspaceLeaf.prototype.openFile;
        const self = this;

        WorkspaceLeaf.prototype.openFile = async function (
            file: TFile,
            openState?: any
        ) {
            if (file && file instanceof TFile) {
                const cache = self.app.metadataCache.getFileCache(file);

                const rawViewMode = cache?.frontmatter?.[self.settings.viewModeKey];
                const viewMode = typeof rawViewMode === 'string' ? rawViewMode.toLowerCase().trim() : null;

                openState = openState || {};
                openState.state = openState.state || {};

                if (viewMode === 'reading') {
                    // Force Reading View for this file
                    openState.state.mode = 'preview';
                } else if (viewMode === 'edit') {
                    // Force Live Preview for this file
                    openState.state.mode = 'source';
                    openState.state.source = false;
                } else {
                    // RESET TAB: File has no property, restore global Vault defaults
                    const vaultConfig = (self.app.vault as any).config || {};
                    const defaultMode = vaultConfig.defaultViewMode || 'source';
                    const isLivePreview = vaultConfig.livePreview !== false;

                    openState.state.mode = defaultMode;
                    if (defaultMode === 'source') {
                        openState.state.source = !isLivePreview;
                    }
                }
            }

            return self.originalOpenFile.call(this, file, openState);
        };
    }

    onunload() {
        if (this.originalOpenFile) {
            WorkspaceLeaf.prototype.openFile = this.originalOpenFile;
        }
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as Partial<ZeroFlickerSettings>
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}