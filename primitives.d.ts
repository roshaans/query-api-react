// Generated by dts-bundle v0.7.3

declare module '@near-lake/primitives' {
    export { LakeContext } from '@near-lake/primitives/lakeContext';
    export { Block } from '@near-lake/primitives/block';
    export { Event } from '@near-lake/primitives/events';
    export { Receipt } from '@near-lake/primitives/receipts';
    export { StateChange } from '@near-lake/primitives/stateChanges';
    export { Transaction } from '@near-lake/primitives/transactions';
    export * from '@near-lake/primitives/core';
}

declare module '@near-lake/primitives/lakeContext' {
    export class LakeContext {
    }
}

declare module '@near-lake/primitives/block' {
    import { Action, Receipt } from '@near-lake/primitives/receipts';
    import { StreamerMessage, ValidatorStakeView } from '@near-lake/primitives/core/types';
    import { Transaction } from '@near-lake/primitives/transactions';
    import { Event } from '@near-lake/primitives/events';
    import { StateChange } from '@near-lake/primitives/stateChanges';
    export class Block {
        readonly streamerMessage: StreamerMessage;
        readonly postponedReceipts: Receipt[];
        readonly transactions: Transaction[];
        constructor(streamerMessage: StreamerMessage, executedReceipts: Receipt[], postponedReceipts: Receipt[], transactions: Transaction[], _actions: Map<string, Action>, _events: Map<string, Event[]>, _stateChanges: StateChange[]);
        get blockHash(): string;
        get prevBlockHash(): string;
        get blockHeight(): number;
        header(): BlockHeader;
        receipts(): Receipt[];
        actions(): Action[];
        events(): Event[];
        stateChanges(): StateChange[];
        actionByReceiptId(receipt_id: string): Action | undefined;
        eventsByReceiptId(receipt_id: string): Event[];
        eventsByAccountId(account_id: string): Event[];
        static fromStreamerMessage(streamerMessage: StreamerMessage): Block;
    }
    export class BlockHeader {
        readonly height: number;
        readonly hash: string;
        readonly prevHash: string;
        readonly author: string;
        readonly timestampNanosec: string;
        readonly epochId: string;
        readonly nextEpochId: string;
        readonly gasPrice: string;
        readonly totalSupply: string;
        readonly latestProtocolVersion: number;
        readonly randomValue: string;
        readonly chunksIncluded: number;
        readonly validatorProposals: ValidatorStakeView[];
        constructor(height: number, hash: string, prevHash: string, author: string, timestampNanosec: string, epochId: string, nextEpochId: string, gasPrice: string, totalSupply: string, latestProtocolVersion: number, randomValue: string, chunksIncluded: number, validatorProposals: ValidatorStakeView[]);
        static fromStreamerMessage(streamerMessage: StreamerMessage): BlockHeader;
    }
}

declare module '@near-lake/primitives/events' {
    export class Event {
        readonly relatedReceiptId: string;
        readonly rawEvent: RawEvent;
        constructor(relatedReceiptId: string, rawEvent: RawEvent);
        static fromLog: (log: string) => Event;
    }
    export class RawEvent {
        readonly event: string;
        readonly standard: string;
        readonly version: string;
        readonly data: JSON | undefined;
        constructor(event: string, standard: string, version: string, data: JSON | undefined);
        static isEvent: (log: string) => boolean;
        static fromLog: (log: string) => RawEvent;
    }
    export type Events = {
        events: Event[];
    };
}

declare module '@near-lake/primitives/receipts' {
    import { ExecutionOutcomeWithReceipt, ExecutionStatus, ReceiptView } from '@near-lake/primitives/core/types';
    import { Events, Event } from '@near-lake/primitives/events';
    export class Receipt implements Events {
        readonly receiptKind: ReceiptKind;
        readonly receiptId: string;
        readonly receiverId: string;
        readonly predecessorId: string;
        readonly status: ExecutionStatus;
        readonly executionOutcomeId?: string | undefined;
        readonly logs: string[];
        constructor(receiptKind: ReceiptKind, receiptId: string, receiverId: string, predecessorId: string, status: ExecutionStatus, executionOutcomeId?: string | undefined, logs?: string[]);
        get events(): Event[];
        static fromOutcomeWithReceipt: (outcomeWithReceipt: ExecutionOutcomeWithReceipt) => Receipt;
    }
    export enum ReceiptKind {
        Action = "Action",
        Data = "Data"
    }
    export class Action {
        readonly receiptId: string;
        readonly predecessorId: string;
        readonly receiverId: string;
        readonly signerId: string;
        readonly signerPublicKey: string;
        readonly operations: Operation[];
        constructor(receiptId: string, predecessorId: string, receiverId: string, signerId: string, signerPublicKey: string, operations: Operation[]);
        static isActionReceipt: (receipt: ReceiptView) => boolean;
        static fromReceiptView: (receipt: ReceiptView) => Action | null;
    }
    class DeployContract {
        readonly code: Uint8Array;
        constructor(code: Uint8Array);
    }
    class FunctionCall {
        readonly methodName: string;
        readonly args: Uint8Array;
        readonly gas: number;
        readonly deposit: string;
        constructor(methodName: string, args: Uint8Array, gas: number, deposit: string);
    }
    class Transfer {
        readonly deposit: string;
        constructor(deposit: string);
    }
    class Stake {
        readonly stake: number;
        readonly publicKey: string;
        constructor(stake: number, publicKey: string);
    }
    class AddKey {
        readonly publicKey: string;
        readonly accessKey: AccessKey;
        constructor(publicKey: string, accessKey: AccessKey);
    }
    class DeleteKey {
        readonly publicKey: string;
        constructor(publicKey: string);
    }
    class DeleteAccount {
        readonly beneficiaryId: string;
        constructor(beneficiaryId: string);
    }
    export type Operation = 'CreateAccount' | DeployContract | FunctionCall | Transfer | Stake | AddKey | DeleteKey | DeleteAccount;
    export class AccessKey {
        readonly nonce: number;
        readonly permission: string | AccessKeyFunctionCallPermission;
        constructor(nonce: number, permission: string | AccessKeyFunctionCallPermission);
    }
    class AccessKeyFunctionCallPermission {
        readonly allowance: string;
        readonly receiverId: string;
        readonly methodNames: string[];
        constructor(allowance: string, receiverId: string, methodNames: string[]);
    }
    export {};
}

declare module '@near-lake/primitives/stateChanges' {
    import { StateChangeWithCauseView } from '@near-lake/primitives/core/types';
    import { AccessKey } from '@near-lake/primitives/receipts';
    export class StateChange {
        readonly cause: StateChangeCause;
        readonly value: StateChangeValue;
        constructor(cause: StateChangeCause, value: StateChangeValue);
        get affectedAccountId(): string;
        static fromStateChangeView(stateChangeView: StateChangeWithCauseView): StateChange;
    }
    type TransactionProcessingCause = {
        txHash: string;
    };
    type ActionReceiptProcessingStartedCause = {
        receiptHash: string;
    };
    type ActionReceiptGasRewardCause = {
        receiptHash: string;
    };
    type ReceiptProcessingCause = {
        receiptHash: string;
    };
    type PostponedReceiptCause = {
        receiptHash: string;
    };
    type StateChangeCause = 'NotWritableToDisk' | 'InitialState' | TransactionProcessingCause | ActionReceiptProcessingStartedCause | ActionReceiptGasRewardCause | ReceiptProcessingCause | PostponedReceiptCause | 'UpdatedDelayedReceipts' | 'ValidatorAccountsUpdate' | 'Migration' | 'Resharding';
    class AccountUpdateValue {
        readonly accountId: string;
        readonly account: Account;
        constructor(accountId: string, account: Account);
    }
    class AccountDeletionValue {
        readonly accountId: string;
        constructor(accountId: string);
    }
    class AccountKeyUpdateValue {
        readonly accountId: string;
        readonly publicKey: string;
        readonly accessKey: AccessKey;
        constructor(accountId: string, publicKey: string, accessKey: AccessKey);
    }
    class AccessKeyDeletionValue {
        readonly accountId: string;
        readonly publicKey: string;
        constructor(accountId: string, publicKey: string);
    }
    class DataUpdateValue {
        readonly accountId: string;
        readonly key: Uint8Array;
        readonly value: Uint8Array;
        constructor(accountId: string, key: Uint8Array, value: Uint8Array);
    }
    class DataDeletionValue {
        readonly accountId: string;
        readonly key: Uint8Array;
        constructor(accountId: string, key: Uint8Array);
    }
    class ContractCodeUpdateValue {
        readonly accountId: string;
        readonly code: Uint8Array;
        constructor(accountId: string, code: Uint8Array);
    }
    class ContractCodeDeletionValue {
        readonly accountId: string;
        constructor(accountId: string);
    }
    type StateChangeValue = AccountUpdateValue | AccountDeletionValue | AccountKeyUpdateValue | AccessKeyDeletionValue | DataUpdateValue | DataDeletionValue | ContractCodeUpdateValue | ContractCodeDeletionValue;
    class Account {
        readonly amount: number;
        readonly locked: number;
        readonly codeHash: string;
        readonly storageUsage: number;
        readonly storagePaidAt: number;
        constructor(amount: number, locked: number, codeHash: string, storageUsage: number, storagePaidAt: number);
    }
    export {};
}

declare module '@near-lake/primitives/transactions' {
    import { ExecutionStatus } from '@near-lake/primitives/core/types';
    import { Operation } from '@near-lake/primitives/receipts';
    export class Transaction {
        readonly transactionHash: string;
        readonly signerId: string;
        readonly signerPublicKey: string;
        readonly signature: string;
        readonly receiverId: string;
        readonly status: ExecutionStatus;
        readonly executionOutcomeId: string;
        readonly operations: Operation[];
        constructor(transactionHash: string, signerId: string, signerPublicKey: string, signature: string, receiverId: string, status: ExecutionStatus, executionOutcomeId: string, operations: Operation[]);
    }
}

declare module '@near-lake/primitives/core' {
    export { StreamerMessage, BlockView, BlockHeaderView, Shard, BlockHeight } from '@near-lake/primitives/core/types';
}

declare module '@near-lake/primitives/core/types' {
    export type BlockHeight = number;
    export interface StreamerMessage {
        block: BlockView;
        shards: Shard[];
    }
    export interface BlockView {
        author: string;
        header: BlockHeaderView;
        chunks: ChunkHeader[];
    }
    export interface BlockHeaderView {
        author: any;
        approvals: (string | null)[];
        blockMerkleRoot: string;
        blockOrdinal: number;
        challengesResult: ChallengeResult[];
        challengesRoot: string;
        chunkHeadersRoot: string;
        chunkMask: boolean[];
        chunkReceiptsRoot: string;
        chunkTxRoot: string;
        chunksIncluded: number;
        epochId: string;
        epochSyncDataHash: string | null;
        gasPrice: string;
        hash: string;
        height: number;
        lastDsFinalBlock: string;
        lastFinalBlock: string;
        latestProtocolVersion: number;
        nextBpHash: string;
        nextEpochId: string;
        outcomeRoot: string;
        prevHash: string;
        prevHeight: number;
        prevStateRoot: string;
        randomValue: string;
        rentPaid: string;
        signature: string;
        timestamp: number;
        timestampNanosec: string;
        totalSupply: string;
        validatorProposals: [];
        validatorReward: string;
    }
    export interface Shard {
        shardId: number;
        chunk?: ChunkView;
        receiptExecutionOutcomes: ExecutionOutcomeWithReceipt[];
        stateChanges: StateChangeWithCauseView[];
    }
    export type ValidatorStakeView = {
        accountId: string;
        publicKey: string;
        stake: string;
        validatorStakeStructVersion: string;
    };
    type ChallengeResult = {
        accountId: string;
        isDoubleSign: boolean;
    };
    interface ChunkHeader {
        balanceBurnt: number;
        chunkHash: string;
        encodedLength: number;
        encodedMerkleRoot: string;
        gasLimit: number;
        gasUsed: number;
        heightCreated: number;
        heightIncluded: number;
        outcomeRoot: string;
        outgoingReceiptsRoot: string;
        prevBlockHash: string;
        prevStateRoot: string;
        rentPaid: string;
        shardId: number;
        signature: string;
        txRoot: string;
        validatorProposals: ValidatorProposal[];
        validatorReward: string;
    }
    type ValidatorProposal = {
        accountId: string;
        publicKey: string;
        stake: string;
        validatorStakeStructVersion: string;
    };
    interface ChunkView {
        author: string;
        header: ChunkHeader;
        receipts: ReceiptView[];
        transactions: IndexerTransactionWithOutcome[];
    }
    export type ActionReceipt = {
        Action: {
            actions: ActionView[];
            gasPrice: string;
            inputDataIds: string[];
            outputDataReceivers: DataReceiver[];
            signerId: string;
            signerPublicKey: string;
        };
    };
    export type DataReceipt = {
        Data: {
            data: string;
            dataId: string;
        };
    };
    type ReceiptEnum = ActionReceipt | DataReceipt;
    type DataReceiver = {
        dataId: string;
        receiverId: string;
    };
    export type ReceiptView = {
        predecessorId: string;
        receiptId: string;
        receiverId: string;
        receipt: ReceiptEnum;
    };
    export type ExecutionStatus = {
        SuccessValue: Uint8Array;
    } | {
        SuccessReceiptId: string;
    } | {
        Failure: string;
    } | 'Postponed';
    type ExecutionProof = {
        direction: string;
        hash: string;
    };
    export type ExecutionOutcomeWithReceipt = {
        executionOutcome: {
            blockHash: string;
            id: string;
            outcome: {
                executorId: string;
                gasBurnt: number;
                logs: string[];
                metadata: {
                    gasProfile: string | null;
                    version: number;
                };
                receiptIds: string[];
                status: ExecutionStatus;
                tokensBurnt: string;
            };
            proof: ExecutionProof[];
        };
        receipt: ReceiptView;
    };
    type IndexerTransactionWithOutcome = {
        transaction: Transaction;
        outcome: ExecutionOutcomeWithReceipt;
    };
    type Transaction = {
        signerId: string;
        publicKey: string;
        nonce: number;
        receiverId: string;
        actions: ActionView[];
        signature: string;
        hash: string;
    };
    type DeployContractAction = {
        DeployContract: {
            code: string;
        };
    };
    type FunctionCallAction = {
        FunctionCall: {
            methodName: string;
            args: string;
            gas: number;
            deposit: string;
        };
    };
    type TransferAction = {
        Transfer: {
            deposit: string;
        };
    };
    type StakeAction = {
        Stake: {
            stake: number;
            publicKey: string;
        };
    };
    type AddKeyAction = {
        AddKey: {
            publicKey: string;
            accessKey: AccessKey;
        };
    };
    interface AccessKey {
        nonce: number;
        permission: string | AccessKeyFunctionCallPermission;
    }
    interface AccessKeyFunctionCallPermission {
        FunctionCall: {
            allowance: string;
            receiverId: string;
            methodNames: string[];
        };
    }
    type DeleteKeyAction = {
        DeleteKey: {
            publicKey: string;
        };
    };
    type DeleteAccountAction = {
        DeleteAccount: {
            beneficiaryId: string;
        };
    };
    type ActionView = 'CreateAccount' | DeployContractAction | FunctionCallAction | TransferAction | StakeAction | AddKeyAction | DeleteKeyAction | DeleteAccountAction;
    export type StateChangeWithCauseView = {
        cause: {
            receiptHash: string;
            type: string;
        };
        value: {
            accountId: string;
            keyBase64: string;
            valueBase64: string;
        };
        type: string;
    };
    export {};
}
