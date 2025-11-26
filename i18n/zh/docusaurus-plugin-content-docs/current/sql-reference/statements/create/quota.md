---
description: '配额文档'
sidebar_label: '配额'
sidebar_position: 42
slug: /sql-reference/statements/create/quota
title: 'CREATE QUOTA'
doc_type: 'reference'
---

创建[配额](../../../guides/sre/user-management/index.md#quotas-management)，并将其分配给用户或角色。

语法：

```sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | written_bytes | execution_time | failed_sequential_authentications} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

键 `user_name`、`ip_address`、`client_key`、`client_key, user_name` 和 `client_key, ip_address` 对应于 [system.quotas](../../../operations/system-tables/quotas.md) 表中的字段。

参数 `queries`、`query_selects`、`query_inserts`、`errors`、`result_rows`、`result_bytes`、`read_rows`、`read_bytes`、`written_bytes`、`execution_time`、`failed_sequential_authentications` 对应于 [system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md) 表中的字段。

`ON CLUSTER` 子句允许在集群上创建配额，参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

**示例**

在 15 个月内，将当前用户的最大查询次数限制为 123 次：

```sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

对于默认用户，将最大执行时间限制为在 30 分钟内不超过 0.5 秒，并在 5 个季度内将最大查询次数限制为 321、最大错误次数限制为 10：

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

更多使用 XML 配置（ClickHouse Cloud 不支持）的示例可在[配额指南](/operations/quotas)中找到。


## 相关内容 {#related-content}

- 博客文章：[使用 ClickHouse 构建单页应用程序](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
