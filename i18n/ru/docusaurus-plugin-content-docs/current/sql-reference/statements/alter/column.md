---
description: 'Документация по столбцу'
sidebar_label: 'СТОЛБЕЦ'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: 'Операции со столбцами'
doc_type: 'reference'
---

Набор запросов, которые позволяют изменять структуру таблицы.

Синтаксис:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

В запросе укажите список из одного или нескольких действий, разделённых запятыми.
Каждое действие — это операция над столбцом.

Поддерживаются следующие действия:

* [ADD COLUMN](#add-column) — Добавляет новый столбец в таблицу.
* [DROP COLUMN](#drop-column) — Удаляет столбец.
* [RENAME COLUMN](#rename-column) — Переименовывает существующий столбец.
* [CLEAR COLUMN](#clear-column) — Сбрасывает значения столбца.
* [COMMENT COLUMN](#comment-column) — Добавляет текстовый комментарий к столбцу.
* [MODIFY COLUMN](#modify-column) — Изменяет тип столбца, выражение по умолчанию, TTL и настройки столбца.
* [MODIFY COLUMN REMOVE](#modify-column-remove) — Удаляет одно из свойств столбца.
* [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) — Изменяет настройки столбца.
* [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) — Сбрасывает настройки столбца.
* [MATERIALIZE COLUMN](#materialize-column) — Материализует столбец в частях таблицы, где этот столбец отсутствует.
  Эти действия подробно описаны ниже.

## ADD COLUMN \{#add-column\}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

Добавляет в таблицу новый столбец с указанными `name`, `type`, [`codec`](../create/table.md/#column_compression_codec) и `default_expr` (см. раздел [Выражения по умолчанию](/sql-reference/statements/create/table#default_values)).

Если указано предложение `IF NOT EXISTS`, запрос не возвращает ошибку, если столбец уже существует. Если вы задаёте `AFTER name_after` (имя другого столбца), столбец добавляется после него в списке столбцов таблицы. Если нужно добавить столбец в начало таблицы, используйте предложение `FIRST`. В противном случае столбец добавляется в конец таблицы. Для цепочки действий `name_after` может быть именем столбца, который добавляется в одном из предыдущих действий.

Добавление столбца только изменяет структуру таблицы и не выполняет никаких действий с данными. Данные не появляются на диске сразу после `ALTER`. Если при чтении из таблицы для столбца отсутствуют данные, они заполняются значениями по умолчанию (путём вычисления выражения по умолчанию, если оно есть, либо нулями или пустыми строками). Столбец появляется на диске после слияния частей данных (см. [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)).

Этот подход позволяет выполнить запрос `ALTER` мгновенно, не увеличивая объём старых данных.

Пример:

```sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

```text
Added1  UInt32
CounterID       UInt32
StartDate       Date
UserID  UInt32
VisitID UInt32
NestedColumn.A  Array(UInt8)
NestedColumn.S  Array(String)
Added2  UInt32
ToDrop  UInt32
Added3  UInt32
```

## Удаление столбца \{#drop-column\}

```sql
DROP COLUMN [IF EXISTS] name
```

Удаляет столбец с именем `name`. Если указано предложение `IF EXISTS`, запрос не завершится ошибкой, даже если столбец не существует.

Удаляет данные из файловой системы. Так как при этом удаляются целые файлы, запрос выполняется почти мгновенно.

:::tip
Нельзя удалить столбец, если на него ссылается [материализованное представление](/sql-reference/statements/create/view). В противном случае будет возвращена ошибка.
:::

Пример:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## ПЕРЕИМЕНОВАТЬ СТОЛБЕЦ \{#rename-column\}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

Переименовывает столбец `name` в `new_name`. Если указано предложение `IF EXISTS`, запрос не вернёт ошибку, даже если столбец не существует. Поскольку переименование не затрагивает исходные данные, запрос выполняется практически мгновенно.

**ПРИМЕЧАНИЕ**: Столбцы, указанные в ключевом выражении таблицы (с `ORDER BY` или `PRIMARY KEY`), не могут быть переименованы. Попытка изменить эти столбцы приведёт к ошибке `SQL Error [524]`.

Пример:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## ОЧИСТИТЬ СТОЛБЕЦ \{#clear-column\}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

Сбрасывает все данные в столбце для указанной партиции. Подробнее о задании имени партиции см. в разделе [How to set the partition expression](../alter/partition.md/#how-to-set-partition-expression).

Если указано предложение `IF EXISTS`, запрос не вернёт ошибку, если столбец не существует.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## Столбец COMMENT \{#comment-column\}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

Добавляет комментарий к столбцу. Если указана клауза `IF EXISTS`, запрос не вернёт ошибку, если столбец отсутствует.

Каждый столбец может иметь только один комментарий. Если для столбца уже существует комментарий, новый комментарий перезаписывает предыдущий.

Комментарии хранятся в столбце `comment_expression`, возвращаемом запросом [DESCRIBE TABLE](/sql-reference/statements/describe-table.md).

Пример:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```

## ИЗМЕНЕНИЕ СТОЛБЦА \{#modify-column\}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

Этот запрос изменяет свойства столбца `name`:

* Тип

* Выражение по умолчанию

* Кодек сжатия

* TTL

* Настройки на уровне столбца

Примеры изменения кодеков сжатия столбцов см. в разделе [Column Compression Codecs](../create/table.md/#column_compression_codec).

Примеры изменения TTL столбцов см. в разделе [Column TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl).

Примеры изменения настроек на уровне столбца см. в разделе [Column-level Settings](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings).

Если указана конструкция `IF EXISTS`, запрос не вернёт ошибку, если столбец не существует.

При изменении типа значения преобразуются так, как если бы к ним были применены функции [toType](/sql-reference/functions/type-conversion-functions.md). Если изменяется только выражение по умолчанию, запрос не выполняет никаких сложных операций и завершается почти мгновенно.

Пример:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

Изменение типа столбца — единственное сложное действие: оно изменяет содержимое файлов с данными. Для больших таблиц это может занять много времени.

Запрос также может изменить порядок столбцов с помощью клаузы `FIRST | AFTER`, см. описание [ADD COLUMN](#add-column), но в этом случае указание типа столбца обязательно.

Пример:

```sql
CREATE TABLE users (
    c1 Int16,
    c2 String
) ENGINE = MergeTree
ORDER BY c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴

ALTER TABLE users MODIFY COLUMN c2 String FIRST;

DESCRIBE users;
┌─name─┬─type───┬
│ c2   │ String │
│ c1   │ Int16  │
└──────┴────────┴

ALTER TABLE users ALTER COLUMN c2 TYPE String AFTER c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴
```

Запрос `ALTER` является атомарным. Для таблиц MergeTree он также не требует блокировок.

Запрос `ALTER` для изменения столбцов реплицируется. Инструкции сохраняются в ZooKeeper, после чего каждая реплика применяет их. Все запросы `ALTER` выполняются в одном и том же порядке. Запрос ожидает, пока соответствующие действия не будут завершены на других репликах. Однако запрос на изменение столбцов в реплицируемой таблице может быть прерван, и тогда все действия будут выполнены асинхронно.

:::note
Будьте осторожны при изменении столбца типа Nullable на Non-Nullable. Убедитесь, что он не содержит значений NULL, в противном случае это приведёт к проблемам при чтении из него. В таком случае обходным решением будет остановить мутацию (KILL MUTATION) и вернуть столбец к типу Nullable.
:::

## MODIFY COLUMN REMOVE \{#modify-column-remove\}

Удаляет одно из следующих свойств столбца: `DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**Пример**

Удалите TTL:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**См. также**

* [REMOVE TTL](ttl.md).

## MODIFY COLUMN MODIFY SETTING \{#modify-column-modify-setting\}

Изменяет параметр столбца.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**Пример**

Измените значение `max_compress_block_size` столбца на `1 МБ`:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING \{#modify-column-reset-setting\}

Сбрасывает настройку столбца и удаляет объявление этой настройки в определении столбца в запросе CREATE таблицы.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**Пример**

Сбросьте настройку столбца `max_compress_block_size` к значению по умолчанию:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN \{#materialize-column\}

Материализует столбец с выражением значения `DEFAULT` или `MATERIALIZED`. При добавлении материализованного столбца с помощью `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` существующие строки без материализованных значений не заполняются автоматически. Инструкцию `MATERIALIZE COLUMN` можно использовать для перезаписи данных существующего столбца после того, как выражение `DEFAULT` или `MATERIALIZED` было добавлено или обновлено (что обновляет только метаданные, но не изменяет существующие данные). Обратите внимание, что материализация столбца в ключе сортировки является недопустимой операцией, поскольку это может нарушить порядок сортировки.
Реализуется как [мутация](/sql-reference/statements/alter/index.md#mutations).

Для столбцов с новым или обновлённым выражением значения `MATERIALIZED` все существующие строки перезаписываются.

Для столбцов с новым или обновлённым выражением значения `DEFAULT` поведение зависит от версии ClickHouse:

* В ClickHouse &lt; v24.2 все существующие строки перезаписываются.
* В ClickHouse &gt;= v24.2 различается, было ли значение в строке в столбце с выражением значения `DEFAULT` явно задано при вставке или нет, то есть было вычислено из выражения значения `DEFAULT`. Если значение было явно задано, ClickHouse оставляет его без изменений. Если значение было вычислено, ClickHouse изменяет его в соответствии с новым или обновлённым выражением значения `MATERIALIZED`.

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```

* Если вы укажете PARTITION, столбец будет материализован только для указанного раздела.

**Пример**

```sql
DROP TABLE IF EXISTS tmp;
SET mutations_sync = 2;
CREATE TABLE tmp (x Int64) ENGINE = MergeTree() ORDER BY tuple() PARTITION BY tuple();
INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5;
ALTER TABLE tmp ADD COLUMN s String MATERIALIZED toString(x);

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM (select x,s from tmp order by x);

┌─groupArray(x)─┬─groupArray(s)─────────┐
│ [0,1,2,3,4]   │ ['0','1','2','3','4'] │
└───────────────┴───────────────────────┘

ALTER TABLE tmp MODIFY COLUMN s String MATERIALIZED toString(round(100/x));

INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5,5;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)──────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['0','1','2','3','4','20','17','14','12','11'] │
└───────────────────────┴────────────────────────────────────────────────┘

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)─────────────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['inf','100','50','33','25','20','17','14','12','11'] │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

**См. также**

* [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).

## Ограничения \{#limitations\}

Запрос `ALTER` позволяет создавать и удалять отдельные элементы (столбцы) во вложенных структурах данных, но не целые вложенные структуры данных. Чтобы добавить вложенную структуру данных, вы можете добавить столбцы с именем вида `name.nested_name` и типом `Array(T)`. Вложенная структура данных эквивалентна нескольким столбцам-массивам с именами с одинаковым префиксом до точки.

Не поддерживается удаление столбцов, входящих в первичный ключ или ключ выборки (столбцы, которые используются в выражении `ENGINE`). Изменение типа для столбцов, включённых в первичный ключ, возможно только в том случае, если это изменение не приводит к модификации данных (например, допускается добавлять значения в Enum или менять тип с `DateTime` на `UInt32`).

Если запроса `ALTER` недостаточно для внесения необходимых изменений в таблицу, вы можете создать новую таблицу, скопировать в неё данные с помощью запроса [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select), затем переключить таблицы с помощью запроса [RENAME](/sql-reference/statements/rename.md/#rename-table) и удалить старую таблицу.

Запрос `ALTER` блокирует все операции чтения и записи для таблицы. Другими словами, если во время выполнения запроса `ALTER` уже выполняется длительный `SELECT`, запрос `ALTER` будет ожидать его завершения. При этом все новые запросы к этой же таблице будут ожидать, пока выполняется этот `ALTER`.

Для таблиц, которые сами по себе не хранят данные (таких, как [Merge](/sql-reference/statements/alter/index.md) и [Distributed](/sql-reference/statements/alter/index.md)), `ALTER` лишь изменяет структуру таблицы и не изменяет структуру подчинённых таблиц. Например, при выполнении `ALTER` для таблицы `Distributed` вам также потребуется выполнить `ALTER` для таблиц на всех удалённых серверах.
