---
slug: /en/guides/sre/network-ports
sidebar_label: Network ports
---

# Network ports

:::note
Ports described as **default** mean that the port number is configured in `/etc/clickhouse-server/config.xml`.  To customize your settings, add a file to `/etc/clickhouse-server/config.d/`.  See the [configuration file](../../operations/configuration-files.md#override) documentation.
:::

|Port|Description|
|----|-----------|
|2181|ZooKeeper default service port. **Note: see `9181` for ClickHouse Keeper**|
|8123|HTTP default port|
|8443|HTTP SSL/TLS default port|
|9000|Native Protocol port (also referred to as ClickHouse TCP protocol). Used by ClickHouse applications and processes like `clickhouse-server`, `clickhouse-client`, and native ClickHouse tools. Used for inter-server communication for distributed queries.|
|9004|MySQL emulation port|
|9005|PostgreSQL emulation port (also used for secure communication if SSL is enabled for ClickHouse).|
|9009|Inter-server communication port for low-level data access. Used for data exchange, replication, and inter-server communication.|
|9010|SSL/TLS for inter-server communications|
|9011|Native protocol PROXYv1 protocol port|
|9019|JDBC bridge|
|9100|gRPC port|
|9181|Recommended ClickHouse Keeper port|
|9234|Recommended ClickHouse Keeper Raft port (also used for secure communication if `<secure>1</secure>` enabled) |
|9363|Prometheus default metrics port|
|9281|Recommended Secure SSL ClickHouse Keeper port|
|9440|Native protocol SSL/TLS port|
|42000|Graphite default port|

