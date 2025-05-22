---
'description': '在 ClickHouse 中配置和管理资源使用配额的指南'
'sidebar_label': '配额'
'sidebar_position': 51
'slug': '/operations/quotas'
'title': '配额'
---

:::note Quotas in ClickHouse Cloud
在 ClickHouse Cloud 中支持配额，但必须使用 [DDL 语法](/sql-reference/statements/create/quota) 创建。下面记录的 XML 配置方法 **不受支持**。
:::

配额允许您在一段时间内限制资源使用或跟踪资源的使用。
配额在用户配置中设置，通常是 'users.xml'。

系统还具有限制单个查询复杂度的功能。请参见 [查询复杂度的限制](../operations/settings/query-complexity.md) 一节。

与查询复杂度限制相比，配额：

- 对可以在一段时间内运行的一组查询施加限制，而不是限制单个查询。
- 考虑到为分布式查询处理在所有远程服务器上消耗的资源。

让我们查看定义配额的 'users.xml' 文件部分。

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

默认情况下，配额跟踪每小时的资源消耗，而不限制使用。
计算出的每个时间段的资源消耗在每次请求后输出到服务器日志中。

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

对于 'statbox' 配额，每小时和每 24 小时（86,400 秒）设定了限制。时间间隔是从一个实现定义的固定时刻开始计算。换句话说，24 小时间隔不一定在午夜开始。

当时间间隔结束时，所有收集的值被清除。在下一个小时，配额计算重新开始。

以下是可以限制的数量：

`queries` – 请求的总数。

`query_selects` – select 请求的总数。

`query_inserts` – insert 请求的总数。

`errors` – 抛出异常的查询数量。

`result_rows` – 作为结果返回的行总数。

`read_rows` – 为在所有远程服务器上运行查询从表中读取的源行总数。

`execution_time` – 查询执行的总时间，单位为秒（壁钟时间）。

如果在至少一个时间间隔内超过限制，将抛出异常，文本中会说明哪个限制被超越、哪个时间间隔，以及何时开始新的时间间隔（可以重新发送查询的时间）。

配额可以使用 "配额键" 功能独立报告多个键的资源。以下是一个示例：

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

配额分配给配置的 'users' 部分中的用户。请参见 "访问权限" 一节。

对于分布式查询处理，累积的数量存储在请求服务器上。因此，如果用户转到另一台服务器，那个服务器上的配额将会 "重新开始"。

当服务器重启时，配额将被重置。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 构建单页面应用](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
