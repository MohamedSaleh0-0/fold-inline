export interface CapsuleNode {
    from: number;        // Absolute start position inside the document line stream
    to: number;          // Absolute end position inside the document line stream
    content: string;     // Isolated text content bounded inside the node delimiters
    depth: number;       // The exact zero-indexed recursion nesting level
    children: CapsuleNode[]; // Structural array mapping deeply nested sub-capsules
}