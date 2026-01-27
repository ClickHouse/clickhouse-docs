---
description: 'Документация по разделам (Partition)'
sidebar_label: 'PARTITION'
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: 'Управление разделами и частями'
doc_type: 'reference'
---

Доступны следующие операции с [разделами](/engines/table-engines/mergetree-family/custom-partitioning-key.md):

* [DETACH PARTITION|PART](#detach-partitionpart) — Перемещает раздел или часть в каталог `detached` и «забывает» о нем.
* [DROP PARTITION|PART](#drop-partitionpart) — Удаляет раздел или часть.
* [DROP DETACHED PARTITION|PART](#drop-detached-partitionpart) — Удаляет часть или все части раздела из `detached`.
* [FORGET PARTITION](#forget-partition) — Удаляет метаданные раздела из ZooKeeper, если он пуст.
* [ATTACH PARTITION|PART](#attach-partitionpart) — Добавляет раздел или часть из каталога `detached` в таблицу.
* [ATTACH PARTITION FROM](#attach-partition-from) — Копирует раздел данных из одной таблицы в другую и добавляет его.
* [REPLACE PARTITION](#replace-partition) — Копирует раздел данных из одной таблицы в другую и заменяет им существующий.
* [MOVE PARTITION TO TABLE](#move-partition-to-table) — Перемещает раздел данных из одной таблицы в другую.
* [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — Сбрасывает значение указанного столбца в разделе.
* [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — Сбрасывает указанный вторичный индекс в разделе.
* [FREEZE PARTITION](#freeze-partition) — Создает резервную копию раздела.
* [UNFREEZE PARTITION](#unfreeze-partition) — Удаляет резервную копию раздела.
* [FETCH PARTITION|PART](#fetch-partitionpart) — Загружает часть или раздел с другого сервера.
* [MOVE PARTITION|PART](#move-partitionpart) — Перемещает раздел или часть данных на другой диск или том.
* [UPDATE IN PARTITION](#update-in-partition) — Обновляет данные внутри раздела по условию.
* [DELETE IN PARTITION](#delete-in-partition) — Удаляет данные внутри раздела по условию.
* [REWRITE PARTS](#rewrite-parts) — Полностью перезаписывает части в таблице (или в указанном разделе).

{/* */ }


## DETACH PARTITION|PART \{#detach-partitionpart\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

Перемещает все данные для указанной партиции в директорию `detached`. Сервер «забывает» об этой отделённой партиции данных, как будто она не существует. Сервер не будет учитывать эти данные, пока вы не выполните запрос [ATTACH](#attach-partitionpart).

Пример:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

Подробнее о задании выражения секционирования см. в разделе [How to set the partition expression](#how-to-set-partition-expression).

После выполнения запроса вы можете сделать с данными в каталоге `detached` всё, что угодно — удалить их из файловой системы или просто оставить.

Этот запрос является реплицируемым — он перемещает данные в каталог `detached` на всех репликах. Учтите, что выполнять этот запрос можно только на реплике-лидере. Чтобы узнать, является ли реплика лидером, выполните запрос `SELECT` к таблице [system.replicas](/operations/system-tables/replicas). В качестве альтернативы можно просто выполнить запрос `DETACH` на всех репликах — все реплики, кроме реплик-лидеров (так как допускается несколько лидеров), выбросят исключение.


## DROP PARTITION|PART \{#drop-partitionpart\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

Удаляет указанную партицию таблицы. Этот запрос помечает партицию как неактивную и полностью удаляет данные примерно за 10 минут.

Подробнее о настройке выражения партиционирования см. в разделе [How to set the partition expression](#how-to-set-partition-expression).

Запрос реплицируемый — он удаляет данные на всех репликах.

Пример:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```


## DROP DETACHED PARTITION|PART — удаление отсоединённой партиции/части \{#drop-detached-partitionpart\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

Удаляет указанную часть или все части указанного раздела из `detached`.
Подробнее о настройке выражения партиционирования см. в разделе [How to set the partition expression](#how-to-set-partition-expression).


## FORGET PARTITION \{#forget-partition\}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

Удаляет из ZooKeeper все метаданные о пустом разделе (partition). Запрос завершится ошибкой, если раздел не пустой или неизвестен. Убедитесь, что выполняете его только для разделов, которые больше никогда не будут использоваться.

О настройке выражения секционирования читайте в разделе [How to set the partition expression](#how-to-set-partition-expression).

Пример:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```


## ATTACH PARTITION|PART \{#attach-partitionpart\}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

Добавляет данные в таблицу из каталога `detached`. Можно добавить данные для целого раздела (partition) или для отдельной части (part). Примеры:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

Подробнее о задании выражения партиционирования см. в разделе [Как задать выражение партиционирования](#how-to-set-partition-expression).

Этот запрос реплицируется. Реплика-инициатор проверяет, есть ли данные в каталоге `detached`.
Если данные есть, запрос проверяет их целостность. Если всё корректно, запрос добавляет данные в таблицу.

Если реплика, не являющаяся инициатором, при получении команды `ATTACH` находит часть с корректными контрольными суммами в своём каталоге `detached`, она подключает эту часть, не запрашивая её с других реплик.
Если части с корректными контрольными суммами нет, данные скачиваются с любой реплики, у которой есть эта часть.

Вы можете поместить данные в каталог `detached` на одной реплике и использовать запрос `ALTER ... ATTACH`, чтобы добавить их в таблицу на всех репликах.


## ATTACH PARTITION FROM — присоединение раздела \{#attach-partition-from\}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

Этот запрос копирует раздел данных из `table1` в `table2`.

Обратите внимание:

* Данные не будут удалены ни из `table1`, ни из `table2`.
* `table1` может быть временной таблицей.

Чтобы запрос успешно выполнился, должны быть выполнены следующие условия:

* Обе таблицы должны иметь одинаковую структуру.
* Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ ORDER BY и одинаковый первичный ключ.
* Обе таблицы должны иметь одинаковую политику хранения.
* Таблица назначения должна включать все индексы и проекции из исходной таблицы. Если в таблице назначения включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае таблица назначения может содержать надмножество индексов и проекций по сравнению с исходной таблицей.


## REPLACE PARTITION — замена раздела \{#replace-partition\}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

Этот запрос копирует раздел из `table1` в `table2` и заменяет существующий раздел в `table2`. Операция является атомарной.

Обратите внимание:

* Данные не будут удалены из `table1`.
* `table1` может быть временной таблицей.

Для успешного выполнения запроса должны быть выполнены следующие условия:

* Обе таблицы должны иметь одинаковую структуру.
* Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ ORDER BY и одинаковый первичный ключ.
* Обе таблицы должны иметь одинаковую политику хранения.
* Таблица назначения должна включать все индексы и проекции из исходной таблицы. Если в таблице назначения включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичными. В противном случае таблица назначения может содержать надмножество индексов и проекций по сравнению с исходной таблицей.


## ПЕРЕМЕЩЕНИЕ РАЗДЕЛА В ТАБЛИЦУ \{#move-partition-to-table\}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

Этот запрос перемещает раздел данных из `table_source` в `table_dest`, при этом данные удаляются из `table_source`.

Для успешного выполнения запроса должны выполняться следующие условия:

* Обе таблицы должны иметь одинаковую структуру.
* Обе таблицы должны иметь одинаковый ключ партиционирования, одинаковый ключ ORDER BY и одинаковый первичный ключ.
* Обе таблицы должны иметь одинаковую политику хранения.
* Обе таблицы должны относиться к одному семейству движков (реплицируемые или нереплицируемые).
* Целевая таблица должна включать все индексы и проекции исходной таблицы. Если в целевой таблице включена настройка `enforce_index_structure_match_on_partition_manipulation`, индексы и проекции должны быть идентичны. В противном случае целевая таблица может содержать надмножество индексов и проекций исходной таблицы.


## Очистка столбца в разделе \{#clear-column-in-partition\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

Сбрасывает все значения в указанном столбце в разделе. Если при создании таблицы была задана секция `DEFAULT`, этот запрос устанавливает значение столбца в указанное значение по умолчанию.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```


## FREEZE PARTITION \{#freeze-partition\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

Этот запрос создает локальную резервную копию указанной партиции. Если предложение `PARTITION` опущено, запрос создает резервную копию всех партиций сразу.

:::note
Весь процесс создания резервной копии выполняется без остановки сервера.
:::

Обратите внимание, что для таблиц старого формата вы можете указать префикс имени партиции (например, `2019`) — тогда запрос создаст резервную копию для всех соответствующих партиций. Подробнее о задании выражения партиционирования см. в разделе [How to set the partition expression](#how-to-set-partition-expression).

В момент выполнения, для получения снимка данных, запрос создает жесткие ссылки (hardlinks) на данные таблицы. Жесткие ссылки размещаются в каталоге `/var/lib/clickhouse/shadow/N/...`, где:

* `/var/lib/clickhouse/` — рабочий каталог ClickHouse, указанный в конфигурации.
* `N` — инкрементальный номер резервной копии.
* если указан параметр `WITH NAME`, то вместо инкрементального номера используется значение параметра `'backup_name'`.

:::note
Если вы используете [набор дисков для хранения данных в таблице](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes), каталог `shadow/N` появляется на каждом диске, сохраняя части данных, отобранные выражением `PARTITION`.
:::

Внутри резервной копии создается такая же структура каталогов, как и внутри `/var/lib/clickhouse/`. Запрос выполняет `chmod` для всех файлов, запрещая запись в них.

После создания резервной копии вы можете скопировать данные из `/var/lib/clickhouse/shadow/` на удаленный сервер, а затем удалить их с локального сервера. Обратите внимание, что запрос `ALTER t FREEZE PARTITION` не реплицируется. Он создает локальную резервную копию только на локальном сервере.

Запрос создает резервную копию практически мгновенно (но сначала он ожидает завершения текущих запросов к соответствующей таблице).

`ALTER TABLE t FREEZE PARTITION` копирует только данные, но не метаданные таблицы. Чтобы создать резервную копию метаданных таблицы, скопируйте файл `/var/lib/clickhouse/metadata/database/table.sql`.

Чтобы восстановить данные из резервной копии, выполните следующие действия:

1. Создайте таблицу, если она не существует. Чтобы посмотреть запрос, используйте .sql-файл (замените в нем `ATTACH` на `CREATE`).
2. Скопируйте данные из каталога `data/database/table/` внутри резервной копии в каталог `/var/lib/clickhouse/data/database/table/detached/`.
3. Выполните запросы `ALTER TABLE t ATTACH PARTITION`, чтобы добавить данные в таблицу.

Восстановление из резервной копии не требует остановки сервера.

Запрос обрабатывает части данных параллельно, количество потоков регулируется настройкой `max_threads`.

Для получения дополнительной информации о резервном копировании и восстановлении данных см. раздел [«Резервное копирование и восстановление в ClickHouse»](/operations/backup/overview).


## UNFREEZE PARTITION \{#unfreeze-partition\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

Удаляет замороженные (`frozen`) разделы с указанным именем на диске. Если клауза `PARTITION` опущена, запрос удаляет резервные копии всех разделов сразу.


## ОЧИСТКА ИНДЕКСА В РАЗДЕЛЕ \{#clear-index-in-partition\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

Запрос работает аналогично `CLEAR COLUMN`, но сбрасывает индекс, а не данные столбца.


## FETCH PARTITION|PART \{#fetch-partitionpart\}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

Загружает партицию с другого сервера. Этот запрос работает только для реплицируемых таблиц.

Запрос выполняет следующее:

1. Загружает партицию|кусок (`partition|part`) с указанного сегмента. В `path-in-zookeeper` необходимо указать путь к этому сегменту в ZooKeeper.
2. Затем запрос помещает загруженные данные в директорию `detached` таблицы `table_name`. Используйте запрос [ATTACH PARTITION|PART](#attach-partitionpart), чтобы добавить данные в таблицу.

Например:

1. FETCH PARTITION

```sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```

2. ПОЛУЧЕНИЕ ЧАСТИ

```sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

Обратите внимание:

* Запрос `ALTER ... FETCH PARTITION|PART` не реплицируется. Он помещает партицию или часть в директорию `detached` только на локальном сервере.
* Запрос `ALTER TABLE ... ATTACH` реплицируется. Он добавляет данные на все реплики. Данные добавляются на одну из реплик из директории `detached`, а на остальные — с других реплик.

Перед загрузкой данных система проверяет, существует ли партиция и соответствует ли структура таблицы. Наиболее подходящая реплика автоматически выбирается из работоспособных реплик.

Хотя запрос называется `ALTER TABLE`, он не изменяет структуру таблицы и не приводит к немедленному изменению данных, доступных в таблице.


## MOVE PARTITION|PART \{#move-partitionpart\}

Перемещает партиции или части данных на другой том или диск для таблиц с движком `MergeTree`. См. [Использование нескольких блочных устройств для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes).

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

Запрос `ALTER TABLE t MOVE`:

* Не реплицируется, так как у разных реплик могут быть разные политики хранения.
* Возвращает ошибку, если указанный диск или том не настроен. Запрос также возвращает ошибку, если не могут быть применены условия перемещения данных, указанные в политике хранения.
* Может вернуть ошибку в случае, когда данные, которые требуется переместить, уже были перемещены фоновым процессом, одновременным запросом `ALTER TABLE t MOVE` или в результате фонового слияния данных. В этом случае пользователю не нужно выполнять никаких дополнительных действий.

Пример:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```


## ОБНОВЛЕНИЕ В РАЗДЕЛЕ \{#update-in-partition\}

Изменяет данные в указанном разделе, соответствующем заданному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```


### Пример \{#example\}

```sql
-- using partition name
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```


### См. также \{#see-also\}

* [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION \{#delete-in-partition\}

Удаляет данные в указанной партиции, которые соответствуют заданному фильтрующему выражению. Операция реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```


### Пример \{#example-1\}

```sql
-- using partition name
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```


## ПЕРЕЗАПИСЬ ЧАСТЕЙ \{#rewrite-parts\}

Это перезапишет части с нуля, применяя все новые настройки. Это логично, поскольку настройки на уровне таблицы, такие как `use_const_adaptive_granularity`, по умолчанию применяются только к заново записанным частям.

### Пример \{#example-rewrite-parts\}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```


### См. также \{#see-also-1\}

* [DELETE](/sql-reference/statements/alter/delete)

## Как задать выражение разбиения (partition expression) \{#how-to-set-partition-expression\}

Вы можете задать выражение разбиения в запросах `ALTER ... PARTITION` разными способами:

* Как значение из столбца `partition` таблицы `system.parts`. Например, `ALTER TABLE visits DETACH PARTITION 201901`.
* С использованием ключевого слова `ALL`. Оно может использоваться только с DROP/DETACH/ATTACH/ATTACH FROM. Например, `ALTER TABLE visits ATTACH PARTITION ALL`.
* Как кортеж выражений или констант, который соответствует (по типам) кортежу ключей разбиения таблицы. В случае одноэлементного ключа разбиения выражение должно быть обёрнуто в функцию `tuple (...)`. Например, `ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
* С использованием идентификатора разбиения (partition ID). Partition ID — это строковый идентификатор разбиения (по возможности человекочитаемый), который используется как имя разбиения в файловой системе и в ZooKeeper. Partition ID должен быть указан в предложении `PARTITION ID` в одинарных кавычках. Например, `ALTER TABLE visits DETACH PARTITION ID '201901'`.
* В запросах [ALTER ATTACH PART](#attach-partitionpart) и [DROP DETACHED PART](#drop-detached-partitionpart), чтобы указать имя парта, используйте строковый литерал со значением из столбца `name` таблицы [system.detached&#95;parts](/operations/system-tables/detached_parts). Например, `ALTER TABLE visits ATTACH PART '201901_1_1_0'`.

Использование кавычек при указании разбиения зависит от типа выражения разбиения. Например, для типа `String` нужно указывать его значение в кавычках (`'`). Для типов `Date` и `Int*` кавычки не требуются.

Все описанные выше правила также справедливы для запроса [OPTIMIZE](/sql-reference/statements/optimize.md). Если вам нужно указать единственное разбиение при оптимизации неразбитой таблицы, задайте выражение `PARTITION tuple()`. Например:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` задает партицию, к которой применяются выражения [UPDATE](/sql-reference/statements/alter/update) или [DELETE](/sql-reference/statements/alter/delete) в результате выполнения запроса `ALTER TABLE`. Новые части создаются только из указанной партиции. Таким образом, `IN PARTITION` помогает снизить нагрузку, когда таблица разбита на множество партиций, а вам необходимо обновить данные точечно.

Примеры запросов `ALTER ... PARTITION` приведены в тестах [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) и [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql).
