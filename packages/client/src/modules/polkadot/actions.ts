import { ActionType, createStandardAction } from "typesafe-actions";
import { DotAccount, DotTransactionStage, DotTransactionType } from "./store";

/** ===========================================================================
 * Action Types
 * ============================================================================
 */

enum ActionTypesEnum {
  FETCH_POLKADOT_ACCOUNT = "FETCH_POLKADOT_ACCOUNT",
  FETCH_POLKADOT_ACCOUNT_SUCCESS = "FETCH_POLKADOT_ACCOUNT_SUCCESS",
  FETCH_POLKADOT_ACCOUNT_FAILURE = "FETCH_POLKADOT_ACCOUNT_FAILURE",

  SET_CONTROLLER = "SET_CONTROLLER",
  SET_CONTROLLER__SUCCESS = "SET_CONTROLLER__SUCCESS",
  SET_CONTROLLER__FAILURE = "SET_CONTROLLER__FAILURE",

  POLKADOT_SIGNIN = "POLKADOT_SIGNIN",
  OPEN_POLKADOT_DIALOG = "OPEN_POLKADOT_DIALOG",
  CLOSE_POLKADOT_DIALOG = "CLOSE_POLKADOT_DIALOG",
  SET_POLKADOT_TRANSACTION_STAGE = "SET_POLKADOT_TRANSACTION_STAGE",

  SET_STAKE = "SET_STAKE",
  SET_STAKE_SUCCESS = "SET_STAKE_SUCCESS",
  SET_STAKE_FAILURE = "SET_STAKE_FAILURE",

  SET_STAKE_AMOUNT = "SET_STAKE_AMOUNT",
}

/** ===========================================================================
 * Actions
 * ============================================================================
 */

const fetchAccount = createStandardAction(
  ActionTypesEnum.FETCH_POLKADOT_ACCOUNT,
)();

const fetchAccountSuccess = createStandardAction(
  ActionTypesEnum.FETCH_POLKADOT_ACCOUNT_SUCCESS,
)<DotAccount>();

const fetchAccountFailure = createStandardAction(
  ActionTypesEnum.FETCH_POLKADOT_ACCOUNT_FAILURE,
)();

const setController = createStandardAction(ActionTypesEnum.SET_CONTROLLER)();

const setControllerSuccess = createStandardAction(
  ActionTypesEnum.SET_CONTROLLER__SUCCESS,
)<any>();

const setControllerFailure = createStandardAction(
  ActionTypesEnum.SET_CONTROLLER__FAILURE,
)<any>();

const polkadotSignin = createStandardAction(ActionTypesEnum.POLKADOT_SIGNIN)<{
  account: DotAccount;
  seed: string;
  stashKey: any;
}>();

const openPolkadotDialog = createStandardAction(
  ActionTypesEnum.OPEN_POLKADOT_DIALOG,
)<DotTransactionType>();

const closePolkadotDialog = createStandardAction(
  ActionTypesEnum.CLOSE_POLKADOT_DIALOG,
)();

const setTransactionStage = createStandardAction(
  ActionTypesEnum.SET_POLKADOT_TRANSACTION_STAGE,
)<DotTransactionStage>();

const setPolkadotStake = createStandardAction(ActionTypesEnum.SET_STAKE)();

const setPolkadotStakeSuccess = createStandardAction(
  ActionTypesEnum.SET_STAKE_SUCCESS,
)<any>();

const setPolkadotStakeFailure = createStandardAction(
  ActionTypesEnum.SET_STAKE_FAILURE,
)<any>();

const setStakeAmount = createStandardAction(ActionTypesEnum.SET_STAKE_AMOUNT)<
  string
>();

const actions = {
  fetchAccount,
  fetchAccountSuccess,
  fetchAccountFailure,
  setController,
  setControllerSuccess,
  setControllerFailure,
  polkadotSignin,
  openPolkadotDialog,
  closePolkadotDialog,
  setTransactionStage,
  setPolkadotStake,
  setPolkadotStakeSuccess,
  setPolkadotStakeFailure,
  setStakeAmount,
};

/** ===========================================================================
 * Export
 * ============================================================================
 */

export type ActionTypes = ActionType<typeof actions>;

export default actions;
