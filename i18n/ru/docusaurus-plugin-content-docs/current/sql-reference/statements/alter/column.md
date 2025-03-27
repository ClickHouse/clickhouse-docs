---
description: 'Документация для Столбцов'
sidebar_label: 'СТОЛБЕЦ'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: 'Манипуляции со Столбцами'
---

Набор запросов, позволяющих изменять структуру таблицы.

Синтаксис:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

В запросе указывается список из одного или нескольких действий, разделенных запятыми. Каждое действие — это операция со столбцом.

Поддерживаются следующие действия:

- [ADD COLUMN](#add-column) — Добавляет новый столбец в таблицу.
- [DROP COLUMN](#drop-column) — Удаляет столбец.
- [RENAME COLUMN](#rename-column) — Переименовывает существующий столбец.
- [CLEAR COLUMN](#clear-column) — Сбрасывает значения столбца.
- [COMMENT COLUMN](#comment-column) — Добавляет текстовый комментарий к столбцу.
- [MODIFY COLUMN](#modify-column) — Изменяет тип столбца, выражение по умолчанию, TTL и настройки столбца.
- [MODIFY COLUMN REMOVE](#modify-column-remove) — Удаляет одно из свойств столбца.
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - Изменяет настройки столбца.
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - Сбрасывает настройки столбца.
- [MATERIALIZE COLUMN](#materialize-column) — Материализует столбец в частях, где столбец отсутствует.
Эти действия описаны подробно ниже.

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

Добавляет новый столбец в таблицу с указанным `name`, `type`, [`codec`](../create/table.md/#column_compression_codec) и `default_expr` (см. раздел [Выражения по умолчанию](/sql-reference/statements/create/table#default_values)).

Если включена клаузула `IF NOT EXISTS`, запрос не вернет ошибку, если столбец уже существует. Если вы укажете `AFTER name_after` (имя другого столбца), столбец добавляется после указанного в списке столбцов таблицы. Если вы хотите добавить столбец в начало таблицы, используйте клаузулу `FIRST`. В противном случае столбец добавляется в конец таблицы. Для цепочки действий `name_after` может быть именем столбца, который добавляется в одном из предыдущих действий.

Добавление столбца изменяет только структуру таблицы, не выполняя никаких действий с данными. Данные не появляются на диске после `ALTER`. Если данные отсутствуют для столбца при считывании из таблицы, они заполняются значениями по умолчанию (выполняя выражение по умолчанию, если оно есть, или используя нули или пустые строки). Столбец появляется на диске после слияния частей данных (см. [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)).

Такой подход позволяет завершить запрос `ALTER` мгновенно, не увеличивая объем старых данных.

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

Удаляет столбец с именем `name`. Если указана клаузула `IF EXISTS`, запрос не вернет ошибку, если столбец не существует.

Удаляет данные из файловой системы. Поскольку это удаление целых файлов, запрос выполняется почти мгновенно.

:::tip
Вы не можете удалить столбец, если он ссылается на [материализованный вид](/sql-reference/statements/create/view). В противном случае будет возвращена ошибка.
:::

Пример:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

Переименовывает столбец `name` в `new_name`. Если указана клаузула `IF EXISTS`, запрос не вернет ошибку, если столбец не существует. Поскольку переименование не затрагивает исходные данные, запрос завершается почти мгновенно.

**ПРИМЕЧАНИЕ**: Столбцы, указанные в выражении ключа таблицы (либо с `ORDER BY`, либо с `PRIMARY KEY`), не могут быть переименованы. Попытка изменить эти столбцы приведет к `SQL Error [524]`.

Пример:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

Сбрасывает все данные в столбце для указанного раздела. Подробнее о том, как задать имя раздела, читайте в разделе [Как установить выражение для раздела](../alter/partition.md/#how-to-set-partition-expression).

Если указана клаузула `IF EXISTS`, запрос не вернет ошибку, если столбец не существует.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

Добавляет комментарий к столбцу. Если указана клаузула `IF EXISTS`, запрос не вернет ошибку, если столбец не существует.

Каждый столбец может иметь один комментарий. Если комментарий уже существует для столбца, новый комментарий перезаписывает предыдущий.

Комментарии хранятся в столбце `comment_expression`, возвращаемом запросом [DESCRIBE TABLE](/sql-reference/statements/describe-table.md).

Пример:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'Этот столбец показывает браузер, используемый для доступа к сайту.'
```

## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

Этот запрос изменяет свойства столбца `name`:

- Тип

- Выражение по умолчанию

- Кодек сжатия

- TTL

- Настройки на уровне столбца

Для примеров изменения кодеков сжатия столбцов смотрите [Кодеки сжатия столбцов](../create/table.md/#column_compression_codec).

Для примеров изменения TTL столбцов смотрите [TTL столбца](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl).

Для примеров изменения настроек на уровне столбца смотрите [Настройки на уровне столбца](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings).

Если указана клаузула `IF EXISTS`, запрос не вернет ошибку, если столбец не существует.

При изменении типа значения преобразуются так, как если бы функции [toType](/sql-reference/functions/type-conversion-functions.md) были применены к ним. Если изменяется только выражение по умолчанию, запрос не выполняет никаких сложных действий и завершается почти мгновенно.

Пример:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

Изменение типа столбца — это единственное сложное действие, поскольку оно изменяет содержимое файлов с данными. Для больших таблиц это может занять много времени.

Запрос также может изменить порядок столбцов, используя клаузу `FIRST | AFTER`, смотрите описание [ADD COLUMN](#add-column), но тип столбца обязателен в этом случае.

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

Запрос `ALTER` является атомарным. Для таблиц MergeTree он также не блокирует.

Запрос `ALTER` для изменения столбцов реплицируется. Инструкции сохраняются в ZooKeeper, после чего каждая реплика применяет их. Все запросы `ALTER` выполняются в одном и том же порядке. Запрос ждет завершения соответствующих действий на других репликах. Тем не менее, запрос на изменение столбцов в реплицированной таблице может быть прерван, и все действия будут выполняться асинхронно.

## MODIFY COLUMN REMOVE {#modify-column-remove}

Удаляет одно из свойств столбца: `DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**Пример**

Удалить TTL:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**См. Также**

- [REMOVE TTL](ttl.md).

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

Изменить настройку столбца.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**Пример**

Изменить `max_compress_block_size` столбца на `1MB`:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

Сбросить настройку столбца, также удаляет декларацию настройки в выражении столбца запроса CREATE таблицы.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**Пример**

Сбросить настройку столбца `max_compress_block_size` на значение по умолчанию:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

Материализует столбец с выражением значения `DEFAULT` или `MATERIALIZED`. При добавлении материализованного столбца с помощью `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED`, существующие строки без материализованных значений не заполняются автоматически. Инструкция `MATERIALIZE COLUMN` может быть использована для переписывания существующих данных столбца после того, как выражение `DEFAULT` или `MATERIALIZED` было добавлено или обновлено (что обновляет только метаданные, но не изменяет существующие данные). Обратите внимание, что материализация столбца в ключе сортировки является недопустимой операцией, поскольку это может нарушить порядок сортировки.
Реализован как [мутация](/sql-reference/statements/alter/index.md#mutations).

Для столбцов с новым или обновленным выражением значения `MATERIALIZED`, все существующие строки переписываются.

Для столбцов с новым или обновленным выражением значения `DEFAULT` поведение зависит от версии ClickHouse:
- В ClickHouse < v24.2 все существующие строки переписываются.
- ClickHouse >= v24.2 различает, было ли значение строки в столбце с выражением значения `DEFAULT` явно указано при его вставке или нет, т.е. вычислено из выражения значения `DEFAULT`. Если значение было явно указано, ClickHouse оставляет его без изменений. Если значение было вычислено, ClickHouse изменяет его на новое или обновленное выражение значения `MATERIALIZED`.

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- Если вы укажете PARTITION, столбец будет материализирован только с указанным разделом.

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

**См. Также**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).

## Ограничения {#limitations}

Запрос `ALTER` позволяет вам создавать и удалять отдельные элементы (столбцы) в вложенных структурах данных, но не целые вложенные структуры данных. Чтобы добавить вложенную структуру данных, вы можете добавить столбцы с именем, например, `name.nested_name` и типом `Array(T)`. Вложенная структура данных эквивалентна нескольким столбцов массива с именем, имеющим один и тот же префикс перед точкой.

Нет поддержки удаления столбцов в первичном ключе или ключе выборки (столбцы, которые используются в выражении `ENGINE`). Изменение типа столбцов, включенных в первичный ключ, возможно только в том случае, если это изменение не вызовет модификации данных (например, разрешено добавлять значения в Enum или изменять тип с `DateTime` на `UInt32`).

Если запрос `ALTER` не достаточен для внесения необходимых изменений в таблицу, вы можете создать новую таблицу, скопировать данные в нее с помощью запроса [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select), затем переключить таблицы с помощью запроса [RENAME](/sql-reference/statements/rename.md/#rename-table) и удалить старую таблицу.

Запрос `ALTER` блокирует все чтения и записи для таблицы. Другими словами, если в момент выполнения запроса `ALTER` запущен долгий `SELECT`, запрос `ALTER` будет ждать его завершения. В то же время все новые запросы к той же таблице будут ждать, пока выполняется этот `ALTER`. 

Для таблиц, которые не хранят данные сами по себе (таких как [Merge](/sql-reference/statements/alter/index.md) и [Distributed](/sql-reference/statements/alter/index.md)), `ALTER` просто изменяет структуру таблицы и не изменяет структуру подчиненных таблиц. Например, при выполнении ALTER для `Distributed` таблицы вам также нужно будет выполнить `ALTER` для таблиц на всех удаленных серверах.
