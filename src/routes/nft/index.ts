import express from "express";
import type { Request, Response, NextFunction } from "express";
import { getNodeConnection } from "../../utils";
import { NftContractAddress, NftsResponseArray } from "../../types/utils";

const router = express.Router();

router.get(
  "/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;

    if (!address) {
      throw new Error("Address was not provided");
    }

    const nodeConnection = getNodeConnection();
    const nfts = await nodeConnection.getOwnedNfts(address);
    return res.json(nfts);
  }
);

router.get(
  "/collection/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;

    if (!address) {
      throw new Error("Collection address was not provided");
    }

    const nodeConnection = getNodeConnection();
    const owners = await nodeConnection.getOwnersForCollection(address);
    const returnee: Record<string, NftsResponseArray> = {};
    const ownersNftsPromises: Promise<NftsResponseArray>[] = [];

    for (const owner of owners) {
      const promise = nodeConnection.getOwnedNfts(owner);
      ownersNftsPromises.push(
        new Promise(async (resolve, reject) => {
          const nfts = await promise.catch((err) => reject(err));
          if (!nfts) {
            return reject("something went wrong");
          }
          returnee[owner] = nfts;
          return resolve(nfts);
        })
      );
    }

    await Promise.all(ownersNftsPromises);
    return res.json(returnee);
  }
);

router.get(
  "/collection/:address/common",
  async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;
    if (!address) {
      throw new Error("Collection address was not provided");
    }

    const nodeConnection = getNodeConnection();
    const owners = await nodeConnection.getOwnersForCollection(address);
    const map: Record<NftContractAddress, number> = {};

    const ownersNftsPromises: Promise<NftsResponseArray>[] = [];

    for (const owner of owners) {
      const promise = nodeConnection.getOwnedNfts(owner);
      ownersNftsPromises.push(
        new Promise(async (resolve, reject) => {
          const nfts = await promise.catch((err) => reject(err));
          if (!nfts) {
            return reject("something went wrong");
          }

          for (const nft of nfts) {
            if (!!map[nft.nftContractAddress]) {
              map[nft.nftContractAddress] += 1;
            } else {
              map[nft.nftContractAddress] = 1;
            }
          }
          return resolve(nfts);
        })
      );
    }

    await Promise.all(ownersNftsPromises);
    const top3 = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    return res.json({ top3 });
  }
);

export default router;
