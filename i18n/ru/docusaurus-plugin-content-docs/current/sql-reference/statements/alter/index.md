---
description: 'Документация для ALTER'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
---


# ALTER

Большинство запросов `ALTER TABLE` изменяют настройки или данные таблицы:

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
Большинство запросов `ALTER TABLE` поддерживается только для [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) и [Distributed](/engines/table-engines/special/distributed.md) таблиц.
:::

Эти операторы `ALTER` управляют представлениями:

| Оператор                                                                       | Описание                                                                               |
|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | Изменяет структуру [Материализованного представления](/sql-reference/statements/create/view).                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | Обновляет [Live представление](/sql-reference/statements/create/view.md/#live-view).|

Эти операторы `ALTER` изменяют сущности, связанные с контролем доступа на основе ролей:

| Оператор                                                                         |
|----------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Оператор                                                                             | Описание                                                                                     |
|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | Добавляет, изменяет или удаляет комментарии к таблице, независимо от того, были ли они установлены ранее или нет. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | Изменяет [Именованные Коллекции](/operations/named-collections.md).                   |

## Мутации {#mutations}

Запросы `ALTER`, которые предназначены для изменения данных таблицы, реализованы с помощью механизма, называемого "мутациями", наиболее заметными являются [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) и [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md). Они выполняются асинхронно в фоновом режиме и аналогичны слияниям в таблицах [MergeTree](/engines/table-engines/mergetree-family/index.md), которые предназначены для создания новых "мутизированных" версий частей данных.

Для таблиц `*MergeTree` мутации выполняются путем **перезаписи целых частей данных**. 
Отсутствует атомарность — части заменяются мутизированными частями сразу, как только они готовы, и запрос `SELECT`, который начал выполняться во время мутации, будет видеть данные из частей, которые уже были мутизированы, вместе с данными из частей, которые еще не были мутизированы.

Мутации полностью упорядочены по порядку их создания и применяются к каждой части в этом порядке. Мутации также частично упорядочены с запросами `INSERT INTO`: данные, которые были вставлены в таблицу до отправки мутации, будут мутизированы, а данные, которые были вставлены после этого, мутизированы не будут. Обратите внимание, что мутации не блокируют вставки.

Запрос мутации возвращает управление сразу после добавления записи о мутации (в случае реплицированных таблиц в ZooKeeper, для нереплицированных таблиц - в файловую систему). Сама мутация выполняется асинхронно, используя настройки системного профиля. Чтобы отслеживать прогресс мутаций, вы можете использовать таблицу [`system.mutations`](/operations/system-tables/mutations). Мутация, которая была успешно отправлена, продолжит выполняться даже если серверы ClickHouse будут перезапущены. Невозможно отменить мутацию после ее отправки, но если мутация застряла по какой-то причине, ее можно отменить с помощью запроса [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation).

Записи о завершенных мутациях не удаляются сразу (количество сохраняемых записей определяется параметром движка хранения `finished_mutations_to_keep`). Более старые записи о мутациях удаляются.

## Синхронность запросов ALTER {#synchronicity-of-alter-queries}

Для нереплицированных таблиц все запросы `ALTER` выполняются синхронно. Для реплицированных таблиц запрос просто добавляет инструкции для соответствующих действий в `ZooKeeper`, а сами действия выполняются как можно скорее. Тем не менее, запрос может ждать завершения этих действий на всех репликах.

Для запросов `ALTER`, которые создают мутации (например: включая, но не ограничиваясь, `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC`), синхронность определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync).

Для других запросов `ALTER`, которые только изменяют метаданные, вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync) для настройки ожидания.

Вы можете указать, сколько времени (в секундах) ждать, пока неактивные реплики выполнят все запросы `ALTER`, с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Для всех запросов `ALTER`, если `alter_sync = 2` и некоторые реплики неактивны более чем в течение времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, то будет вызвано исключение `UNFINISHED`.
:::

## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
