---
slug: '/sql-reference/statements/alter/'
sidebar_label: ALTER
sidebar_position: 35
description: 'Документация для ALTER'
title: ALTER
doc_type: reference
---
# ALTER

Большинство запросов `ALTER TABLE` изменяют настройки или данные таблицы:

| Модификатор                                                                            |
|----------------------------------------------------------------------------------------|
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

Эти операторы `ALTER` управляют представлениями:

| Оператор                                                                           | Описание                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | Изменяет структуру [материализованного представления](/sql-reference/statements/create/view).                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | Обновляет [live-представление](/sql-reference/statements/create/view.md/#live-view).|

Эти операторы `ALTER` изменяют сущности, связанные с контролем доступа на основе ролей:

| Оператор                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Оператор                                                                             | Описание                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | Добавляет, изменяет или удаляет комментарии в таблице, независимо от того, были ли они установлены ранее или нет. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | Изменяет [Именованные коллекции](/operations/named-collections.md).                   |

## Мутации {#mutations}

Запросы `ALTER`, предназначенные для изменения данных таблицы, реализуются с помощью механизма, называемого "мутациями", наиболее заметными из которых являются [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) и [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md). Они являются асинхронными фоновыми процессами, похожими на слияния в таблицах [MergeTree](/engines/table-engines/mergetree-family/index.md), которые производят новые "мутированные" версии частей.

Для таблиц `*MergeTree` мутации выполняются путем **перезаписи целых частей данных**. 
Атомарность отсутствует — части заменяются мутированными частями, как только они готовы, и запрос `SELECT`, который начал выполняться в процессе мутации, будет видеть данные из частей, которые уже были мутированы, вместе с данными из частей, которые еще не были мутированы.

Мутации полностью упорядочены по порядку их создания и применяются к каждой части в этом порядке. Мутации также частично упорядочены с запросами `INSERT INTO`: данные, которые были вставлены в таблицу до подачи мутации, будут мутированы, а данные, вставленные после этого, не будут мутированы. Обратите внимание, что мутации не блокируют вставки.

Запрос на мутацию возвращается немедленно после добавления записи мутации (в случае реплицируемых таблиц — в ZooKeeper, для нереплицируемых таблиц — в файловую систему). Сама мутация выполняется асинхронно с использованием настроек системного профиля. Для отслеживания процесса мутаций вы можете использовать таблицу [`system.mutations`](/operations/system-tables/mutations). Мутация, которая была успешно подана, продолжит выполняться даже если серверы ClickHouse будут перезапущены. Нет возможности отменить мутацию после ее подачи, но если мутация зависла по какой-либо причине, ее можно отменить с помощью запроса [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation).

Записи для завершенных мутаций не удаляются сразу (количество хранимых записей определяется параметром движка хранения `finished_mutations_to_keep`). Более старые записи мутаций удаляются.

## Синхронность запросов ALTER {#synchronicity-of-alter-queries}

Для нереплицируемых таблиц все запросы `ALTER` выполняются синхронно. Для реплицируемых таблиц запрос просто добавляет инструкции для соответствующих действий в `ZooKeeper`, а сами действия выполняются как можно скорее. Тем не менее, запрос может ждать завершения этих действий на всех репликах.

Для запросов `ALTER`, которые создают мутации (например: включая, но не ограничиваясь `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC`), синхронность определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync).

Для других запросов `ALTER`, которые изменяют только метаданные, вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync) для организации ожидания.

Вы можете указать, как долго (в секундах) ждать, пока неактивные реплики выполнят все запросы `ALTER`, с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Для всех запросов `ALTER`, если `alter_sync = 2` и некоторые реплики не активны более времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, то генерируется исключение `UNFINISHED`.
:::

## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)