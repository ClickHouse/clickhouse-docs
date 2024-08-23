---
date: 2023-03-01
---

# Capturing server logs of queries at the client

A client can view the server logs - even at a different level than what the server log level is configured to - by setting the `send_logs_level` client setting.

For example, suppose the client runs:

```sql
SET send_logs_level = 'trace';
```

The client will receive trace logs even if the server has log level set to info.

One useful scenario is to use `send_logs_level` to monitor the insertion of rows into a `Distributed` table:
- Enable logs in `clickhouse-client` using `SET send_logs_level = 'trace';`
- Run your `INSERT` query
- Inserts into a distributed table are asynchronous by default. The data is written into a local buffer on disk, then sent to remote servers in background.
- Logs will be sent from all nodes participating in the query processing (distributed tracing)

To check the status of distributed inserts, check the [`system.distribution_queue` table](https://clickhouse.com/docs/en/operations/system-tables/distribution_queue/). This table contains information about local files that are in the queue to be sent to the shards. These local files contain new parts that are created by inserting new data into the `Distributed` table in asynchronous mode.
