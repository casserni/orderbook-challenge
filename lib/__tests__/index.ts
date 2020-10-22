import "jest-expect-message";

import * as faker from "faker";

import { Exchange } from "../index";
import { IOrder, IPrice } from "../types";

import { times, random } from "lodash";

describe("Exchange", () => {
  const DateFunc = Date;
  let mockDate = faker.random.number();

  // @ts-ignore
  beforeAll(() => (Date = { now: () => mockDate }));

  afterAll(() => (Date = DateFunc));

  describe("buy()", () => {
    it("should loop through prices executing any available buy sell and add to orderbook", async () => {
      mockDate = 123;

      const exchange = new Exchange();
      exchange._orderBook = {
        orders: {
          byId: {
            "1": {
              id: "1",
              isBuyOrder: false,
              price: 1,
              quantity: 1,
              executedQuantity: 0,
            },
            "2": {
              id: "2",
              isBuyOrder: false,
              price: 1,
              quantity: 1,
              executedQuantity: 0,
            },
            "3": {
              id: "3",
              isBuyOrder: false,
              price: 2,
              quantity: 1,
              executedQuantity: 0,
            },
            "4": {
              id: "4",
              isBuyOrder: false,
              price: 2,
              quantity: 7,
              executedQuantity: 0,
            },
            "5": {
              id: "5",
              isBuyOrder: false,
              price: 5,
              quantity: 1,
              executedQuantity: 0,
            },
          },
        },
        prices: {
          byPrice: {
            1: {
              price: 1,
              remainingQuantity: 2,
              orders: ["1", "2"],
            },
            2: {
              price: 2,
              remainingQuantity: 8,
              orders: ["3", "4"],
            },
            5: {
              price: 2,
              remainingQuantity: 1,
              orders: ["5"],
            },
          },
          sorted: {
            lowestSell: [1, 2, 5],
            highestBuy: [],
          },
        },
      };

      const result = await exchange.buy(4, 3);

      expect(result).toEqual({
        id: "123",
        quantity: 4,
        price: 3,
        executedQuantity: 4,
        isBuyOrder: true,
      });
      expect(exchange._orderBook).toMatchSnapshot();
    });
  });

  describe("sell()", () => {
    it("should loop through prices executing any available buy orders and add to orderbook", async () => {
      mockDate = 123;

      const exchange = new Exchange();
      exchange._orderBook = {
        orders: {
          byId: {
            "1": {
              id: "1",
              isBuyOrder: true,
              price: 10,
              quantity: 1,
              executedQuantity: 0,
            },
            "2": {
              id: "2",
              isBuyOrder: true,
              price: 10,
              quantity: 1,
              executedQuantity: 0,
            },
            "3": {
              id: "3",
              isBuyOrder: true,
              price: 9,
              quantity: 1,
              executedQuantity: 0,
            },
            "4": {
              id: "4",
              isBuyOrder: true,
              price: 9,
              quantity: 7,
              executedQuantity: 0,
            },
            "5": {
              id: "5",
              isBuyOrder: true,
              price: 5,
              quantity: 1,
              executedQuantity: 0,
            },
          },
        },
        prices: {
          byPrice: {
            10: {
              price: 1,
              remainingQuantity: 2,
              orders: ["1", "2"],
            },
            9: {
              price: 2,
              remainingQuantity: 8,
              orders: ["3", "4"],
            },
            5: {
              price: 2,
              remainingQuantity: 1,
              orders: ["5"],
            },
          },
          sorted: {
            lowestSell: [],
            highestBuy: [10, 9, 5],
          },
        },
      };

      const result = await exchange.sell(4, 6);

      expect(result).toEqual({
        id: mockDate.toString(),
        quantity: 4,
        price: 6,
        executedQuantity: 4,
        isBuyOrder: false,
      });
      expect(exchange._orderBook).toMatchSnapshot();
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
        prices: {
          byPrice: { [mockPrice]: mockPriceAmount },
          sorted: {
            lowestSell: [],
            highestBuy: [],
          },
        },
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
        prices: {
          byPrice: {},
          sorted: {
            lowestSell: [],
            highestBuy: [],
          },
        },
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

  describe("_addOrder()", () => {
    it("should add the order to the orderbook", () => {
      mockDate = faker.random.number();

      const order: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number(),
        isBuyOrder: false,
        quantity: faker.random.number(),
        executedQuantity: expect.any(Number),
      };

      const exchange = new Exchange();
      // @ts-ignore private func
      exchange._addOrder(order);

      expect(
        exchange._orderBook.orders.byId[order.id],
        "should have added the order to the orderbook"
      ).toEqual(order);
      expect.assertions(1);
    });

    it("should create new price storage for open order", () => {
      mockDate = faker.random.number();

      const order: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number(),
        isBuyOrder: false,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const exchange = new Exchange();
      // @ts-ignore private func
      exchange._addOrder(order);

      expect(
        exchange._orderBook.prices.byPrice[order.price],
        "should have added new price to price storage"
      ).toEqual({
        price: order.price,
        remainingQuantity: order.quantity - order.executedQuantity,
        orders: [order.id],
      });
      expect.assertions(1);
    });

    it("should add to update existing price storage for open order", () => {
      mockDate = faker.random.number();
      const existingOrder: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number(),
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 10 }),
        isBuyOrder: false,
      };
      const existingRemaining =
        existingOrder.quantity - existingOrder.executedQuantity;

      mockDate = faker.random.number();
      const newOrder: IOrder = {
        id: mockDate.toString(),
        price: existingOrder.price,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 10 }),
        isBuyOrder: false,
      };
      const newRemaining = newOrder.quantity - newOrder.executedQuantity;

      const exchange = new Exchange();

      // @ts-ignore private func
      exchange._addOrder(existingOrder);
      // @ts-ignore private func
      exchange._addOrder(newOrder);

      expect(
        exchange._orderBook.prices.byPrice[existingOrder.price],
        "should have updated existing price storage"
      ).toEqual({
        price: existingOrder.price,
        remainingQuantity: existingRemaining + newRemaining,
        orders: [existingOrder.id, newOrder.id],
      });
      expect.assertions(1);
    });

    it("should add buy order to correct spot in buy price orders", () => {
      mockDate = faker.random.number();

      const lowest: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number({ min: 0, max: 2 }),
        isBuyOrder: true,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const mid: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number({ min: 3, max: 4 }),
        isBuyOrder: true,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const highest: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number({ min: 5, max: 6 }),
        isBuyOrder: true,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const exchange = new Exchange();
      // @ts-ignore private func
      exchange._addOrder(mid);
      // @ts-ignore private func
      exchange._addOrder(highest);
      // @ts-ignore private func
      exchange._addOrder(lowest);

      expect(
        exchange._orderBook.prices.sorted.highestBuy,
        "should have added buy orders in decreasing price order"
      ).toEqual([highest.price, mid.price, lowest.price]);
      expect.assertions(1);
    });

    it("should add sell order to correct spot in sell price orders", () => {
      mockDate = faker.random.number();

      const lowest: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number({ min: 0, max: 2 }),
        isBuyOrder: false,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const mid: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number({ min: 3, max: 4 }),
        isBuyOrder: false,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const highest: IOrder = {
        id: mockDate.toString(),
        price: faker.random.number({ min: 5, max: 6 }),
        isBuyOrder: false,
        quantity: faker.random.number({ min: 10 }),
        executedQuantity: faker.random.number({ min: 0, max: 5 }),
      };

      const exchange = new Exchange();
      // @ts-ignore private func
      exchange._addOrder(mid);
      // @ts-ignore private func
      exchange._addOrder(highest);
      // @ts-ignore private func
      exchange._addOrder(lowest);

      expect(
        exchange._orderBook.prices.sorted.lowestSell,
        "should have added sell orders in increasing price order"
      ).toEqual([lowest.price, mid.price, highest.price]);
      expect.assertions(1);
    });
  });

  describe("_processOrder()", () => {
    it("should loop through prices executing any available sell orders", async () => {
      const exchange = new Exchange();
      exchange._orderBook = {
        orders: {
          byId: {
            "1": {
              id: "1",
              isBuyOrder: false,
              price: 1,
              quantity: 1,
              executedQuantity: 0,
            },
            "2": {
              id: "2",
              isBuyOrder: false,
              price: 1,
              quantity: 1,
              executedQuantity: 0,
            },
            "3": {
              id: "3",
              isBuyOrder: false,
              price: 2,
              quantity: 1,
              executedQuantity: 0,
            },
            "4": {
              id: "4",
              isBuyOrder: false,
              price: 2,
              quantity: 7,
              executedQuantity: 0,
            },
            "5": {
              id: "5",
              isBuyOrder: false,
              price: 5,
              quantity: 1,
              executedQuantity: 0,
            },
          },
        },
        prices: {
          byPrice: {
            1: {
              price: 1,
              remainingQuantity: 2,
              orders: ["1", "2"],
            },
            2: {
              price: 2,
              remainingQuantity: 8,
              orders: ["3", "4"],
            },
            5: {
              price: 2,
              remainingQuantity: 1,
              orders: ["5"],
            },
          },
          sorted: {
            lowestSell: [1, 2, 5],
            highestBuy: [],
          },
        },
      };

      const order: IOrder = {
        id: "foo",
        quantity: 4,
        price: 3,
        executedQuantity: 0,
        isBuyOrder: true,
      };

      // @ts-ignore
      const result = await exchange._processOrder(order);

      expect(result.executedQuantity).toEqual(4);
      expect(exchange._orderBook).toMatchSnapshot();
    });

    it("should loop through prices executing any available buy orders", async () => {
      const exchange = new Exchange();
      exchange._orderBook = {
        orders: {
          byId: {
            "1": {
              id: "1",
              isBuyOrder: true,
              price: 10,
              quantity: 1,
              executedQuantity: 0,
            },
            "2": {
              id: "2",
              isBuyOrder: true,
              price: 10,
              quantity: 1,
              executedQuantity: 0,
            },
            "3": {
              id: "3",
              isBuyOrder: true,
              price: 9,
              quantity: 1,
              executedQuantity: 0,
            },
            "4": {
              id: "4",
              isBuyOrder: true,
              price: 9,
              quantity: 7,
              executedQuantity: 0,
            },
            "5": {
              id: "5",
              isBuyOrder: true,
              price: 5,
              quantity: 1,
              executedQuantity: 0,
            },
          },
        },
        prices: {
          byPrice: {
            10: {
              price: 1,
              remainingQuantity: 2,
              orders: ["1", "2"],
            },
            9: {
              price: 2,
              remainingQuantity: 8,
              orders: ["3", "4"],
            },
            5: {
              price: 2,
              remainingQuantity: 1,
              orders: ["5"],
            },
          },
          sorted: {
            lowestSell: [],
            highestBuy: [10, 9, 5],
          },
        },
      };

      const order: IOrder = {
        id: "foo",
        quantity: 4,
        price: 6,
        executedQuantity: 0,
        isBuyOrder: false,
      };

      // @ts-ignore
      const result = await exchange._processOrder(order);

      expect(result.executedQuantity).toEqual(4);
      expect(exchange._orderBook).toMatchSnapshot();
    });
  });
});

describe("process", () => {
  it("should run", async () => {
    // 100 orders with random price from 0-100

    const exchange = new Exchange();

    const start = Date.now();
    times(100, async () => {
      times(100, async (num) => {
        const buy = random(0, 1, false);

        if (buy) {
          await exchange.buy(random(0, 100, false), random(0, 100, false));
        } else {
          await exchange.sell(random(0, 100, false), random(0, 100, false));
        }
      });
    });
    const end = Date.now();
    console.log(end - start);
  });
});
