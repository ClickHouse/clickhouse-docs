---
description: 'Настройки на уровне запроса'
sidebar_label: 'Настройки сессии на уровне запроса'
slug: /operations/settings/query-level
title: 'Настройки сессии на уровне запроса'
---

## Обзор {#overview}

Существует несколько способов выполнения операторов с использованием конкретных настроек. Настройки конфигурируются по уровням, и каждый следующий уровень переопределяет предыдущие значения настройки.

## Порядок приоритета {#order-of-priority}

Порядок приоритета для определения настройки следующий:

1. Применение настройки к пользователю непосредственно или в рамках профиля настроек

    - SQL (рекомендуется)
    - добавление одного или нескольких XML или YAML файлов в `/etc/clickhouse-server/users.d`

2. Настройки сессии

    - Отправьте `SET setting=value` из консоли ClickHouse Cloud SQL или `clickhouse client` в интерактивном режиме. Аналогично, вы можете использовать сессии ClickHouse в протоколе HTTP. Для этого вам нужно указать параметр `session_id` в HTTP.

3. Настройки запроса

    - При запуске `clickhouse client` в неинтерактивном режиме задайте параметр запуска `--setting=value`.
    - При использовании HTTP API передавайте параметры CGI (`URL?setting_1=value&setting_2=value...`).
    - Определите настройки в
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    клаузе запроса SELECT. Значение настройки применяется только к этому запросу
    и сбрасывается к значению по умолчанию или предыдущему значению после выполнения запроса.

## Приведение Настройки к Значению По Умолчанию {#converting-a-setting-to-its-default-value}

Если вы изменили настройку и хотите вернуть её к значению по умолчанию, установите значение на `DEFAULT`. Синтаксис выглядит так:

```sql
SET setting_name = DEFAULT
```

Например, значение по умолчанию для `async_insert` равно `0`. Предположим, вы изменили его значение на `1`:

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

Ответ будет:

```response
┌─value──┐
│ 1      │
└────────┘
```

Следующая команда возвращает его значение обратно на 0:

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

Настройка теперь опять вернулась к значению по умолчанию:

```response
┌─value───┐
│ 0       │
└─────────┘
```

## Пользовательские Настройки {#custom_settings}

В дополнение к общим [настройкам](/operations/settings/settings.md) пользователи могут определять пользовательские настройки.

Имя пользовательской настройки должно начинаться с одного из предопределённых префиксов. Список этих префиксов должен быть объявлен в параметре [custom_settings_prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) в файле конфигурации сервера.

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

Чтобы определить пользовательскую настройку, используйте команду `SET`:

```sql
SET custom_a = 123;
```

Чтобы получить текущее значение пользовательской настройки, используйте функцию `getSetting()`:

```sql
SELECT getSetting('custom_a');
```

## Примеры {#examples}

Все эти примеры устанавливают значение настройки `async_insert` на `1` и демонстрируют, как проверить настройки в работающей системе.

### Использование SQL для прямого применения настройки к пользователю {#using-sql-to-apply-a-setting-to-a-user-directly}

Это создает пользователя `ingester` с настройкой `async_insert = 1`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```

#### Проверка профиля настроек и присвоений {#examine-the-settings-profile-and-assignment}

```sql
SHOW ACCESS
```

```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ ...                                                                                │

# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS async_insert = true  │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### Использование SQL для создания профиля настроек и назначения его пользователю {#using-sql-to-create-a-settings-profile-and-assign-to-a-user}

Это создает профиль `log_ingest` с настройкой `async_insert = 1`:

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

Это создает пользователя `ingester` и присваивает ему профиль настроек `log_ingest`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```

### Использование XML для создания профиля настроек и пользователя {#using-xml-to-create-a-settings-profile-and-user}

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

#### Проверка профиля настроек и присвоений {#examine-the-settings-profile-and-assignment-1}

```sql
SHOW ACCESS
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

### Присвоение настройки сессии {#assign-a-setting-to-a-session}

```sql
SET async_insert = 1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### Присвоение настройки во время запроса {#assign-a-setting-during-a-query}

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```

## См. также {#see-also}

- Посмотрите страницу [Настройки](/operations/settings/settings.md) для описания настроек ClickHouse.
- [Глобальные настройки сервера](/operations/server-configuration-parameters/settings.md)
