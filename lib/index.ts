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
    this._addOrder(order);

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
    this._addOrder(order);

    return order;
  }

  public getQuantityAtPrice(price: number) {
    const orderPrice = this._orderBook.prices.byPrice[price];
    return orderPrice ? orderPrice.remainingQuantity : 0;
  }

  public getOrder(id: string) {
    return this._orderBook.orders.byId[id];
  }

  // helpers
  private _addOrder(order: IOrder) {
    // add the new order to the orderbook
    this._orderBook.orders.byId[order.id] = order;

    // if this is an open order add to the prices storage
    const isOpen = order.quantity > order.executedQuantity;
    if (isOpen) {
      const existing = this._orderBook.prices.byPrice[order.price];
      const remainingQuantity = order.quantity - order.executedQuantity;

      if (existing) {
        existing.orders.push(order.id);
        existing.remainingQuantity += remainingQuantity;
      } else {
        this._orderBook.prices.byPrice[order.price] = {
          price: order.price,
          remainingQuantity,
          orders: [order.id],
        };
      }

      if (order.isBuyOrder) {
        binarySearchInsert(
          this._orderBook.prices.sorted.highestBuy,
          order.price,
          (a, b) => b - a
        );
      } else {
        binarySearchInsert(
          this._orderBook.prices.sorted.lowestSell,
          order.price
        );
      }
    }
  }
}

// Simple id generator, there are better ways to do this like using uuid but for simplicity lets just use the date as an id
// This will quickly break down in a large system where two orders might get placed at the exact same time.
// Using Date will also allow us to easily stub out this function in testing
function generateId() {
  return Date.now().toString();
}

// using binary search to decrease the search time to O(log n)
// array splice is still O(N) time :(
// source code inspired from
// https://www.npmjs.com/package/binary-search-insert
function binarySearchInsert(
  arr: number[],
  item: number,
  comparator: (a: number, b: number) => number = (a, b) => a - b
) {
  // if empty array add and return early
  if (arr.length === 0) {
    arr.push(item);
    return;
  }

  let high = arr.length - 1;
  let low = 0;
  let mid = 0;

  while (low <= high) {
    mid = Math.floor(high - low);
    let cmp = comparator(arr[mid], item);
    if (cmp <= 0) {
      // searching too low
      low = mid + 1;
    } else {
      // searching too high
      high = mid - 1;
    }
  }

  let cmp = comparator(arr[mid], item);
  if (cmp <= 0) {
    mid++;
  }

  arr.splice(mid, 0, item);
}
