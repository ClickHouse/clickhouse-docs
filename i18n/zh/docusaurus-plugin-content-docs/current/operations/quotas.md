---
description: '在 ClickHouse 中配置和管理资源使用配额的指南'
sidebar_label: 'Quotas'
sidebar_position: 51
slug: /operations/quotas
title: 'Quotas'
doc_type: 'guide'
---

:::note ClickHouse Cloud 中的配额
ClickHouse Cloud 支持配额，但必须使用 [DDL 语法](/sql-reference/statements/create/quota) 来创建。下面文档中所述的 XML 配置方式**尚不支持**。
:::

配额允许你在一段时间内限制资源使用，或跟踪资源的使用情况。
配额是在用户配置中设置的，通常位于 &#39;users.xml&#39; 文件中。

系统还提供了限制单个查询复杂度的功能。参见[查询复杂度限制](../operations/settings/query-complexity.md)一节。

与查询复杂度限制不同，配额具有以下特性：

* 对在一段时间内可运行的一组查询施加限制，而不是限制单个查询。
* 统计分布式查询处理过程中在所有远程服务器上消耗的资源。

下面来看一下 &#39;users.xml&#39; 文件中定义配额的片段。

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

默认情况下，配额会按小时跟踪资源使用情况，但不会对使用量进行限制。
为每个时间间隔计算出的资源消耗会在每次请求后输出到服务器日志中。

```xml
<statbox>
    <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
    <interval>
        <!-- Length of the interval. -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <written_bytes>5000000</written_bytes>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</read_rows>
        <execution_time>900</execution_time>
        <failed_sequential_authentications>5</failed_sequential_authentications>
    </interval>

    <interval>
        <duration>86400</duration>

        <queries>10000</queries>
        <query_selects>10000</query_selects>
        <query_inserts>10000</query_inserts>
        <errors>1000</errors>
        <result_rows>5000000000</result_rows>
        <result_bytes>160000000000</result_bytes>
        <read_rows>500000000000</read_rows>
        <result_bytes>16000000000000</result_bytes>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

对于 &#39;statbox&#39; 配额，会分别设置每小时和每 24 小时 (86,400 秒) 的限制。时间区间从一个由实现定义的固定时刻开始计算。换句话说，这个 24 小时间隔不一定从午夜开始。

当时间区间结束时，所有已收集的数值都会被清空。在接下来的一个小时内，配额计算会重新开始。

以下是可以被限制的指标：

`queries` – 请求总数。

`query_selects` – SELECT 请求总数。

`query_inserts` – INSERT 请求总数。

`errors` – 抛出异常的查询数量。

`result_rows` – 作为结果返回的行总数。

`result_bytes` - 作为结果返回的行的总大小。

`read_rows` – 为在所有远程服务器上运行查询而从表中读取的源行总数。

`read_bytes` - 为在所有远程服务器上运行查询而从表中读取的数据总大小。

`written_bytes` - 写入操作的数据总大小。

`execution_time` – 查询执行总时间 (以秒为单位的挂钟时间) 。

`failed_sequential_authentications` - 连续身份验证错误的总次数。

`queries_per_normalized_hash` – 任意单个规范化查询的最大执行次数。规范化查询是指将字面量替换为占位符后的查询，因此 `SELECT 1` 和 `SELECT 2` 会被视为同一个规范化查询。此限制会针对每种不同的规范化查询模式分别独立跟踪。

如果在至少一个时间间隔内超出限制，将抛出一个异常，异常文本会说明超出了哪个限制、对应的是哪个时间间隔，以及新的时间间隔何时开始 (即何时可以再次发送查询) 。

配额可以使用“quota key”功能，对多个键的资源进行相互独立的统计和报告。下面是一个示例：

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

使用 DDL 语法时，您还可以按规范化查询哈希对配额进行分组，这样每种不同的查询模式都会拥有各自独立的配额桶：

```sql
CREATE QUOTA my_quota KEYED BY normalized_query_hash FOR INTERVAL 1 hour MAX queries = 100 TO my_user;
```

在此示例中，用户每小时对每种不同的规范化查询最多可执行 100 次。`SELECT number FROM numbers(1)` 和 `SELECT number FROM numbers(2)` 共享同一个桶 (因为它们具有相同的规范化形式) ，但 `SELECT number, number FROM numbers(1)` 使用单独的桶。

在配置的 &#39;users&#39; 部分为用户分配配额。参见“Access rights (访问权限) ”章节。

在分布式查询处理中，累积用量存储在发起请求的服务器上。因此，如果用户切换到另一台服务器，该服务器上的配额将会从头开始重新计算。

当服务器重启时，配额会被重置。

## 相关内容 \{#related-content\}

* 博文：[使用 ClickHouse 构建单页应用](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)