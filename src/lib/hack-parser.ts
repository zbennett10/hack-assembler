export enum CommandType {
    A_COMMAND = 'A_COMMAND',
    C_COMMAND = 'C_COMMAND',
    L_COMMAND = 'L_COMMAND',
    NONE = 'NONE'
}

// tslint:disable-next-line: no-class
export class HackParser {

    /**
     * 
     * @param asmCode Assembly code that needs to be translated into 16-bit machine language
     */
    public generate(asmCode: string): string {
        const lines = asmCode.replace(/\r/g, "").split(/\n/);
        
        // TODO:
        // Read assembly code and build symbol table
        // Parse each line of assembly code and write hack binary code  using symbol table

        // First impl w/o symbol table
        const binaryLines = lines.map(line => {
            const commandType = this.getCommandType(line);
            if (commandType === CommandType.NONE) {
                return '\n';
            }

            if (commandType === CommandType.A_COMMAND || commandType === CommandType.L_COMMAND) {
                return this.getSymbol(line, commandType);
            }

            return this.composeCCommandMnemonics(line);
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
                const parsedNum = parseFloat(line.replace('@', ''));
                const binary = `0${parsedNum.toString(2)}`;
                // TODO: this will need to check the symbol table if a symbol and not a number directly
                return this.fill(binary).split('').map((b, i) => (i + 1) % 4 === 0 ? b + ' ' : b).join('');
            }
            case CommandType.C_COMMAND: {
                return this.fill(('111' + this.composeCCommandMnemonics(line))).split('').map((b, i) => (i + 1) % 4 === 0 ? b + ' ' : b).join('');

            }
            case CommandType.L_COMMAND: { // For parsing pseudo-commands like (LOOP) or (END)
                // TODO: Need to store symbol location...
                return '\n';
            }
            default: {
                return '\n';
            }
        }
    }

    private composeCCommandMnemonics(line: string): string {
        return this.getDest(line) + this.getComp(line) + this.getJump(line);
    }

    private getDest(line: string): string {
        const equalsIdx = line.indexOf('=');
        if (equalsIdx > -1) {
            switch (line.slice(0, equalsIdx)) {
                case 'M': return '001';
                case 'D': return '010';
                case 'MD': return '011';
                case 'A': return '100';
                case 'AM': return '101';
                case 'AD': return '110';
                case 'AMD': return '111';
                default: return '';
            }
        }
        return '';
    }

    // TODO: 9/11/2020 - left off here - see page 109 in book
    private getComp(line: string): string {
        return line;
    }

    private getJump(line: string): string {
        const semicolonIdx = line.indexOf(';');
        if (semicolonIdx > -1) {
            switch (line.slice(semicolonIdx)) {
                case 'JGT': return '001';
                case 'JEQ': return '010';
                case 'JGE': return '011';
                case 'JLT': return '100';
                case 'JNE': return '101';
                case 'JLE': return '110';
                case 'JMP': return '111';
                default: return '';
            }
        }
        return '';
    }

    private fill(binary: string): string {
        while (binary.length < 16) {
            binary = '0' + binary;
        }
        return binary;
    }

}