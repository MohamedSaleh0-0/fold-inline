import { IParser } from "../domain/services/IParser";
import { CapsuleNode } from "../domain/models/CapsuleNode";

interface ActiveToken {
    startIndex: number;
    depth: number;
}

export class CapsuleParser implements IParser {
    constructor(
        private readonly startSym: string, 
        private readonly endSym: string
    ) {}

    public parseLine(lineText: string, lineOffset: number): CapsuleNode[] {
        const rootNodes: CapsuleNode[] = [];
        const openTokensStack: ActiveToken[] = [];
        const flattenedRegistry: CapsuleNode[] = [];

        let i = 0;
        while (i < lineText.length) {
            // 1. Evaluate opening boundary encounter
            if (lineText.startsWith(this.startSym, i)) {
                openTokensStack.push({
                    startIndex: i,
                    depth: openTokensStack.length
                });
                i += this.startSym.length;
                continue;
            }

            // 2. Evaluate closing boundary encounter
            if (lineText.startsWith(this.endSym, i)) {
                if (openTokensStack.length > 0) {
                    const matchedToken = openTokensStack.pop()!;
                    const absoluteFrom = lineOffset + matchedToken.startIndex;
                    const absoluteTo = lineOffset + i + this.endSym.length;
                    
                    const contentStart = matchedToken.startIndex + this.startSym.length;
                    const contentEnd = i;
                    const cleanContent = lineText.substring(contentStart, contentEnd);

                    const node: CapsuleNode = {
                        from: absoluteFrom,
                        to: absoluteTo,
                        content: cleanContent,
                        depth: matchedToken.depth,
                        children: []
                    };

                    flattenedRegistry.push(node);
                }
                i += this.endSym.length;
                continue;
            }
            i++;
        }

        // 3. Construct a hierarchical parent-child tree mapping from the flattened registry
        const sortedNodes = flattenedRegistry.sort((a, b) => a.from - b.from || b.to - a.to);

        for (const targetNode of sortedNodes) {
            let directParent: CapsuleNode | null = null;

            for (const potentialParent of sortedNodes) {
                if (
                    potentialParent.from < targetNode.from && 
                    potentialParent.to > targetNode.to && 
                    potentialParent.depth === targetNode.depth - 1
                ) {
                    if (!directParent || potentialParent.from > directParent.from) {
                        directParent = potentialParent;
                    }
                }
            }

            if (directParent) {
                directParent.children.push(targetNode);
            } else if (targetNode.depth === 0) {
                rootNodes.push(targetNode);
            }
        }

        return rootNodes;
    }
}