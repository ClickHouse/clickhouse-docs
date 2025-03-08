---
title: 'Обзор Настроек'
sidebar_position: 1
slug: /operations/settings/overview
description: 'Страница обзора настроек.'
---


# Обзор Настроек

:::note
XML-основные Профили Настроек и [файлы конфигурации](/operations/configuration-files) в настоящее время не поддерживаются для ClickHouse Cloud. Для указания настроек для вашей службы ClickHouse Cloud вы должны использовать [Профили Настроек на Основе SQL](/operations/access-rights#settings-profiles-management).
:::

Существует две основные группы настроек ClickHouse:

- Глобальные серверные настройки
- Сессионные настройки

Основное различие между ними заключается в том, что глобальные серверные настройки применяются глобально для сервера ClickHouse, в то время как сессионные настройки применяются к пользовательским сессиям или даже отдельным запросам.

Читать о [глобальных серверных настройках](/operations/server-configuration-parameters/settings.md), чтобы узнать больше о конфигурации вашего сервера ClickHouse на глобальном уровне.

Читать о [сессионных настройках](/operations/settings/settings-query-level.md), чтобы узнать больше о конфигурации вашего сервера ClickHouse на уровне сессии.

## Просмотр нестандартных настроек {#see-non-default-settings}

Чтобы просмотреть, какие настройки были изменены от их стандартного значения:

```sql
SELECT name, value FROM system.settings WHERE changed
```

Если вы не изменили никаких настроек от их стандартного значения, то ClickHouse не вернет ничего.

Чтобы проверить значение конкретной настройки, укажите `name` настройки в вашем запросе:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

Эта команда должна вернуть что-то вроде:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```
