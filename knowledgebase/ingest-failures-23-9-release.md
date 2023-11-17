---
sidebar_position: 1
title: Possible ingest failures after 23.9 release
date: 2022-11-17
---

The root cause of these permissions errors has been identified and is due to more strict checking of grants in the new release for [`async_inserts`](/en/optimize/asynchronous-inserts).

To fix this issue, grants must be updated for your service to work. Check the error message indicating the missing grants and add those needed grants manually. The required additional grants for the tables using `async_inserts` will either be the `SELECT` or `dictGet` grant.

If you are unable to perform this change, then please contact [ClickHouse Support](https://clickhouse.com/support/program) for assistance.
