---
sidebar_label: 'Устранение неполадок и лучшие практики'
slug: /integrations/fivetran/troubleshooting
sidebar_position: 4
description: 'Распространённые ошибки, советы по отладке и лучшие практики для целевого хранилища ClickHouse в Fivetran.'
title: 'Устранение неполадок и лучшие практики'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'устранение неполадок', 'лучшие практики', 'отладка']
---

# Устранение неполадок &amp; лучшие практики \{#troubleshooting-best-practices\}

## Распространённые ошибки \{#common-errors\}

### Сбой при проверке привилегий или ошибки операций, связанные с разрешениями \{#grants-test-failed\}

**Сообщение об ошибке:**

```sh
Test grants failed, cause: user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**Причина:** У пользователя Fivetran нет необходимых привилегий. Для коннектора требуются привилегии `ALTER`, `CREATE DATABASE`, `CREATE TABLE`, `INSERT` и `SELECT` на `*.*` (все базы данных и таблицы).

:::note
При проверке привилегий запрашивается `system.grants`, и учитываются только привилегии, выданные непосредственно пользователю. Привилегии, назначенные через роль ClickHouse, не обнаруживаются. Подробнее см. в разделе [ролевые привилегии](/integrations/fivetran/troubleshooting#role-based-grants).
:::

**Решение:**

Предоставьте необходимые привилегии непосредственно пользователю Fivetran:

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

### Ошибка при ожидании завершения всех мутаций \{#mutations-not-completed\}

**Сообщение об ошибке:**

```sh
error while waiting for all mutations to be completed: ... initial cause: ...
```

**Причина:** Была отправлена mutation `ALTER TABLE ... UPDATE` или `ALTER TABLE ... DELETE`, но коннектор превысил время ожидания её завершения на всех репликах. Часть ошибки &quot;initial cause&quot; часто содержит исходную ошибку ClickHouse (обычно это код 341, &quot;Unfinished&quot;).

Это может произойти, когда:

* кластер ClickHouse Cloud находится под высокой нагрузкой;
* один или несколько узлов стали недоступны во время выполнения mutation.

**Решения:**

1. **Проверьте ход выполнения mutation**: Выполните следующий запрос, чтобы проверить наличие ожидающих мутаций:
   ```sql
   SELECT database, table, mutation_id, command, create_time, is_done
   FROM system.mutations
   WHERE NOT is_done
   ORDER BY create_time DESC;
   ```
2. **Проверьте состояние кластера**: Убедитесь, что все узлы работают нормально.
3. **Подождите и повторите попытку**: После восстановления нормального состояния кластера мутации в конечном итоге завершатся. Fivetran автоматически повторит синхронизацию.

### Ошибка несоответствия столбцов \{#column-mismatch-error\}

**Сообщение об ошибке:**

При несоответствии столбцов из-за изменения schema в источнике могут возникать различные ошибки. Например:

```sh
columns count in ClickHouse table (8) does not match the input file (6). Expected columns: id, name, ..., got: id, name, ...
```

Или:

```sh
column user_email was not found in the table definition. Table columns: ...; input file columns: ...
```

**Причина:** Столбцы в целевой таблице ClickHouse не совпадают со столбцами в синхронизируемых данных. Это может произойти в следующих случаях:

* В таблицу ClickHouse вручную добавили или из неё вручную удалили столбцы.
* Изменение schema в источнике не было корректно перенесено.

**Решения:**

1. **Не изменяйте вручную таблицы, управляемые Fivetran.** См. раздел [лучшие практики](/integrations/fivetran/troubleshooting#dont-modify-tables).
2. **Верните столбцу исходный тип**: Если вы знаете, какой тип должен быть у столбца, измените его обратно на ожидаемый, используя [соответствие преобразования типов](/integrations/fivetran/reference#type-mapping) в качестве справки.
3. **Повторно синхронизируйте таблицу**: В дашборде Fivetran запустите историческую повторную синхронизацию для затронутой таблицы.
4. **Удалите и создайте заново**: В качестве крайней меры удалите целевую таблицу и позвольте Fivetran заново создать её при следующей синхронизации.

### Слишком большой AST (code 168) \{#ast-too-big\}

**Сообщение об ошибке:**

```sh
code: 168, message: AST is too big. Maximum: 50000
```

или

```sh
code: 62, message: Max query size exceeded
```

**Причина:** Большие пакеты UPDATE или DELETE создают SQL-запросы с очень сложными абстрактными синтаксическими деревьями. Это часто происходит при работе с Wide-таблицами или при включенном режиме истории.

**Решение:**

Уменьшите значения `mutation_batch_size` и `hard_delete_batch_size` в файле [расширенной конфигурации](/integrations/fivetran/reference#advanced-configuration). Для обоих параметров значение по умолчанию — `1500`, допустимый диапазон — от `200` до `1500`.

***

### Превышение лимита памяти / OOM (код 241) \{#memory-limit-exceeded\}

**Сообщение об ошибке:**

```sh
code: 241, message: (total) memory limit exceeded: would use 14.01 GiB
```

**Причина:** Для операции INSERT требуется больше памяти, чем доступно. Обычно это происходит при крупных начальных синхронизациях, при работе с широкими таблицами или при параллельном выполнении пакетных операций.

**Решения:**

1. **Уменьшите `write_batch_size`**: Для больших таблиц попробуйте снизить значение до 50,000.
2. **Уменьшите нагрузку на базу данных**: Проверьте нагрузку на сервис ClickHouse Cloud, чтобы убедиться, что он не перегружен.
3. **Увеличьте ресурсы сервиса ClickHouse Cloud**, чтобы выделить больше памяти.

***

### Неожиданный EOF / ошибка подключения \{#unexpected-eof\}

**Сообщение об ошибке:**

```sh
ClickHouse connection error: unexpected EOF
```

Или `FAILURE_WITH_TASK` без трассировки стека в логах Fivetran.

**Причина:**

* Список доступа по IP не настроен для разрешения трафика Fivetran.
* Временные сетевые проблемы между Fivetran и ClickHouse Cloud.
* Повреждённые или недопустимые исходные данные приводят к сбою целевого коннектора.

**Решения:**

1. **Проверьте список доступа по IP**: в ClickHouse Cloud перейдите в **Settings &gt; Security** и добавьте [IP-адреса Fivetran](https://fivetran.com/docs/using-fivetran/ips) или разрешите доступ отовсюду.
2. **Повторите попытку**: последние версии коннектора автоматически выполняют повторную попытку при ошибках EOF. Редкие ошибки (1–2 в день), скорее всего, носят временный характер.
3. **Если проблема сохраняется**: откройте обращение в поддержку ClickHouse, указав временной интервал возникновения ошибки. Также попросите поддержку Fivetran проверить качество исходных данных.

***

### Не удаётся сопоставить тип UInt64 \{#uint64-type-error\}

**Сообщение об ошибке:**

```sh
cause: can't map type UInt64 to Fivetran types
```

**Причина:** Коннектор сопоставляет `LONG` с `Int64`, но не с `UInt64`. Эта ошибка возникает, если в таблице под управлением Fivetran вручную изменить тип столбца.

**Решения:**

1. **Не изменяйте типы столбцов вручную** в таблицах под управлением Fivetran.
2. **Чтобы устранить проблему**: верните столбцу ожидаемый тип (например, `Int64`) или удалите таблицу и повторно синхронизируйте её.
3. **Для пользовательских типов**: создайте [materialized view](/sql-reference/statements/create/view#materialized-view) поверх таблицы под управлением Fivetran.

***

### Для таблицы не задан первичный ключ \{#no-primary-keys\}

**Сообщение об ошибке:**

```sh
Failed to alter table ... cause: no primary keys for table
```

**Причина:** Для каждой таблицы ClickHouse требуется `ORDER BY`. Если у источника нет первичного ключа, Fivetran автоматически добавляет `_fivetran_id`. Эта ошибка возникает в редких случаях, когда в источнике определён первичный ключ, но в данных он отсутствует.

**Решения:**

1. **Обратитесь в службу поддержки Fivetran**, чтобы проверить пайплайн источника.
2. **Проверьте schema источника**: Убедитесь, что столбцы первичного ключа присутствуют в данных.

***

### Не удается назначить ролевые гранты \{#role-based-grants\}

**Сообщение об ошибке:**

```sh
user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**Причина:** Коннектор проверяет привилегии так:

```sql
SELECT access_type, database, table, column FROM system.grants WHERE user_name = 'my_user'
```

Это возвращает только прямые назначения привилегий. Привилегии, выданные через роль ClickHouse, имеют `user_name = NULL` и `role_name = 'my_role'`, поэтому эта проверка их не показывает.

**Решение:**

**Выдайте привилегии напрямую** пользователю Fivetran:

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

***

## Лучшие практики \{#best-practices\}

### Выделенный сервис ClickHouse для Fivetran \{#dedicated-service\}

При высокой нагрузке на ингестию рассмотрите возможность использования [разделения вычислительных ресурсов](/cloud/reference/warehouses) в ClickHouse Cloud, чтобы создать выделенный сервис для рабочих нагрузок записи Fivetran. Это изолирует ингестию от аналитических запросов и предотвращает конкуренцию за ресурсы.

Например, можно использовать следующую архитектуру:

* **Сервис A (запись)**: destination Fivetran + другие инструменты ингестии (ClickPipes, коннекторы Kafka)
* **Сервис B (чтение)**: BI-инструменты, дашборды, ad hoc-запросы

### Оптимизация запросов при чтении \{#optimizing-reading-queries\}

ClickHouse использует `SharedReplacingMergeTree` для целевых таблиц Fivetran — это версия [движка таблицы `ReplacingMergeTree`](/guides/replacing-merge-tree) в ClickHouse Cloud. Повторяющиеся строки с одинаковым первичным ключом — это нормально: дедупликация происходит асинхронно во время фоновых слияний. При чтении данных нужно быть внимательными, чтобы не возвращать дубликаты, поскольку некоторые строки к этому моменту могли ещё не пройти дедупликацию.

Использование ключевого слова `FINAL` — самый простой способ избежать дубликатов, поскольку оно принудительно выполняет слияние всех строк, которые к моменту чтения ещё не были дедуплицированы:

```sql
SELECT * FROM schema.table FINAL WHERE ...
```

Есть способы оптимизировать эту операцию `FINAL` — например, фильтровать по ключевым столбцам с помощью условия `WHERE`. Подробнее см. в разделе [производительность FINAL](/guides/replacing-merge-tree#final-performance) руководства по ReplacingMergeTree.

Если этих оптимизаций недостаточно, доступны и другие варианты, которые позволяют обойтись без `FINAL` и при этом корректно обрабатывать дубликаты:

* Если вам нужно выполнить запрос к числовому столбцу, значение которого постоянно увеличивается, [вы можете использовать `max(the_column)`](/guides/developer/deduplication#avoiding-final).
* Если вам нужно получить последнее значение некоторых столбцов для определённого ключа, можно использовать [`argMax(the_column, _fivetran_id)`](https://clickhouse.com/blog/10-best-practice-tips#perfecting_replacingmergetree).

### Оптимизация первичного ключа и ORDER BY \{#primary-key-optimization\}

Fivetran реплицирует первичный ключ исходной таблицы в предложение ClickHouse `ORDER BY`. Если у источника нет первичного ключа, сортировочным ключом становится `_fivetran_id` (UUID), что может привести к низкой производительности запросов, поскольку ClickHouse строит свой [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) на основе столбцов `ORDER BY`.

**Рекомендации для этого случая, если других способов оптимизации недостаточно:**

1. **Используйте таблицы Fivetran как сырые промежуточные таблицы.** Не выполняйте по ним аналитические запросы напрямую.
2. **Если производительность запросов по-прежнему недостаточна**, используйте [Refreshable Materialized View](/materialized-view/refreshable-materialized-view), чтобы создать копию таблицы с `ORDER BY`, оптимизированным под ваши шаблоны запросов. В отличие от incremental materialized views, refreshable materialized views повторно выполняют полный запрос по расписанию, что позволяет корректно обрабатывать операции `UPDATE` и `DELETE`, которые Fivetran выполняет во время синхронизации:

   ```sql
   CREATE MATERIALIZED VIEW schema.table_optimized
   REFRESH EVERY 1 HOUR
   ENGINE = ReplacingMergeTree()
   ORDER BY (user_id, event_date)
   AS SELECT * FROM schema.table_raw FINAL;
   ```

   :::note
   Избегайте incremental (non-refreshable) materialized views для таблиц под управлением Fivetran. Поскольку Fivetran выполняет операции `UPDATE` и `DELETE`, чтобы поддерживать синхронизацию данных, incremental materialized views не будут отражать эти изменения и будут содержать устаревшие или некорректные данные.
   :::

### Не изменяйте вручную таблицы, управляемые Fivetran \{#dont-modify-tables\}

Избегайте ручного изменения DDL в таблицах, управляемых Fivetran (например, `ALTER TABLE ... MODIFY COLUMN`). Коннектор ожидает schema, которую создал сам. Ручные изменения могут привести к [ошибкам соответствия типов](#uint64-type-error) и сбоям из-за несоответствия schema.

Используйте materialized views для пользовательских преобразований.

## Отладка \{#debugging\}

При диагностике сбоев:

* Проверьте `system.query_log` в ClickHouse на наличие проблем на стороне сервера.
* Обратитесь в Fivetran за помощью при проблемах на стороне клиента.

Если вы обнаружили ошибку в коннекторе, [создайте issue в GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues) или свяжитесь со [службой поддержки ClickHouse](/about-us/support).

### Отладка синхронизаций Fivetran \{#debugging-fivetran-syncs\}

Используйте следующие запросы, чтобы диагностировать сбои синхронизации со стороны ClickHouse.

#### Проверьте последние ошибки ClickHouse, связанные с Fivetran \{#check-errors\}

```sql
SELECT event_time, query, exception_code, exception
FROM system.query_log
WHERE client_name LIKE 'fivetran-destination%'
  AND exception_code > 0
ORDER BY event_time DESC
LIMIT 50;
```

#### Проверьте недавнюю активность пользователя Fivetran \{#check-activity\}

```sql
SELECT event_time, query_kind, query, exception_code, exception
FROM system.query_log
WHERE user = '{fivetran_user}'
ORDER BY event_time DESC
LIMIT 100;
```
