---
slug: /sql-reference/statements/alter/partition
sidebar_position: 38
sidebar_label: ПАРТИЦИЯ
title: "Управление партициями и частями"
---

Следующие операции с [партициями](/engines/table-engines/mergetree-family/custom-partitioning-key.md) доступны:

- [DETACH PARTITION\|PART](#detach-partitionpart) — Перемещает партицию или часть в директорию `detached` и забывает о ней.
- [DROP PARTITION\|PART](#drop-partitionpart) — Удаляет партицию или часть.
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - Удаляет часть или все части партиции из `detached`.
- [FORGET PARTITION](#forget-partition) — Удаляет метаданные партиции из zookeeper, если она пуста.
- [ATTACH PARTITION\|PART](#attach-partitionpart) — Добавляет партицию или часть из директории `detached` в таблицу.
- [ATTACH PARTITION FROM](#attach-partition-from) — Копирует данные партиции из одной таблицы в другую и добавляет.
- [REPLACE PARTITION](#replace-partition) — Копирует данные партиции из одной таблицы в другую и заменяет.
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — Перемещает данные партиции из одной таблицы в другую.
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — Сбрасывает значение указанной колонки в партиции.
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — Сбрасывает указанный вторичный индекс в партиции.
- [FREEZE PARTITION](#freeze-partition) — Создает резервную копию партиции.
- [UNFREEZE PARTITION](#unfreeze-partition) — Удаляет резервную копию партиции.
- [FETCH PARTITION\|PART](#fetch-partitionpart) — Загружает часть или партицию с другого сервера.
- [MOVE PARTITION\|PART](#move-partitionpart) — Перемещает партицию/часть данных на другой диск или объем.
- [UPDATE IN PARTITION](#update-in-partition) — Обновляет данные в партиции по условию.
- [DELETE IN PARTITION](#delete-in-partition) — Удаляет данные в партиции по условию.

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

Перемещает все данные для указанной партиции в директорию `detached`. Сервер забывает о данных партиции, как если бы она не существовала. Сервер не будет знать об этих данных, пока вы не выполните запрос [ATTACH](#attach-partitionpart).

Пример:

``` sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

После выполнения запроса вы можете делать все, что угодно с данными в директории `detached` — удалить их из файловой системы или просто оставить их.

Этот запрос реплицируется – он перемещает данные в директорию `detached` на всех репликах. Обратите внимание, что вы можете выполнить этот запрос только на ведущей реплике. Чтобы узнать, является ли реплика ведущей, выполните запрос `SELECT` к таблице [system.replicas](/operations/system-tables/replicas). Кроме того, проще всего выполнить запрос `DETACH` на всех репликах - все реплики выдадут исключение, кроме ведущих реплик (так как допускается наличие нескольких ведущих).

## DROP PARTITION\|PART {#drop-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

Удаляет указанную партицию из таблицы. Этот запрос помечает партицию как неактивную и полностью удаляет данные, примерно за 10 минут.

Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

Запрос реплицируется – он удаляет данные на всех репликах.

Пример:

``` sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

Удаляет указанную часть или все части указанной партиции из `detached`.
Читайте больше о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

## FORGET PARTITION {#forget-partition}

``` sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

Удаляет все метаданные об пустой партиции из ZooKeeper. Запрос завершится с ошибкой, если партиция не пустая или неизвестная. Убедитесь, что вы выполняете его только для партиций, которые больше никогда не будут использоваться.

Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

Пример:

``` sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

Добавляет данные в таблицу из директории `detached`. Возможно добавить данные для всей партиции или для отдельной части. Примеры:

``` sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

Читайте больше о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

Этот запрос реплицируется. Реплика-инициатор проверяет, есть ли данные в директории `detached`.
Если данные есть, запрос проверяет их целостность. Если все правильно, запрос добавляет данные в таблицу.

Если неинициаторская реплика, получившая команду attach, находит часть с правильными контрольными суммами в своей собственной папке `detached`, она присоединяет данные, не загружая их из других реплик.
Если части с правильными контрольными суммами нет, данные загружаются с любой реплики, имеющей часть.

Вы можете положить данные в директорию `detached` на одной реплике и использовать запрос `ALTER ... ATTACH`, чтобы добавить их в таблицу на всех репликах.

## ATTACH PARTITION FROM {#attach-partition-from}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

Этот запрос копирует данные партиции из `table1` в `table2`.

Обратите внимание на следующее:

- Данные не будут удалены ни из `table1`, ни из `table2`.
- `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть выполнены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ сортировки и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае, целевая таблица может иметь супerset индексов и проекций исходной таблицы.

## REPLACE PARTITION {#replace-partition}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

Этот запрос копирует данные партиции из `table1` в `table2` и заменяет существующую партицию в `table2`. Операция атомарна.

Обратите внимание на следующее:

- Данные не будут удалены из `table1`.
- `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть выполнены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ сортировки и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае, целевая таблица может иметь супerset индексов и проекций исходной таблицы.

## MOVE PARTITION TO TABLE {#move-partition-to-table}

``` sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

Этот запрос перемещает данные партиции из `table_source` в `table_dest`, удаляя данные из `table_source`.

Для успешного выполнения запроса должны быть выполнены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ сортировки и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Обе таблицы должны принадлежать к одной и той же семействе движков (реплицированные или не реплицированные).
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае, целевая таблица может иметь супerset индексов и проекций исходной таблицы.

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

Сбрасывает все значения в указанной колонке в партиции. Если в момент создания таблицы было определено условие `DEFAULT`, этот запрос устанавливает значение колонки в указанное значение по умолчанию.

Пример:

``` sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

Этот запрос создает локальную резервную копию указанной партиции. Если условие `PARTITION` опущено, запрос создает резервную копию всех партиций сразу.

:::note
Весь процесс резервного копирования выполняется без остановки сервера.
:::

Обратите внимание, что для таблиц старого типа вы можете указать префикс имени партиции (например, `2019`) - в этом случае запрос создает резервную копию для всех соответствующих партиций. Читайте о настройке выражения партиции в разделе [Как установить выражение партиции](#how-to-set-partition-expression).

В момент выполнения, для снимка данных, запрос создает жесткие ссылки на данные таблицы. Жесткие ссылки помещаются в директорию `/var/lib/clickhouse/shadow/N/...`, где:

- `/var/lib/clickhouse/` — рабочая директория ClickHouse, указанная в конфигурации.
- `N` — инкрементный номер резервной копии.
- если указан параметр `WITH NAME`, то значение параметра `'backup_name'` будет использоваться вместо инкрементного номера.

:::note
Если вы используете [набор дисков для хранения данных в таблице](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes), директория `shadow/N` появляется на каждом диске и хранит части данных, соответствующие выражению `PARTITION`.
:::

Структура директорий внутри резервной копии такая же, как внутри `/var/lib/clickhouse/`. Запрос выполняет `chmod` для всех файлов, запрещая запись в них.

После создания резервной копии вы можете скопировать данные из `/var/lib/clickhouse/shadow/` на удаленный сервер, а затем удалить их с локального сервера. Обратите внимание, что запрос `ALTER t FREEZE PARTITION` не реплицируется. Он создает локальную резервную копию только на локальном сервере.

Запрос создает резервную копию почти мгновенно (но сначала ждет завершения текущих запросов к соответствующей таблице).

`ALTER TABLE t FREEZE PARTITION` копирует только данные, а не метаданные таблицы. Чтобы сделать резервную копию метаданных таблицы, скопируйте файл `/var/lib/clickhouse/metadata/database/table.sql`.

Чтобы восстановить данные из резервной копии, выполните следующие действия:

1. Создайте таблицу, если она не существует. Для просмотра запроса используйте файл .sql (замените `ATTACH` в нем на `CREATE`).
2. Скопируйте данные из директории `data/database/table/` внутри резервной копии в директорию `/var/lib/clickhouse/data/database/table/detached/`.
3. Выполните запросы `ALTER TABLE t ATTACH PARTITION`, чтобы добавить данные в таблицу.

Восстановление из резервной копии не требует остановки сервера.

Для получения дополнительной информации о резервных копиях и восстановлении данных см. раздел [Резервное копирование данных](/operations/backup.md).

## UNFREEZE PARTITION {#unfreeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

Удаляет `freezed` партиции с указанным именем с диска. Если условие `PARTITION` опущено, запрос удаляет резервные копии всех партиций сразу.

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

Запрос работает аналогично `CLEAR COLUMN`, но сбрасывает индекс вместо данных колонки.

## FETCH PARTITION|PART {#fetch-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

Загружает партицию с другого сервера. Этот запрос работает только для реплицированных таблиц.

Запрос выполняет следующие действия:

1. Загружает партицию\часть из указанного шарда. В 'path-in-zookeeper' вы должны указать путь к шардe в ZooKeeper.
2. Затем запрос помещает загруженные данные в директорию `detached` таблицы `table_name`. Используйте запрос [ATTACH PARTITION\|PART](#attach-partitionpart), чтобы добавить данные в таблицу.

Например:

1. FETCH PARTITION
``` sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. FETCH PART
``` sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

Обратите внимание на следующее:

- Запрос `ALTER ... FETCH PARTITION|PART` не реплицируется. Он помещает часть или партицию в директорию `detached` только на локальном сервере.
- Запрос `ALTER TABLE ... ATTACH` реплицируется. Он добавляет данные ко всем репликам. Данные добавляются к одной из реплик из директории `detached`, а к другим - с соседних реплик.

Перед загрузкой система проверяет, существует ли партиция и соответствует ли структура таблицы. Наиболее подходящая реплика автоматически выбирается из исправных реплик.

Хотя запрос называется `ALTER TABLE`, он не изменяет структуру таблицы и не изменяет немедленно данные, доступные в таблице.

## MOVE PARTITION\|PART {#move-partitionpart}

Перемещает партиции или части данных на другой объем или диск для таблиц с движком `MergeTree`. См. [Использование нескольких блочных устройств для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes).

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

Запрос `ALTER TABLE t MOVE`:

- Не реплицируется, потому что разные реплики могут иметь разные политики хранения.
- Возвращает ошибку, если указанный диск или объем не настроен. Запрос также возвращает ошибку, если условия перемещения данных, указанные в политике хранения, не могут быть применены.
- Может возвращать ошибку в случае, если данные, которые необходимо переместить, уже переместились фоновым процессом, конкурентным запросом `ALTER TABLE t MOVE` или в результате фонового слияния данных. Пользователю не следует выполнять никаких дополнительных действий в этом случае.

Пример:

``` sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

Манипулирует данными в указанной партиции, соответствующей заданному фильтрующему выражению. Реализован как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### Пример {#example}

``` sql
-- используя имя партиции
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- используя id партиции
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### См. Также {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

Удаляет данные в указанной партиции, соответствующей заданному фильтрующему выражению. Реализован как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### Пример {#example-1}

``` sql
-- используя имя партиции
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- используя id партиции
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```

### См. Также {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## Как установить выражение партиции {#how-to-set-partition-expression}

Вы можете указать выражение партиции в запросах `ALTER ... PARTITION` различными способами:

- Как значение из колонки `partition` таблицы `system.parts`. Например, `ALTER TABLE visits DETACH PARTITION 201901`.
- Используя ключевое слово `ALL`. Оно может использоваться только с DROP/DETACH/ATTACH/ATTACH FROM. Например, `ALTER TABLE visits ATTACH PARTITION ALL`.
- Как кортеж выражений или констант, которые соответствуют (по типам) кортежу ключей партиционирования таблицы. В случае единственного элемента ключа партиционирования выражение должно быть заключено в функцию `tuple (...)`. Например, `ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- Используя ID партиции. ID партиции — это строковый идентификатор партиции (читаемый человеком, если возможно), который используется как имя партиции в файловой системе и в ZooKeeper. ID партиции должен быть указан в условии `PARTITION ID`, в одинарных кавычках. Например, `ALTER TABLE visits DETACH PARTITION ID '201901'`.
- В запросе [ALTER ATTACH PART](#attach-partitionpart) и [DROP DETACHED PART](#drop-detached-partitionpart) для указания имени части используйте строковый литерал со значением из колонки `name` таблицы [system.detached_parts](/operations/system-tables/detached_parts). Например, `ALTER TABLE visits ATTACH PART '201901_1_1_0'`.

Использование кавычек при указании партиции зависит от типа выражения партиции. Например, для типа `String` вы должны указать его имя в кавычках (`'`). Для типов `Date` и `Int*` кавычки не нужны.

Все вышеперечисленные правила также применимы к запросу [OPTIMIZE](/sql-reference/statements/optimize.md). Если вам нужно указать только партицию при оптимизации непартиционированной таблицы, установите выражение `PARTITION tuple()`. Например:

``` sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` указывает партицию, к которой применяются выражения [UPDATE](/sql-reference/statements/alter/update) или [DELETE](/sql-reference/statements/alter/delete) в результате запроса `ALTER TABLE`. Новые части создаются только из указанной партиции. Таким образом, `IN PARTITION` помогает уменьшить нагрузку, когда таблица разбита на множество партиций, и вам нужно лишь обновить данные по отдельным точкам.

Примеры запросов `ALTER ... PARTITION` показаны в тестах [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) и [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql).
