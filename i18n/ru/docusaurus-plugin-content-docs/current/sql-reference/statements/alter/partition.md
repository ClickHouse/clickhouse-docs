---
slug: '/sql-reference/statements/alter/partition'
sidebar_label: PARTITION
sidebar_position: 38
description: 'Документация для Partition'
title: 'Управление партициями и частями'
doc_type: reference
---
Следующие операции с [партициями](/engines/table-engines/mergetree-family/custom-partitioning-key.md) доступны:

- [DETACH PARTITION\|PART](#detach-partitionpart) — Перемещает партицию или часть в каталог `detached` и забывает о ней.
- [DROP PARTITION\|PART](#drop-partitionpart) — Удаляет партицию или часть.
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - Удаляет часть или все части партиции из `detached`.
- [FORGET PARTITION](#forget-partition) — Удаляет метаданные партиции из ZooKeeper, если она пустая.
- [ATTACH PARTITION\|PART](#attach-partitionpart) — Добавляет партицию или часть из каталога `detached` в таблицу.
- [ATTACH PARTITION FROM](#attach-partition-from) — Копирует данные партиции из одной таблицы в другую и добавляет.
- [REPLACE PARTITION](#replace-partition) — Копирует данные партиции из одной таблицы в другую и заменяет.
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — Перемещает данные партиции из одной таблицы в другую.
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — Сбрасывает значение указанной колонки в партиции.
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — Сбрасывает указанный вторичный индекс в партиции.
- [FREEZE PARTITION](#freeze-partition) — Создает резервную копию партиции.
- [UNFREEZE PARTITION](#unfreeze-partition) — Удаляет резервную копию партиции.
- [FETCH PARTITION\|PART](#fetch-partitionpart) — Загружает часть или партицию с другого сервера.
- [MOVE PARTITION\|PART](#move-partitionpart) — Перемещает партицию/часть данных на другой диск или том.
- [UPDATE IN PARTITION](#update-in-partition) — Обновляет данные внутри партиции по условию.
- [DELETE IN PARTITION](#delete-in-partition) — Удаляет данные внутри партиции по условию.
- [REWRITE PARTS](#rewrite-parts) — Полностью переписывает части в таблице (или в конкретной партиции).

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

Перемещает все данные для указанной партиции в каталог `detached`. Сервер забывает о удаленной партиции данных так, как если бы её не существовало. Сервер не будет знать об этих данных, пока вы не выполните запрос [ATTACH](#attach-partitionpart).

Пример:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

После выполнения запроса вы можете делать все, что хотите, с данными в каталоге `detached` — удалять их из файловой системы или просто оставить.

Этот запрос реплицируется – он перемещает данные в каталог `detached` на всех репликах. Обратите внимание, что вы можете выполнить этот запрос только на ведущей реплике. Чтобы узнать, является ли реплика ведущей, выполните запрос `SELECT` к таблице [system.replicas](/operations/system-tables/replicas). В качестве альтернативы проще сделать запрос `DETACH` на всех репликах - все реплики выбросят исключение, кроме ведущих реплик (поскольку допускаются множественные ведущие).

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

Удаляет указанную партицию из таблицы. Этот запрос помечает партицию как неактивную и полностью удаляет данные, примерно за 10 минут.

Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

Запрос реплицируется – он удаляет данные на всех репликах.

Пример:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

Удаляет указанную часть или все части указанной партиции из `detached`.
Читайте больше о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

Удаляет все метаданные о пустой партиции из ZooKeeper. Запрос завершается неудачей, если партиция не пустая или неизвестна. Убедитесь, что выполняете его только для партиций, которые больше никогда не будут использоваться.

Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

Пример:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

Добавляет данные в таблицу из каталога `detached`. Можно добавить данные для всей партиции или для отдельной части. Примеры:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

Читайте больше о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

Этот запрос реплицируется. Инициатор реплики проверяет, есть ли данные в каталоге `detached`.
Если данные существуют, запрос проверяет их целостность. Если все правильно, запрос добавляет данные в таблицу.

Если неинициатор реплики, получивший команду attach, находит часть с правильными контрольными суммами в своем каталоге `detached`, он прикрепляет данные без загрузки их с других реплик.
Если нет части с правильными контрольными суммами, данные загружаются с любой реплики, имеющей часть.

Вы можете поместить данные в каталог `detached` на одной реплике и использовать запрос `ALTER ... ATTACH` для добавления их в таблицу на всех репликах.

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

Этот запрос копирует данные партиции из `table1` в `table2`.

Обратите внимание на следующие моменты:

- Данные не будут удалены ни из `table1`, ни из `table2`.
- `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть выполнены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ ORDER BY и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае целевая таблица может иметь супerset индексов и проекций из исходной таблицы.

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

Этот запрос копирует данные партиции из `table1` в `table2` и заменяет существующую партицию в `table2`. Операция является атомарной.

Обратите внимание на следующие моменты:

- Данные не будут удалены из `table1`.
- `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть выполнены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ ORDER BY и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае целевая таблица может иметь супerset индексов и проекций из исходной таблицы.

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

Этот запрос перемещает партицию данных из `table_source` в `table_dest`, удаляя данные из `table_source`.

Для успешного выполнения запроса должны быть выполнены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ ORDER BY и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Обе таблицы должны принадлежать к одной семье движков (реплицированные или не реплицированные).
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае целевая таблица может иметь супerset индексов и проекций из исходной таблицы.

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

Сбрасывает все значения в указанной колонке в партиции. Если при создании таблицы было определено условие `DEFAULT`, этот запрос устанавливает значение колонки на указанное значение по умолчанию.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

Этот запрос создает локальную резервную копию указанной партиции. Если условие `PARTITION` пропущено, запрос создает резервную копию всех партиций сразу.

:::note
Весь процесс резервного копирования выполняется без остановки сервера.
:::

Обратите внимание, что для таблиц старого стиля вы можете указать префикс имени партиции (например, `2019`) – тогда запрос создает резервную копию для всех соответствующих партиций. Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

В момент выполнения, для снимка данных, запрос создает жесткие ссылки на данные таблицы. Жесткие ссылки помещаются в каталог `/var/lib/clickhouse/shadow/N/...`, где:

- `/var/lib/clickhouse/` — рабочий каталог ClickHouse, указанный в конфигурации.
- `N` — инкрементный номер резервной копии.
- если параметр `WITH NAME` указан, то значение параметра `'backup_name'` используется вместо инкрементного номера.

:::note
Если вы используете [набор дисков для хранения данных в таблице](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes), каталог `shadow/N` появляется на каждом диске, храня данные, совпадающие с выражением `PARTITION`.
:::

Такая же структура каталогов создается внутри резервной копии, как и внутри `/var/lib/clickhouse/`. Запрос выполняет `chmod` для всех файлов, запрещая запись в них.

После создания резервной копии вы можете скопировать данные из `/var/lib/clickhouse/shadow/` на удаленный сервер, а затем удалить их с локального сервера. Обратите внимание, что запрос `ALTER t FREEZE PARTITION` не реплицируется. Он создает локальную резервную копию только на локальном сервере.

Запрос создает резервную копию почти мгновенно (но сначала он ждет завершения текущих запросов к соответствующей таблице).

`ALTER TABLE t FREEZE PARTITION` копирует только данные, а не метаданные таблицы. Чтобы сделать резервную копию метаданных таблицы, скопируйте файл `/var/lib/clickhouse/metadata/database/table.sql`.

Чтобы восстановить данные из резервной копии, выполните следующие действия:

1.  Создайте таблицу, если она не существует. Для просмотра запроса используйте .sql файл (замените `ATTACH` в нем на `CREATE`).
2.  Скопируйте данные из каталога `data/database/table/` внутри резервной копии в каталог `/var/lib/clickhouse/data/database/table/detached/`.
3.  Выполните запросы `ALTER TABLE t ATTACH PARTITION`, чтобы добавить данные в таблицу.

Восстановление из резервной копии не требует остановки сервера.

Для получения дополнительной информации о резервных копиях и восстановлении данных смотрите раздел [Резервное копирование данных](/operations/backup.md).

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

Удаляет `замороженные` партиции с указанным именем с диска. Если условие `PARTITION` пропущено, запрос удаляет резервную копию всех партиций сразу.

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

Запрос работает аналогично `CLEAR COLUMN`, но сбрасывает индекс вместо данных колонки.

## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

Загружает партицию с другого сервера. Этот запрос работает только для реплицированных таблиц.

Запрос выполняет следующее:

1.  Загружает партицию|часть с указанного шарда. В 'path-in-zookeeper' вы должны указать путь к шардe в ZooKeeper.
2.  Затем запрос помещает загруженные данные в каталог `detached` таблицы `table_name`. Используйте запрос [ATTACH PARTITION\|PART](#attach-partitionpart), чтобы добавить данные в таблицу.

Например:

1. FETCH PARTITION
```sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. FETCH PART
```sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

Обратите внимание:

- Запрос `ALTER ... FETCH PARTITION|PART` не реплицируется. Он помещает часть или партицию в каталог `detached` только на локальном сервере.
- Запрос `ALTER TABLE ... ATTACH` реплицируется. Он добавляет данные ко всем репликам. Данные добавляются к одной из реплик из каталога `detached`, а к другим - с соседних реплик.

Перед загрузкой система проверяет, существует ли партиция и совпадает ли структура таблицы. Наиболее подходящая реплика автоматически выбирается из здоровых реплик.

Хотя запрос называется `ALTER TABLE`, он не изменяет структуру таблицы и не изменяет немедленно доступные в таблице данные.

## MOVE PARTITION\|PART {#move-partitionpart}

Перемещает партиции или части данных на другой том или диск для таблиц с движком `MergeTree`. Смотрите [Использование нескольких блочных устройств для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes).

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

Запрос `ALTER TABLE t MOVE`:

- Не реплицируется, потому что разные реплики могут иметь разные политики хранения.
- Возвращает ошибку, если указанный диск или том не сконфигурирован. Запрос также возвращает ошибку, если условия перемещения данных, указанные в политике хранения, не могут быть применены.
- Может вернуть ошибку в случае, если данные, которые нужно переместить, уже перемещаются фоновым процессом, конкурентным запросом `ALTER TABLE t MOVE` или в результате фонового объединения данных. Пользователь не должен выполнять никаких дополнительных действий в этом случае.

Пример:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

Управляет данными в указанной партиции, соответствующими указанному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### Пример {#example}

```sql
-- using partition name
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### См. также {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

Удаляет данные в указанной партиции, соответствующие указанному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### Пример {#example-1}

```sql
-- using partition name
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```

## REWRITE PARTS {#rewrite-parts}

Это перепишет части с нуля, используя все новые настройки. Это имеет смысл, поскольку настройки уровня таблицы, такие как `use_const_adaptive_granularity`, применяются только для вновь записанных частей по умолчанию.

### Пример {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### См. также {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## Как установить выражение партиции {#how-to-set-partition-expression}

Вы можете указать выражение партиции в запросах `ALTER ... PARTITION` разными способами:

- Как значение из колонки `partition` таблицы `system.parts`. Например, `ALTER TABLE visits DETACH PARTITION 201901`.
- Используя ключевое слово `ALL`. Оно может использоваться только с DROP/DETACH/ATTACH/ATTACH FROM. Например, `ALTER TABLE visits ATTACH PARTITION ALL`.
- Как кортеж выражений или констант, которые соответствуют (по типам) кортежу ключей партиционирования таблицы. В случае единственного элемента ключа партиционирования выражение должно быть обернуто в функцию `tuple (...)`. Например, `ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- Используя идентификатор партиции. Идентификатор партиции — это строковый идентификатор партиции (читаемый человеком, если возможно), который используется в качестве имен партиций в файловой системе и в ZooKeeper. Идентификатор партиции должен быть указан в условии `PARTITION ID`, в одинарных кавычках. Например, `ALTER TABLE visits DETACH PARTITION ID '201901'`.
- В запросе [ALTER ATTACH PART](#attach-partitionpart) и [DROP DETACHED PART](#drop-detached-partitionpart), чтобы указать имя части, используйте строковый литерал со значением из колонки `name` таблицы [system.detached_parts](/operations/system-tables/detached_parts). Например, `ALTER TABLE visits ATTACH PART '201901_1_1_0'`.

Использование кавычек при указании партиции зависит от типа выражения партиции. Например, для типа `String` вы должны указать его имя в кавычках (`'`). Для типов `Date` и `Int*` кавычки не требуются.

Все указанные выше правила также верны для запроса [OPTIMIZE](/sql-reference/statements/optimize.md). Если вам нужно указать только одну партицию при оптимизации непартиционной таблицы, установите выражение `PARTITION tuple()`. Например:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` указывает партицию, к которой применяются выражения [UPDATE](/sql-reference/statements/alter/update) или [DELETE](/sql-reference/statements/alter/delete) в результате запроса `ALTER TABLE`. Новые части создаются только из указанной партиции. Таким образом, `IN PARTITION` помогает снизить нагрузку, когда таблица разделена на множество партиций, и вам нужно обновить данные по точкам.

Примеры запросов `ALTER ... PARTITION` демонстрируются в тестах [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) и [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql).