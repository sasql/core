export class DiagnosticMessage extends Error {
    constructor(
        message: string,
        public startIndex: number,
        public endIndex: number
    ) {
        super(message);
    }
}
