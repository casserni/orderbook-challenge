import { merge } from "lodash";
import { defaultOrderBook, IExchange } from "./types";

export class Exchange implements IExchange {
  public _orderBook = merge({}, defaultOrderBook);

  constructor() {
    // TODO
  }

  // @ts-ignore
  public sync(fileName: string) {
    // TODO
  }

  // @ts-ignore
  public buy(quantity: number, price: number) {
    // TODO
  }

  // @ts-ignore
  public sell(quantity: number, price: number) {
    // TODO
  }

  public getQuantityAtPrice(price: number) {
    const orderPrice = this._orderBook.prices.byPrice[price];
    return orderPrice ? orderPrice.remainingQuantity : 0;
  }

  public getOrder(id: string) {
    return this._orderBook.orders.byId[id];
  }
}
