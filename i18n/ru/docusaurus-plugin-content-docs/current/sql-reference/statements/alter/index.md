---
description: 'Документация по ALTER'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
---


# ALTER

Большинство запросов `ALTER TABLE` изменяют настройки или данные таблицы:

| Модификатор                                                                            |
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
Большинство запросов `ALTER TABLE` поддерживаются только для [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) и [Distributed](/engines/table-engines/special/distributed.md) таблиц.
:::

Эти инструкции `ALTER` манипулируют представлениями:

| Инструкция                                                                           | Описание                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | Изменяет структуру [материализованного представления](/sql-reference/statements/create/view).                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | Обновляет [live-представление](/sql-reference/statements/create/view.md/#live-view).|

Эти инструкции `ALTER` изменяют сущности, связанные с контролем доступа на основе ролей:

| Инструкция                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Инструкция                                                                             | Описание                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | Добавляет, изменяет или удаляет комментарии к таблице, независимо от того, были ли они установлены ранее или нет. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | Изменяет [именованные коллекции](/operations/named-collections.md).                   |

## Мутации {#mutations}

Запросы `ALTER`, которые предназначены для манипуляции с данными таблицы, реализуются с помощью механизма под названием "мутации", наиболее заметно [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) и [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md). Они являются асинхронными фоновыми процессами, аналогичными слияниям в таблицах [MergeTree](/engines/table-engines/mergetree-family/index.md), которые производят новые "мутациированные" версии частей.

Для таблиц `*MergeTree` мутации выполняются путем **перезаписи целых частей данных**. 
Отсутствует атомарность — части заменяются мутабельными частями, как только они готовы, а запрос `SELECT`, который начал выполняться во время мутации, увидит данные из частей, которые уже были мутивированы, вместе с данными из частей, которые еще не были мутивированы.

Мутации полностью упорядочены по порядку их создания и применяются к каждой части в этом порядке. Мутации также частично упорядочены по запросам `INSERT INTO`: данные, которые были вставлены в таблицу до подачи мутации, будут мутивированы, а данные, вставленные после этого, мутивированы не будут. Обратите внимание, что мутации не блокируют вставки никаким образом.

Запрос мутации возвращается немедленно после добавления записи мутации (в случае реплицируемых таблиц в ZooKeeper, для нереплицируемых таблиц - в файловую систему). Сама мутация выполняется асинхронно с использованием настроек профиля системы. Чтобы отслеживать прогресс мутаций, вы можете использовать таблицу [`system.mutations`](/operations/system-tables/mutations). Мутация, которая была успешно подана, будет продолжать выполняться даже если сервера ClickHouse будут перезапущены. Нет способа откатить мутацию после ее подачи, но если мутация застряла по какой-либо причине, ее можно отменить с помощью запроса [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation).

Записи для завершенных мутаций не удаляются сразу (количество сохраненных записей определяется параметром движка хранения `finished_mutations_to_keep`). Более старые записи мутаций удаляются.

## Синхронность запросов ALTER {#synchronicity-of-alter-queries}

Для нереплицируемых таблиц все запросы `ALTER` выполняются синхронно. Для реплицируемых таблиц запрос просто добавляет инструкции для соответствующих действий в `ZooKeeper`, а сами действия выполняются как можно скорее. Тем не менее, запрос может ожидать завершения этих действий на всех репликах.

Для запросов `ALTER`, которые создают мутации (например: включая, но не ограничиваясь `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC`), синхронность определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync).

Для других запросов `ALTER`, которые только изменяют метаданные, вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync), чтобы настроить ожидание.

Вы можете указать, как долго (в секундах) ждать неактивные реплики для выполнения всех запросов `ALTER` с настройкой [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Для всех запросов `ALTER`, если `alter_sync = 2` и некоторые реплики не активны более чем на время, указанное в настройке `replication_wait_for_inactive_replica_timeout`, тогда выбрасывается исключение `UNFINISHED`.
:::

## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
