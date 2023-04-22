import fetch from "node-fetch";
import {
  isGetAssetTransfersResponse,
  isGetOwnedNftsResponse,
  isGetOwnersForCollectionResponse,
} from "../types/alchemyResponseTypes";
import util from "util";
import type { NftsResponseArray, NftsResponseSet } from "../types/utils";

export default class NodeConnection {
  private baseUrl = "https://eth-mainnet.g.alchemy.com";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getOwnersForCollection = async (
    contractAddress: string
  ): Promise<string[]> => {
    const url = this.generateEndpoint(
      `/nft/v2/${this.apiKey}/getOwnersForCollection`,
      {
        contractAddress,
        withTokenBalance: "false",
      }
    );

    const response = await fetch(url, {
      method: "GET",
    }).then((r) => r.json());

    if (!isGetOwnersForCollectionResponse(response)) {
      throw new Error("Failed to receive ownerAddresses");
    }

    return response.ownerAddresses;
  };

  getAverageAgeForCollection = async (
    contractAddress: string
  ): Promise<number> => {
    const owners = await this.getOwnersForCollection(contractAddress);
    const sum = await owners.reduce(async (prev, current) => {
      const prevValue = await prev;
      const currentValue = await this.getAddressAgeInYears(current);
      return prevValue + currentValue;
    }, Promise.resolve(0));
    return sum / owners.length;
  };

  getAddressAgeInYears = async (address: string): Promise<number> => {
    const latestTransactionDate = await this.getOldestTransactionDate(address);
    const today = Date.now();
    const difference = today - latestTransactionDate.getTime();
    const oneYearInMilliseconds = 1000 * 60 * 60 * 24 * 365;
    return difference / oneYearInMilliseconds;
  };

  getOwnedNfts = async (address: string): Promise<NftsResponseArray> => {
    const url = this.generateEndpoint(`/nft/v2/${this.apiKey}/getNFTs`, {
      owner: address,
      withMetadata: "false",
      spamConfidenceLevel: "HIGH",
      "excludeFilters[]": "SPAM",
    });

    const response = await fetch(url, {
      method: "GET",
    }).then((r) => r.json());

    if (!isGetOwnedNftsResponse(response)) {
      throw new Error("Incorrect format for owned nfts");
    }

    const bucket: NftsResponseSet = {};

    for (const owned of response.ownedNfts) {
      if (bucket[owned.contract.address]) {
        bucket[owned.contract.address].add(owned.id.tokenId);
      } else {
        bucket[owned.contract.address] = new Set([owned.id.tokenId]);
      }
    }

    let pageKey = response.pageKey;
    while (!!pageKey) {
      const nextBatch = await fetch(url + `&pageKey=${pageKey}`, {
        method: "GET",
      }).then((r) => r.json());
      if (!isGetOwnedNftsResponse(nextBatch)) {
        throw new Error("Incorreect format for owned nfts in afterbatches");
      }
      pageKey = nextBatch.pageKey;
      nextBatch.ownedNfts.map((nft) => {
        if (bucket[nft.contract.address]) {
          bucket[nft.contract.address].add(nft.id.tokenId);
        } else {
          bucket[nft.contract.address] = new Set([nft.id.tokenId]);
        }
      });
    }
    const returnee: NftsResponseArray = [];
    for (const [key, tokenSet] of Object.entries(bucket)) {
      returnee.push({ nftContractAddress: key, tokens: Array.from(tokenSet) });
    }
    return returnee;
  };

  getOldestTransactionDate = async (address: string): Promise<Date> => {
    const url = this.generateEndpoint(`/v2/${this.apiKey}`);
    const bodyParams = {
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getAssetTransfers",
      params: [
        {
          category: [
            "external",
            "internal",
            "erc20",
            "erc721",
            "erc1155",
            "specialnft",
          ],
          order: "asc",
          toAddress: address,
          withMetadata: true,
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: "0x1",
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(bodyParams),
    }).then((r) => r.json());

    if (!isGetAssetTransfersResponse(response)) {
      throw new Error(
        `expected getAssetTramsfers response but got: ${util.inspect(
          response,
          false,
          null
        )}`
      );
    }

    const dateString = response.result.transfers[0].metadata.blockTimestamp;
    return new Date(dateString);
  };

  private generateEndpoint(endpoint: string, params?: Record<string, string>) {
    const url = new URL(this.baseUrl + endpoint);
    if (params) {
      url.search = new URLSearchParams(params).toString();
    }
    return url;
  }
}
