---
slug: /operations/settings/permissions-for-queries
sidebar_position: 58
sidebar_label: Permissions for Queries
title: 'Permissions for Queries'
description: 'Settings for query permissions.'
---


# Permissions for Queries

Запросы в ClickHouse можно разделить на несколько типов:

1.  Запросы на чтение данных: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`.
2.  Запросы на запись данных: `INSERT`, `OPTIMIZE`.
3.  Запрос на изменение настроек: `SET`, `USE`.
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) запросы: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP`, `TRUNCATE`.
5.  `KILL QUERY`.

Следующие настройки регулируют права пользователей в зависимости от типа запроса:

## readonly {#readonly}
Ограничивает права на чтение данных, запись данных и изменение настроек.

При установленном значении 1, разрешает:

- Все типы запросов на чтение (такие как SELECT и эквивалентные запросы).
- Запросы, которые меняют только контекст сессии (такие как USE).

При установленном значении 2, разрешает вышеуказанное плюс:
- SET и CREATE TEMPORARY TABLE

  :::tip
  Запросы, такие как EXISTS, DESCRIBE, EXPLAIN, SHOW PROCESSLIST и т.д. эквивалентны SELECT, потому что они просто выполняют выборку из системных таблиц.
  :::

Возможные значения:

- 0 — Запросы на Чтение, Запись и Изменение настроек разрешены.
- 1 — Разрешены только запросы на Чтение данных.
- 2 — Разрешены запросы на Чтение данных и Изменение настроек.

Значение по умолчанию: 0

:::note
После установки `readonly = 1`, пользователь не может изменять настройки `readonly` и `allow_ddl` в текущей сессии.

При использовании метода `GET` в [HTTP интерфейсе](../../interfaces/http.md) `readonly = 1` устанавливается автоматически. Для изменения данных используйте метод `POST`.

Установка `readonly = 1` запрещает пользователю изменять настройки. Существует способ запретить пользователю изменять только определенные настройки. Также есть способ разрешить изменение только конкретных настроек при ограничениях `readonly = 1`. Для деталей смотрите [constraints on settings](../../operations/settings/constraints-on-settings.md).
:::


## allow_ddl {#allow_ddl}

Разрешает или запрещает [DDL](https://en.wikipedia.org/wiki/Data_definition_language) запросы.

Возможные значения:

- 0 — DDL запросы не разрешены.
- 1 — DDL запросы разрешены.

Значение по умолчанию: 1

:::note
Вы не можете выполнить `SET allow_ddl = 1`, если `allow_ddl = 0` для текущей сессии.
:::


:::note KILL QUERY
`KILL QUERY` может быть выполнен с любым сочетанием настроек readonly и allow_ddl.
:::
