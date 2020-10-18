import "jest-expect-message";

import * as faker from "faker";

import { Exchange } from "../index";
import { IOrder, IPrice } from "../types";

describe("Exchange", () => {
  describe("sync()", () => {});
  describe("buy()", () => {});
  describe("sell()", () => {});

  describe("getQuantityAtPrice()", () => {
    it("should return remaining quantity from orderbook state", () => {
      const mockPrice = faker.random.number();
      const mockAmount = faker.random.number();
      const mockPriceAmount: IPrice = {
        price: mockPrice,
        remainingQuantity: mockAmount,
        orders: [],
      };

      const exchange = new Exchange();
      exchange._orderBook = {
        orders: {
          byId: {},
        },
        prices: { byPrice: { [mockPrice]: mockPriceAmount } },
      };
      const result = exchange.getQuantityAtPrice(mockPrice);

      expect(result).toEqual(mockAmount);
      expect.assertions(1);
    });

    it("should return 0 for unfound price", () => {
      const mockPrice = faker.random.number();

      const exchange = new Exchange();
      const result = exchange.getQuantityAtPrice(mockPrice);

      expect(result).toEqual(0);
      expect.assertions(1);
    });
  });

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

      expect(result).toBeUndefined();
      expect.assertions(1);
    });
  });
});
