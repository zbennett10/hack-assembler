class SymbolTable {
    private symbolMap;

    constructor() {
       this.symbolMap = {
        'ARG': '2',
        'KBD': '24576',
        'LCL': '1',
        'SCREEN': '16384',
        'SP': '0',
        'THAT': '4',
        'THIS': '3'
       };

       ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15']
        .forEach((r, idx) => this.symbolMap[r] = idx.toString());
    }

    public contains(symbol: string): boolean {
        const match = this.symbolMap[symbol];
        return match && typeof match === 'number';
    }

    public getAddress(symbol: string): number {
        return this.symbolMap[symbol];
    }

    public buildTable(asmLines: string[]): void {
        let currentMemoryAddr = 16;
        let currentLineCount = -1;
        asmLines.forEach(line => {
            const cleanLine = line.replace(/\s/g, '');
            if (/^\/\//.test(cleanLine)) {
                return;
            }

            if (/^\(.*\)/.test(cleanLine)) { // We have encountered a label!
                const label = cleanLine.replace('(', '').replace(')', '')
                this.addEntry(label, currentLineCount);
                return;
            }

            if (/^@[a-z]/.test(cleanLine)) { // We have encountered a variable
                const symbol = cleanLine.replace('@', '');
                if (!this.contains(symbol)) {
                    this.addEntry(symbol, currentMemoryAddr);
                    currentMemoryAddr++;
                }
            }


            currentLineCount++;

        });
    }


    private addEntry(symbol: string, address: number): void {
        if (!this.symbolMap[symbol]) {
            this.symbolMap[symbol] = address;
        }
    }


}

const hackSymbolTable = new SymbolTable(); // Ensure this is a singleton

export default hackSymbolTable;