---
slug: /sql-reference/data-types/ipv6
sidebar_position: 30
sidebar_label: IPv6
---

## IPv6 {#ipv6}

IPv6地址。以UInt128大端格式存储在16个字节中。

### 基本用法 {#basic-usage}

``` sql
CREATE TABLE hits (url String, from IPv6) ENGINE = MergeTree() ORDER BY url;

DESCRIBE TABLE hits;
```

``` text
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┐
│ url  │ String │              │                    │         │                  │
│ from │ IPv6   │              │                    │         │                  │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┘
```

或者你可以使用`IPv6`域作为键：

``` sql
CREATE TABLE hits (url String, from IPv6) ENGINE = MergeTree() ORDER BY from;
```

`IPv6`域支持自定义输入作为IPv6字符串：

``` sql
INSERT INTO hits (url, from) VALUES ('https://wikipedia.org', '2a02:aa08:e000:3100::2')('https://clickhouse.com', '2001:44c8:129:2632:33:0:252:2')('https://clickhouse.com/docs/en/', '2a02:e980:1e::1');

SELECT * FROM hits;
```

``` text
┌─url────────────────────────────────┬─from──────────────────────────┐
│ https://clickhouse.com          │ 2001:44c8:129:2632:33:0:252:2 │
│ https://clickhouse.com/docs/en/ │ 2a02:e980:1e::1               │
│ https://wikipedia.org              │ 2a02:aa08:e000:3100::2        │
└────────────────────────────────────┴───────────────────────────────┘
```

值以紧凑的二进制形式存储：

``` sql
SELECT toTypeName(from), hex(from) FROM hits LIMIT 1;
```

``` text
┌─toTypeName(from)─┬─hex(from)────────────────────────┐
│ IPv6             │ 200144C8012926320033000002520002 │
└──────────────────┴──────────────────────────────────┘
```

IPv6地址可以直接与IPv4地址进行比较：

```sql
SELECT toIPv4('127.0.0.1') = toIPv6('::ffff:127.0.0.1');
```

```text
┌─equals(toIPv4('127.0.0.1'), toIPv6('::ffff:127.0.0.1'))─┐
│                                                       1 │
└─────────────────────────────────────────────────────────┘
```


**另请参阅**

- [处理IPv4和IPv6地址的函数](../functions/ip-address-functions.md)
