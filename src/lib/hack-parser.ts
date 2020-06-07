export enum CommandType {
    A_COMMAND = 'A_COMMAND',
    C_COMMAND = 'C_COMMAND',
    L_COMMAND = 'L_COMMAND',
    NONE = 'NONE'
}

// tslint:disable-next-line: no-class
export class HackParser {
    
    constructor() {}

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
        } else if (/.*\;.*/gi.test(line)) {
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
                return this.fill(binary);
            }
            case CommandType.L_COMMAND: { // For parsing pseduo-commands like (LOOP) or (END)
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
        return line;
    }

    private getComp(line: string): string {
        return line;
    }

    private getJump(line: string): string {
        return line;
    }

    private fill(binary: string): string {
        while (binary.length < 16) {
            binary = '0' + binary;
        }
        return binary;
    }

}