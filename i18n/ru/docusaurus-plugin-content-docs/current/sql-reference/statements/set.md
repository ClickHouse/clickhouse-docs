---
description: 'Документация по оператору SET'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'Оператор SET'
doc_type: 'reference'
---

# Оператор SET \\{#set-statement\\}

```sql
SET param = value
```

Присваивает значение `value` параметру `param` [настройки](/operations/settings/overview) для текущей сессии. Нельзя изменять [настройки сервера](../../operations/server-configuration-parameters/settings.md) таким способом.

Также можно задать все значения из указанного SETTINGS PROFILE одним запросом.

```sql
SET profile = 'profile-name-from-the-settings-file'
```

Для булевых настроек со значением `true` можно использовать сокращённый синтаксис, опуская указание значения. Если задано только имя настройки, она автоматически устанавливается в `1` (`true`).

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```

## Настройка параметров запроса \\{#setting-query-parameters\\}

Оператор `SET` также можно использовать для определения параметров запроса, добавляя к имени параметра префикс `param_`.
Параметры запроса позволяют писать универсальные запросы с заполнителями, которые подставляются фактическими значениями во время выполнения запроса.

```sql
SET param_name = value
```

Чтобы использовать параметр запроса, обратитесь к нему, используя синтаксис `{name: datatype}`:

```sql
SET param_id = 42;
SET param_name = 'John';

SELECT * FROM users
WHERE id = {id: UInt32}
AND name = {name: String};
```

Параметры запроса особенно полезны, когда один и тот же запрос нужно выполнить несколько раз с разными значениями.

Для более подробной информации о параметрах запроса, включая использование с типом `Identifier`, см. раздел [Определение и использование параметров запроса](../../sql-reference/syntax.md#defining-and-using-query-parameters).

Дополнительную информацию см. в разделе [Настройки](../../operations/settings/settings.md).
