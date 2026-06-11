import { Extension, StateField, StateEffect } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { RangeSetBuilder, Prec } from "@codemirror/state";
import { CapsuleSettings } from "../../domain/models/Settings";
import { CapsuleParser } from "../../application/CapsuleParser";
import { CapsuleWidget } from "./CapsuleWidget";
import { CapsuleNode } from "../../domain/models/CapsuleNode";

export const updateCapsuleSettingsEffect = StateEffect.define<CapsuleSettings>();
export const toggleSingleCapsuleEffect = StateEffect.define<number>();

let openAbsolutePositions = new Set<number>();

export function createCapsuleExtension(
    initialSettings: CapsuleSettings,
    expandedCache: Set<string>
): Extension {
    
    let currentSettings = initialSettings;
    let parser = new CapsuleParser(currentSettings.startSymbol, currentSettings.endSymbol);

    const capsuleField = StateField.define<DecorationSet>({
        create(state) {
            return buildDecorations(state, currentSettings, parser, openAbsolutePositions);
        },
        update(decorations, tr) {
            if (tr.docChanged) {
                const shiftedPositions = new Set<number>();
                openAbsolutePositions.forEach(pos => {
                    shiftedPositions.add(tr.changes.mapPos(pos));
                });
                openAbsolutePositions = shiftedPositions;
            }

            for (let effect of tr.effects) {
                if (effect.is(toggleSingleCapsuleEffect)) {
                    const targetPos = effect.value;
                    if (openAbsolutePositions.has(targetPos)) {
                        openAbsolutePositions.delete(targetPos);
                    } else {
                        openAbsolutePositions.add(targetPos);
                    }
                    return buildDecorations(tr.state, currentSettings, parser, openAbsolutePositions);
                }
                if (effect.is(updateCapsuleSettingsEffect)) {
                    currentSettings = effect.value;
                    parser = new CapsuleParser(currentSettings.startSymbol, currentSettings.endSymbol);
                    
                    // إصلاح: تصفير كامل للمواقع القديمة عند تعديل الـ Triggers أو الـ Hover لمنع التداخل العشوائي
                    openAbsolutePositions.clear();
                    return buildDecorations(tr.state, currentSettings, parser, openAbsolutePositions);
                }
            }

            if (tr.docChanged || !tr.startState.selection.eq(tr.state.selection)) {
                return buildDecorations(tr.state, currentSettings, parser, openAbsolutePositions);
            }
            return decorations.map(tr.changes);
        },
        provide: field => EditorView.decorations.from(field)
    });

    return Prec.highest(capsuleField);
}

function buildDecorations(
    state: any,
    settings: CapsuleSettings,
    parser: CapsuleParser,
    openPositions: Set<number>
): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const selectionRanges = state.selection.ranges;
    const startSym = settings.startSymbol;

    for (let i = 1; i <= state.doc.lines; i++) {
        const line = state.doc.line(i);
        if (!line.text.includes(startSym)) continue;

        const rootNodes = parser.parseLine(line.text, line.from);

        const processNode = (node: CapsuleNode) => {
            if (settings.cursorBehavior === "reveal") {
                let isCursorInside = false;
                for (let range of selectionRanges) {
                    if (range.from <= node.to && range.to >= node.from) {
                        isCursorInside = true;
                        break;
                    }
                }
                if (isCursorInside) {
                    node.children.forEach(processNode);
                    return;
                }
            }

            const isExpanded = openPositions.has(node.from);
            
            // إصلاح: تفعيل ميزة القفز التلقائي بكتلة واحدة صلبة عند تفعيل وضع الـ Bypass
            const isBypassMode = settings.cursorBehavior === "bypass";

            builder.add(
                node.from,
                node.to,
                Decoration.replace({
                    widget: new CapsuleWidget(
                        node.content,
                        settings,
                        isExpanded,
                        node.from
                    ),
                    atomic: isBypassMode
                })
            );
        };

        rootNodes.forEach(processNode);
    }

    return builder.finish();
}