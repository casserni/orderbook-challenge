import "jest-expect-message";

import * as faker from "faker";

import { Exchange } from "../index";
import { IOrder, IPrice } from "../types";

describe("Exchange", () => {
  const DateFunc = Date;
  let mockDate = faker.random.number();

  // @ts-ignore
  beforeAll(() => (Date = { now: () => mockDate }));

  afterAll(() => (Date = DateFunc));

  describe("sync()", () => {});

  describe("buy()", () => {
    it("should add the buy order to the orderbook", () => {
      mockDate = faker.random.number();
      const mockPrice = faker.random.number();
      const mockAmount = faker.random.number();

      const exchange = new Exchange();
      const sell = exchange.buy(mockAmount, mockPrice);

      const order: IOrder = {
        id: mockDate.toString(),
        price: mockPrice,
        isBuyOrder: true,
        quantity: mockAmount,
        executedQuantity: expect.any(Number),
      };

      expect(sell, "should return the order").toEqual(order);
      expect(
        exchange._orderBook.orders.byId[order.id],
        "should have added the order to the orderbook"
      ).toEqual(order);
      expect.assertions(2);
    });
  });

  describe("sell()", () => {
    it("should add the sell order to the orderbook", () => {
      const mockPrice = faker.random.number();
      const mockAmount = faker.random.number();

      const exchange = new Exchange();
      const sell = exchange.sell(mockAmount, mockPrice);

      const order: IOrder = {
        id: mockDate.toString(),
        price: mockPrice,
        isBuyOrder: false,
        quantity: mockAmount,
        executedQuantity: expect.any(Number),
      };

      expect(sell, "should return the order").toEqual(order);
      expect(
        exchange._orderBook.orders.byId[order.id],
        "should have added the order to the orderbook"
      ).toEqual(order);
      expect.assertions(2);
    });
  });

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
