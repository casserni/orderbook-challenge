import { merge } from "lodash";
import { defaultOrderBook, IExchange } from "./types";

export class Exchange implements IExchange {
  public _orderBook = merge({}, defaultOrderBook);

  constructor() {
    // TODO
  }

  public sync(fileName: string) {
    // TODO
  }

  public buy(quantity: number, price: number) {
    // TODO
  }

  public sell(quantity: number, price: number) {
    // TODO
  }

  public getQuantityAtPrice(price: number) {
    // TODO
  }

  public getOrder(id: string) {
    return this._orderBook.orders.byId[id];
  }
}

module.exports = Exchange;
