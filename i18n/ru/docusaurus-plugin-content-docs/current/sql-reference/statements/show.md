---
description: 'Документация по SHOW'
sidebar_label: 'SHOW'
sidebar_position: 37
slug: /sql-reference/statements/show
title: 'Операторы SHOW'
doc_type: 'reference'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` скрывает конфиденциальные данные, если не включены следующие настройки:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (настройка сервера)
- [`format_display_secrets_in_show_and_select` ](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (настройка формата)  

Кроме того, у пользователя должна быть привилегия [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect).
:::



## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

Эти операторы возвращают один столбец типа String,
содержащий запрос `CREATE`, который использовался для создания указанного объекта.

### Синтаксис {#syntax}

```sql title="Синтаксис"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
Если использовать этот оператор для получения запроса `CREATE` системных таблиц,
будет возвращён _фиктивный_ запрос, который только объявляет структуру таблицы
и не может быть использован для её создания.
:::


## SHOW DATABASES {#show-databases}

Эта инструкция выводит список всех баз данных.

### Синтаксис {#syntax-1}

```sql title="Синтаксис"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

Эквивалентна запросу:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### Примеры {#examples}

В этом примере используется `SHOW` для получения имён баз данных, содержащих последовательность символов 'de':

```sql title="Запрос"
SHOW DATABASES LIKE '%de%'
```

```text title="Ответ"
┌─name────┐
│ default │
└─────────┘
```

Также можно выполнить поиск без учёта регистра:

```sql title="Запрос"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Ответ"
┌─name────┐
│ default │
└─────────┘
```

Или получить имена баз данных, не содержащих 'de':

```sql title="Запрос"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="Ответ"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

Наконец, можно получить имена только первых двух баз данных:

```sql title="Запрос"
SHOW DATABASES LIMIT 2
```

```text title="Ответ"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### См. также {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)


## SHOW TABLES {#show-tables}

Оператор `SHOW TABLES` выводит список таблиц.

### Синтаксис {#syntax-2}

```sql title="Синтаксис"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Если секция `FROM` не указана, запрос возвращает список таблиц из текущей базы данных.

Этот оператор эквивалентен запросу:

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Примеры {#examples-1}

В этом примере используется оператор `SHOW TABLES` для поиска всех таблиц, содержащих 'user' в имени:

```sql title="Запрос"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Результат"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

Также можно выполнить поиск без учёта регистра:

```sql title="Запрос"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Результат"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

Или найти таблицы, не содержащие букву 's' в имени:

```sql title="Запрос"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="Результат"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

Наконец, можно получить имена только первых двух таблиц:

```sql title="Запрос"
SHOW TABLES FROM system LIMIT 2
```

```text title="Результат"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### См. также {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)


## SHOW COLUMNS {#show_columns}

Оператор `SHOW COLUMNS` выводит список столбцов.

### Синтаксис {#syntax-3}

```sql title="Синтаксис"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

Имя базы данных и таблицы можно указать в сокращенной форме `<db>.<table>`,
то есть `FROM tab FROM db` и `FROM db.tab` эквивалентны.
Если база данных не указана, запрос возвращает список столбцов из текущей базы данных.

Также доступны два необязательных ключевых слова: `EXTENDED` и `FULL`. Ключевое слово `EXTENDED` в настоящее время не имеет эффекта
и существует для совместимости с MySQL. Ключевое слово `FULL` добавляет в вывод столбцы collation, comment и privilege.

Оператор `SHOW COLUMNS` возвращает результирующую таблицу со следующей структурой:

| Столбец     | Описание                                                                                                                      | Тип                |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `field`     | Имя столбца                                                                                                                   | `String`           |
| `type`      | Тип данных столбца. Если запрос выполнен через протокол MySQL wire protocol, отображается эквивалентное имя типа в MySQL. | `String`           |
| `null`      | `YES`, если тип данных столбца Nullable, иначе `NO`                                                                           | `String`           |
| `key`       | `PRI`, если столбец входит в первичный ключ, `SOR`, если столбец входит в ключ сортировки, иначе пусто       | `String`           |
| `default`   | Выражение по умолчанию для столбца, если он имеет тип `ALIAS`, `DEFAULT` или `MATERIALIZED`, иначе `NULL`.                    | `Nullable(String)` |
| `extra`     | Дополнительная информация, в настоящее время не используется                                                                  | `String`           |
| `collation` | (только если указано ключевое слово `FULL`) Сопоставление столбца, всегда `NULL`, так как в ClickHouse нет сопоставлений на уровне столбцов | `Nullable(String)` |
| `comment`   | (только если указано ключевое слово `FULL`) Комментарий к столбцу                                                             | `String`           |
| `privilege` | (только если указано ключевое слово `FULL`) Привилегия для этого столбца, в настоящее время недоступна  | `String`           |

### Примеры {#examples-2}

В этом примере используется оператор `SHOW COLUMNS` для получения информации обо всех столбцах таблицы 'orders',
начинающихся с 'delivery\_':

```sql title="Запрос"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Ответ"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### См. также {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)


## SHOW DICTIONARIES {#show-dictionaries}

Оператор `SHOW DICTIONARIES` выводит список [словарей](../../sql-reference/dictionaries/index.md).

### Синтаксис {#syntax-4}

```sql title="Синтаксис"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Если предложение `FROM` не указано, запрос возвращает список словарей из текущей базы данных.

Те же результаты, что и при выполнении запроса `SHOW DICTIONARIES`, можно получить следующим образом:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Примеры {#examples-3}

Следующий запрос выбирает первые две строки из списка словарей в базе данных `system`, имена которых содержат `reg`.

```sql title="Запрос"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Результат"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```


## SHOW INDEX {#show-index}

Отображает список первичных индексов и индексов пропуска данных таблицы.

Этот оператор существует в основном для совместимости с MySQL. Системные таблицы [`system.tables`](../../operations/system-tables/tables.md) (для
первичных ключей) и [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (для индексов пропуска данных)
предоставляют эквивалентную информацию в более привычном для ClickHouse формате.

### Синтаксис {#syntax-5}

```sql title="Синтаксис"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Имя базы данных и таблицы можно указать в сокращенной форме как `<db>.<table>`, т. е. `FROM tab FROM db` и `FROM db.tab`
эквивалентны. Если база данных не указана, запрос использует текущую базу данных.

Необязательное ключевое слово `EXTENDED` в настоящее время не имеет эффекта и существует для совместимости с MySQL.

Оператор возвращает результирующую таблицу со следующей структурой:

| Столбец         | Описание                                                                                                                 | Тип                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `table`         | Имя таблицы.                                                                                                             | `String`           |
| `non_unique`    | Всегда `1`, так как ClickHouse не поддерживает ограничения уникальности.                                                 | `UInt8`            |
| `key_name`      | Имя индекса, `PRIMARY`, если индекс является индексом первичного ключа.                                                  | `String`           |
| `seq_in_index`  | Для индекса первичного ключа — позиция столбца, начиная с `1`. Для индекса пропуска данных — всегда `1`.                | `UInt8`            |
| `column_name`   | Для индекса первичного ключа — имя столбца. Для индекса пропуска данных — `''` (пустая строка), см. поле "expression".  | `String`           |
| `collation`     | Сортировка столбца в индексе: `A` для возрастающей, `D` для убывающей, `NULL`, если не отсортирован.                    | `Nullable(String)` |
| `cardinality`   | Оценка кардинальности индекса (количество уникальных значений в индексе). В настоящее время всегда 0.                   | `UInt64`           |
| `sub_part`      | Всегда `NULL`, так как ClickHouse не поддерживает префиксы индексов, как MySQL.                                         | `Nullable(String)` |
| `packed`        | Всегда `NULL`, так как ClickHouse не поддерживает упакованные индексы (как MySQL).                                       | `Nullable(String)` |
| `null`          | В настоящее время не используется                                                                                        |                    |
| `index_type`    | Тип индекса, например `PRIMARY`, `MINMAX`, `BLOOM_FILTER` и т. д.                                                       | `String`           |
| `comment`       | Дополнительная информация об индексе, в настоящее время всегда `''` (пустая строка).                                    | `String`           |
| `index_comment` | `''` (пустая строка), так как индексы в ClickHouse не могут иметь поле `COMMENT` (как в MySQL).                          | `String`           |
| `visible`       | Видимость индекса для оптимизатора, всегда `YES`.                                                                        | `String`           |
| `expression`    | Для индекса пропуска данных — выражение индекса. Для индекса первичного ключа — `''` (пустая строка).                   | `String`           |

### Примеры {#examples-4}

В этом примере используется оператор `SHOW INDEX` для получения информации обо всех индексах в таблице 'tbl'

```sql title="Запрос"
SHOW INDEX FROM 'tbl'
```


```text title="Ответ"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
│ tbl   │          1 │ mm1_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ a, c, d    │
│ tbl   │          1 │ mm2_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ c, d, e    │
│ tbl   │          1 │ PRIMARY  │ 1            │ c           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ PRIMARY  │ 2            │ a           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ set_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ SET          │         │               │ YES     │ e          │
└───────┴────────────┴──────────┴──────────────┴─────────────┴───────────┴─────────────┴──────────┴────────┴──────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
```

### См. также {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)


## SHOW PROCESSLIST {#show-processlist}

Выводит содержимое таблицы [`system.processes`](/operations/system-tables/processes), которая содержит список запросов, выполняющихся в данный момент, за исключением самих запросов `SHOW PROCESSLIST`.

### Синтаксис {#syntax-6}

```sql title="Синтаксис"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

Запрос `SELECT * FROM system.processes` возвращает данные обо всех выполняющихся запросах.

:::tip
Выполните в консоли:

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```

:::


## SHOW GRANTS {#show-grants}

Оператор `SHOW GRANTS` отображает привилегии пользователя.

### Синтаксис {#syntax-7}

```sql title="Синтаксис"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

Если пользователь не указан, запрос возвращает привилегии текущего пользователя.

Модификатор `WITH IMPLICIT` позволяет отображать неявные привилегии (например, `GRANT SELECT ON system.one`).

Модификатор `FINAL` объединяет все привилегии пользователя и его назначенных ролей (с наследованием).


## SHOW CREATE USER {#show-create-user}

Оператор `SHOW CREATE USER` показывает параметры, которые использовались при [создании пользователя](../../sql-reference/statements/create/user.md).

### Синтаксис {#syntax-8}

```sql title="Синтаксис"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```


## SHOW CREATE ROLE {#show-create-role}

Оператор `SHOW CREATE ROLE` показывает параметры, которые использовались при [создании роли](../../sql-reference/statements/create/role.md).

### Синтаксис {#syntax-9}

```sql title="Синтаксис"
SHOW CREATE ROLE name1 [, name2 ...]
```


## SHOW CREATE ROW POLICY {#show-create-row-policy}

Оператор `SHOW CREATE ROW POLICY` показывает параметры, которые использовались при [создании политики доступа к строкам](../../sql-reference/statements/create/row-policy.md).

### Синтаксис {#syntax-10}

```sql title="Синтаксис"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```


## SHOW CREATE QUOTA {#show-create-quota}

Инструкция `SHOW CREATE QUOTA` показывает параметры, которые использовались при [создании квоты](../../sql-reference/statements/create/quota.md).

### Синтаксис {#syntax-11}

```sql title="Синтаксис"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```


## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

Оператор `SHOW CREATE SETTINGS PROFILE` показывает параметры, которые использовались при [создании профиля настроек](../../sql-reference/statements/create/settings-profile.md).

### Синтаксис {#syntax-12}

```sql title="Синтаксис"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```


## SHOW USERS {#show-users}

Оператор `SHOW USERS` возвращает список имён [учётных записей пользователей](../../guides/sre/user-management/index.md#user-account-management).
Для просмотра параметров учётных записей пользователей обратитесь к системной таблице [`system.users`](/operations/system-tables/users).

### Синтаксис {#syntax-13}

```sql title="Синтаксис"
SHOW USERS
```


## SHOW ROLES {#show-roles}

Оператор `SHOW ROLES` возвращает список [ролей](../../guides/sre/user-management/index.md#role-management).
Для просмотра других параметров см. системные таблицы [`system.roles`](/operations/system-tables/roles) и [`system.role_grants`](/operations/system-tables/role_grants).

### Синтаксис {#syntax-14}


```sql title="Синтаксис"
SHOW [CURRENT|ENABLED] ROLES
```

## SHOW PROFILES {#show-profiles}

Оператор `SHOW PROFILES` возвращает список [профилей настроек](../../guides/sre/user-management/index.md#settings-profiles-management).
Для просмотра параметров учётных записей пользователей обратитесь к системной таблице [`settings_profiles`](/operations/system-tables/settings_profiles).

### Синтаксис {#syntax-15}

```sql title="Синтаксис"
SHOW [SETTINGS] PROFILES
```


## SHOW POLICIES {#show-policies}

Оператор `SHOW POLICIES` возвращает список [политик доступа к строкам](../../guides/sre/user-management/index.md#row-policy-management) для указанной таблицы.
Для просмотра параметров учётных записей пользователей см. системную таблицу [`system.row_policies`](/operations/system-tables/row_policies).

### Синтаксис {#syntax-16}

```sql title="Синтаксис"
SHOW [ROW] POLICIES [ON [db.]table]
```


## SHOW QUOTAS {#show-quotas}

Оператор `SHOW QUOTAS` возвращает список [квот](../../guides/sre/user-management/index.md#quotas-management).
Для просмотра параметров квот обратитесь к системной таблице [`system.quotas`](/operations/system-tables/quotas).

### Синтаксис {#syntax-17}

```sql title="Синтаксис"
SHOW QUOTAS
```


## SHOW QUOTA {#show-quota}

Оператор `SHOW QUOTA` возвращает информацию о потреблении [квоты](../../operations/quotas.md) для всех пользователей или для текущего пользователя.
Для просмотра других параметров см. системные таблицы [`system.quotas_usage`](/operations/system-tables/quotas_usage) и [`system.quota_usage`](/operations/system-tables/quota_usage).

### Синтаксис {#syntax-18}


```sql title="Синтаксис"
SHOW [CURRENT] QUOTA
```

## SHOW ACCESS {#show-access}

Оператор `SHOW ACCESS` показывает всех [пользователей](../../guides/sre/user-management/index.md#user-account-management), [роли](../../guides/sre/user-management/index.md#role-management), [профили](../../guides/sre/user-management/index.md#settings-profiles-management) и т. д., а также все их [привилегии](../../sql-reference/statements/grant.md#privileges).

### Синтаксис {#syntax-19}

```sql title="Синтаксис"
SHOW ACCESS
```


## SHOW CLUSTER(S) {#show-clusters}

Оператор `SHOW CLUSTER(S)` возвращает список кластеров.
Все доступные кластеры перечислены в таблице [`system.clusters`](../../operations/system-tables/clusters.md).

:::note
Запрос `SHOW CLUSTER name` выводит столбцы `cluster`, `shard_num`, `replica_num`, `host_name`, `host_address` и `port` из таблицы `system.clusters` для указанного имени кластера.
:::

### Синтаксис {#syntax-20}

```sql title="Синтаксис"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### Примеры {#examples-5}

```sql title="Запрос"
SHOW CLUSTERS;
```

```text title="Ответ"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="Запрос"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="Ответ"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="Запрос"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="Ответ"
Row 1:
──────
cluster:                 test_shard_localhost
shard_num:               1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
```


## SHOW SETTINGS {#show-settings}

Оператор `SHOW SETTINGS` возвращает список системных настроек и их значений.
Он выбирает данные из таблицы [`system.settings`](../../operations/system-tables/settings.md).

### Синтаксис {#syntax-21}

```sql title="Синтаксис"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### Условия {#clauses}

`LIKE|ILIKE` позволяют указать шаблон соответствия для имени настройки. Он может содержать подстановочные символы, такие как `%` или `_`. Условие `LIKE` чувствительно к регистру, `ILIKE` — нечувствительно.

При использовании условия `CHANGED` запрос возвращает только настройки, отличающиеся от значений по умолчанию.

### Примеры {#examples-6}

Запрос с условием `LIKE`:

```sql title="Запрос"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Ответ"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

Запрос с условием `ILIKE`:

```sql title="Запрос"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="Ответ"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

Запрос с условием `CHANGED`:

```sql title="Запрос"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Ответ"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```


## SHOW SETTING {#show-setting}

Оператор `SHOW SETTING` выводит значение указанной настройки.

### Синтаксис {#syntax-22}

```sql title="Синтаксис"
SHOW SETTING <name>
```

### См. также {#see-also-4}

- таблица [`system.settings`](../../operations/system-tables/settings.md)


## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### Примеры {#examples-7}

```sql title="Запрос"
SHOW FILESYSTEM CACHES
```

```text title="Результат"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### См. также {#see-also-5}

- Таблица [`system.settings`](../../operations/system-tables/settings.md)


## SHOW ENGINES {#show-engines}

Оператор `SHOW ENGINES` выводит содержимое таблицы [`system.table_engines`](../../operations/system-tables/table_engines.md),
которая содержит описание движков таблиц, поддерживаемых сервером, и информацию о поддерживаемых ими функциях.

### Синтаксис {#syntax-23}

```sql title="Синтаксис"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### См. также {#see-also-6}

- таблица [system.table_engines](../../operations/system-tables/table_engines.md)


## SHOW FUNCTIONS {#show-functions}

Оператор `SHOW FUNCTIONS` выводит содержимое таблицы [`system.functions`](../../operations/system-tables/functions.md).

### Синтаксис {#syntax-24}

```sql title="Синтаксис"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

Если указано условие `LIKE` или `ILIKE`, запрос возвращает список системных функций, имена которых соответствуют указанному шаблону `<pattern>`.

### См. также {#see-also-7}

- таблица [`system.functions`](../../operations/system-tables/functions.md)


## SHOW MERGES {#show-merges}

Оператор `SHOW MERGES` возвращает список слияний.
Все слияния перечислены в таблице [`system.merges`](../../operations/system-tables/merges.md):

| Column              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `table`             | Имя таблицы.                                                |
| `database`          | Имя базы данных, в которой находится таблица.                  |
| `estimate_complete` | Расчётное время до завершения (в секундах).               |
| `elapsed`           | Время, прошедшее с момента начала слияния (в секундах).     |
| `progress`          | Процент выполненной работы (0-100 процентов).          |
| `is_mutation`       | 1, если этот процесс является мутацией части.                      |
| `size_compressed`   | Общий размер сжатых данных объединяемых частей. |
| `memory_usage`      | Потребление памяти процессом слияния.                   |

### Синтаксис {#syntax-25}

```sql title="Синтаксис"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### Примеры {#examples-8}

```sql title="Запрос"
SHOW MERGES;
```

```text title="Результат"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="Запрос"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="Результат"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
