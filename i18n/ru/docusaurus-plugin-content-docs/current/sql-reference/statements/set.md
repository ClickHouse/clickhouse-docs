---
description: 'Документация по оператору SET'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'Оператор SET'
doc_type: 'reference'
---

# Оператор SET \{#set-statement\}

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

## SET TIME ZONE \{#set-time-zone\}

```sql
SET TIME ZONE [=] 'timezone'
```

Устанавливает часовой пояс сеанса. Это псевдоним для `SET session_timezone = 'timezone'`, предусмотренный для совместимости с PostgreSQL и другими SQL-базами данных.

Многие SQL-клиенты, ORM и JDBC-драйверы автоматически выполняют `SET TIME ZONE` при подключении. Этот синтаксис позволяет таким инструментам работать с ClickHouse без специальных обходных решений.

```sql
SET TIME ZONE 'UTC';
SET TIME ZONE 'Europe/Amsterdam';
SET TIME ZONE 'America/New_York';

-- Verify the current session time zone
SELECT getSetting('session_timezone');
```

Значение часового пояса должно быть допустимым именем из [базы данных часовых поясов IANA](https://www.iana.org/time-zones). Недопустимое имя часового пояса приведет к ошибке.

Дополнительные сведения о настройке `session_timezone` см. в разделе [session_timezone](/operations/settings/settings#session_timezone).

## Настройка параметров запроса \{#setting-query-parameters\}

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
