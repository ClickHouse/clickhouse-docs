---
slug: '/guides/developer/mutations'
sidebar_label: 'Обновление и удаление данных'
sidebar_position: 1
description: 'Описание того, как выполнять операции обновления и удаления в ClickHouse'
title: 'Обновление и удаление данных ClickHouse'
keywords: ['обновление', 'удаление', 'мутация']
doc_type: guide
show_related_blogs: false
---
# Обновление и удаление данных ClickHouse с помощью мутаций

Хотя ClickHouse предназначен для аналитических нагрузок с высоким объемом данных, в некоторых ситуациях возможно изменять или удалять существующие данные. Эти операции обозначаются как "мутации" и выполняются с помощью команды `ALTER TABLE`.

:::tip
Если вам нужно часто обновлять данные, рассмотрите возможность использования [дедупликации](../developer/deduplication.md) в ClickHouse, которая позволяет вам обновлять и/или удалять строки без генерации события мутации. В качестве альтернативы используйте [легковесные обновления](/docs/sql-reference/statements/update) или [легковесные удаления](/guides/developer/lightweight-delete).
:::

## Обновление данных {#updating-data}

Используйте команду `ALTER TABLE...UPDATE`, чтобы обновить строки в таблице:

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` — это новое значение для колонки, для которой удовлетворено условие `<filter_expr>`. `<expression>` должен быть того же типа, что и колонка, или должен быть преобразуемым в тот же тип с помощью оператора `CAST`. `<filter_expr>` должен возвращать значение `UInt8` (ноль или ненулевое) для каждой строки данных. Несколько операторов `UPDATE <column>` могут быть объединены в одной команде `ALTER TABLE`, разделенные запятыми.

**Примеры**:

 1. Мутация, подобная этой, позволяет обновлять, заменяя `visitor_ids` новыми с помощью поиска в словаре:

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

Используйте команду `ALTER TABLE`, чтобы удалить строки:

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` должен возвращать значение UInt8 для каждой строки данных.

**Примеры**

1. Удалите любые записи, где колонка находится в массиве значений:
```sql
ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
```

2. Что изменяет этот запрос?
```sql
ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
```

:::note
Для удаления всех данных в таблице более эффективно использовать команду `TRUNCATE TABLE [<database].]<table>`. Эта команда также может быть выполнена `ON CLUSTER`.
:::

Ознакомьтесь с документом по [`DELETE` statement](/sql-reference/statements/delete.md) для получения дополнительных деталей.

## Легковесные удаления {#lightweight-deletes}

Еще один вариант удаления строк — использовать команду `DELETE FROM`, которая называется **легковесным удалением**. Удаленные строки немедленно помечаются как удаленные и будут автоматически исключены из всех последующих запросов, поэтому вам не придется ждать объединения частей или использовать ключевое слово `FINAL`. Очистка данных происходит асинхронно в фоновом режиме.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

Например, следующий запрос удаляет все строки из таблицы `hits`, где колонка `Title` содержит текст `hello`:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

Несколько примечаний о легковесных удалениях:
- Эта функция доступна только для семейства движков таблиц `MergeTree`.
- Легковесные удаления по умолчанию являются асинхронными. Установите `mutations_sync` равным 1, чтобы дождаться обработки запроса одной репликой, и установите `mutations_sync` равным 2, чтобы дождаться обработки всех реплик.