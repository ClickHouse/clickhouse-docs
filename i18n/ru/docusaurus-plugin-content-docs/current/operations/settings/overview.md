---
description: 'Обзор страницы настроек.'
sidebar_position: 1
slug: /operations/settings/overview
title: 'Обзор настроек'
---


# Обзор настроек

## Обзор {#overview}

:::note
Профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files) в настоящее время не поддерживаются для ClickHouse Cloud. Чтобы указать настройки для вашего сервиса ClickHouse Cloud, вы должны использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management).
:::

Существует две основные группы настроек ClickHouse:

- Глобальные серверные настройки
- Настройки сессии

Основное различие между ними заключается в том, что глобальные серверные настройки применяются глобально для сервера ClickHouse, в то время как настройки сессии применяются к пользовательским сессиям или даже к отдельным запросам.

## Просмотр нестандартных настроек {#see-non-default-settings}

Чтобы увидеть, какие настройки были изменены от их значения по умолчанию, вы можете выполнить запрос к таблице
`system.settings`:

```sql
SELECT name, value FROM system.settings WHERE changed
```

Если никаких настроек не было изменено от их значения по умолчанию, то ClickHouse не вернёт ничего.

Чтобы проверить значение конкретной настройки, вы можете указать `name` настройки в вашем запросе:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

Что вернёт что-то вроде этого:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## Дополнительное чтение {#further-reading}

- См. [глобальные серверные настройки](/operations/server-configuration-parameters/settings.md), чтобы узнать больше о конфигурировании вашего сервера ClickHouse на глобальном уровне.
- См. [настройки сессии](/operations/settings/settings-query-level.md), чтобы узнать больше о конфигурировании вашего сервера ClickHouse на уровне сессии.
