---
'description': 'ClickHouse에서 IPv4 데이터 유형에 대한 문서'
'sidebar_label': 'IPv4'
'sidebar_position': 28
'slug': '/sql-reference/data-types/ipv4'
'title': 'IPv4'
'doc_type': 'reference'
---

## IPv4 {#ipv4}

IPv4 주소. UInt32로 4바이트로 저장됩니다.

### 기본 사용법 {#basic-usage}

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

또는 IPv4 도메인을 키로 사용할 수 있습니다:

```sql
CREATE TABLE hits (url String, from IPv4) ENGINE = MergeTree() ORDER BY from;
```

`IPv4` 도메인은 IPv4-문자열로 사용자 정의 입력 형식을 지원합니다:

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

값은 압축된 이진 형식으로 저장됩니다:

```sql
SELECT toTypeName(from), hex(from) FROM hits LIMIT 1;
```

```text
┌─toTypeName(from)─┬─hex(from)─┐
│ IPv4             │ B7F7E83A  │
└──────────────────┴───────────┘
```

IPv4 주소는 IPv6 주소와 직접 비교할 수 있습니다:

```sql
SELECT toIPv4('127.0.0.1') = toIPv6('::ffff:127.0.0.1');
```

```text
┌─equals(toIPv4('127.0.0.1'), toIPv6('::ffff:127.0.0.1'))─┐
│                                                       1 │
└─────────────────────────────────────────────────────────┘
```

**참고**

- [IPv4 및 IPv6 주소 작업을 위한 함수](../functions/ip-address-functions.md)
