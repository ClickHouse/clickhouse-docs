---
slug: /operations/quotas
sidebar_position: 51
sidebar_label: '配额'
title: '配额'
---

配额允许您在一段时间内限制资源使用或跟踪资源的使用情况。配额在用户配置中设置，通常为 'users.xml'。

系统还具有限制单个查询复杂度的功能。请参见[查询复杂度的限制](../operations/settings/query-complexity.md)部分。

与查询复杂度限制相比，配额：

- 对一段时间内可以运行的一组查询施加限制，而不是限制单个查询。
- 考虑在所有远程服务器上用于分布式查询处理的资源。

让我们看看定义配额的 'users.xml' 文件的部分。

``` xml
<!-- 配额 -->
<quotas>
    <!-- 配额名称。 -->
    <default>
        <!-- 一段时间内的限制。您可以设置许多具有不同限制的时间间隔。 -->
        <interval>
            <!-- 时间间隔的长度。 -->
            <duration>3600</duration>

            <!-- 不限制。仅在指定的时间间隔内收集数据。 -->
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

默认情况下，配额每小时跟踪资源消耗，而不限制使用。每个时间间隔计算的资源消耗在每个请求后输出到服务器日志。

``` xml
<statbox>
    <!-- 一段时间内的限制。您可以设置许多具有不同限制的时间间隔。 -->
    <interval>
        <!-- 时间间隔的长度。 -->
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

对于 'statbox' 配额，每小时和每24小时（86,400秒）设置了限制。时间间隔从一个实现定义的固定时刻开始计算。换句话说，24小时的间隔不一定从午夜开始。

当时间间隔结束时，所有收集的值将被清除。在下一个小时，配额计算将重新开始。

以下是可以限制的数量：

`queries` – 请求的总数。

`query_selects` – select请求的总数。

`query_inserts` – insert请求的总数。

`errors` – 抛出异常的查询数量。

`result_rows` – 作为结果返回的总行数。

`read_rows` – 从表中读取的用于在所有远程服务器上运行查询的源行的总数。

`execution_time` – 查询的总执行时间，以秒为单位（墙时）。

如果至少有一个时间间隔的限制被超过，则会抛出异常，说明哪个限制被超过、哪个时间间隔以及何时开始新的时间间隔（何时可以再次发送查询）。

配额可以使用“配额键”功能独立报告多个键的资源。以下是示例：

``` xml
<!-- 用于全局报告设计器。 -->
<web_global>
    <!-- keyed – 配额键 "key" 在查询参数中传递，
            每个键值的配额都是单独跟踪的。
        例如，您可以将用户名作为键传递，
            这样配额将单独计算每个用户名。
        使用键的意义在于配额键是由程序传输，而非用户。

        您还可以编写 <keyed_by_ip />，使用IP地址作为配额键。
        （但请记住，用户可以相当容易地更改IPv6地址。）
    -->
    <keyed />
```

配额分配给配置的 'users' 部分的用户。请参见“访问权限”部分。

对于分布式查询处理，累积的金额存储在请求者服务器上。因此，如果用户转到另一台服务器，那里配额将“重新开始”。

当服务器重新启动时，配额将被重置。
