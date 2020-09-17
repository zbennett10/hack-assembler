import hackSymbolTable from './symbol-table';

export enum CommandType {
    A_COMMAND = 'A_COMMAND',
    C_COMMAND = 'C_COMMAND',
    L_COMMAND = 'L_COMMAND',
    NONE = 'NONE'
}

// tslint:disable-next-line: no-class
export class HackParser {

    private symbolTable = hackSymbolTable;

    /**
     * 
     * @param asmCode Assembly code that needs to be translated into 16-bit machine language
     */
    public generate(asmCode: string): string {
        const lines = asmCode.replace(/\r/g, "").split(/\n/);

        // First pass through assembly code to build symbol table
        this.symbolTable.buildTable(lines);
        
        // Second pass in order to parse assembly into Hack 16-bit machine language
        const binaryLines = lines.map(line => {
            const cleanLine = line.replace(/\s/g, '');
            const commandType = this.getCommandType(cleanLine);
            if (commandType === CommandType.NONE) {
                return '\n';
            }

            // TODO: need to parse L_COMMAND separately here...
            if (commandType === CommandType.A_COMMAND || commandType === CommandType.L_COMMAND) {
                return this.getSymbol(cleanLine, commandType);
            }

            return ('111' + this.composeCCommandMnemonics(cleanLine)).split('').map((b, i) => (i + 1) % 4 === 0 ? b + ' ' : b).join('');
        });

        return binaryLines.join('\n');
    }

    private getCommandType(line: string): CommandType {
        if (/\@.*/gi.test(line)) {
            return CommandType.A_COMMAND;
        } else if (/.*(=|;).*/gi.test(line)) {
            return CommandType.C_COMMAND;
        } else if (/\(.*\)/gi.test(line)) {
            return CommandType.L_COMMAND;
        }

        return CommandType.NONE;
    }

    private getSymbol(line: string, commandType: CommandType): string {
        switch (commandType) {
            case CommandType.A_COMMAND: {
                // TODO: watch out for labels here
                if (/-?[0-9]+/.test(line.replace('@', ''))) {
                    const parsedNum = parseFloat(line.replace('@', ''));
                    const binary = `0${parsedNum.toString(2)}`;
                    return this.fill(binary).split('').map((b, i) => (i + 1) % 4 === 0 ? b + ' ' : b).join('');
                } else {
                    const memLocation = this.symbolTable.getAddress(line.replace('@', ''));
                    // TODO: need to fix this.. this isn't parsing out correctly
                    const binary = `0${memLocation.toString(2)}`;
                    return this.fill(binary).split('').map((b, i) => (i + 1) % 4 === 0 ? b + ' ' : b).join('');
                }
            }
            default: {
                return '';
            }
        }
    }

    private composeCCommandMnemonics(line: string): string {
        return this.getComp(line) + this.getDest(line) + this.getJump(line);
    }

    private getDest(line: string): string {
        const equalsIdx = line.indexOf('=');
        if (equalsIdx > -1) {
            const dest = line.slice(0, equalsIdx);
            switch (dest) {
                case 'M': return '001';
                case 'D': return '010';
                case 'MD': return '011';
                case 'A': return '100';
                case 'AM': return '101';
                case 'AD': return '110';
                case 'AMD': return '111';
                default: {
                    throw new Error(`Invalid dest field ==> ${dest}`);
                };
            }
        }
        return '000';
    }

    private getComp(line: string): string {
        const equalitySignIdx = line.indexOf('=');
        const semicolonIdx = line.indexOf(';');

        let comp = '';
        // check for just comp
        if (equalitySignIdx < 0 && semicolonIdx < 0) {
            comp = line;
        } else if (equalitySignIdx > -1 && semicolonIdx < 0) { // check for dest=comp
            comp = line.slice(equalitySignIdx + 1);
        } else if (equalitySignIdx > -1 && semicolonIdx > -1) { // check for dest=comp;jump
            comp = line.slice(equalitySignIdx + 1, semicolonIdx);
        } else { // check for comp;jump
            comp = line.slice(0, semicolonIdx);
        }
        
        return this.getARegisterBitVal(comp) + this.determineCompBits(comp);
    }

    // Return c1-c6 of the 16-bit machine language instruction set for the Hack platform where:
    private determineCompBits(line: string): string {
        switch(true) {
            case (line === '0'): return '101010';
            case (line === '1'): return '111111';
            case (line === '-1'): return '111010';
            case (line === 'D'): return '001100';
            case (line === 'A' || line === 'M'): return '110000';
            case (line === '!D'): return '001101';
            case (line === '!A' || line === '!M'): return '110001';
            case (line === '-D'): return '001111';
            case (line === '-A' || line === '-M'): return '110011';
            case (line === 'D+1'): return '011111';
            case (line === 'A+1' || line === 'M+1'): return '110111';
            case (line === 'D-1'): return '001110';
            case (line === 'A-1' || line === 'M-1'): return '110010';
            case (line === 'D+A' || line === 'D+M'): return '000010';
            case (line === 'D-A' || line === 'D-M'): return '010011';
            case (line === 'A-D' || line === 'M-D'): return '000111';
            case (line === 'D&A' || line === 'D&M'): return '000000';
            case (line === 'D|A' || line === 'D|M'): return '010101';
            default: {
                throw new Error(`Unable to parse comp field -> Invalid comp present!  =>> ${line}` )
            }
        }
    }

    private getARegisterBitVal(comp: string): string {
        return comp.includes('M') ? '1' : '0';
    }

    private getJump(line: string): string {
        const semicolonIdx = line.indexOf(';');
        if (semicolonIdx > -1) {
            const jump = line.slice(semicolonIdx + 1);
            switch (jump) {
                case 'JGT': return '001';
                case 'JEQ': return '010';
                case 'JGE': return '011';
                case 'JLT': return '100';
                case 'JNE': return '101';
                case 'JLE': return '110';
                case 'JMP': return '111';
                default: {
                    throw new Error(`Invalid jump field ==> ${jump}`);
                };
            }
        }
        return '000';
    }

    private fill(binary: string): string {
        while (binary.length < 16) {
            binary = '0' + binary;
        }
        return binary;
    }

}