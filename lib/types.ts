export interface IExchange {
  sync: (fileName: string) => any;
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
