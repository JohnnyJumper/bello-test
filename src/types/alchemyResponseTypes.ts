export interface GetOwnersForCollectionResponse {
  ownerAddresses: string[];
}

export function isGetOwnersForCollectionResponse(
  obj: unknown
): obj is GetOwnersForCollectionResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    obj !== undefined &&
    "ownerAddresses" in obj &&
    Array.isArray(obj.ownerAddresses) &&
    obj.ownerAddresses.every((v) => typeof v === "string")
  );
}

export interface GetAssetTransfersResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: [
      {
        metadata: {
          blockTimestamp: string;
        };
      }
    ];
  };
  pageKey?: string;
}
export function isGetAssetTransfersResponse(
  obj: unknown
): obj is GetAssetTransfersResponse {
  if (typeof obj !== "object" || obj === null || obj === undefined) {
    return false;
  }

  const { jsonrpc, id, result } = obj as GetAssetTransfersResponse;

  return (
    typeof jsonrpc === "string" &&
    typeof id === "number" &&
    typeof result === "object" &&
    Array.isArray(result.transfers) &&
    result.transfers.every((transfer) => {
      const blockTimestamp = transfer.metadata.blockTimestamp;
      const isDateString =
        typeof blockTimestamp === "string" &&
        !isNaN(Date.parse(blockTimestamp));
      return isDateString;
    })
  );
}

interface ContractMetadata {
  name: string;
  symbol: string;
  totalSupply: string;
  tokenType: string;
  contractDeployer: string;
  deployedBlockNumber: number;
  openSea: {
    floorPrice: number;
    collectionName: string;
    safelistRequestStatus: string;
    lastIngestedAt: string;
  };
}

interface TokenMetadata {
  tokenType: string;
}

interface TokenUri {
  gateway: string;
  raw: string;
}

interface Media {
  gateway: string;
  raw: string;
}

interface Metadata {
  metadata: any[];
  attributes: any[];
}

interface OwnedNft {
  contract: {
    address: string;
  };
  id: {
    tokenId: string;
    tokenMetadata: TokenMetadata;
  };
  balance: string;
  title?: string;
  description?: string;
  tokenUri?: TokenUri;
  media?: Media[];
  metadata?: Metadata;
  timeLastUpdated?: string;
  error?: string;
  contractMetadata?: ContractMetadata;
}

export interface GetOwnedNftsResponse {
  ownedNfts: OwnedNft[];
  pageKey: string;
  totalCount: number;
  blockHash: string;
}

export function isGetOwnedNftsResponse(
  data: unknown
): data is GetOwnedNftsResponse {
  if (!data) {
    return false;
  }

  const { ownedNfts, pageKey, totalCount, blockHash } =
    data as Partial<GetOwnedNftsResponse>;

  return (
    Array.isArray(ownedNfts) &&
    typeof totalCount === "number" &&
    typeof blockHash === "string"
  );
}
