---
'description': '在ClickHouse中配置和管理资源使用配额的指南'
'sidebar_label': '配额'
'sidebar_position': 51
'slug': '/operations/quotas'
'title': '资源使用配额'
---



:::note ClickHouse Cloud中的配额
配额在ClickHouse Cloud中得到支持，但必须使用 [DDL 语法](/sql-reference/statements/create/quota) 创建。下面文档中的XML配置方法是**不支持的**。
:::

配额允许您在一段时间内限制资源使用或跟踪资源的使用情况。配额在用户配置中设置，通常为'users.xml'。

系统还具有限制单个查询复杂性的功能。请参见[查询复杂性限制](../operations/settings/query-complexity.md)部分。

与查询复杂性限制不同，配额：

- 对在一段时间内可以运行的查询集施加限制，而不是限制单个查询。
- 考虑了为分布式查询处理在所有远程服务器上消耗的资源。

让我们来看一下定义配额的'users.xml'文件部分。

```xml
<!-- Quotas -->
<quotas>
    <!-- Quota name. -->
    <default>
        <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
        <interval>
            <!-- Length of the interval. -->
            <duration>3600</duration>

            <!-- Unlimited. Just collect data for the specified time interval. -->
            <queries>0</queries>
            <query_selects>0</query_selects>
            <query_inserts>0</query_inserts>
            <errors>0</errors>
            <result_rows>0</result_rows>
            <read_rows>0</read_rows>
            <execution_time>0</execution_time>
        </interval>
    </default>
```

默认情况下，配额每小时跟踪资源消耗，而不限制使用。为每个时间间隔计算的资源消耗在每个请求后输出到服务器日志。

```xml
<statbox>
    <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
    <interval>
        <!-- Length of the interval. -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</read_rows>
        <execution_time>900</execution_time>
    </interval>

    <interval>
        <duration>86400</duration>

        <queries>10000</queries>
        <query_selects>10000</query_selects>
        <query_inserts>10000</query_inserts>
        <errors>1000</errors>
        <result_rows>5000000000</result_rows>
        <read_rows>500000000000</read_rows>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

对于'statbox'配额，限制设置为每小时和每24小时（86,400秒）。时间间隔从实现定义的一个固定时刻开始计算。换句话说，24小时的时间间隔不一定从午夜开始。

当时间间隔结束时，所有收集的值将被清除。在下一个小时，配额计算将重新开始。

以下是可以被限制的数量：

`queries` – 请求的总数量。

`query_selects` – select请求的总数量。

`query_inserts` – insert请求的总数量。

`errors` – 抛出异常的查询数量。

`result_rows` – 作为结果返回的总行数。

`read_rows` – 为在所有远程服务器上运行查询而从表中读取的源行的总数量。

`execution_time` – 查询的总执行时间（以秒为单位，墙时）。

如果在至少一个时间间隔内超过了限制，将抛出异常，内容包括超出限制的文本、超出限制的时间间隔以及新时间间隔开始的时间（可以再次发送查询的时间）。

配额可以使用“配额键”功能独立报告多个键的资源。以下是一个示例：

```xml
<!-- For the global reports designer. -->
<web_global>
    <!-- keyed – The quota_key "key" is passed in the query parameter,
            and the quota is tracked separately for each key value.
        For example, you can pass a username as the key,
            so the quota will be counted separately for each username.
        Using keys makes sense only if quota_key is transmitted by the program, not by a user.

        You can also write <keyed_by_ip />, so the IP address is used as the quota key.
        (But keep in mind that users can change the IPv6 address fairly easily.)
    -->
    <keyed />
```

配额在配置的'users'部分分配给用户。请参见“访问权限”部分。

对于分布式查询处理，累积的数量存储在请求服务器上。因此，如果用户转到另一台服务器，那里配额将“重新开始”。

当服务器重新启动时，配额将被重置。

## 相关内容 {#related-content}

- 博客: [使用ClickHouse构建单页面应用程序](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
