---
description: 'Документация для SHOW'
sidebar_label: 'SHOW'
sidebar_position: 37
slug: /sql-reference/statements/show
title: 'Операторы SHOW'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` скрывает секреты, если не включены следующие настройки:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (настройка сервера)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (настройка формата)  

Дополнительно пользователь должен иметь привилегию [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect).
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

Эти команды возвращают один столбец типа String, 
содержащий запрос `CREATE`, использованный для создания указанного объекта.

### Синтаксис {#syntax}

```sql title="Синтаксис"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
Если вы используете эту команду для получения запроса `CREATE` системных таблиц,
вы получите *поддельный* запрос, который только объявляет структуру таблицы,
но не может быть использован для создания таблицы.
:::

## SHOW DATABASES {#show-databases}

Эта команда выводит список всех баз данных.

### Синтаксис {#syntax-1}

```sql title="Синтаксис"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

Она идентична запросу:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### Примеры {#examples}

В этом примере мы используем `SHOW`, чтобы получить имена баз данных, содержащие последовательность символов 'de' в их именах:

```sql title="Запрос"
SHOW DATABASES LIKE '%de%'
```

```text title="Ответ"
┌─name────┐
│ default │
└─────────┘
```

Мы также можем сделать это нечувствительным к регистру:

```sql title="Запрос"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Ответ"
┌─name────┐
│ default │
└─────────┘
```

Или получить имена баз данных, которые не содержат 'de' в своих именах:

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

Наконец, мы можем получить имена только первых двух баз данных:

```sql title="Запрос"
SHOW DATABASES LIMIT 2
```

```text title="Ответ"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### Смотрите также {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

Команда `SHOW TABLES` отображает список таблиц.

### Синтаксис {#syntax-2}

```sql title="Синтаксис"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Если clause `FROM` не указан, запрос возвращает список таблиц из текущей базы данных.

Эта команда идентична запросу:

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Примеры {#examples-1}

В этом примере мы используем команду `SHOW TABLES`, чтобы найти все таблицы, содержащие 'user' в их именах:

```sql title="Запрос"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Ответ"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

Мы также можем сделать это нечувствительным к регистру:

```sql title="Запрос"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Ответ"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

Или найти таблицы, которые не содержат буквы 's' в их именах:

```sql title="Запрос"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="Ответ"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

Наконец, мы можем получить имена только первых двух таблиц:

```sql title="Запрос"
SHOW TABLES FROM system LIMIT 2
```

```text title="Ответ"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### Смотрите также {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

Команда `SHOW COLUMNS` отображает список столбцов.

### Синтаксис {#syntax-3}

```sql title="Синтаксис"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Имя базы данных и таблицы может быть указано в сокращенной форме как `<db>.<table>`, 
что означает, что `FROM tab FROM db` и `FROM db.tab` эквивалентны. 
Если база данных не указана, запрос возвращает список столбцов из текущей базы данных.

Также есть два необязательных ключевых слова: `EXTENDED` и `FULL`. Ключевое слово `EXTENDED` в настоящее время не имеет эффекта
и существует для совместимости с MySQL. Ключевое слово `FULL` заставляет вывод включать коллецию, комментарий и столбцы привилегий.

Команда `SHOW COLUMNS` создает таблицу результатов со следующей структурой:

| Столбец     | Описание                                                                                                                   | Тип               |
|-------------|---------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | Имя столбца                                                                                                              | `String`           |
| `type`      | Тип данных столбца. Если запрос был выполнен через протокол проводного соединения MySQL, будет показано эквивалентное имя типа в MySQL. | `String`           |
| `null`      | `YES`, если тип данных столбца допускает значение NULL, иначе `NO`                                                         | `String`           |
| `key`       | `PRI`, если столбец является частью первичного ключа, `SOR`, если столбец является частью ключа сортировки, пусто в противном случае | `String`           |
| `default`   | Значение по умолчанию столбца, если он имеет тип `ALIAS`, `DEFAULT` или `MATERIALIZED`, иначе `NULL`.                    | `Nullable(String)` |
| `extra`     | Дополнительная информация, в настоящее время не используется                                                                                      | `String`           |
| `collation` | (только если указано ключевое слово `FULL`) Колляция столбца, всегда `NULL`, потому что ClickHouse не имеет колляций на уровне столбцов | `Nullable(String)` |
| `comment`   | (только если указано ключевое слово `FULL`) Комментарий к столбцу                                                           | `String`           |
| `privilege` | (только если указано ключевое слово `FULL`) Привилегия, которую вы имеете над этим столбцом, в настоящее время недоступна                         | `String`           |

### Примеры {#examples-2}

В этом примере мы используем команду `SHOW COLUMNS`, чтобы получить информацию обо всех столбцах в таблице 'orders',
начиная с 'delivery_':

```sql title="Запрос"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Ответ"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### Смотрите также {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

Команда `SHOW DICTIONARIES` отображает список [Словарей](../../sql-reference/dictionaries/index.md).

### Синтаксис {#syntax-4}

```sql title="Синтаксис"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Если clause `FROM` не указан, запрос возвращает список словарей из текущей базы данных.

Вы можете получить те же результаты, что и запрос `SHOW DICTIONARIES`, следующим образом:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Примеры {#examples-3}

Следующий запрос извлекает первые две строки из списка таблиц в базе данных `system`, имена которых содержат `reg`.

```sql title="Запрос"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Ответ"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

Выводит список первичных и индексов пропуска данных таблицы.

Эта команда в основном существует для совместимости с MySQL. Системные таблицы [`system.tables`](../../operations/system-tables/tables.md) (для
первичных ключей) и [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (для индексов пропуска данных)
предоставляют эквивалентную информацию, но более привычным для ClickHouse способом.

### Синтаксис {#syntax-5}

```sql title="Синтаксис"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

Имя базы данных и таблицы может быть указано в сокращенной форме как `<db>.<table>`, т.е. `FROM tab FROM db` и `FROM db.tab` эквивалентны. Если база данных не указана, запрос предполагает текущее значение базы данных.

Необязательное ключевое слово `EXTENDED` в настоящее время не имеет эффекта и существует для совместимости с MySQL.

Запрос создает таблицу результата со следующей структурой:

| Столбец         | Описание                                                                                                             | Тип               |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | Имя таблицы.                                                                                                   | `String`           |
| `non_unique`    | Всегда `1`, так как ClickHouse не поддерживает ограничения уникальности.                                                        | `UInt8`            |
| `key_name`      | Имя индекса, `PRIMARY`, если индекс является первичным ключом.                                                    | `String`           |
| `seq_in_index`  | Для индекса первичного ключа — позиция столбца, начиная с `1`. Для индекса пропуска данных: всегда `1`.            | `UInt8`            |
| `column_name`   | Для индекса первичного ключа — имя столбца. Для индекса пропуска данных: `''` (пустая строка), см. поле "expression". | `String`           |
| `collation`     | Сортировка столбца в индексе: `A` если по возрастанию, `D` если по убыванию, `NULL` если не отсортирован.                         | `Nullable(String)` |
| `cardinality`   | Оценка кардинальности индекса (число уникальных значений в индексе). В настоящее время всегда 0.                       | `UInt64`           |
| `sub_part`      | Всегда `NULL`, потому что ClickHouse не поддерживает префиксы индексов, как MySQL.                                             | `Nullable(String)` |
| `packed`        | Всегда `NULL`, потому что ClickHouse не поддерживает упакованные индексы (как MySQL).                                           | `Nullable(String)` |
| `null`          | В настоящее время не используется                                                                                                         |                    |
| `index_type`    | Тип индекса, например, `PRIMARY`, `MINMAX`, `BLOOM_FILTER` и т.д.                                                            | `String`           |
| `comment`       | Дополнительная информация об индексе, в настоящее время всегда `''` (пустая строка).                                            | `String`           |
| `index_comment` | `''` (пустая строка), потому что индексы в ClickHouse не могут иметь поле `COMMENT` (как в MySQL).                         | `String`           |
| `visible`       | Если индекс виден оптимизатору, всегда `YES`.                                                                  | `String`           |
| `expression`    | Для индекса пропуска данных — выражение индекса. Для индекса первичного ключа: `''` (пустая строка).                           | `String`           |

### Примеры {#examples-4}

В этом примере мы используем команду `SHOW INDEX`, чтобы получить информацию обо всех индексах в таблице 'tbl'.

```sql title="Запрос"
SHOW INDEX FROM 'tbl'
```

```text title="Ответ"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
│ tbl   │          1 │ mm1_idx  │ 1            │ 1           │ ᴺᵁᴸᴷ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ a, c, d    │
│ tbl   │          1 │ mm2_idx  │ 1            │ 1           │ ᴺᵁᴸᴷ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ c, d, e    │
│ tbl   │          1 │ PRIMARY  │ 1            │ c           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ PRIMARY  │ 2            │ a           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ set_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ SET          │         │               │ YES     │ e          │
└───────┴────────────┴──────────┴──────────────┴─────────────┴───────────┴─────────────┴──────────┴────────┴──────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
```

### Смотрите также {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST {#show-processlist}

Выводит содержимое таблицы [`system.processes`](/operations/system-tables/processes), которая содержит список запросов, которые обрабатываются в данный момент, исключая `SHOW PROCESSLIST` запросы.

### Синтаксис {#syntax-6}

```sql title="Синтаксис"
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

```sql title="Синтаксис"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

Если пользователь не указан, запрос возвращает привилегии для текущего пользователя.

Модификатор `WITH IMPLICIT` позволяет показать неявные гранты (например, `GRANT SELECT ON system.one`)

Модификатор `FINAL` объединяет все гранты от пользователя и его предоставленных ролей (с наследованием)

## SHOW CREATE USER {#show-create-user}

Команда `SHOW CREATE USER` показывает параметры, которые использовались при [создании пользователя](../../sql-reference/statements/create/user.md).

### Синтаксис {#syntax-8}

```sql title="Синтаксис"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

Команда `SHOW CREATE ROLE` показывает параметры, которые использовались при [создании роли](../../sql-reference/statements/create/role.md).

### Синтаксис {#syntax-9}

```sql title="Синтаксис"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

Команда `SHOW CREATE ROW POLICY` показывает параметры, которые использовались при [создании политики строк](../../sql-reference/statements/create/row-policy.md).

### Синтаксис {#syntax-10}

```sql title="Синтаксис"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

Команда `SHOW CREATE QUOTA` показывает параметры, которые использовались при [создании квоты](../../sql-reference/statements/create/quota.md).

### Синтаксис {#syntax-11}

```sql title="Синтаксис"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

Команда `SHOW CREATE SETTINGS PROFILE` показывает параметры, которые использовались при [создании профиля настроек](../../sql-reference/statements/create/settings-profile.md).

### Синтаксис {#syntax-12}

```sql title="Синтаксис"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

Команда `SHOW USERS` возвращает список имен [учетных записей пользователей](../../guides/sre/user-management/index.md#user-account-management). 
Чтобы просмотреть параметры учетных записей пользователей, смотрите системную таблицу [`system.users`](/operations/system-tables/users).

### Синтаксис {#syntax-13}

```sql title="Синтаксис"
SHOW USERS
```

## SHOW ROLES {#show-roles}

Команда `SHOW ROLES` возвращает список [ролей](../../guides/sre/user-management/index.md#role-management). 
Чтобы просмотреть другие параметры, 
смотрите системные таблицы [`system.roles`](/operations/system-tables/roles) и [`system.role_grants`](/operations/system-tables/role-grants).

### Синтаксис {#syntax-14}

```sql title="Синтаксис"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

Команда `SHOW PROFILES` возвращает список [профилей настроек](../../guides/sre/user-management/index.md#settings-profiles-management). 
Чтобы просмотреть параметры учетных записей пользователей, смотрите системную таблицу [`settings_profiles`](/operations/system-tables/settings_profiles).

### Синтаксис {#syntax-15}

```sql title="Синтаксис"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

Команда `SHOW POLICIES` возвращает список [политик строк](../../guides/sre/user-management/index.md#row-policy-management) для указанной таблицы. 
Чтобы просмотреть параметры учетных записей пользователей, смотрите системную таблицу [`system.row_policies`](/operations/system-tables/row_policies).

### Синтаксис {#syntax-16}

```sql title="Синтаксис"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

Команда `SHOW QUOTAS` возвращает список [квот](../../guides/sre/user-management/index.md#quotas-management). 
Чтобы просмотреть параметры квот, смотрите системную таблицу [`system.quotas`](/operations/system-tables/quotas).

### Синтаксис {#syntax-17}

```sql title="Синтаксис"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

Команда `SHOW QUOTA` возвращает [потребление квоты](../../operations/quotas.md) для всех пользователей или для текущего пользователя. 
Чтобы просмотреть другие параметры, смотрите системные таблицы [`system.quotas_usage`](/operations/system-tables/quotas_usage) и [`system.quota_usage`](/operations/system-tables/quota_usage).

### Синтаксис {#syntax-18}

```sql title="Синтаксис"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

Команда `SHOW ACCESS` показывает всех [пользователей](../../guides/sre/user-management/index.md#user-account-management), [ролей](../../guides/sre/user-management/index.md#role-management), [профилей](../../guides/sre/user-management/index.md#settings-profiles-management) и т.д. и все их [гранты](../../sql-reference/statements/grant.md#privileges).

### Синтаксис {#syntax-19}

```sql title="Синтаксис"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

Команда `SHOW CLUSTER(S)` возвращает список кластеров. 
Все доступные кластеры перечислены в таблице [`system.clusters`](../../operations/system-tables/clusters.md).

:::note
Запрос `SHOW CLUSTER name` отображает содержимое таблицы `system.clusters` для указанного имени кластера.
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
shard_weight:            1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
is_local:                1
user:                    default
default_database:
errors_count:            0
estimated_recovery_time: 0
```

## SHOW SETTINGS {#show-settings}

Команда `SHOW SETTINGS` возвращает список системных настроек и их значений. 
Она выбирает данные из таблицы [`system.settings`](../../operations/system-tables/settings.md).

### Синтаксис {#syntax-21}

```sql title="Синтаксис"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### Оговорки {#clauses}

`LIKE|ILIKE` позволяют задать шаблон соответствия для имени настройки. Он может содержать шаблоны, такие как `%` или `_`. Условие `LIKE` чувствительно к регистру, `ILIKE` — нечувствительно.

Когда используется условие `CHANGED`, запрос возвращает только настройки, измененные по сравнению с их значениями по умолчанию.

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

Команда `SHOW SETTING` выводит значение настройки для указанного имени настройки.

### Смотрите также {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) таблица

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### Примеры {#examples-7}

```sql title="Запрос"
SHOW FILESYSTEM CACHES
```

```text title="Ответ"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### Смотрите также {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) таблица

## SHOW ENGINES {#show-engines}

Команда `SHOW ENGINES` выводит содержимое таблицы [`system.table_engines`](../../operations/system-tables/table_engines.md), 
которая содержит описание движков таблиц, поддерживаемых сервером, и информацию о поддерживаемых функциях.

### Синтаксис {#syntax-23}

```sql title="Синтаксис"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### Смотрите также {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) таблица

## SHOW FUNCTIONS {#show-functions}

Команда `SHOW FUNCTIONS` выводит содержимое таблицы [`system.functions`](../../operations/system-tables/functions.md).

### Синтаксис {#syntax-24}

```sql title="Синтаксис"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

Если указано условие `LIKE` или `ILIKE`, запрос возвращает список системных функций, имена которых соответствуют предоставленному `<pattern>`.

### Смотрите также {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) таблица

## SHOW MERGES {#show-merges}

Команда `SHOW MERGES` возвращает список слияний. 
Все слияния перечислены в таблице [`system.merges`](../../operations/system-tables/merges.md):

| Столбец              | Описание                                                |
|---------------------|------------------------------------------------------------|
| `table`             | Имя таблицы.                                                |
| `database`          | Имя базы данных, в которой находится таблица.                  |
| `estimate_complete` | Оценочное время завершения (в секундах).               |
| `elapsed`           | Время, прошедшее (в секундах) с момента начала слияния.     |
| `progress`          | Процент завершенной работы (0-100 процентов).          |
| `is_mutation`       | 1, если этот процесс является частью мутации.                      |
| `size_compressed`   | Общий размер сжатых данных объединенных частей. |
| `memory_usage`      | Использование памяти процесса слияния.                   |


### Синтаксис {#syntax-25}

```sql title="Синтаксис"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### Примеры {#examples-8}

```sql title="Запрос"
SHOW MERGES;
```

```text title="Ответ"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="Запрос"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="Ответ"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
