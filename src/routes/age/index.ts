import express from "express";
import type { Request, Response, NextFunction } from "express";
import { getNodeConnection } from "../../utils";

import util from "util";

const router = express.Router();

router.get(
  "/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;

    if (!address) {
      throw new Error("Address was not provided");
    }

    const nodeConnection = getNodeConnection();
    const age = await nodeConnection.getAddressAgeInYears(address);
    return res.json({
      age,
    });
  }
);

router.get(
  "/collection/:contract",
  async (req: Request, res: Response, next: NextFunction) => {
    const { contract: contractAddress } = req.params;
    if (!contractAddress) {
      throw new Error("collection contract address is missing from request");
    }

    const nodeConnection = getNodeConnection();
    const averageAge = await nodeConnection.getAverageAgeForCollection(
      contractAddress
    );

    return res.json({
      age: averageAge,
    });
  }
);

router.get(
  "/collection/:address/each",
  async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;
    if (!address) {
      throw new Error("collection contract address is missing from request");
    }

    const nodeConnection = getNodeConnection();
    const owners = await nodeConnection.getOwnersForCollection(address);
    const response: Record<string, number> = {};
    const agePromises: Promise<number>[] = [];
    for (const owner of owners) {
      const agePromise = nodeConnection.getAddressAgeInYears(owner);
      agePromises.push(
        new Promise(async (resolve, reject) => {
          const age = await agePromise.catch((err) => reject(err));
          if (typeof age !== "number") {
            return reject("something went wrong");
          }
          response[owner] = age;
          return resolve(age);
        })
      );
    }
    await Promise.all(agePromises);
    return res.json(response);
  }
);

export default router;
