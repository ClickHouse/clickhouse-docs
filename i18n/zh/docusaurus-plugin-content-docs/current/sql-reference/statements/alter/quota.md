---
'description': '配额的文档'
'sidebar_label': 'QUOTA'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/quota'
'title': 'ALTER QUOTA'
---

Changes quotas.

语法：

```sql
ALTER QUOTA [IF EXISTS] name [ON CLUSTER cluster_name]
    [RENAME TO new_name]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
        NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```
键 `user_name`、`ip_address`、`client_key`、`client_key, user_name` 和 `client_key, ip_address` 对应于 [system.quotas](../../../operations/system-tables/quotas.md) 表中的字段。

参数 `queries`、`query_selects`、`query_inserts`、`errors`、`result_rows`、`result_bytes`、`read_rows`、`read_bytes`、`execution_time` 对应于 [system.quotas_usage](../../../operations/system-tables/quotas_usage.md) 表中的字段。

`ON CLUSTER` 子句允许在集群上创建配额，请参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

**示例**

限制当前用户的最大查询数量为 123 个，在 15 个月约束内：

```sql
ALTER QUOTA IF EXISTS qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

对于默认用户，限制最大执行时间为半秒，在 30 分钟内，并限制最大查询数量为 321，最大错误数量为 10，在 5 个季度内：

```sql
ALTER QUOTA IF EXISTS qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```
