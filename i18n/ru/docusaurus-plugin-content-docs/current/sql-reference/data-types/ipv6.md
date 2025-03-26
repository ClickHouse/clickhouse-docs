---
description: 'Документация для типа данных IPv6 в ClickHouse, который хранит адреса IPv6 в виде 16-байтовых значений'
sidebar_label: 'IPv6'
sidebar_position: 30
slug: /sql-reference/data-types/ipv6
title: 'IPv6'
---

## IPv6 {#ipv6}

Адреса IPv6. Хранятся в 16 байтах в формате UInt128 big-endian.

### Основное Использование {#basic-usage}

```sql
CREATE TABLE hits (url String, from IPv6) ENGINE = MergeTree() ORDER BY url;

DESCRIBE TABLE hits;
```

```text
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┐
│ url  │ String │              │                    │         │                  │
│ from │ IPv6   │              │                    │         │                  │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┘
```

ИЛИ вы можете использовать домен `IPv6` в качестве ключа:

```sql
CREATE TABLE hits (url String, from IPv6) ENGINE = MergeTree() ORDER BY from;
```

Домен `IPv6` поддерживает пользовательский ввод в виде строк IPv6:

```sql
INSERT INTO hits (url, from) VALUES ('https://wikipedia.org', '2a02:aa08:e000:3100::2')('https://clickhouse.com', '2001:44c8:129:2632:33:0:252:2')('https://clickhouse.com/docs/en/', '2a02:e980:1e::1');

SELECT * FROM hits;
```

```text
┌─url────────────────────────────────┬─from──────────────────────────┐
│ https://clickhouse.com          │ 2001:44c8:129:2632:33:0:252:2 │
│ https://clickhouse.com/docs/en/ │ 2a02:e980:1e::1               │
│ https://wikipedia.org              │ 2a02:aa08:e000:3100::2        │
└────────────────────────────────────┴───────────────────────────────┘
```

Значения хранятся в компактном двоичном формате:

```sql
SELECT toTypeName(from), hex(from) FROM hits LIMIT 1;
```

```text
┌─toTypeName(from)─┬─hex(from)────────────────────────┐
│ IPv6             │ 200144C8012926320033000002520002 │
└──────────────────┴──────────────────────────────────┘
```

Адреса IPv6 можно непосредственно сравнивать с адресами IPv4:

```sql
SELECT toIPv4('127.0.0.1') = toIPv6('::ffff:127.0.0.1');
```

```text
┌─equals(toIPv4('127.0.0.1'), toIPv6('::ffff:127.0.0.1'))─┐
│                                                       1 │
└─────────────────────────────────────────────────────────┘
```


**Смотрите Также**

- [Функции для работы с адресами IPv4 и IPv6](../functions/ip-address-functions.md)
