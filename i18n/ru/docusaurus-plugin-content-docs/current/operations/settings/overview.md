---
description: 'Обзор настроек.'
sidebar_position: 1
slug: /operations/settings/overview
title: 'Обзор настроек'
---


# Обзор настроек

## Обзор {#overview}

:::note
Профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files) в настоящее время не 
поддерживаются для ClickHouse Cloud. Чтобы указать настройки для вашего ClickHouse Cloud 
сервиса, вы должны использовать [SQL-управляемые профили настроек](/operations/access-rights#settings-profiles-management).
:::

Существуют две основные группы настроек ClickHouse:

- Глобальные настройки сервера
- Настройки сессии

Основное отличие между ними заключается в том, что глобальные настройки сервера применяются глобально 
для сервера ClickHouse, в то время как настройки сессии применяются к пользовательским сессиям или даже
отдельным запросам.

## Просмотр нестандартных настроек {#see-non-default-settings}

Чтобы просмотреть, какие настройки были изменены от их стандартного значения, вы можете выполнить запрос к
таблице `system.settings`:

```sql
SELECT name, value FROM system.settings WHERE changed
```

Если настройки не были изменены от их стандартного значения, ClickHouse вернет ничего.

Чтобы проверить значение конкретной настройки, вы можете указать `name` настройки в вашем запросе:

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

## Дальнейшее чтение {#further-reading}

- См. [глобальные настройки сервера](/operations/server-configuration-parameters/settings.md), чтобы узнать больше о конфигурации вашего 
  сервера ClickHouse на глобальном уровне.
- См. [настройки сессии](/operations/settings/settings-query-level.md), чтобы узнать больше о конфигурации вашего сервера ClickHouse 
  на уровне сессии.

