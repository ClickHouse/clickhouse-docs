---
'description': 'ClickHouse에서 IPv6 주소를 16바이트 값으로 저장하는 IPv6 데이터 유형에 대한 문서'
'sidebar_label': 'IPv6'
'sidebar_position': 30
'slug': '/sql-reference/data-types/ipv6'
'title': 'IPv6'
'doc_type': 'reference'
---

## IPv6 {#ipv6}

IPv6 주소. UInt128 big-endian으로 16 바이트에 저장됩니다.

### Basic Usage {#basic-usage}

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

또는 `IPv6` 도메인을 키로 사용할 수 있습니다:

```sql
CREATE TABLE hits (url String, from IPv6) ENGINE = MergeTree() ORDER BY from;
```

`IPv6` 도메인은 IPv6 문자열로 사용자 정의 입력을 지원합니다:

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

값은 압축된 이진 형식으로 저장됩니다:

```sql
SELECT toTypeName(from), hex(from) FROM hits LIMIT 1;
```

```text
┌─toTypeName(from)─┬─hex(from)────────────────────────┐
│ IPv6             │ 200144C8012926320033000002520002 │
└──────────────────┴──────────────────────────────────┘
```

IPv6 주소는 IPv4 주소와 직접 비교할 수 있습니다:

```sql
SELECT toIPv4('127.0.0.1') = toIPv6('::ffff:127.0.0.1');
```

```text
┌─equals(toIPv4('127.0.0.1'), toIPv6('::ffff:127.0.0.1'))─┐
│                                                       1 │
└─────────────────────────────────────────────────────────┘
```

**See Also**

- [Functions for Working with IPv4 and IPv6 Addresses](../functions/ip-address-functions.md)
