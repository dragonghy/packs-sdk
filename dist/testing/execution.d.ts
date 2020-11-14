import type { ExecutionContext } from '../api_types';
import type { GenericSyncFormula } from '../api';
import type { PackDefinition } from '../types';
import type { ParamDefs } from '../api_types';
import type { ParamValues } from '../api_types';
import type { SyncExecutionContext } from '../api_types';
import type { TypedStandardFormula } from '../api';
export interface ExecuteOptions {
    validateParams?: boolean;
    validateResult?: boolean;
}
export interface ExecuteSyncOptions extends ExecuteOptions {
    maxIterations?: number;
}
export declare function executeFormula(formula: TypedStandardFormula, params: ParamValues<ParamDefs>, context?: ExecutionContext, { validateParams: shouldValidateParams, validateResult: shouldValidateResult }?: ExecuteOptions): Promise<any>;
export declare function executeFormulaFromPackDef(packDef: PackDefinition, formulaNameWithNamespace: string, params: ParamValues<ParamDefs>, context?: ExecutionContext, options?: ExecuteOptions): Promise<any>;
export declare function executeFormulaFromCLI(args: string[], module: any): Promise<void>;
export declare function executeSyncFormula(formula: GenericSyncFormula, params: ParamValues<ParamDefs>, context?: SyncExecutionContext, { validateParams: shouldValidateParams, validateResult: shouldValidateResult, maxIterations: maxIterations, }?: ExecuteSyncOptions): Promise<any[]>;
export declare function executeSyncFormulaFromPackDef(packDef: PackDefinition, syncFormulaName: string, params: ParamValues<ParamDefs>, context?: SyncExecutionContext, options?: ExecuteSyncOptions): Promise<any[]>;
