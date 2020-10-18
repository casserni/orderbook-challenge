export interface IExchange {
  sync: (fileName: string) => IOrderBook;
  buy: (quantity: number, price: number) => IOrder;
  sell: (quantity: number, price: number) => IOrder;
  getQuantityAtPrice: (price: number) => number;
  getOrder: (id: string) => IOrder;
}

export interface IOrder {
  id: string;
  // whethe this order is a buy or sell order
  isBuyOrder: boolean;
  // the order's original quantity
  quantity: number;
  // the price the order was made at
  price: number;
  // the # of quantity that this order has bought or sold
  executedQuantity: number;
}

export interface IPrice {
  price: number;
  // accumulation of all remaining quantity from buy or sell orders at this price
  remainingQuantity: number;
  // open orders at this price sorted by time placement of the order
  orders: Array<IOrder["id"]>;
}

export interface IOrderBook {
  orders: {
    byId: { [id: string]: IOrder };
  };

  prices: {
    byPrice: { [price: string]: IPrice };
  };
}

export const defaultOrderBook: IOrderBook = {
  orders: {
    byId: {},
  },

  prices: {
    byPrice: {},
  },
};
