---
slug: /guides/developer/mutations
sidebar_label: 'Обновление и удаление данных'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', 'mutations']
title: 'Обновление и удаление данных в ClickHouse'
description: 'Описывает, как выполнять операции обновления и удаления данных в ClickHouse'
show_related_blogs: false
doc_type: 'guide'
---



# Обновление и удаление данных ClickHouse с помощью мутаций

Хотя ClickHouse ориентирован на высоконагруженные аналитические сценарии, в некоторых случаях можно изменять или 
удалять уже существующие данные. Эти операции называются «мутациями» и выполняются с помощью команды `ALTER TABLE`.

:::tip
Если вам нужно часто выполнять обновления, рассмотрите использование [дедупликации](../developer/deduplication.md) в ClickHouse, которая позволяет обновлять 
и/или удалять строки без создания события мутации. Либо используйте [облегчённые обновления](/docs/sql-reference/statements/update)
или [облегчённые удаления](/guides/developer/lightweight-delete)
:::



## Обновление данных {#updating-data}

Используйте команду `ALTER TABLE...UPDATE` для обновления строк в таблице:

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` — новое значение для столбца, где выполняется условие `<filter_expr>`. Выражение `<expression>` должно иметь тот же тип данных, что и столбец, или приводиться к нему с помощью оператора `CAST`. Выражение `<filter_expr>` должно возвращать значение типа `UInt8` (ноль или ненулевое) для каждой строки данных. Несколько операторов `UPDATE <column>` можно объединить в одной команде `ALTER TABLE`, разделив запятыми.

**Примеры**:

1.  Такая мутация позволяет заменить `visitor_ids` новыми значениями с помощью поиска по словарю:

    ```sql
    ALTER TABLE website.clicks
    UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
    WHERE visit_date < '2022-01-01'
    ```

2.  Изменение нескольких значений в одной команде может быть эффективнее, чем выполнение нескольких команд:

    ```sql
    ALTER TABLE website.clicks
    UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
    WHERE visit_date < '2022-01-01'
    ```

3.  Мутации можно выполнять с `ON CLUSTER` для шардированных таблиц:

    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster
    UPDATE click_count = click_count / 2
    WHERE visitor_id ILIKE '%robot%'
    ```

:::note
Невозможно обновлять столбцы, которые являются частью первичного ключа или ключа сортировки.
:::


## Удаление данных {#deleting-data}

Для удаления строк используйте команду `ALTER TABLE`:

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

Выражение `<filter_expr>` должно возвращать значение типа UInt8 для каждой строки данных.

**Примеры**

1. Удаление записей, где значение столбца содержится в массиве значений:

   ```sql
   ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
   ```

2. Что изменяет этот запрос?
   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
   ```

:::note
Для удаления всех данных в таблице эффективнее использовать команду `TRUNCATE TABLE [<database].]<table>`. Эта команда также может выполняться с указанием `ON CLUSTER`.
:::

Подробнее см. на странице документации по [оператору `DELETE`](/sql-reference/statements/delete.md).


## Легковесные удаления {#lightweight-deletes}

Другой способ удаления строк — использование команды `DELETE FROM`, которая называется **легковесным удалением**. Удаленные строки немедленно помечаются как удаленные и автоматически исключаются из всех последующих запросов, поэтому не нужно ждать слияния частей или использовать ключевое слово `FINAL`. Очистка данных происходит асинхронно в фоновом режиме.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

Например, следующий запрос удаляет все строки из таблицы `hits`, где столбец `Title` содержит текст `hello`:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

Несколько замечаний о легковесных удалениях:

- Эта функция доступна только для семейства движков таблиц `MergeTree`.
- Легковесные удаления по умолчанию синхронны и ожидают обработки удаления всеми репликами. Поведение управляется настройкой [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync).
