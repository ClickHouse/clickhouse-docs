创建一个可以分配给用户或角色的 [配额](../../../guides/sre/user-management/index.md#quotas-management)。

语法：

```sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

键 `user_name`、`ip_address`、`client_key`、`client_key, user_name` 和 `client_key, ip_address` 对应于 [system.quotas](../../../operations/system-tables/quotas.md) 表中的字段。

参数 `queries`、`query_selects`、`query_inserts`、`errors`、`result_rows`、`result_bytes`、`read_rows`、`read_bytes`、`execution_time`、`failed_sequential_authentications` 对应于 [system.quotas_usage](../../../operations/system-tables/quotas_usage.md) 表中的字段。

`ON CLUSTER` 子句允许在集群上创建配额，参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

**示例**

限制当前用户在15个月内最多只能执行123个查询：

```sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

对于默认用户，限制最大执行时间为30分钟内的半秒，并限制最多321个查询和5个季度内最多10个错误：

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

进一步的示例，使用xml配置（在ClickHouse Cloud中不支持），可以在 [配额指南](/operations/quotas) 中找到。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 构建单页面应用](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
