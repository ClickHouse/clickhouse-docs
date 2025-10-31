---
slug: '/sql-reference/statements/show'
sidebar_label: SHOW
sidebar_position: 37
description: 'Показать документацию'
title: 'Инструкции SHOW'
doc_type: reference
---
:::note

`SHOW CREATE (TABLE|DATABASE|USER)` скрывает секреты, если не включены следующие настройки:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (настройка сервера)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (настройка формата)  

Кроме того, у пользователя должно быть привилегия [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect).
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

Эти команды возвращают один столбец типа String, содержащий запрос `CREATE`, использованный для создания указанного объекта.

### Синтаксис {#syntax}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
Если вы используете эту команду для получения запроса `CREATE` системных таблиц, 
вы получите *фейковый* запрос, который лишь объявляет структуру таблицы, 
но не может быть использован для создания таблицы.
:::

## SHOW DATABASES {#show-databases}

Эта команда выводит список всех баз данных.

### Синтаксис {#syntax-1}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

Он идентичен запросу:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### Примеры {#examples}

В этом примере мы используем `SHOW`, чтобы получить имена баз данных, содержащие символную последовательность 'de' в своих именах:

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

Мы также можем сделать это без учета регистра:

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

Или получить имена баз данных, которые не содержат 'de' в своих именах:

```sql title="Query"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

Наконец, мы можем получить имена только первых двух баз данных:

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### См. также {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

Команда `SHOW TABLES` отображает список таблиц.

### Синтаксис {#syntax-2}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Если предложение `FROM` не указано, запрос возвращает список таблиц из текущей базы данных.

Эта команда идентична запросу:

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Примеры {#examples-1}

В этом примере мы используем команду `SHOW TABLES`, чтобы найти все таблицы, содержащие 'user' в их именах:

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

Мы также можем сделать это без учета регистра:

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

Или найти таблицы, в именах которых нет буквы 's':

```sql title="Query"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="Response"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

Наконец, мы можем получить имена только первых двух таблиц:

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### См. также {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

Команда `SHOW COLUMNS` отображает список столбцов.

### Синтаксис {#syntax-3}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

Имя базы данных и таблицы можно указать в сокращенной форме как `<db>.<table>`, 
что означает, что `FROM tab FROM db` и `FROM db.tab` эквивалентны. 
Если база данных не указана, запрос возвращает список столбцов из текущей базы данных.

Также есть два необязательных ключевых слова: `EXTENDED` и `FULL`. Ключевое слово `EXTENDED` в настоящее время не имеет эффекта
и существует для совместимости с MySQL. Ключевое слово `FULL` заставляет вывод включать колляцию, комментарий и столбцы привилегий.

Команда `SHOW COLUMNS` производит таблицу результата со следующей структурой:

| Column      | Description                                                                                                                   | Type               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | Имя столбца                                                                                                                 | `String`           |
| `type`      | Тип данных столбца. Если запрос был сделан через протокол MySQL, то показывается соответствующее имя типа в MySQL.         | `String`           |
| `null`      | `YES`, если тип данных столбца допускает NULL, `NO` в противном случае                                                      | `String`           |
| `key`       | `PRI`, если столбец является частью первичного ключа, `SOR`, если столбец является частью ключа сортировки, в противном случае пусто | `String`           |
| `default`   | Стандартное выражение столбца, если он типа `ALIAS`, `DEFAULT` или `MATERIALIZED`, в противном случае `NULL`.             | `Nullable(String)` |
| `extra`     | Дополнительная информация, в настоящее время не используется                                                                  | `String`           |
| `collation` | (только если было указано ключевое слово `FULL`) Колляция столбца, всегда `NULL`, потому что ClickHouse не поддерживает колляции по столбцам | `Nullable(String)` |
| `comment`   | (только если было указано ключевое слово `FULL`) Комментарий к столбцу                                                       | `String`           |
| `privilege` | (только если было указано ключевое слово `FULL`) Привилегия, которую вы имеете на этот столбец, в настоящее время недоступна | `String`           |

### Примеры {#examples-2}

В этом примере мы используем команду `SHOW COLUMNS`, чтобы получить информацию о всех столбцах в таблице 'orders',
начинающихся с 'delivery_':

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### См. также {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

Команда `SHOW DICTIONARIES` отображает список [Словарей](../../sql-reference/dictionaries/index.md).

### Синтаксис {#syntax-4}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Если предложение `FROM` не указано, запрос возвращает список словарей из текущей базы данных.

Вы можете получить такие же результаты, как запрос `SHOW DICTIONARIES`, следующими способами:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Примеры {#examples-3}

Следующий запрос выбирает первые две строки из списка таблиц в базе данных `system`, имена которых содержат `reg`.

```sql title="Query"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Response"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

Отображает список первичных и индексов пропусков данных таблицы.

Эта команда в основном существует для совместимости с MySQL. Системные таблицы [`system.tables`](../../operations/system-tables/tables.md) (для
первичных ключей) и [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (для индексов пропусков данных)
предоставляют эквивалентную информацию, но в более привычной для ClickHouse форме.

### Синтаксис {#syntax-5}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Имя базы данных и таблицы можно указать в сокращенной форме как `<db>.<table>`, т.е. `FROM tab FROM db` и `FROM db.tab` являются
эквивалентными. Если база данных не указана, запрос считает текущую базу данных как базу данных.

Необязательное ключевое слово `EXTENDED` в настоящее время не имеет эффекта и существует для совместимости с MySQL.

Команда производит таблицу результата со следующей структурой:

| Column          | Description                                                                                                              | Type               |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | Имя таблицы.                                                                                                            | `String`           |
| `non_unique`    | Всегда `1`, поскольку ClickHouse не поддерживает ограничения уникальности.                                             | `UInt8`            |
| `key_name`      | Имя индекса, `PRIMARY`, если индекс является первичным.                                                                | `String`           |
| `seq_in_index`  | Для первичного индекса, позиция столбца, начиная с `1`. Для индекса пропуска данных: всегда `1`.                        | `UInt8`            |
| `column_name`   | Для первичного индекса, имя столбца. Для индекса пропуска данных: `''` (пустая строка), см. поле "expression".        | `String`           |
| `collation`     | Сортировка столбца в индексе: `A`, если по возрастанию, `D`, если по убыванию, `NULL`, если не отсортировано.       | `Nullable(String)` |
| `cardinality`   | Оценка кардинальности индекса (количество уникальных значений в индексе). В настоящее время всегда 0.                   | `UInt64`           |
| `sub_part`      | Всегда `NULL`, потому что ClickHouse не поддерживает префиксы индекса, как и MySQL.                                     | `Nullable(String)` |
| `packed`        | Всегда `NULL`, потому что ClickHouse не поддерживает упакованные индексы (как в MySQL).                                 | `Nullable(String)` |
| `null`          | В настоящее время не используется                                                                                       |                    |
| `index_type`    | Тип индекса, например, `PRIMARY`, `MINMAX`, `BLOOM_FILTER` и т.д.                                                       | `String`           |
| `comment`       | Дополнительная информация об индексе, в настоящее время всегда `''` (пустая строка).                                   | `String`           |
| `index_comment` | `''` (пустая строка), поскольку индексы в ClickHouse не могут иметь поле `COMMENT` (как в MySQL).                        | `String`           |
| `visible`       | Если индекс виден оптимизатору, всегда `YES`.                                                                          | `String`           |
| `expression`    | Для индекса пропуска данных выражение индекса. Для первичного индекса: `''` (пустая строка).                           | `String`           |

### Примеры {#examples-4}

В этом примере мы используем команду `SHOW INDEX`, чтобы получить информацию обо всех индексах в таблице 'tbl'

```sql title="Query"
SHOW INDEX FROM 'tbl'
```

```text title="Response"
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

Выводит содержимое таблицы [`system.processes`](/operations/system-tables/processes), которая содержит список запросов, обрабатываемых в данный момент, исключая запросы `SHOW PROCESSLIST`.

### Синтаксис {#syntax-6}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

Запрос `SELECT * FROM system.processes` возвращает данные о всех текущих запросах.

:::tip
Выполните в консоли:

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

Команда `SHOW GRANTS` показывает привилегии для пользователя.

### Синтаксис {#syntax-7}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

Если пользователь не указан, запрос возвращает привилегии для текущего пользователя.

Модификатор `WITH IMPLICIT` позволяет показать неявные права (например, `GRANT SELECT ON system.one`)

Модификатор `FINAL` объединяет все права от пользователя и его предоставленных ролей (с наследованием)

## SHOW CREATE USER {#show-create-user}

Команда `SHOW CREATE USER` показывает параметры, которые использовались при [создании пользователя](../../sql-reference/statements/create/user.md).

### Синтаксис {#syntax-8}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

Команда `SHOW CREATE ROLE` показывает параметры, которые использовались при [создании роли](../../sql-reference/statements/create/role.md).

### Синтаксис {#syntax-9}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

Команда `SHOW CREATE ROW POLICY` показывает параметры, которые использовались при [создании политик строк](../../sql-reference/statements/create/row-policy.md).

### Синтаксис {#syntax-10}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

Команда `SHOW CREATE QUOTA` показывает параметры, которые использовались при [создании квоты](../../sql-reference/statements/create/quota.md).

### Синтаксис {#syntax-11}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

Команда `SHOW CREATE SETTINGS PROFILE` показывает параметры, которые использовались при [создании профиля настроек](../../sql-reference/statements/create/settings-profile.md).

### Синтаксис {#syntax-12}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

Команда `SHOW USERS` возвращает список имен [учетных записей пользователей](../../guides/sre/user-management/index.md#user-account-management). 
Чтобы просмотреть параметры учетных записей пользователей, смотрите системную таблицу [`system.users`](/operations/system-tables/users).

### Синтаксис {#syntax-13}

```sql title="Syntax"
SHOW USERS
```

## SHOW ROLES {#show-roles}

Команда `SHOW ROLES` возвращает список [ролей](../../guides/sre/user-management/index.md#role-management). 
Чтобы просмотреть другие параметры, 
смотрите системные таблицы [`system.roles`](/operations/system-tables/roles) и [`system.role_grants`](/operations/system-tables/role_grants).

### Синтаксис {#syntax-14}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

Команда `SHOW PROFILES` возвращает список [профилей настроек](../../guides/sre/user-management/index.md#settings-profiles-management). 
Чтобы просмотреть параметры учетных записей пользователей, смотрите системную таблицу [`settings_profiles`](/operations/system-tables/settings_profiles).

### Синтаксис {#syntax-15}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

Команда `SHOW POLICIES` возвращает список [политик строк](../../guides/sre/user-management/index.md#row-policy-management) для указанной таблицы. 
Чтобы просмотреть параметры учетных записей пользователей, смотрите системную таблицу [`system.row_policies`](/operations/system-tables/row_policies).

### Синтаксис {#syntax-16}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

Команда `SHOW QUOTAS` возвращает список [квот](../../guides/sre/user-management/index.md#quotas-management). 
Чтобы просмотреть параметры квот, смотрите системную таблицу [`system.quotas`](/operations/system-tables/quotas).

### Синтаксис {#syntax-17}

```sql title="Syntax"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

Команда `SHOW QUOTA` возвращает данные о [потреблении квоты](../../operations/quotas.md) для всех пользователей или для текущего пользователя. 
Чтобы просмотреть другие параметры, смотрите системные таблицы [`system.quotas_usage`](/operations/system-tables/quotas_usage) и [`system.quota_usage`](/operations/system-tables/quota_usage).

### Синтаксис {#syntax-18}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

Команда `SHOW ACCESS` показывает всех [пользователей](../../guides/sre/user-management/index.md#user-account-management), [роли](../../guides/sre/user-management/index.md#role-management), [профили](../../guides/sre/user-management/index.md#settings-profiles-management) и т.д. и все их [привилегии](../../sql-reference/statements/grant.md#privileges).

### Синтаксис {#syntax-19}

```sql title="Syntax"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

Команда `SHOW CLUSTER(S)` возвращает список кластеров. 
Все доступные кластеры перечислены в таблице [`system.clusters`](../../operations/system-tables/clusters.md).

:::note
Запрос `SHOW CLUSTER name` отображает `cluster`, `shard_num`, `replica_num`, `host_name`, `host_address` и `port` таблицы `system.clusters` для указанного имени кластера.
:::

### Синтаксис {#syntax-20}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### Примеры {#examples-5}

```sql title="Query"
SHOW CLUSTERS;
```

```text title="Response"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="Query"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="Response"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="Query"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="Response"
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

Команда `SHOW SETTINGS` возвращает список системных настроек и их значений. 
Она выбирает данные из таблицы [`system.settings`](../../operations/system-tables/settings.md).

### Синтаксис {#syntax-21}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### Предложения {#clauses}

`LIKE|ILIKE` позволяют указать шаблон сопоставления для имени настройки. Он может содержать символы подстановки, такие как `%` или `_`. Предложение `LIKE` чувствительно к регистру, `ILIKE` — нечувствительно к регистру.

Когда используется предложение `CHANGED`, запрос возвращает только настройки, измененные от их значений по умолчанию.

### Примеры {#examples-6}

Запрос с предложением `LIKE`:

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

Запрос с предложением `ILIKE`:

```sql title="Query"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="Response"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

Запрос с предложением `CHANGED`:

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

Команда `SHOW SETTING` выводит значение настройки для указанного имени настройки.

### Синтаксис {#syntax-22}

```sql title="Syntax"
SHOW SETTING <name>
```

### См. также {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) таблица

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### Примеры {#examples-7}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### См. также {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) таблица

## SHOW ENGINES {#show-engines}

Команда `SHOW ENGINES` выводит содержимое таблицы [`system.table_engines`](../../operations/system-tables/table_engines.md), 
которая содержит описание поддерживаемых движков таблиц и информацию об их поддержке функций.

### Синтаксис {#syntax-23}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### См. также {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) таблица

## SHOW FUNCTIONS {#show-functions}

Команда `SHOW FUNCTIONS` выводит содержимое таблицы [`system.functions`](../../operations/system-tables/functions.md).

### Синтаксис {#syntax-24}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

Если указано любое из предложений `LIKE` или `ILIKE`, запрос возвращает список системных функций, названия которых соответствуют указанному `<pattern>`.

### См. также {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) таблица

## SHOW MERGES {#show-merges}

Команда `SHOW MERGES` возвращает список слияний. 
Все слияния перечислены в таблице [`system.merges`](../../operations/system-tables/merges.md):

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| `table`             | Имя таблицы.                                              |
| `database`          | Имя базы данных, в которой находится таблица.            |
| `estimate_complete` | Оценочное время завершения (в секундах).                 |
| `elapsed`           | Время, прошедшее (в секундах) с начала слияния.         |
| `progress`          | Процент выполненной работы (0-100 процентов).            |
| `is_mutation`       | 1, если этот процесс является частью мутации.            |
| `size_compressed`   | Общий размер сжатых данных объединенных частей.           |
| `memory_usage`      | Потребление памяти процессом слияния.                     |

### Синтаксис {#syntax-25}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### Примеры {#examples-8}

```sql title="Query"
SHOW MERGES;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="Query"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```