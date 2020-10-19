# Orderbook Implementation

# Running Tests

Install any dependencies

```bash
npm install
```

Run the test suite

```bash
npm test
```

# Implementation Considerations

Firstly I decided to use `typescript` instead of pure `javascript` for my implementation. Reason being is the added type saftey speeds up development time, forces myself to really think about the API and data structure before implementation, and lastly helps elimante "some" javascript oddity around type conversion and points out some smaller bugs early on. Plus typescript IS javascript so there isn't much of a reason not to use it, aside from not wanting to add some extra build steps.

For testing I went with `jest`. Its one of the more common testing frameworks and the one I am most familiar with. As an added bonus I used `jest-expect-message` which allows for more custom error messaging and in general more descriptive tests. This is great since you aren't stuck with a generic "foo" doesn't equal "bar" error. Also used snapshot testing for some of the more complex cases to ensure every part of the order book is in the right standing.

Onto the data structure....

For the data I decided to go with a normalized data structure of orders and prices. This is heavily inspired by how Redux recommends shaping complex data for optimized fetching/updating. You can read about it here https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape. What is nice about a normalized data structure is there isn't much nesting involved and its almost flattened with references to `id`'s in other top level keys and since grabbing values from an object is `O(1)` time it makes for really fast data fetching.

In the pricing object we store an array of order ids, sorted by the time the order was placed so we can keep track of priority. We also keep two arrays of pricing order one for buy prices decreasing, and one for sale prices decreasing. This allows use to keep pricing priority based on value. This can be improved, see sub optimal designs. On the pricing object I also store the remaining quantity at that price for quicking computation time of the `getQuantityAtPrice` function. This actually doesn't follow the normalizing data principal since it is pulling data out of orders, but the trade off of `O(N)` to `O(1)` time was worth it.

# Sub-Optimal Design

Here is the order in which I would fix/update any sub optimal designs

- Synchronous vs Asynchronous

  All of the functions run synchronously! This means when large orders are placed it could lock up sequential orders until it's completion. In a real implementation, the improvement here is adding a queue system for the processing of orders. So splitting up the buy/sell functions into two parts. The first is adding the order to the orderbook which we should handle synchronously so we keep priority integrity. Then once added, push a "process order" to the queue. The queue should still process orders in the order they are placed but since the processing happens separately you can argue its asynchronous to the actually adding to the orderbook. From a product standpoint what it would look like is a user places order, gets immediate confirmation/error. Then as time goes by they can see it being run.

- ID generation

  For simplicity the id generaton is really just a time stamp of when an order was placed. This introduces can introduce a bug in large systems. What if you were running multiple servers that read/write to the same orderbook to lighten the load, and two orders were placed at the exact same time? Two orders would have the same ID!! Really we should use uuids or something better, but for simplicity and speed of implementation a shortcut was taken here.

- Storage on Crash

  As of right now there is no handling for storage on crash :( One way easy way to do this is as the orders complete make sure to rewrite to the original orderbook. Reading and writing to files can be pretty expensive if your orderbook gets quite large, and was left out for time of completiong reasons at this moment.

- Arrays vs Linked List's

  Pricing order and order id at price order were both stored using dynamic arrays. This is not great for memory storage due to how javascript handles arrays. It preallocates an amount of storage, then whenever you go over that amount, it needs to create a new area of storage and copies all of the elements over to that new storage block. If you have a system that is constantly updating arrays like this one, you might run into some slowness on those edgecases. The other option would be to use Linked Lists where the location in storage is irrelevannt and you never have the issue in memory with copying the data over. The addition of Linked Lists does add more code complexity even though there is the boost in memory optimization.
