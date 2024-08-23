---
date: 2023-03-01
---

# How to increase the number of threads available?

ClickHouse uses threads from the **Global Thread pool** to process queries and also perform background operations like merges and mutations. If there is no idle thread to process a query, then a new thread is created in the pool.

The maximum size of the global thread pool is determined by the `max_thread_pool_size` setting, which defaults to 10,000. You can modify this value in your config - here we set it to 20,000:

```xml
<max_thread_pool_size>20000</max_thread_pool_size>
```

If you modify `max_thread_pool_size`, we recommend changing `thread_pool_queue_size` to be the same value. The `thread_pool_queue_size` setting is the maximum number of jobs that can be scheduled on the Global Thread pool:

```xml
<thread_pool_queue_size>20000</thread_pool_queue_size>
```

You can also free up resources if your server has a lot of idle threads - using the `max_thread_pool_free_size` setting. The default is 1,000, which means your Global Thread pool will never have more than 1,000 idle threads. The following example increases the value to 2,000:

```xml
<max_thread_pool_free_size>2000</max_thread_pool_free_size>
```

Check out the [docs](https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings#max-thread-pool-size) for more details on the settings above and other settings that affect the Global Thread pool.
