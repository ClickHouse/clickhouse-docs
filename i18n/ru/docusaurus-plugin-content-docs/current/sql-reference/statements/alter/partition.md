---
description: "Документация по разделам"
sidebar_label: "PARTITION"
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: "Манипулирование разделами и частями"
doc_type: "reference"
---

Доступны следующие операции с [разделами](/engines/table-engines/mergetree-family/custom-partitioning-key.md):

- [DETACH PARTITION\|PART](#detach-partitionpart) — Перемещает раздел или часть в директорию `detached` и удаляет из памяти.
- [DROP PARTITION\|PART](#drop-partitionpart) — Удаляет раздел или часть.
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) — Удаляет часть или все части раздела из `detached`.
- [FORGET PARTITION](#forget-partition) — Удаляет метаданные раздела из ZooKeeper, если раздел пустой.
- [ATTACH PARTITION\|PART](#attach-partitionpart) — Добавляет раздел или часть из директории `detached` в таблицу.
- [ATTACH PARTITION FROM](#attach-partition-from) — Копирует раздел данных из одной таблицы в другую и добавляет его.
- [REPLACE PARTITION](#replace-partition) — Копирует раздел данных из одной таблицы в другую и заменяет существующий.
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — Перемещает раздел данных из одной таблицы в другую.
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — Сбрасывает значение указанного столбца в разделе.
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — Сбрасывает указанный вторичный индекс в разделе.
- [FREEZE PARTITION](#freeze-partition) — Создаёт резервную копию раздела.
- [UNFREEZE PARTITION](#unfreeze-partition) — Удаляет резервную копию раздела.
- [FETCH PARTITION\|PART](#fetch-partitionpart) — Загружает часть или раздел с другого сервера.
- [MOVE PARTITION\|PART](#move-partitionpart) — Перемещает раздел/часть данных на другой диск или том.
- [UPDATE IN PARTITION](#update-in-partition) — Обновляет данные внутри раздела по условию.
- [DELETE IN PARTITION](#delete-in-partition) — Удаляет данные внутри раздела по условию.
- [REWRITE PARTS](#rewrite-parts) — Полностью перезаписывает части в таблице (или конкретном разделе).

<!-- -->


## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

Перемещает все данные указанной партиции в директорию `detached`. Сервер забывает об отсоединённой партиции данных, как будто её не существует. Сервер не будет знать об этих данных, пока вы не выполните запрос [ATTACH](#attach-partitionpart).

Пример:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

Подробнее о задании выражения партиции читайте в разделе [Как задать выражение партиции](#how-to-set-partition-expression).

После выполнения запроса вы можете делать с данными в директории `detached` всё что угодно — удалить их из файловой системы или просто оставить.

Этот запрос реплицируется — он перемещает данные в директорию `detached` на всех репликах. Обратите внимание, что выполнить этот запрос можно только на реплике-лидере. Чтобы узнать, является ли реплика лидером, выполните запрос `SELECT` к таблице [system.replicas](/operations/system-tables/replicas). Альтернативный вариант — выполнить запрос `DETACH` на всех репликах: все реплики выбросят исключение, кроме реплик-лидеров (поскольку допускается наличие нескольких лидеров).


## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

Удаляет указанную партицию из таблицы. Запрос помечает партицию как неактивную, после чего данные полностью удаляются примерно через 10 минут.

О том, как задать выражение партиции, читайте в разделе [Как задать выражение партиции](#how-to-set-partition-expression).

Запрос реплицируется — данные удаляются на всех репликах.

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
Подробнее о задании выражения партиции см. в разделе [Как задать выражение партиции](#how-to-set-partition-expression).


## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

Удаляет все метаданные о пустой партиции из ZooKeeper. Запрос завершается ошибкой, если партиция не пуста или неизвестна. Убедитесь, что команда выполняется только для партиций, которые больше никогда не будут использоваться.

Подробнее о задании выражения партиции читайте в разделе [Как задать выражение партиции](#how-to-set-partition-expression).

Пример:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```


## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

Добавляет данные в таблицу из директории `detached`. Можно добавить данные для целой партиции или для отдельного куска. Примеры:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

Подробнее о задании выражения партиции читайте в разделе [Как задать выражение партиции](#how-to-set-partition-expression).

Этот запрос реплицируется. Реплика-инициатор проверяет наличие данных в директории `detached`.
Если данные существуют, запрос проверяет их целостность. Если всё в порядке, запрос добавляет данные в таблицу.

Если реплика, не являющаяся инициатором, получив команду attach, находит кусок с корректными контрольными суммами в своей директории `detached`, она присоединяет данные без их загрузки с других реплик.
Если куска с корректными контрольными суммами нет, данные загружаются с любой реплики, у которой есть этот кусок.

Вы можете поместить данные в директорию `detached` на одной реплике и использовать запрос `ALTER ... ATTACH`, чтобы добавить их в таблицу на всех репликах.


## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

Этот запрос копирует партицию данных из таблицы `table1` в таблицу `table2`.

Обратите внимание:

- Данные не будут удалены ни из `table1`, ни из `table2`.
- `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть соблюдены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ сортировки и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае целевая таблица может содержать надмножество индексов и проекций исходной таблицы.


## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

Этот запрос копирует партицию данных из `table1` в `table2` и заменяет существующую партицию в `table2`. Операция выполняется атомарно.

Обратите внимание:

- Данные не будут удалены из `table1`.
- `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть соблюдены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ сортировки и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае целевая таблица может содержать надмножество индексов и проекций исходной таблицы.


## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

Этот запрос перемещает партицию данных из `table_source` в `table_dest` с удалением данных из `table_source`.

Для успешного выполнения запроса должны быть соблюдены следующие условия:

- Обе таблицы должны иметь одинаковую структуру.
- Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ сортировки и одинаковый первичный ключ.
- Обе таблицы должны иметь одинаковую политику хранения.
- Обе таблицы должны принадлежать к одному семейству движков (реплицируемые или нереплицируемые).
- Целевая таблица должна включать все индексы и проекции из исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае целевая таблица может содержать надмножество индексов и проекций исходной таблицы.


## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

Сбрасывает все значения в указанном столбце партиции. Если при создании таблицы было определено выражение `DEFAULT`, запрос устанавливает для столбца указанное значение по умолчанию.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```


## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

Этот запрос создаёт локальную резервную копию указанной партиции. Если секция `PARTITION` опущена, запрос создаёт резервную копию всех партиций одновременно.

:::note
Весь процесс резервного копирования выполняется без остановки сервера.
:::

Обратите внимание, что для таблиц старого стиля можно указать префикс имени партиции (например, `2019`) — тогда запрос создаст резервную копию для всех соответствующих партиций. Подробнее о задании выражения партиции читайте в разделе [Как задать выражение партиции](#how-to-set-partition-expression).

Во время выполнения для создания снимка данных запрос создаёт жёсткие ссылки на данные таблицы. Жёсткие ссылки размещаются в каталоге `/var/lib/clickhouse/shadow/N/...`, где:

- `/var/lib/clickhouse/` — рабочий каталог ClickHouse, указанный в конфигурации.
- `N` — инкрементный номер резервной копии.
- если указан параметр `WITH NAME`, то вместо инкрементного номера используется значение параметра `'backup_name'`.

:::note
Если вы используете [набор дисков для хранения данных в таблице](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes), каталог `shadow/N` появляется на каждом диске, хранящем части данных, соответствующие выражению `PARTITION`.
:::

Внутри резервной копии создаётся та же структура каталогов, что и внутри `/var/lib/clickhouse/`. Запрос выполняет `chmod` для всех файлов, запрещая запись в них.

После создания резервной копии вы можете скопировать данные из `/var/lib/clickhouse/shadow/` на удалённый сервер, а затем удалить их с локального сервера. Обратите внимание, что запрос `ALTER t FREEZE PARTITION` не реплицируется. Он создаёт локальную резервную копию только на локальном сервере.

Запрос создаёт резервную копию практически мгновенно (но сначала ожидает завершения выполнения текущих запросов к соответствующей таблице).

`ALTER TABLE t FREEZE PARTITION` копирует только данные, но не метаданные таблицы. Чтобы создать резервную копию метаданных таблицы, скопируйте файл `/var/lib/clickhouse/metadata/database/table.sql`

Чтобы восстановить данные из резервной копии, выполните следующие действия:

1.  Создайте таблицу, если она не существует. Чтобы просмотреть запрос, используйте файл .sql (замените в нём `ATTACH` на `CREATE`).
2.  Скопируйте данные из каталога `data/database/table/` внутри резервной копии в каталог `/var/lib/clickhouse/data/database/table/detached/`.
3.  Выполните запросы `ALTER TABLE t ATTACH PARTITION`, чтобы добавить данные в таблицу.

Восстановление из резервной копии не требует остановки сервера.

Запрос обрабатывает части параллельно, количество потоков регулируется настройкой `max_threads`.

Для получения дополнительной информации о резервном копировании и восстановлении данных см. раздел [Резервное копирование данных](/operations/backup.md).


## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

Удаляет `frozen` (замороженные) партиции с указанным именем с диска. Если предложение `PARTITION` опущено, запрос удаляет резервные копии всех партиций одновременно.


## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

Запрос работает аналогично `CLEAR COLUMN`, но сбрасывает индекс, а не данные столбца.


## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

Загружает партицию с другого сервера. Этот запрос работает только для реплицируемых таблиц.

Запрос выполняет следующие действия:

1.  Загружает партицию|часть с указанного шарда. В 'path-in-zookeeper' необходимо указать путь к шарду в ZooKeeper.
2.  Затем запрос помещает загруженные данные в директорию `detached` таблицы `table_name`. Используйте запрос [ATTACH PARTITION\|PART](#attach-partitionpart) для добавления данных в таблицу.

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

- Запрос `ALTER ... FETCH PARTITION|PART` не реплицируется. Он помещает часть или партицию в директорию `detached` только на локальном сервере.
- Запрос `ALTER TABLE ... ATTACH` реплицируется. Он добавляет данные во все реплики. Данные добавляются в одну из реплик из директории `detached`, а в остальные — с соседних реплик.

Перед загрузкой система проверяет существование партиции и соответствие структуры таблицы. Наиболее подходящая реплика автоматически выбирается из работоспособных реплик.

Несмотря на то, что запрос называется `ALTER TABLE`, он не изменяет структуру таблицы и не изменяет немедленно доступные в таблице данные.


## MOVE PARTITION\|PART {#move-partitionpart}

Перемещает партиции или части данных на другой том или диск для таблиц с движком `MergeTree`. См. [Использование нескольких блочных устройств для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes).

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

Запрос `ALTER TABLE t MOVE`:

- Не реплицируется, так как разные реплики могут иметь различные политики хранения.
- Возвращает ошибку, если указанный диск или том не настроен. Запрос также возвращает ошибку, если не могут быть применены условия перемещения данных, указанные в политике хранения.
- Может вернуть ошибку в случае, если данные, которые необходимо переместить, уже были перемещены фоновым процессом, параллельным запросом `ALTER TABLE t MOVE` или в результате фонового слияния данных. В этом случае пользователю не требуется выполнять какие-либо дополнительные действия.

Пример:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```


## UPDATE IN PARTITION {#update-in-partition}

Изменяет данные в указанной партиции, соответствующие заданному условию фильтрации. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### Пример {#example}

```sql
-- используя имя партиции
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- используя идентификатор партиции
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### См. также {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)


## DELETE IN PARTITION {#delete-in-partition}

Удаляет данные в указанной партиции, соответствующие заданному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### Пример {#example-1}

```sql
-- используя имя партиции
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- используя идентификатор партиции
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```


## REWRITE PARTS {#rewrite-parts}

Эта операция перезаписывает части с нуля, применяя все новые настройки. Это необходимо, поскольку настройки на уровне таблицы, такие как `use_const_adaptive_granularity`, по умолчанию применяются только к вновь создаваемым частям.

### Пример {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### См. также {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)


## Как задать выражение партиции {#how-to-set-partition-expression}

Выражение партиции в запросах `ALTER ... PARTITION` можно указать несколькими способами:

- Как значение из столбца `partition` таблицы `system.parts`. Например, `ALTER TABLE visits DETACH PARTITION 201901`.
- С помощью ключевого слова `ALL`. Оно может использоваться только с DROP/DETACH/ATTACH/ATTACH FROM. Например, `ALTER TABLE visits ATTACH PARTITION ALL`.
- Как кортеж выражений или констант, который соответствует (по типам) кортежу ключей партиционирования таблицы. В случае ключа партиционирования из одного элемента выражение должно быть обёрнуто в функцию `tuple (...)`. Например, `ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- С помощью идентификатора партиции. Идентификатор партиции — это строковый идентификатор партиции (по возможности читаемый человеком), который используется в качестве имён партиций в файловой системе и в ZooKeeper. Идентификатор партиции должен быть указан в секции `PARTITION ID` в одинарных кавычках. Например, `ALTER TABLE visits DETACH PARTITION ID '201901'`.
- В запросах [ALTER ATTACH PART](#attach-partitionpart) и [DROP DETACHED PART](#drop-detached-partitionpart) для указания имени куска используйте строковый литерал со значением из столбца `name` таблицы [system.detached_parts](/operations/system-tables/detached_parts). Например, `ALTER TABLE visits ATTACH PART '201901_1_1_0'`.

Использование кавычек при указании партиции зависит от типа выражения партиции. Например, для типа `String` необходимо указывать его имя в кавычках (`'`). Для типов `Date` и `Int*` кавычки не требуются.

Все вышеперечисленные правила также справедливы для запроса [OPTIMIZE](/sql-reference/statements/optimize.md). Если необходимо указать единственную партицию при оптимизации непартиционированной таблицы, задайте выражение `PARTITION tuple()`. Например:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` указывает партицию, к которой применяются выражения [UPDATE](/sql-reference/statements/alter/update) или [DELETE](/sql-reference/statements/alter/delete) в результате выполнения запроса `ALTER TABLE`. Новые куски создаются только из указанной партиции. Таким образом, `IN PARTITION` помогает снизить нагрузку, когда таблица разделена на множество партиций и необходимо обновить данные точечно.

Примеры запросов `ALTER ... PARTITION` продемонстрированы в тестах [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) и [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql).
