---
slug: /guides/developer/mutations
sidebar_label: 'Обновление и удаление данных'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', 'mutations']
title: 'Обновление и удаление данных в ClickHouse'
description: 'Описывает выполнение операций обновления и удаления в ClickHouse'
show_related_blogs: false
doc_type: 'guide'
---

# Обновление и удаление данных ClickHouse с помощью мутаций \{#updating-and-deleting-clickhouse-data-with-mutations\}

Хотя ClickHouse ориентирован на аналитические нагрузки с большим объемом данных, в некоторых ситуациях можно изменять
или удалять уже существующие данные. Эти операции называются «мутациями» и выполняются с помощью команды `ALTER TABLE`.

:::tip
Если вам часто требуется обновлять данные, рассмотрите использование механизма [deduplication](../developer/deduplication.md) в ClickHouse, который позволяет обновлять
и/или удалять строки без выполнения мутаций. В качестве альтернативы используйте [lightweight updates](/docs/sql-reference/statements/update)
или [lightweight deletes](/guides/developer/lightweight-delete)
:::

## Обновление данных \{#updating-data\}

Используйте команду `ALTER TABLE...UPDATE` для обновления строк в таблице:

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`&lt;expression&gt;` — это новое значение для столбца для строк, где выполняется условие `&lt;filter_expr&gt;`. `&lt;expression&gt;` должно иметь тот же тип данных, что и столбец, или может быть приведено к тому же типу данных с помощью оператора `CAST`. `&lt;filter_expr&gt;` должно возвращать значение типа `UInt8` (ноль или ненулевое значение) для каждой строки данных. Несколько операторов `UPDATE &lt;column&gt;` могут быть объединены в одной команде `ALTER TABLE`, разделённых запятыми.

**Примеры**:

1. Такая мутация позволяет обновлять `visitor_ids`, заменяя их новыми с помощью словарного поиска:

   ```sql
     ALTER TABLE website.clicks
     UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
     WHERE visit_date < '2022-01-01'
     ```

2. Изменение нескольких значений в одной команде может быть более эффективным, чем выполнение нескольких отдельных команд:

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
Нельзя обновлять столбцы, которые входят в первичный или сортировочный ключ.
:::

## Удаление данных \{#deleting-data\}

Используйте команду `ALTER TABLE`, чтобы удалить строки:

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` должен возвращать значение типа UInt8 для каждой строки данных.

**Примеры**

1. Удалить все записи, где значение столбца содержится в массиве значений:
   ```sql
    ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
    ```

2. Что изменяет этот запрос?
   ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
    ```

:::note
Чтобы удалить все данные в таблице, будет эффективнее использовать команду `TRUNCATE TABLE [<database>.]<table>`. Эту команду также можно выполнить с модификатором `ON CLUSTER`.
:::

См. страницу документации по оператору [`DELETE`](/sql-reference/statements/delete.md) для получения дополнительных сведений.

## Легковесные удаления \{#lightweight-deletes\}

Другой вариант удаления строк — использование команды `DELETE FROM`, которая называется **легковесным удалением**. Удалённые строки помечаются как удалённые немедленно и будут автоматически исключаться из всех последующих запросов, поэтому вам не нужно ждать слияния частей или использовать ключевое слово `FINAL`. Очистка данных выполняется асинхронно в фоновом режиме.

```

For example, the following query deletes all rows from the `hits` table where the `Title` column contains the text `hello`:

```

Например, следующий запрос удаляет все строки таблицы `hits`, в которых столбец `Title` содержит текст `hello`:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

Несколько замечаний о легковесных удалениях:

* Эта функция доступна только для семейства движков таблиц `MergeTree`.
* Легковесные удаления по умолчанию выполняются синхронно, ожидая, пока все реплики обработают операцию удаления. Поведение задаётся настройкой [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync).
