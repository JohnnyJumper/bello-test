export type TokenId = string;
export type NftContractAddress = string;
export type NftsResponseSet = Record<NftContractAddress, Set<TokenId>>;
export type NftsResponseArray = {
  nftContractAddress: string;
  tokens: string[];
}[];
