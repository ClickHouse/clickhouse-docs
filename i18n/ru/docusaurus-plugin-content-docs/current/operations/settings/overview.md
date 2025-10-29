---
slug: '/operations/settings/overview'
sidebar_position: 1
description: 'Страница обзора для настройки.'
title: 'Обзор настроек'
doc_type: reference
---
# Обзор настроек

## Обзор {#overview}

:::note
Профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files) в настоящее время не 
поддерживаются для ClickHouse Cloud. Чтобы указать настройки для вашего сервиса ClickHouse Cloud, 
вы должны использовать [SQL-ориентированные профили настроек](/operations/access-rights#settings-profiles-management).
:::

Существует две основные группы настроек ClickHouse:

- Глобальные серверные настройки
- Настройки сессии

Основное отличие между ними заключается в том, что глобальные серверные настройки применяются глобально 
для сервера ClickHouse, тогда как настройки сессии применяются к пользовательским сессиям или даже
отдельным запросам.

## Просмотр нестандартных настроек {#see-non-default-settings}

Чтобы увидеть, какие настройки были изменены от их стандартного значения, вы можете выполнить запрос к таблице
`system.settings`:

```sql
SELECT name, value FROM system.settings WHERE changed
```

Если никаких настроек не было изменено от их стандартного значения, ClickHouse не вернет ничего.

Чтобы проверить значение конкретной настройки, вы можете указать `name` этой настройки в вашем запросе:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

Это вернет что-то вроде этого:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## Дополнительные материалы {#further-reading}

- См. [глобальные серверные настройки](/operations/server-configuration-parameters/settings.md), чтобы узнать больше о настройке вашего 
  сервера ClickHouse на глобальном уровне.
- См. [настройки сессии](/operations/settings/settings-query-level.md) для получения дополнительной информации о настройке вашего сервера ClickHouse 
  на уровне сессии.