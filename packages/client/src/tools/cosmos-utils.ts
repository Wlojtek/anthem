import {
  assertUnreachable,
  COIN_DENOMS,
  ICosmosAccountInformation,
  IMsgSend,
  ITxFee,
  ITxMsg,
  ITxSignature,
  ITxValue,
  NETWORK_NAME,
  NetworkDefinition,
} from "@anthem/utils";
import { LEDGER_ACTION_TYPE } from "modules/ledger/actions";
import { AvailableReward } from "ui/workflows/CosmosTransactionWorkflows";
import { unitToDenom } from "./currency-utils";
import { multiply } from "./math-utils";

/** ===========================================================================
 * Types & Config
 * ============================================================================
 */

interface TransactionMetadata {
  from: string;
  chain_id: string;
  generate_only: boolean;
  fees: string;
  sequence: string;
  account_number: string;
}

export interface TransactionData {
  txMsg: ITxValue;
  txRequestMetadata: TransactionMetadata;
}

interface JsonTransaction {
  txMsg: ITxValue;
  txRequestMetadata: TransactionMetadata;
}

export interface TxPostBody {
  type: string;
  value: {
    fee: ITxFee;
    memo: string;
    msg: Maybe<ReadonlyArray<ITxMsg>>;
    signatures: ReadonlyArray<
      ITxSignature & {
        account_number: string;
        sequence: string;
        pub_key: { type: string; value: string };
      }
    >;
  };
}

/** ===========================================================================
 * Constants related to the Cosmos Network
 * ============================================================================
 */

export const COSMOS_MESSAGE_TYPES = {
  SEND: "cosmos-sdk/MsgSend",
  VOTE: "cosmos-sdk/MsgVote",
  DELEGATE: "cosmos-sdk/MsgDelegate",
  CLAIM: "cosmos-sdk/MsgWithdrawDelegationReward",
};

export const TERRA_MESSAGE_TYPES = {
  VOTE: "governance/MsgVote",
  DELEGATE: "staking/MsgDelegate",
  CLAIM: "distribution/MsgWithdrawDelegationReward",
  SEND: "bank/MsgSend",
};

// TODO: Implement
export const OASIS_MESSAGE_TYPES = {};

// TODO: Implement
export const CELO_MESSAGE_TYPES = {};

// TODO: Implement
export const POLKADOT_MESSAGE_TYPES = {};

const getTransactionMessageTypeForNetwork = (
  network: NETWORK_NAME,
  transactionType: LEDGER_ACTION_TYPE,
): string => {
  // Reject non-Cosmos transaction types
  if (
    transactionType === "UNDELEGATE" ||
    transactionType === "WITHDRAW" ||
    transactionType === "VOTE_GOLD" ||
    transactionType === "LOCK_GOLD" ||
    transactionType === "UNLOCK_GOLD" ||
    transactionType === "REVOKE_VOTES" ||
    transactionType === "UPVOTE_PROPOSAL" ||
    transactionType === "VOTE_FOR_PROPOSAL" ||
    transactionType === "ACTIVATE_VOTES"
  ) {
    throw new Error("Not valid for Cosmos SDK transactions");
  }

  switch (network) {
    case "COSMOS":
    case "KAVA":
      return COSMOS_MESSAGE_TYPES[transactionType];
    case "TERRA":
      return TERRA_MESSAGE_TYPES[transactionType];
    case "OASIS":
      console.warn("[TODO]: Implement Oasis transaction types!");
      // @ts-ignore
      return OASIS_MESSAGE_TYPES[transactionType];
    case "CELO":
      console.warn("[TODO]: Implement Celo transaction types!");
      // @ts-ignore
      return CELO_MESSAGE_TYPES[transactionType];
    case "POLKADOT":
      console.warn("[TODO]: Implement Polkadot transaction types!");
      // @ts-ignore
      return POLKADOT_MESSAGE_TYPES[transactionType];
    default:
      return assertUnreachable(network);
  }
};

const TRANSACTION_MEMO =
  "Stake online with Chorus One at https://anthem.chorus.one";

/** ===========================================================================
 * Utils
 * ============================================================================
 */

/**
 * Helper to get fee & gas data for a transaction.
 */
const getFeeData = (
  denom: COIN_DENOMS,
  gasAmount: string,
  gasPrice: string,
) => {
  return {
    amount: [
      {
        denom,
        amount: multiply(gasAmount, gasPrice, String),
      },
    ],
    gas: gasAmount,
  };
};

/**
 * Create the delegation transaction message.
 */
export const createDelegationTransactionMessage = (args: {
  amount: string;
  address: string;
  gasAmount: string;
  gasPrice: string;
  denom: COIN_DENOMS;
  network: NetworkDefinition;
  validatorOperatorAddress: string;
}): ITxValue => {
  const {
    denom,
    amount,
    network,
    address,
    gasPrice,
    gasAmount,
    validatorOperatorAddress,
  } = args;

  const type = getTransactionMessageTypeForNetwork(network.name, "DELEGATE");

  return {
    fee: getFeeData(denom, gasAmount, gasPrice),
    signatures: null,
    memo: TRANSACTION_MEMO,
    msg: [
      {
        type,
        value: {
          delegator_address: address,
          validator_address: validatorOperatorAddress,
          amount: {
            denom,
            amount: unitToDenom(amount, network.denominationSize, String),
          },
        },
      },
    ],
  };
};

/**
 * Create a send transaction message.
 *
 * NOTE: The GraphQL type is not correct for IMsgSend, because there is
 * an issue mapping overlapping union types so the amount key in Send
 * transactions gets rewritten as amounts.
 */
export const createSendTransactionMessage = (args: {
  amount: string;
  address: string;
  gasAmount: string;
  gasPrice: string;
  recipient: string;
  denom: COIN_DENOMS;
  network: NetworkDefinition;
}): ITxValue => {
  const {
    denom,
    amount,
    network,
    address,
    gasPrice,
    gasAmount,
    recipient,
  } = args;

  const type = getTransactionMessageTypeForNetwork(network.name, "SEND");
  const value: IMsgSend = {
    to_address: recipient,
    from_address: address,
    // @ts-ignore - the key is amount, not amounts, see NOTE
    amount: [
      {
        denom,
        amount: unitToDenom(amount, network.denominationSize, String),
      },
    ],
  };

  return {
    fee: getFeeData(denom, gasAmount, gasPrice),
    signatures: null,
    memo: TRANSACTION_MEMO,
    msg: [{ type, value }],
  };
};

/**
 * Create the rewards claim transaction message.
 */
export const createRewardsClaimTransaction = (args: {
  address: string;
  gasAmount: string;
  gasPrice: string;
  selectedRewards: ReadonlyArray<AvailableReward>;
  denom: COIN_DENOMS;
  network: NETWORK_NAME;
}): ITxValue => {
  const {
    denom,
    network,
    address,
    gasPrice,
    gasAmount,
    selectedRewards,
  } = args;

  const type = getTransactionMessageTypeForNetwork(network, "CLAIM");

  return {
    fee: getFeeData(denom, gasAmount, gasPrice),
    signatures: null,
    memo: TRANSACTION_MEMO,
    msg: selectedRewards.map(reward => {
      return {
        type,
        value: {
          delegator_address: address,
          validator_address: reward.validator_address,
        },
      };
    }),
  };
};

/**
 * Get the request metadata object for a transaction.
 */
export const createTransactionRequestMetadata = (args: {
  address: string;
  account: ICosmosAccountInformation;
  gasAmount: string;
  gasPrice: string;
  network: NetworkDefinition;
}): TransactionMetadata => {
  const { address, network, account, gasAmount, gasPrice } = args;
  const { value: accountValue } = account;

  return {
    from: address,
    chain_id: network.chainId,
    generate_only: false,
    fees: multiply(gasPrice, gasAmount, String),
    sequence: String(accountValue.sequence),
    account_number: String(accountValue.account_number),
  };
};

/**
 * Get the request metadata object for a transaction.
 */
export const createCosmosTransactionPostBody = (args: {
  transactionData: JsonTransaction;
  signature: string;
  publicKey: string;
}): TxPostBody => {
  const { transactionData, signature, publicKey } = args;
  const { txRequestMetadata } = transactionData;

  return {
    // TODO: Works for any network?
    type: "cosmos-sdk/StdTx",
    value: {
      ...transactionData.txMsg,
      signatures: [
        {
          signature,
          account_number: txRequestMetadata.account_number,
          sequence: txRequestMetadata.sequence,
          pub_key: {
            type: "tendermint/PubKeySecp256k1",
            value: publicKey,
          },
        },
      ],
      memo: TRANSACTION_MEMO,
    },
  };
};
