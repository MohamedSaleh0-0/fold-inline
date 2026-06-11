import { CapsuleNode } from "../models/CapsuleNode";

export interface IParser {
    parseLine(lineText: string, lineOffset: number): CapsuleNode[];
}