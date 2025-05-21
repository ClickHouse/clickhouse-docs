
The above mechanics illustrate a constant overhead regardless of the insert size, making batch size the single most important optimization for ingest throughput. Batching inserts reduce the overhead as a proportion of total insert time and improves processing efficiency.

We recommend inserting data in batches of at least 1,000 行, and ideally between 10,000–100,000 行. Fewer, larger inserts reduce the number of パーツ written, minimize merge load, and lower overall system resource usage. 

**For a synchronous insert strategy to be effective this client-side batching is required.**

If you're unable to batch data client-side, ClickHouse supports asynchronous inserts that shift batching to the server ([see](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)).

:::tip 
Regardless of the size of your inserts, we recommend keeping the number of insert クエリ around one insert クエリ per second. The reason for that recommendation is that the created パーツ are merged to larger パーツ in the background (in order to optimize your data for read クエリ), and sending too many insert クエリ per second can lead to situations where the background merging can't keep up with the number of new パーツ. However, you can use a higher rate of insert クエリ per second when you use asynchronous inserts (see asynchronous inserts). 
:::
```
