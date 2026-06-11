import { MarkdownPostProcessorContext } from "obsidian";
import { CapsuleSettings } from "../../domain/models/Settings";
import { CapsuleParser } from "../../application/CapsuleParser";
import { CapsuleNode } from "../../domain/models/CapsuleNode";

export function createMarkdownPostProcessor(
    settings: CapsuleSettings,
    expandedCache: Set<string>
) {
    return (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const startSym = settings.startSymbol;
        const parser = new CapsuleParser(startSym, settings.endSymbol);

        const blocks = el.querySelectorAll("p, li, span");
        
        blocks.forEach((node: Element) => {
            const block = node as HTMLElement;
            if (!block.innerText || !block.innerText.includes(startSym)) return;

            const rawText = block.innerText;
            const rootNodes = parser.parseLine(rawText, 0);

            if (rootNodes.length === 0) return;

            block.empty();
            
            const renderTree = (nodes: CapsuleNode[], parentEl: HTMLElement, textOffset: number, fullText: string) => {
                let lastIndex = 0;

                nodes.forEach(node => {
                    const localFrom = node.from - textOffset;
                    const localTo = node.to - textOffset;

                    if (localFrom > lastIndex) {
                        parentEl.appendChild(document.createTextNode(fullText.substring(lastIndex, localFrom)));
                    }

                    const wrapper = document.createElement("span");
                    wrapper.className = `inline-capsule-wrapper theme-${settings.styleType}`;
                    
                    const isExpanded = expandedCache.has(node.content);
                    if (isExpanded) wrapper.classList.add("is-expanded");

                    const trigger = document.createElement("span");
                    trigger.className = "inline-capsule-trigger";
                    trigger.innerText = settings.triggerText;

                    const contentSpan = document.createElement("span");
                    contentSpan.className = "inline-capsule-content";

                    if (node.children.length > 0) {
                        renderTree(node.children, contentSpan, node.from + startSym.length, node.content);
                    } else {
                        contentSpan.innerText = node.content;
                    }

                    wrapper.appendChild(trigger);
                    wrapper.appendChild(contentSpan);

                    bindPostProcessorEvents(wrapper, node.content, settings, expandedCache);

                    parentEl.appendChild(wrapper);
                    lastIndex = localTo;
                });

                if (lastIndex < fullText.length) {
                    parentEl.appendChild(document.createTextNode(fullText.substring(lastIndex)));
                }
            };

            renderTree(rootNodes, block, 0, rawText);
        });
    };
}

function bindPostProcessorEvents(
    wrapper: HTMLElement,
    content: string,
    settings: CapsuleSettings,
    expandedCache: Set<string>
) {
    const mode = settings.interactionMode;

    if (mode === "click" || mode === "both") {
        wrapper.addEventListener("click", (e) => {
            e.stopPropagation();
            if (expandedCache.has(content)) {
                expandedCache.delete(content);
                wrapper.classList.remove("is-expanded");
            } else {
                expandedCache.add(content);
                wrapper.classList.add("is-expanded");
            }
        });
    }

    if (mode === "hover" || mode === "both") {
        wrapper.addEventListener("mouseenter", () => wrapper.classList.add("is-hover-revealed"));
        wrapper.addEventListener("mouseleave", () => wrapper.classList.remove("is-hover-revealed"));
    }
}