---
description: 'Настройки сеанса на уровне запроса'
sidebar_label: 'Сессионные настройки на уровне запроса'
slug: /operations/settings/query-level
title: 'Сессионные настройки на уровне запроса'
doc_type: 'reference'
---

## Обзор {#overview}

Существует несколько способов выполнения запросов с заданными настройками.
Настройки задаются на нескольких уровнях, и каждый последующий уровень переопределяет предыдущие значения параметра.

## Порядок приоритета {#order-of-priority}

Порядок приоритета для задания настройки:

1. Применение настройки непосредственно к пользователю или внутри профиля настроек

    - SQL (рекомендуется)
    - добавление одного или нескольких XML- или YAML-файлов в `/etc/clickhouse-server/users.d`

2. Настройки сессии

    - Отправьте `SET setting=value` из SQL-консоли ClickHouse Cloud или
    `clickhouse client` в интерактивном режиме. Аналогично, вы можете
    использовать сессии ClickHouse по протоколу HTTP. Для этого необходимо
    указать HTTP-параметр `session_id`.

3. Настройки запроса

    - При запуске `clickhouse client` в неинтерактивном режиме установите
    параметр запуска `--setting=value`.
    - При использовании HTTP API передавайте CGI-параметры (`URL?setting_1=value&setting_2=value...`).
    - Определите настройки в разделе
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    запроса SELECT. Значение настройки применяется только к этому запросу и
    после выполнения запроса сбрасывается к значению по умолчанию или предыдущему значению.

## Возврат настройки к значению по умолчанию

Если вы изменили настройку и хотите вернуть её к значению по умолчанию, укажите значение `DEFAULT`. Синтаксис следующий:

```sql
SET имя_настройки = DEFAULT
```

Например, по умолчанию `async_insert` имеет значение `0`. Предположим, вы измените его на `1`:

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

Ответ:

```response
┌─value──┐
│ 1      │
└────────┘
```

Следующая команда снова устанавливает его значение в 0:

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

Параметр снова установлен в значение по умолчанию:

```response
┌─value───┐
│ 0       │
└─────────┘
```


## Пользовательские настройки

В дополнение к общим [настройкам](/operations/settings/settings.md) пользователи могут задавать собственные настройки.

Имя пользовательской настройки должно начинаться с одного из предопределённых префиксов. Список этих префиксов задаётся в параметре [custom&#95;settings&#95;prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) в файле конфигурации сервера.

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

Чтобы задать пользовательскую настройку, используйте команду `SET`:

```sql
SET custom_a = 123;
```

Чтобы получить текущее значение пользовательской настройки, используйте функцию `getSetting()`:

```sql
SELECT getSetting('custom_a');
```


## Примеры {#examples}

Во всех этих примерах значение настройки `async_insert` устанавливается в `1` и демонстрируется, как просматривать настройки в работающей системе.

### Применение настройки к пользователю напрямую с помощью SQL

Это создаёт пользователя `ingester` с настройкой `async_inset = 1`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```


#### Просмотрите профиль настроек и его назначение

```sql
ПОКАЗАТЬ ДОСТУП
```

```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ ...                                                                                │
# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS async_insert = true  │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```


### Использование SQL для создания профиля настроек и назначения его пользователю

Создаётся профиль `log_ingest` с настройкой `async_inset = 1`:

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

Это создаёт пользователя `ingester` и назначает этому пользователю профиль настроек `log_ingest`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```


### Создание профиля настроек и пользователя с помощью XML

```xml title=/etc/clickhouse-server/users.d/users.xml
<clickhouse>
# highlight-start
    <profiles>
        <log_ingest>
            <async_insert>1</async_insert>
        </log_ingest>
    </profiles>
# highlight-end

    <users>
        <ingester>
            <password_sha256_hex>7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3</password_sha256_hex>
# highlight-start
            <profile>log_ingest</profile>
# highlight-end
        </ingester>
        <default replace="true">
            <password_sha256_hex>7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3</password_sha256_hex>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
        </default>
    </users>
</clickhouse>
```


#### Просмотрите профиль настроек и его назначение

```sql
ПОКАЗАТЬ ДОСТУП
```

```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ CREATE USER default IDENTIFIED WITH sha256_password                                │
# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS PROFILE log_ingest   │
│ CREATE SETTINGS PROFILE default                                                    │
# highlight-next-line
│ CREATE SETTINGS PROFILE log_ingest SETTINGS async_insert = true                    │
│ CREATE SETTINGS PROFILE readonly SETTINGS readonly = 1                             │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```


### Назначьте настройку сеансу

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```


### Назначение настройки в запросе

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```


## См. также {#see-also}

- См. страницу [Settings](/operations/settings/settings.md) с описанием настроек ClickHouse.
- [Глобальные настройки сервера](/operations/server-configuration-parameters/settings.md)