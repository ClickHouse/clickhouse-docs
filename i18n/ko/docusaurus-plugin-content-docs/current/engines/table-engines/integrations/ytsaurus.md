---
'description': 'YTsaurus 클러스터에서 데이터를 가져오는 것을 허용하는 테이블 엔진.'
'sidebar_label': 'YTsaurus'
'sidebar_position': 185
'slug': '/engines/table-engines/integrations/ytsaurus'
'title': 'YTsaurus 테이블 엔진'
'keywords':
- 'YTsaurus'
- 'table engine'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# YTsaurus 테이블 엔진

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

YTsaurus 테이블 엔진을 사용하면 YTsaurus 클러스터에서 데이터를 가져올 수 있습니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2], ...
) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
이 기능은 실험적이며 향후 릴리스에서 하위 호환성에 영향을 줄 수 있는 방식으로 변경될 수 있습니다.
[`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 설정을 사용하여 YTsaurus 테이블 엔진의 사용을 활성화하세요.

다음과 같이 설정할 수 있습니다:

`SET allow_experimental_ytsaurus_table_engine = 1`.
:::

**엔진 매개변수**

- `http_proxy_url` — YTsaurus http 프록시의 URL.
- `cypress_path` — 데이터 소스에 대한 Cypress 경로.
- `oauth_token` — OAuth 토큰.

## 사용 예제 {#usage-example}

YTsaurus 테이블을 생성하는 쿼리를 보여줍니다:

```sql title="Query"
SHOW CREATE TABLE yt_saurus;
```

```sql title="Response"
CREATE TABLE yt_saurus
(
    `a` UInt32,
    `b` String
)
ENGINE = YTsaurus('http://localhost:8000', '//tmp/table', 'password')
```

테이블에서 데이터를 반환하려면, 다음 쿼리를 실행하세요:

```sql title="Query"
SELECT * FROM yt_saurus;
```

```response title="Response"
┌──a─┬─b──┐
│ 10 │ 20 │
└────┴────┘
```

## 데이터 타입 {#data-types}

### 원시 데이터 타입 {#primitive-data-types}

| YTsaurus 데이터 타입 | Clickhouse 데이터 타입   |
| ------------------- | ----------------------- |
| `int8`              | `Int8`                  |
| `int16`             | `Int16`                 |
| `int32`             | `Int32`                 |
| `int64`             | `Int64`                 |
| `uint8`             | `UInt8`                 |
| `uint16`            | `UInt16`                |
| `uint32`            | `UInt32`                |
| `uint64`            | `UInt64`                |
| `float`             | `Float32`               |
| `double`            | `Float64`               |
| `boolean`           | `Bool`                  |
| `string`            | `String`                |
| `utf8`              | `String`                |
| `json`              | `JSON`                  |
| `yson(type_v3)`     | `JSON`                  |
| `uuid`              | `UUID`                  |
| `date32`            | `Date`(아직 지원되지 않음)|
| `datetime64`        | `Int64`                 |
| `timestamp64`       | `Int64`                 |
| `interval64`        | `Int64`                 |
| `date`              | `Date`(아직 지원되지 않음)|
| `datetime`          | `DateTime`              |
| `timestamp`         | `DateTime64(6)`         |
| `interval`          | `UInt64`                |
| `any`               | `String`                |
| `null`              | `Nothing`               |
| `void`              | `Nothing`               |
| `T` with `required = False` | `Nullable(T)`   |

### 복합 타입 {#composite-data-types}

| YTsaurus 데이터 타입 | Clickhouse 데이터 타입 |
| ------------------- | -------------------- |
| `decimal`           | `Decimal`            |
| `optional`          | `Nullable`           |
| `list`              | `Array`              |
| `struct`            | `NamedTuple`         |
| `tuple`             | `Tuple`              |
| `variant`           | `Variant`            |
| `dict`              | `Array(Tuple(...))   |
| `tagged`            | `T`                  |

**참조**

- [ytsaurus](../../../sql-reference/table-functions/ytsaurus.md) 테이블 함수
- [ytsaurus 데이터 스키마](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [ytsaurus 데이터 타입](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)
