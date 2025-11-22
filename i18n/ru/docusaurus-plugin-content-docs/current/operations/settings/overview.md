---
description: 'Обзор настроек.'
sidebar_position: 1
slug: /operations/settings/overview
title: 'Обзор настроек'
doc_type: 'reference'
---



# Обзор настроек



## Обзор {#overview}

:::note
Профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files) в настоящее время не
поддерживаются для ClickHouse Cloud. Чтобы задать настройки для вашего сервиса ClickHouse Cloud,
необходимо использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management).
:::

Существует две основные группы настроек ClickHouse:

- Глобальные настройки сервера
- Настройки сеанса

Основное различие между ними заключается в том, что глобальные настройки сервера применяются глобально
к серверу ClickHouse, тогда как настройки сеанса применяются к пользовательским сеансам или даже
к отдельным запросам.


## Просмотр настроек, отличающихся от значений по умолчанию {#see-non-default-settings}

Чтобы просмотреть настройки, которые были изменены по сравнению со значениями по умолчанию, выполните запрос к таблице `system.settings`:

```sql
SELECT name, value FROM system.settings WHERE changed
```

Если ни одна настройка не была изменена, ClickHouse не вернёт никаких результатов.

Чтобы проверить значение конкретной настройки, укажите её `name` в запросе:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

Результат будет примерно следующим:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```


## Дополнительные материалы {#further-reading}

- См. [глобальные настройки сервера](/operations/server-configuration-parameters/settings.md) для получения дополнительной информации о настройке
  сервера ClickHouse на глобальном уровне.
- См. [настройки сессии](/operations/settings/settings-query-level.md) для получения дополнительной информации о настройке сервера ClickHouse
  на уровне сессии.
