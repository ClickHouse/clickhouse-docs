---
slug: '/sql-reference/statements/alter/column'
sidebar_label: COLUMN
sidebar_position: 37
description: 'Документация по Column'
title: 'Манипуляции с колонками'
doc_type: reference
---
Набор запросов, позволяющий изменять структуру таблицы.

Синтаксис:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

В запросе укажите список из одного или нескольких разделенных запятыми действий. Каждое действие — это операция с колонкой.

Поддерживаются следующие действия:

- [ADD COLUMN](#add-column) — Добавляет новую колонку в таблицу.
- [DROP COLUMN](#drop-column) — Удаляет колонку.
- [RENAME COLUMN](#rename-column) — Переименовывает существующую колонку.
- [CLEAR COLUMN](#clear-column) — Сбрасывает значения колонки.
- [COMMENT COLUMN](#comment-column) — Добавляет текстовый комментарий к колонке.
- [MODIFY COLUMN](#modify-column) — Изменяет тип колонки, значение по умолчанию, TTL и настройки колонки.
- [MODIFY COLUMN REMOVE](#modify-column-remove) — Удаляет одно из свойств колонки.
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - Изменяет настройки колонки.
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - Сбрасывает настройки колонки.
- [MATERIALIZE COLUMN](#materialize-column) — Материализует колонку в частях, где колонка отсутствует.

Эти действия описаны подробно ниже.

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

Добавляет новую колонку в таблицу с указанным `name`, `type`, [`codec`](../create/table.md/#column_compression_codec) и `default_expr` (см. раздел [Default expressions](/sql-reference/statements/create/table#default_values)).

Если включено условие `IF NOT EXISTS`, запрос не вернет ошибку, если колонка уже существует. Если вы укажете `AFTER name_after` (имя другой колонки), колонка добавляется после указанной в списке колонок таблицы. Если вы хотите добавить колонку в начало таблицы, используйте условие `FIRST`. В противном случае колонка добавляется в конец таблицы. Для цепочки действий `name_after` может быть именем колонки, добавленной в одном из предыдущих действий.

Добавление колонки просто изменяет структуру таблицы, не выполняя никаких действий с данными. Данные не появляются на диске после `ALTER`. Если данных не хватает для колонки при чтении из таблицы, они заполняются значениями по умолчанию (выполняя выражение по умолчанию, если оно есть, или используя нули или пустые строки). Колонка появляется на диске после слияния частей данных (см. [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)).

Этот подход позволяет быстро выполнить запрос `ALTER`, не увеличивая объем старых данных.

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

## DROP COLUMN {#drop-column}

```sql
DROP COLUMN [IF EXISTS] name
```

Удаляет колонку с именем `name`. Если указано условие `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

Удаляет данные из файловой системы. Поскольку это удаляет целые файлы, запрос выполняется почти мгновенно.

:::tip
Вы не можете удалить колонку, если она ссылается на [материализованное представление](/sql-reference/statements/create/view). В противном случае это приведет к ошибке.
:::

Пример:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

Переименовывает колонку `name` в `new_name`. Если указано условие `IF EXISTS`, запрос не вернет ошибку, если колонка не существует. Поскольку переименование не связано с основными данными, запрос выполняется почти мгновенно.

**ПРИМЕЧАНИЕ**: Колонки, указанные в ключевом выражении таблицы (либо с `ORDER BY`, либо с `PRIMARY KEY`), не могут быть переименованы. Попытка изменить эти колонки приведет к ошибке `SQL Error [524]`.

Пример:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

Сбрасывает все данные в колонке для указанной партиции. Подробнее о задании имени партиции читайте в разделе [How to set the partition expression](../alter/partition.md/#how-to-set-partition-expression).

Если указано условие `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

Добавляет комментарий к колонке. Если указано условие `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

Каждая колонка может иметь один комментарий. Если комментарий уже существует для колонки, новый комментарий заменяет предыдущий.

Комментарии хранятся в колонке `comment_expression`, возвращаемой запросом [DESCRIBE TABLE](/sql-reference/statements/describe-table.md).

Пример:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```

## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

Этот запрос изменяет свойства колонки `name`:

- Тип

- Выражение по умолчанию

- Кодек сжатия

- TTL

- Настройки на уровне колонки

Для примеров изменения кодеков сжатия колонок смотрите [Column Compression Codecs](../create/table.md/#column_compression_codec).

Для примеров изменения TTL колонок смотрите [Column TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl).

Для примеров изменения настроек на уровне колонок смотрите [Column-level Settings](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings).

Если указано условие `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

При изменении типа значения конвертируются так, как если бы функции [toType](/sql-reference/functions/type-conversion-functions.md) были применены к ним. Если изменяется только выражение по умолчанию, запрос не выполняет ничего сложного и завершается почти мгновенно.

Пример:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

Изменение типа колонки является единственным сложным действием – это изменяет содержимое файлов с данными. Для больших таблиц это может занять много времени.

Запрос также может изменить порядок колонок, используя условие `FIRST | AFTER`, смотрите описание [ADD COLUMN](#add-column), но тип колонки обязателен в этом случае.

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

Запрос `ALTER` является атомарным. Для таблиц MergeTree он также выполняется без блокировок.

Запрос `ALTER` для изменения колонок реплицируется. Инструкции сохраняются в ZooKeeper, а затем каждая реплика применяет их. Все запросы `ALTER` выполняются в одном и том же порядке. Запрос ждет завершения соответствующих действий на других репликах. Тем не менее, запрос на изменение колонок в реплицированной таблице может быть прерван, и все действия будут выполнены асинхронно.

:::note
Пожалуйста, будьте осторожны при изменении Nullable колонки на Non-Nullable. Убедитесь, что она не содержит NULL значений, иначе это вызовет проблемы при чтении из нее. В этом случае обходным путем будет остановить мутацию и вернуть колонку обратно к типу Nullable.
:::

## MODIFY COLUMN REMOVE {#modify-column-remove}

Удаляет одно из свойств колонки: `DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**Пример**

Удалить TTL:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**Смотрите также**

- [REMOVE TTL](ttl.md).

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

Изменяет настройку колонки.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**Пример**

Изменить `max_compress_block_size` колонки на `1MB`:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

Сбрасывает настройку колонки, также удаляет декларацию настройки в выражении колонки запроса CREATE таблицы.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**Пример**

Сбросить настройку колонки `max_compress_block_size` на значение по умолчанию:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

Материализует колонку с выражением значения `DEFAULT` или `MATERIALIZED`. При добавлении материализованной колонки с помощью `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` существующие строки без материализованных значений автоматически не заполняются. Оператор `MATERIALIZE COLUMN` может быть использован для перезаписи существующих данных в колонке после того, как выражение `DEFAULT` или `MATERIALIZED` было добавлено или обновлено (что обновляет только метаданные, но не изменяет существующие данные). Обратите внимание, что материализация колонки в ключе сортировки является недопустимой операцией, так как это может нарушить порядок сортировки. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Для колонок с новым или обновленным выражением значения `MATERIALIZED` все существующие строки перезаписываются.

Для колонок с новым или обновленным выражением значения `DEFAULT` поведение зависит от версии ClickHouse:
- В ClickHouse < v24.2 все существующие строки перезаписываются.
- ClickHouse >= v24.2 различает, было ли значение строки в колонке с выражением значения `DEFAULT` явно задано при вставке или нет, т.е. было ли оно рассчитано из выражения значения `DEFAULT`. Если значение было явно задано, ClickHouse сохраняет его как есть. Если значение было рассчитано, ClickHouse изменяет его на новое или обновленное выражение значения `MATERIALIZED`.

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- Если вы укажете PARTITION, колонка будет материализована только с указанной партицией.

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

**Смотрите также**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).

## Ограничения {#limitations}

Запрос `ALTER` позволяет вам создавать и удалять отдельные элементы (колонки) в вложенных структурах данных, но не целые вложенные структуры данных. Для добавления вложенной структуры данных вы можете добавлять колонки с именем, например `name.nested_name`, и типом `Array(T)`. Вложенная структура данных эквивалентна нескольким колонкам массивов с именем, имеющим одинаковый префикс до точки.

Нет поддержки для удаления колонок в первичном ключе или ключе выборки (колонки, которые используются в выражении `ENGINE`). Изменение типа для колонок, которые включены в первичный ключ, возможно только в том случае, если это изменение не приводит к изменению данных (например, разрешается добавлять значения в Enum или изменять тип с `DateTime` на `UInt32`).

Если запрос `ALTER` недостаточен для внесения необходимых изменений в таблицу, вы можете создать новую таблицу, скопировать в нее данные с помощью запроса [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select), затем переключить таблицы с помощью запроса [RENAME](/sql-reference/statements/rename.md/#rename-table) и удалить старую таблицу.

Запрос `ALTER` блокирует все чтения и записи для таблицы. Другими словами, если в это время выполняется длительный `SELECT`, запрос `ALTER` будет ждать его завершения. В то же время все новые запросы к той же таблице будут ждать, пока выполняется этот `ALTER`.

Для таблиц, которые не хранят данные сами по себе (таких как [Merge](/sql-reference/statements/alter/index.md) и [Distributed](/sql-reference/statements/alter/index.md)), `ALTER` просто изменяет структуру таблицы и не изменяет структуру подчиненных таблиц. Например, при выполнении `ALTER` для таблицы `Distributed` вам также потребуется выполнить `ALTER` для таблиц на всех удаленных серверах.