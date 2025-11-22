---
description: '在 ClickHouse 中配置和管理资源使用配额的指南'
sidebar_label: '配额'
sidebar_position: 51
slug: /operations/quotas
title: '配额'
doc_type: 'guide'
---

:::note ClickHouse Cloud 中的配额
ClickHouse Cloud 支持配额，但必须使用 [DDL 语法](/sql-reference/statements/create/quota) 来创建。下文所述的 XML 配置方式**不受支持**。
:::

配额用于在一定时间段内限制资源使用或监控资源使用情况。
配额在用户配置文件中进行设置，通常为 &#39;users.xml&#39;。

系统还提供了限制单个查询复杂度的功能。参见 [查询复杂度限制](../operations/settings/query-complexity.md) 一节。

与查询复杂度限制相比，配额：

* 对在一段时间内可执行的一组查询进行限制，而不是仅限制单个查询。
* 统计分布式查询处理过程中在所有远程服务器上消耗的资源。

让我们来看一下 &#39;users.xml&#39; 文件中定义配额的部分。

```xml
<!-- 配额 -->
<quotas>
    <!-- 配额名称 -->
    <default>
        <!-- 时间段限制。可以设置多个具有不同限制的时间间隔。 -->
        <interval>
            <!-- 时间间隔长度 -->
            <duration>3600</duration>

            <!-- 不限制。仅收集指定时间间隔内的数据。 -->
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

默认情况下，配额会按小时跟踪资源消耗，但不会限制使用量。
为每个时间间隔计算出的资源消耗会在每次请求后输出到服务器日志中。

```xml
<statbox>
    <!-- 时间段限制。可以设置多个具有不同限制的时间间隔。 -->
    <interval>
        <!-- 间隔长度。 -->
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

对于 `statbox` 配额，会分别设置每小时和每 24 小时（86,400 秒）的限制。时间区间从一个由实现定义的固定时间点开始计数。换句话说，24 小时时间区间不一定从午夜开始。

当时间区间结束时，所有累积的数值都会被清空。接下来的一个小时，将重新开始计算配额。

可以被限制的指标如下：

`queries` – 请求总数。

`query_selects` – `select` 请求总数。

`query_inserts` – `insert` 请求总数。

`errors` – 抛出异常的查询数量。

`result_rows` – 返回结果的总行数。

`result_bytes` - 返回结果的总大小（字节数）。

`read_rows` – 在所有远程服务器上，为执行查询从表中读取的源数据行总数。

`read_bytes` - 在所有远程服务器上，为执行查询从表中读取的总大小（字节数）。

`written_bytes` - 写入操作的总大小（字节数）。

`execution_time` – 查询总执行时间（秒，墙钟时间，wall time）。

`failed_sequential_authentications` - 连续身份验证错误的总次数。


如果至少有一个时间区间超出限制，将抛出一个异常，其中包含文本说明：超出的具体限制项、对应的时间区间，以及新时间区间何时开始（也就是何时可以再次发送查询）。

Quota 可以使用 &quot;quota key&quot;（配额键）功能，对多个不同的 key 分别统计和报告资源使用情况。下面是一个示例：

```xml
<!-- 用于全局报告设计器。 -->
<web_global>
    <!-- keyed – quota_key "key" 通过查询参数传递,
            配额将针对每个键值分别跟踪。
        例如,可以传递用户名作为键,
            这样配额将针对每个用户名分别计数。
        仅当 quota_key 由程序传递而非由用户传递时,使用键才有意义。

        也可以写成 <keyed_by_ip />,这样 IP 地址将用作配额键。
        (但请注意,用户可以相当容易地更改 IPv6 地址。)
    -->
    <keyed />
```

在配置文件的 &#39;users&#39; 部分为用户指定配额。参见“Access rights”一节。

对于分布式查询处理，累计用量存储在发起请求的服务器上。因此，如果用户切换到另一台服务器，该服务器上的配额将会从头开始计算。

当服务器重启时，配额会被重置。


## 相关内容 {#related-content}

- 博客：[使用 ClickHouse 构建单页应用](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
