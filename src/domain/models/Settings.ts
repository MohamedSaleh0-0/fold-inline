export interface CapsuleSettings {
    styleType: "ghost" | "pill" | "bracket";
    cursorBehavior: "reveal" | "bypass";
    interactionMode: "click" | "hover" | "both";
    startSymbol: string;
    endSymbol: string;
    triggerText: string;
}

export const DEFAULT_SETTINGS: CapsuleSettings = {
    styleType: "ghost",
    cursorBehavior: "reveal",
    interactionMode: "click",
    startSymbol: "[=",
    endSymbol: "=]",
    triggerText: ".."
};