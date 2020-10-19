import { merge } from "lodash";
import { defaultOrderBook, IExchange, IOrder } from "./types";

export class Exchange implements IExchange {
  public _orderBook = merge({}, defaultOrderBook);

  constructor() {
    // TODO
  }

  // @ts-ignore
  public sync(fileName: string) {
    // TODO
  }

  public buy(quantity: number, price: number) {
    const order: IOrder = {
      id: generateId(),
      quantity,
      price,
      executedQuantity: 0,
      isBuyOrder: true,
    };

    // add the new order to the orderbook
    this._orderBook.orders.byId[order.id] = order;

    return order;
  }

  public sell(quantity: number, price: number) {
    const order: IOrder = {
      id: generateId(),
      quantity,
      price,
      executedQuantity: 0,
      isBuyOrder: false,
    };

    // add the new order to the orderbook
    this._orderBook.orders.byId[order.id] = order;

    // if this is an open order add to the prices storage
    const isOpen = order.quantity > order.executedQuantity;
    if (isOpen) {
      const existing = this._orderBook.prices.byPrice[price];
      const remainingQuantity = order.quantity - order.executedQuantity;

      if (existing) {
        existing.orders.push(order.id);
        existing.remainingQuantity += remainingQuantity;
      } else {
        this._orderBook.prices.byPrice[price] = {
          price,
          remainingQuantity,
          orders: [order.id],
        };
      }
    }

    return order;
  }

  public getQuantityAtPrice(price: number) {
    const orderPrice = this._orderBook.prices.byPrice[price];
    return orderPrice ? orderPrice.remainingQuantity : 0;
  }

  public getOrder(id: string) {
    return this._orderBook.orders.byId[id];
  }
}

// Simple id generator, there are better ways to do this like using uuid but for simplicity lets just use the date as an id
// This will quickly break down in a large system where two orders might get placed at the exact same time.
// Using Date will also allow us to easily stub out this function in testing
function generateId() {
  return Date.now().toString();
}
