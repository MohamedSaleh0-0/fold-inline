import { PluginSettingTab, App, Setting } from "obsidian";
import InlineCapsulePlugin from "../../main";

export class InlineCapsuleSettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: InlineCapsulePlugin) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Inline Capsule Advanced Settings" });

        new Setting(containerEl)
            .setName("Capsule Visual Theme")
            .setDesc("Toggle the layout theme constraints.")
            .addDropdown(dropdown => dropdown
                .addOption("ghost", "Ghost Inline")
                .addOption("pill", "Smart Pill")
                .addOption("bracket", "Bracket Block")
                .setValue(this.plugin.settings.styleType)
                .onChange(async (value: string) => {
                    this.plugin.settings.styleType = value as "ghost" | "pill" | "bracket";
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Interaction Trigger Mode")
            .setDesc("Choose how the capsule unrolls (Hovering vs Mouse Clicking).")
            .addDropdown(dropdown => dropdown
                .addOption("click", "Click Only")
                .addOption("hover", "Hover Only")
                .addOption("both", "Dual Mode (Hover to peek, Click to lock)")
                .setValue(this.plugin.settings.interactionMode)
                .onChange(async (value: string) => {
                    this.plugin.settings.interactionMode = value as "click" | "hover" | "both";
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Cursor Interactive Behavior")
            .setDesc("Reveal markdown on selection intersection or remain collapsed.")
            .addDropdown(dropdown => dropdown
                .addOption("reveal", "Reveal Markdown on Selection (Wiki-Link flow)")
                .addOption("bypass", "Keep Collapsed (Standard block flow)")
                .setValue(this.plugin.settings.cursorBehavior)
                .onChange(async (value: string) => {
                    this.plugin.settings.cursorBehavior = value as "reveal" | "bypass";
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Opening Delimiter")
            .setDesc("The symbol string that begins a capsule block.")
            .addText(text => text
                .setPlaceholder("[=")
                .setValue(this.plugin.settings.startSymbol)
                .onChange(async (value) => {
                    this.plugin.settings.startSymbol = value || "[=";
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Closing Delimiter")
            .setDesc("The symbol string that terminates a capsule block.")
            .addText(text => text
                .setPlaceholder('=]')
                .setValue(this.plugin.settings.endSymbol)
                .onChange(async (value) => {
                    this.plugin.settings.endSymbol = value || "=]";
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Collapsed Indicator Text")
            .setDesc("The string displayed inside sentences when data is hidden.")
            .addText(text => text
                .setPlaceholder("..")
                .setValue(this.plugin.settings.triggerText)
                .onChange(async (value) => {
                    this.plugin.settings.triggerText = value || "..";
                    await this.plugin.saveSettings();
                }));
    }
}