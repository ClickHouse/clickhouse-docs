---
description: 'Документация по оператору ALTER'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
---



# ALTER

Большинство запросов `ALTER TABLE` изменяют настройки таблицы или её данные:

| Модификатор                                                                        |
|-------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                         |
| [PARTITION](/sql-reference/statements/alter/partition.md)                   |
| [DELETE](/sql-reference/statements/alter/delete.md)                         |
| [UPDATE](/sql-reference/statements/alter/update.md)                         |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                     |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                  |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                 |
| [TTL](/sql-reference/statements/alter/ttl.md)                               |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                 |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md) |

:::note
Большинство запросов `ALTER TABLE` поддерживаются только для таблиц [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) и [Distributed](/engines/table-engines/special/distributed.md).
:::

Эти операторы `ALTER` модифицируют представления:

| Оператор                                                                           | Описание                                                                               |
|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | Изменяет структуру [материализованного представления](/sql-reference/statements/create/view). |

Эти операторы `ALTER` изменяют сущности, связанные с ролевым управлением доступом:

| Оператор                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Оператор                                                                             | Описание                                                                                 |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | Добавляет, изменяет или удаляет комментарии к таблице, независимо от того, были ли они заданы ранее. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | Изменяет [именованные коллекции](/operations/named-collections.md).                   |



## Мутации {#mutations}

Запросы `ALTER`, предназначенные для изменения данных таблицы, реализованы с помощью механизма под названием «мутации», в частности [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) и [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md). Это асинхронные фоновые процессы, аналогичные слияниям в таблицах [MergeTree](/engines/table-engines/mergetree-family/index.md), которые создают новые «мутированные» версии кусков данных.

Для таблиц `*MergeTree` мутации выполняются путём **перезаписи целых кусков данных**.
Атомарность отсутствует — куски заменяются мутированными кусками сразу после их готовности, и запрос `SELECT`, начавший выполнение во время мутации, увидит данные как из уже мутированных кусков, так и из ещё не мутированных.

Мутации полностью упорядочены по порядку их создания и применяются к каждому куску в этом порядке. Мутации также частично упорядочены относительно запросов `INSERT INTO`: данные, вставленные в таблицу до отправки мутации, будут мутированы, а данные, вставленные после этого, мутированы не будут. Обратите внимание, что мутации никак не блокируют вставки.

Запрос мутации возвращается сразу после добавления записи о мутации (в случае реплицируемых таблиц — в ZooKeeper, для нереплицируемых таблиц — в файловую систему). Сама мутация выполняется асинхронно с использованием системных настроек профиля. Для отслеживания прогресса мутаций можно использовать таблицу [`system.mutations`](/operations/system-tables/mutations). Успешно отправленная мутация продолжит выполняться, даже если серверы ClickHouse будут перезапущены. Откатить мутацию после её отправки невозможно, но если мутация по какой-то причине зависла, её можно отменить с помощью запроса [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation).

Записи о завершённых мутациях не удаляются сразу (количество сохраняемых записей определяется параметром движка хранения `finished_mutations_to_keep`). Более старые записи о мутациях удаляются.


## Синхронность запросов ALTER {#synchronicity-of-alter-queries}

Для нереплицируемых таблиц все запросы `ALTER` выполняются синхронно. Для реплицируемых таблиц запрос только добавляет инструкции для соответствующих действий в `ZooKeeper`, а сами действия выполняются при первой возможности. При этом запрос может ожидать завершения этих действий на всех репликах.

Для запросов `ALTER`, создающих мутации (например, включая, но не ограничиваясь `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC`), синхронность определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync).

Для других запросов `ALTER`, которые только изменяют метаданные, можно использовать настройку [alter_sync](/operations/settings/settings#alter_sync) для настройки ожидания.

Можно указать, как долго (в секундах) ожидать выполнения всех запросов `ALTER` неактивными репликами с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Для всех запросов `ALTER`, если `alter_sync = 2` и некоторые реплики неактивны дольше времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, выбрасывается исключение `UNFINISHED`.
:::


## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
