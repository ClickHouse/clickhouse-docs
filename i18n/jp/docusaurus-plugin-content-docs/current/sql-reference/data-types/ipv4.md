---
description: 'ClickHouse の IPv4 データ型に関するドキュメント'
sidebar_label: 'IPv4'
sidebar_position: 28
slug: /sql-reference/data-types/ipv4
title: 'IPv4'
doc_type: 'reference'
---

## IPv4 \\{#ipv4\\}

IPv4 アドレス。4 バイトの UInt32 型として格納されます。

### 基本的な使い方 \\{#basic-usage\\}

```sql
CREATE TABLE hits (url String, from IPv4) ENGINE = MergeTree() ORDER BY url;

DESCRIBE TABLE hits;
```

```text
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┐
│ url  │ String │              │                    │         │                  │
│ from │ IPv4   │              │                    │         │                  │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┘
```

または IPv4 ドメインをキーとして使用できます：

```sql
CREATE TABLE hits (url String, from IPv4) ENGINE = MergeTree() ORDER BY from;
```

`IPv4` ドメインは、IPv4 文字列形式でのカスタム入力をサポートします。

```sql
INSERT INTO hits (url, from) VALUES ('https://wikipedia.org', '116.253.40.133')('https://clickhouse.com', '183.247.232.58')('https://clickhouse.com/docs/en/', '116.106.34.242');

SELECT * FROM hits;
```

```text
┌─url────────────────────────────────┬───────────from─┐
│ https://clickhouse.com/docs/en/ │ 116.106.34.242 │
│ https://wikipedia.org              │ 116.253.40.133 │
│ https://clickhouse.com          │ 183.247.232.58 │
└────────────────────────────────────┴────────────────┘
```

値はコンパクトなバイナリ形式で格納されます。

```sql
SELECT toTypeName(from), hex(from) FROM hits LIMIT 1;
```

```text
┌─toTypeName(from)─┬─hex(from)─┐
│ IPv4             │ B7F7E83A  │
└──────────────────┴───────────┘
```

IPv4 アドレスは IPv6 アドレスと直接比較できます。

```sql
SELECT toIPv4('127.0.0.1') = toIPv6('::ffff:127.0.0.1');
```

```text
┌─equals(toIPv4('127.0.0.1'), toIPv6('::ffff:127.0.0.1'))─┐
│                                                       1 │
└─────────────────────────────────────────────────────────┘
```

**関連項目**

* [IPv4 および IPv6 アドレスを扱う関数](../functions/ip-address-functions.md)
