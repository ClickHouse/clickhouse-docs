---
slug: /sql-reference/statements/alter/column
sidebar_position: 37
sidebar_label: КОЛОНКА
title: 'Манипуляции с колонками'
---

Набор запросов, позволяющий изменять структуру таблицы.

Синтаксис:

``` sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

В запросе укажите список из одного или нескольких действий, разделённых запятыми. Каждое действие является операцией над колонкой.

Поддерживаются следующие действия:

- [ADD COLUMN](#add-column) — Добавляет новую колонку в таблицу.
- [DROP COLUMN](#drop-column) — Удаляет колонку.
- [RENAME COLUMN](#rename-column) — Переименовывает существующую колонку.
- [CLEAR COLUMN](#clear-column) — Сбрасывает значения колонки.
- [COMMENT COLUMN](#comment-column) — Добавляет текстовый комментарий к колонке.
- [MODIFY COLUMN](#modify-column) — Изменяет тип колонки, выражение по умолчанию, TTL и настройки колонки.
- [MODIFY COLUMN REMOVE](#modify-column-remove) — Удаляет одно из свойств колонки.
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - Изменяет настройки колонки.
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - Сбрасывает настройки колонки.
- [MATERIALIZE COLUMN](#materialize-column) — Отображает колонку в частях, где колонка отсутствует.
Эти действия описаны подробно ниже.

## ADD COLUMN {#add-column}

``` sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

Добавляет новую колонку в таблицу с указанным `name`, `type`, [`codec`](../create/table.md/#column_compression_codec) и `default_expr` (см. раздел [Выражения по умолчанию](/sql-reference/statements/create/table#default_values)).

Если включен клаусула `IF NOT EXISTS`, запрос не вернет ошибку, если колонка уже существует. Если вы укажете `AFTER name_after` (имя другой колонки), колонка добавляется после указанной в списке колонок таблицы. Если вы хотите добавить колонку в начало таблицы, используйте клаусулу `FIRST`. В противном случае колонка добавляется в конец таблицы. Для цепочки действий `name_after` может быть именем колонки, добавленной в одном из предыдущих действий.

Добавление колонки просто изменяет структуру таблицы, не выполняя никаких действий с данными. Данные не появляются на диске после `ALTER`. Если данные отсутствуют для колонки при чтении из таблицы, они заполняются значениями по умолчанию (путем выполнения выражения по умолчанию, если оно есть, или с использованием нулей или пустых строк). Колонка появится на диске после слияния частей данных (см. [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)).

Этот подход позволяет заверить запрос `ALTER` мгновенно, не увеличивая объем старых данных.

Пример:

``` sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

``` text
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

``` sql
DROP COLUMN [IF EXISTS] name
```

Удаляет колонку с именем `name`. Если указана клаусула `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

Удаляет данные из файловой системы. Поскольку это удаляет целые файлы, запрос выполняется практически мгновенно.

:::tip
Вы не можете удалить колонку, если на нее ссылается [материализованное представление](/sql-reference/statements/create/view). В противном случае будет возвращена ошибка.
:::

Пример:

``` sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

``` sql
RENAME COLUMN [IF EXISTS] name to new_name
```

Переименовывает колонку `name` в `new_name`. Если указана клаусула `IF EXISTS`, запрос не вернет ошибку, если колонка не существует. Поскольку переименование не затрагивает подлежащие данные, запрос выполняется почти мгновенно.

**ПРИМЕЧАНИЕ**: Колонки, указанные в выражении ключа таблицы (либо с `ORDER BY`, либо с `PRIMARY KEY`), не могут быть переименованы. Попытка изменить эти колонки приведет к `SQL Error [524]`.

Пример:

``` sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

``` sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

Сбрасывает все данные в колонке для заданной партиции. Узнайте больше о настройке имени партиции в разделе [Как задать выражение партиции](../alter/partition.md/#how-to-set-partition-expression).

Если указана клаусула `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

Пример:

``` sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

``` sql
COMMENT COLUMN [IF EXISTS] name 'Текстовый комментарий'
```

Добавляет комментарий к колонке. Если указана клаусула `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

Каждая колонка может иметь один комментарий. Если комментарий уже существует для колонки, новый комментарий заменяет предыдущий.

Комментарии хранятся в колонке `comment_expression`, возвращаемой запросом [DESCRIBE TABLE](/sql-reference/statements/describe-table.md).

Пример:

``` sql
ALTER TABLE visits COMMENT COLUMN browser 'Эта колонка показывает браузер, использованный для доступа к сайту.'
```

## MODIFY COLUMN {#modify-column}

``` sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

Этот запрос изменяет свойства колонки `name`:

- Тип

- Выражение по умолчанию

- Кодек сжатия

- TTL

- Настройки на уровне колонки

Для примеров изменения кодеков сжатия колонок смотрите [Кодеки сжатия колонок](../create/table.md/#column_compression_codec).

Для примеров изменения TTL колонок смотрите [TTL колонок](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl).

Для примеров изменения настроек на уровне колонок смотрите [Настройки на уровне колонки](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings).

Если указана клаусула `IF EXISTS`, запрос не вернет ошибку, если колонка не существует.

При изменении типа значения конвертируются так, как если бы функции [toType](/sql-reference/functions/type-conversion-functions.md) были применены к ним. Если изменяется только выражение по умолчанию, запрос не выполняет ничего сложного и завершается практически мгновенно.

Пример:

``` sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

Изменение типа колонки является единственным сложным действием — оно изменяет содержимое файлов с данными. Для больших таблиц это может занять много времени.

Запрос также может изменить порядок колонок с использованием клаусул `FIRST | AFTER`, смотрите описание [ADD COLUMN](#add-column), но тип колонки является обязательным в этом случае.

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

Запрос `ALTER` является атомарным. Для таблиц MergeTree он также осуществляется без блокировок.

Запрос `ALTER` для изменения колонок реплицируется. Инструкции сохраняются в ZooKeeper, а затем каждая реплика применяет их. Все запросы `ALTER` выполняются в одном и том же порядке. Запрос ожидает завершения соответствующих действий на других репликах. Однако запрос на изменение колонок в реплицированной таблице может быть прерван, и все действия будут выполнены асинхронно.

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

**См. также**

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

Материализует колонку с выражением значения `DEFAULT` или `MATERIALIZED`. При добавлении материализованной колонки с помощью `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` существующие строки без материализованных значений не заполняются автоматически. Команда `MATERIALIZE COLUMN` может быть использована для переписывания существующих данных колонок после того, как выражение `DEFAULT` или `MATERIALIZED` было добавлено или обновлено (что обновляет только метаданные, но не изменяет существующие данные). Учтите, что материализация колонки в ключе сортировки является недопустимой операцией, поскольку это может нарушить порядок сортировки.
Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Для колонок с новым или обновленным выражением значения `MATERIALIZED` все существующие строки переписываются.

Для колонок с новым или обновленным выражением значения `DEFAULT` поведение зависит от версии ClickHouse:
- В ClickHouse < v24.2 все существующие строки переписываются.
- В ClickHouse >= v24.2 различает, если значение строки в колонке с выражением значения `DEFAULT` было явно указано при вставке или нет, т.е. вычислено из выражения значения `DEFAULT`. Если значение было явно указано, ClickHouse сохраняет его как есть. Если значение было вычислено, ClickHouse изменяет его на новое или обновленное выражение значения `MATERIALIZED`.

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

**См. также**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).

## Ограничения {#limitations}

Запрос `ALTER` позволяет создавать и удалять отдельные элементы (колонки) в вложенных структурах данных, но не целые вложенные структуры данных. Чтобы добавить вложенную структуру данных, вы можете добавлять колонки с именем, например `name.nested_name` и типом `Array(T)`. Вложенная структура данных эквивалентна нескольким колонкам массива с именем, имеющим один и тот же префикс перед точкой.

Нет поддержки для удаления колонок в первичном ключе или ключе выборки (колонки, используемые в выражении `ENGINE`). Изменение типа для колонок, входящих в первичный ключ, возможно только в том случае, если это изменение не приведет к модификации данных (например, вам разрешается добавлять значения в Enum или изменять тип с `DateTime` на `UInt32`).

Если запрос `ALTER` недостаточен для внесения необходимых изменений в таблицу, вы можете создать новую таблицу, скопировать в нее данные с помощью запроса [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select), затем переключить таблицы с помощью запроса [RENAME](/sql-reference/statements/rename.md/#rename-table) и удалить старую таблицу.

Запрос `ALTER` блокирует все чтения и записи для таблицы. Другими словами, если в это время выполняется длинный `SELECT`, запрос `ALTER` будет ожидать его завершения. В то же время все новые запросы к той же таблице будут ожидать, пока выполняется этот `ALTER`.

Для таблиц, которые не хранят данные сами по себе (например, [Merge](/sql-reference/statements/alter/index.md) и [Distributed](/sql-reference/statements/alter/index.md)), `ALTER` просто изменяет структуру таблицы и не меняет структуру подчиненных таблиц. Например, при выполнении ALTER для `Distributed` таблицы вам также придется выполнить `ALTER` для таблиц на всех удаленных серверах.
