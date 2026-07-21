## Community monitoring solutions {#community-monitoring}

The ClickHouse community has developed comprehensive monitoring solutions that integrate with popular observability stacks. [ClickHouse Monitoring](https://github.com/duyet/clickhouse-monitoring) provides a complete monitoring setup with pre-built dashboards. This open source project offers a quick-start approach for teams looking to implement ClickHouse monitoring with established best practices and proven dashboard configurations.

[QueryBurn](https://github.com/ofeliacode/queryburn) is an open source read-only agent that scans `system.query_log` and sends Telegram alerts for expensive ClickHouse queries. It can detect long-running queries, high read volume, high memory usage, and queries that scan many rows but return small results. QueryBurn provides a Docker image, a mock alert demo, and a local ClickHouse demo for quick evaluation.

:::note
Like other direct database monitoring approaches, these solutions query ClickHouse system tables directly, which prevents instances from idling and impacts cost optimization.
:::
