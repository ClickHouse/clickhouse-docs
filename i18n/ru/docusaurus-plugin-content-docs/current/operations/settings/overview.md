---
description: 'Страница обзора настроек.'
sidebar_position: 1
slug: /operations/settings/overview
title: 'Обзор настроек'
doc_type: 'reference'
---

# Обзор настроек \{#settings-overview\}

## Обзор \{#overview\}

:::note
Профили настроек на основе XML и [конфигурационные файлы](/operations/configuration-files) в настоящее время не поддерживаются в ClickHouse Cloud. Чтобы задать настройки для вашего сервиса ClickHouse Cloud, необходимо использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management).
:::

Существуют две основные группы настроек ClickHouse:

- Глобальные настройки сервера
- Сессионные настройки

Основное различие между ними заключается в том, что глобальные настройки сервера применяются ко всему серверу ClickHouse, тогда как сессионные настройки применяются к пользовательским сеансам или даже к отдельным запросам.

## Просмотр настроек, отличающихся от значений по умолчанию \{#see-non-default-settings\}

Чтобы посмотреть, какие настройки были изменены по сравнению со значениями по умолчанию, выполните запрос к таблице
`system.settings`:

```sql
SELECT name, value FROM system.settings WHERE changed
```

Если все настройки оставлены со значениями по умолчанию, ClickHouse
ничего не вернёт.

Чтобы проверить значение конкретной настройки, вы можете указать имя
этой настройки (`name`) в запросе:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

В результате вы увидите примерно следующее:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## Дополнительные материалы \{#further-reading\}

- См. раздел [глобальные настройки сервера](/operations/server-configuration-parameters/settings.md), чтобы узнать больше о настройке 
  сервера ClickHouse на глобальном уровне.
- См. раздел [настройки сеанса](/operations/settings/settings-query-level.md), чтобы узнать больше о настройке сервера ClickHouse 
  на уровне сеанса.
