---
title: Setting a limit on query execution time
description: "How to enforce limit on max query execution time"
date: 2022-07-10
---

# Question

How do I enforce a time limit on my queries?


# Answer

You can use `max_execution_time` setting:

```sql
clickhouse-cloud :) SELECT 1 SETTINGS max_execution_time=0.0001

SELECT 1
SETTINGS max_execution_time = 0.0001

Query id: 3db752a7-b94f-4456-b3b9-ccbf290d1394


0 rows in set. Elapsed: 0.113 sec.

Received exception from server (version 23.5.1):
Code: 159. DB::Exception: Received from service.aws.clickhouse.cloud:9440. DB::Exception: Timeout exceeded: elapsed 0.000557862 seconds, maximum: 0.0001. (TIMEOUT_EXCEEDED)
```
