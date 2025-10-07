---
slug: '/engines/table-engines/special/join'
sidebar_label: JOIN
sidebar_position: 70
description: 'Дополнительная подготовленная структура данных для использования в'
title: 'Движок таблиц JOIN'
doc_type: reference
---
# `Join` движок таблицы

Опциональная подготовленная структура данных для использования в операциях [JOIN](/sql-reference/statements/select/join).

:::note
Это не статья о самом [JOIN операторе](/sql-reference/statements/select/join).
:::

:::note
В ClickHouse Cloud, если ваш сервис был создан с версией ниже 25.4, вам необходимо установить совместимость как минимум на 25.4 с помощью `SET compatibility=25.4`.
:::

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

Смотрите детальное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

## Параметры движка {#engine-parameters}

### `join_strictness` {#join_strictness}

`join_strictness` – [строгость JOIN](/sql-reference/statements/select/join#supported-types-of-join).

### `join_type` {#join_type}

`join_type` – [тип JOIN](/sql-reference/statements/select/join#supported-types-of-join).

### Ключевые колонки {#key-columns}

`k1[, k2, ...]` – Ключевые колонки из оператора `USING`, с которыми выполняется операция `JOIN`.

Введите параметры `join_strictness` и `join_type` без кавычек, например, `Join(ANY, LEFT, col1)`. Они должны соответствовать операции `JOIN`, для которой будет использоваться таблица. Если параметры не совпадают, ClickHouse не вызывает исключение и может вернуть некорректные данные.

## Специфика и рекомендации {#specifics-and-recommendations}

### Хранение данных {#data-storage}

Данные таблицы `Join` всегда находятся в оперативной памяти (RAM). При вставке строк в таблицу ClickHouse записывает блоки данных в директорию на диске, чтобы их можно было восстановить при перезагрузке сервера.

Если сервер перезагружается некорректно, блок данных на диске может быть утерян или поврежден. В этом случае вам может понадобиться вручную удалить файл с поврежденными данными.

### Выбор и вставка данных {#selecting-and-inserting-data}

Вы можете использовать запросы `INSERT` для добавления данных в таблицы с движком `Join`. Если таблица была создана с строгостью `ANY`, данные для дублирующихся ключей игнорируются. При строгости `ALL` все строки добавляются.

Основные случаи использования таблиц с движком `Join` следующие:

- Поместить таблицу на правую сторону в операторе `JOIN`.
- Вызвать функцию [joinGet](/sql-reference/functions/other-functions.md/#joinget), которая позволяет извлекать данные из таблицы так же, как из словаря.

### Удаление данных {#deleting-data}

Запросы `ALTER DELETE` для таблиц с движком `Join` реализованы как [мутации](/sql-reference/statements/alter/index.md#mutations). Мутация `DELETE` читает отфильтрованные данные и перезаписывает данные в памяти и на диске.

### Ограничения и настройки {#join-limitations-and-settings}

При создании таблицы применяются следующие настройки:

#### `join_use_nulls` {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### `max_rows_in_join` {#max_rows_in_join}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### `max_bytes_in_join` {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### `join_overflow_mode` {#join_overflow_mode}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### `join_any_take_last_row` {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)

#### `join_use_nulls` {#join_use_nulls-1}

#### Постоянный {#persistent}

Отключает постоянство для движков таблиц Join и [Set](/engines/table-engines/special/set.md).

Снижает затраты на ввод-вывод. Подходит для сценариев, которые нацелены на производительность и не требуют персистентности.

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

Значение по умолчанию: `1`.

Таблицы с движком `Join` не могут использоваться в операциях `GLOBAL JOIN`.

Движок `Join` позволяет указать настройку [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) в операторе `CREATE TABLE`. Запрос [SELECT](/sql-reference/statements/select/index.md) должен иметь то же значение `join_use_nulls`.

## Примеры использования {#example}

Создание таблицы с левой стороны:

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

Создание таблицы `Join` с правой стороны:

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

Объединение таблиц:

```sql
SELECT * FROM id_val ANY LEFT JOIN id_val_join USING (id);
```

```text
┌─id─┬─val─┬─id_val_join.val─┐
│  1 │  11 │              21 │
│  2 │  12 │               0 │
│  3 │  13 │              23 │
└────┴─────┴─────────────────┘
```

В качестве альтернативы, вы можете извлечь данные из таблицы `Join`, указав значение ключа соединения:

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

Удаление строки из таблицы `Join`:

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```