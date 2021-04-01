import type { Arguments } from 'yargs';
interface ValidateArgs {
    manifestFile: string;
}
export declare function handleValidate({ manifestFile }: Arguments<ValidateArgs>): Promise<void>;
export declare function validateMetadata(_manifestFile: string): Promise<void>;
export {};
