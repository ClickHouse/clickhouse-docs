---
description: 'Допустимая подготовленная структура данных для использования в операциях [JOIN].'
sidebar_label: 'Объединение'
sidebar_position: 70
slug: /engines/table-engines/special/join
title: 'Движок таблиц Объединение'
---


# Движок таблиц Объединение

Допустимая подготовленная структура данных для использования в [JOIN](/sql-reference/statements/select/join) операциях.

:::note
Это не статья о самом [JOIN условии](/sql-reference/statements/select/join).
:::

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

## Параметры движка {#engine-parameters}

### join_strictness {#join_strictness}

`join_strictness` – [Строгость JOIN](/sql-reference/statements/select/join#supported-types-of-join).

### join_type {#join_type}

`join_type` – [Тип JOIN](/sql-reference/statements/select/join#supported-types-of-join).

### Ключевые столбцы {#key-columns}

`k1[, k2, ...]` – Ключевые столбцы из условия `USING`, по которым выполняется операция `JOIN`.

Введите параметры `join_strictness` и `join_type` без кавычек, например, `Join(ANY, LEFT, col1)`. Они должны соответствовать операции `JOIN`, для которой будет использоваться таблица. Если параметры не совпадают, ClickHouse не выдает исключение и может вернуть некорректные данные.

## Специфика и рекомендации {#specifics-and-recommendations}

### Хранение данных {#data-storage}

Данные таблицы `Join` всегда находятся в оперативной памяти. При вставке строк в таблицу ClickHouse записывает блоки данных в директорию на диске, чтобы их можно было восстановить при перезагрузке сервера.

Если сервер перезапускается некорректно, блок данных на диске может быть потерян или поврежден. В этом случае вам может потребоваться вручную удалить файл с поврежденными данными.

### Выборка и вставка данных {#selecting-and-inserting-data}

Вы можете использовать запросы `INSERT` для добавления данных в таблицы с движком `Join`. Если таблица была создана с `ANY` строгостью, данные для дублирующих ключей игнорируются. При `ALL` строгости все строки добавляются.

Основные сценарии использования таблиц с движком `Join` следующие:

- Разместите таблицу с правой стороны в условии `JOIN`.
- Вызовите функцию [joinGet](/sql-reference/functions/other-functions.md/#joinget), которая позволяет извлекать данные из таблицы так же, как из словаря.

### Удаление данных {#deleting-data}

Запросы `ALTER DELETE` для таблиц с движком `Join` реализуются как [мутации](/sql-reference/statements/alter/index.md#mutations). Мутация `DELETE` читает отфильтрованные данные и перезаписывает данные в оперативной памяти и на диске.

### Ограничения и настройки {#join-limitations-and-settings}

При создании таблицы применяются следующие настройки:

#### join_use_nulls {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### max_rows_in_join {#max_rows_in_join}

[max_rows_in_join](/operations/settings/query-complexity#settings-max_rows_in_join)

#### max_bytes_in_join {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/query-complexity#settings-max_bytes_in_join)

#### join_overflow_mode {#join_overflow_mode}

[join_overflow_mode](/operations/settings/query-complexity#settings-join_overflow_mode)

#### join_any_take_last_row {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)
#### join_use_nulls {#join_use_nulls-1}

#### persistent {#persistent}

Отключает долговечность для движков таблиц Join и [Set](/engines/table-engines/special/set.md).

Снижает накладные расходы на I/O. Подходит для сценариев, стремящихся к производительности и не требующих постоянства.

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

Значение по умолчанию: `1`.

Таблицы с движком `Join` нельзя использовать в операциях `GLOBAL JOIN`.

Движок `Join` позволяет указать настройку [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) в операторе `CREATE TABLE`. Запрос [SELECT](/sql-reference/statements/select/index.md) должен иметь такое же значение `join_use_nulls`.

## Примеры использования {#example}

Создание таблицы на левой стороне:

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

Создание таблицы `Join` на правой стороне:

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

В качестве альтернативы вы можете извлечь данные из таблицы `Join`, указав значение ключа объединения:

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
