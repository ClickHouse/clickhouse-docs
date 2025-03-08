---
slug: /guides/developer/mutations
sidebar_label: Обновление и удаление данных
sidebar_position: 1
keywords: ['update', 'delete', 'mutation']
---


# Обновление и удаление данных ClickHouse

Хотя ClickHouse ориентирован на высоконагруженные аналитические задачи, в некоторых случаях возможно модифицировать или удалить существующие данные. Эти операции называются "мутациями" и выполняются с помощью команды `ALTER TABLE`. Вы также можете `DELETE` строку, используя возможность легкого удаления в ClickHouse.

:::tip
Если вам нужно часто обновлять данные, рассмотрите возможность использования [удаления дубликатов](../developer/deduplication.md) в ClickHouse, что позволяет вам обновлять и/или удалять строки без создания события мутации.
:::

## Обновление данных {#updating-data}

Используйте команду `ALTER TABLE...UPDATE` для обновления строк в таблице:

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` — новое значение для колонки, для которой выполняется `<filter_expr>`. `<expression>` должен иметь тот же тип данных, что и колонка, или быть конвертируемым в тот же тип данных с помощью оператора `CAST`. `<filter_expr>` должен возвращать значение `UInt8` (ноль или неноль) для каждой строки данных. Несколько операторов `UPDATE <column>` могут быть объединены в одной команде `ALTER TABLE`, разделенные запятыми.

**Примеры**:

 1. Мутация, подобная этой, позволяет обновить `visitor_ids`, заменяя их новыми с использованием словаря:

     ```sql
     ALTER TABLE website.clicks
     UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
     WHERE visit_date < '2022-01-01'
     ```

2. Модификация нескольких значений в одной команде может быть более эффективной, чем несколько команд:

     ```sql
     ALTER TABLE website.clicks
     UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
     WHERE visit_date < '2022-01-01'
     ```

3. Мутации могут выполняться `ON CLUSTER` для шардированных таблиц:

     ```sql
     ALTER TABLE clicks ON CLUSTER main_cluster
     UPDATE click_count = click_count / 2
     WHERE visitor_id ILIKE '%robot%'
     ```

:::note
Невозможно обновить колонки, которые являются частью первичного или сортировочного ключа.
:::

## Удаление данных {#deleting-data}

Используйте команду `ALTER TABLE` для удаления строк:

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` должен возвращать значение UInt8 для каждой строки данных.

**Примеры**

1. Удалить любые записи, где колонка находится в массиве значений:
    ```sql
    ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
    ```

2. Что изменяет этот запрос?
    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
    ```

:::note
Для удаления всех данных из таблицы более эффективно использовать команду `TRUNCATE TABLE [<database>.]<table>`. Эта команда также может быть выполнена `ON CLUSTER`.
:::

Посмотрите на [`DELETE` statement](/sql-reference/statements/delete.md) для получения более подробной информации.

## Легкие удаления {#lightweight-deletes}

Другим вариантом для удаления строк является использование команды `DELETE FROM`, которая называется **легким удалением**. Удаленные строки немедленно помечаются как удаленные и автоматически фильтруются из всех последующих запросов, поэтому вам не нужно ждать слияния частей или использовать ключевое слово `FINAL`. Очистка данных происходит асинхронно в фоновом режиме.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

Например, следующий запрос удаляет все строки из таблицы `hits`, где колонка `Title` содержит текст `hello`:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

Несколько замечаний о легких удалениях:
- Эта функция доступна только для семейства таблиц `MergeTree`.
- Легкие удаления асинхронны по умолчанию. Установите `mutations_sync` равным 1, чтобы дождаться обработки оператора одной репликой, и установите `mutations_sync` равным 2, чтобы дождаться обработки всех реплик.
