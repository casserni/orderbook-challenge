import "jest-expect-message";

import * as faker from "faker";

import { Exchange } from "../index";
import { IOrder } from "../types";

describe("Exchange", () => {
  describe("sync()", () => {});
  describe("buy()", () => {});
  describe("sell()", () => {});
  describe("getQuantityAtPrice()", () => {});

  describe("getOrder()", () => {
    it("should return the order from the orderbook state", () => {
      const mockId = faker.lorem.word(6);
      const mockOrder: IOrder = {
        id: mockId,
        isBuyOrder: true,
        price: faker.random.number(6),
        quantity: faker.random.number({ min: 6 }),
        executedQuantity: faker.random.number({ max: 6 }),
      };

      const exchange = new Exchange();
      exchange._orderBook = {
        orders: {
          byId: { [mockId]: mockOrder },
        },
        prices: { byPrice: {} },
      };
      const result = exchange.getOrder(mockId);

      expect(result).toEqual(mockOrder);
      expect.assertions(1);
    });

    it("should return undefined fron the orderbook state", () => {
      const mockId = faker.lorem.word(6);

      const exchange = new Exchange();
      const result = exchange.getOrder(mockId);

      expect(result).toBeUndefined;
      expect.assertions(1);
    });
  });
});
