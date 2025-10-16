---
'description': 'Движок таблиц, который позволяет импортировать данные из кластера
  YTsaurus.'
'sidebar_label': 'YTsaurus'
'sidebar_position': 185
'slug': '/engines/table-engines/integrations/ytsaurus'
'title': 'YTsaurus'
'keywords':
- 'YTsaurus'
- 'table engine'
'doc_type': 'reference'
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# YTsaurus

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Движок таблиц YTsaurus позволяет вам импортировать данные из кластера YTsaurus.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2], ...
) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
Это экспериментальная функция, которая может измениться в несовместимых с предыдущими версиями способах в будущих релизах.
Разрешите использование движка таблиц YTsaurus, 
установив настройку [`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine).

Вы можете сделать это с помощью:

`SET allow_experimental_ytsaurus_table_engine = 1`.
:::

**Параметры движка**

- `http_proxy_url` — URL к http-прокси YTsaurus.
- `cypress_path` — Путь Cypress к источнику данных.
- `oauth_token` — OAuth токен.

## Пример использования {#usage-example}

Показывает запрос, создающий таблицу YTsaurus:

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

Чтобы вернуть данные из таблицы, выполните:

```sql title="Query"
SELECT * FROM yt_saurus;
```

```response title="Response"
┌──a─┬─b──┐
│ 10 │ 20 │
└────┴────┘
```

## Типы данных {#data-types}

### Примитивные типы данных {#primitive-data-types}

| Тип данных YTsaurus | Тип данных Clickhouse    |
| ------------------ | ----------------------- |
| `int8`             | `Int8`                  |
| `int16`            | `Int16`                 |
| `int32`            | `Int32`                 |
| `int64`            | `Int64`                 |
| `uint8`            | `UInt8`                 |
| `uint16`           | `UInt16`                |
| `uint32`           | `UInt32`                |
| `uint64`           | `UInt64`                |
| `float`            | `Float32`               |
| `double`           | `Float64`               |
| `boolean`          | `Bool`                  |
| `string`           | `String`                |
| `utf8`             | `String`                |
| `json`             | `JSON`                  |
| `yson(type_v3)`    | `JSON`                  |
| `uuid`             | `UUID`                  |
| `date32`           | `Date`(пока не поддерживается)|
| `datetime64`       | `Int64`                 |
| `timestamp64`      | `Int64`                 |
| `interval64`       | `Int64`                 |
| `date`             | `Date`(пока не поддерживается)|
| `datetime`         | `DateTime`              |
| `timestamp`        | `DateTime64(6)`         |
| `interval`         | `UInt64`                |
| `any`              | `String`                |
| `null`             | `Nothing`               |
| `void`             | `Nothing`               |
| `T` с `required = False`| `Nullable(T)`   |

### Композитные типы {#composite-data-types}

| Тип данных YTsaurus | Тип данных Clickhouse |
| ------------------ | -------------------- |
| `decimal`          | `Decimal`            |
| `optional`         | `Nullable`           |
| `list`             | `Array`              |
| `struct`           | `NamedTuple`         |
| `tuple`            | `Tuple`              |
| `variant`          | `Variant`            |
| `dict`             | `Array(Tuple(...))   |
| `tagged`           | `T`                  |

**Смотрите также**

- [ytsaurus](../../../sql-reference/table-functions/ytsaurus.md) функция таблицы
- [схема данных ytsaurus](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [типы данных ytsaurus](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)