import fs from 'fs';
import { HackParser } from './hack-parser';

export const Assemble = (asmFilePath: string, outputPath = './hack.bin'): void => {
    const asmFileContents = fs.readFileSync(asmFilePath, { encoding: 'utf-8' });
    const parser = new HackParser();
    const hackBinary = parser.generate(asmFileContents);

    return fs.writeFileSync(outputPath, hackBinary);
};

Assemble('./test.asm');
