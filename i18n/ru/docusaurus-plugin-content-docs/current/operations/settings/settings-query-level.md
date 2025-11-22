---
description: 'Настройки сеанса на уровне запроса'
sidebar_label: 'Настройки сеанса на уровне запроса'
slug: /operations/settings/query-level
title: 'Настройки сеанса на уровне запроса'
doc_type: 'reference'
---



## Обзор {#overview}

Существует несколько способов выполнения запросов с определёнными настройками.
Настройки задаются послойно, и каждый последующий слой переопределяет предыдущие значения настроек.


## Порядок приоритета {#order-of-priority}

Порядок приоритета при определении настроек:

1. Применение настройки непосредственно к пользователю или в профиле настроек
   - SQL (рекомендуется)
   - добавление одного или нескольких XML- или YAML-файлов в `/etc/clickhouse-server/users.d`

2. Настройки сеанса
   - Отправьте `SET setting=value` из SQL-консоли ClickHouse Cloud или
     `clickhouse client` в интерактивном режиме. Аналогичным образом можно использовать
     сеансы ClickHouse по протоколу HTTP. Для этого необходимо указать
     HTTP-параметр `session_id`.

3. Настройки запроса
   - При запуске `clickhouse client` в неинтерактивном режиме укажите
     параметр запуска `--setting=value`.
   - При использовании HTTP API передайте CGI-параметры (`URL?setting_1=value&setting_2=value...`).
   - Определите настройки в секции
     [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
     запроса SELECT. Значение настройки применяется только к данному запросу
     и сбрасывается до значения по умолчанию или предыдущего значения после выполнения запроса.


## Возврат настройки к значению по умолчанию {#converting-a-setting-to-its-default-value}

Если вы изменили настройку и хотите вернуть её к значению по умолчанию, установите значение `DEFAULT`. Синтаксис команды:

```sql
SET setting_name = DEFAULT
```

Например, значение по умолчанию для `async_insert` равно `0`. Предположим, вы изменили его на `1`:

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

Результат:

```response
┌─value──┐
│ 1      │
└────────┘
```

Следующая команда вернёт значение обратно к 0:

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

Настройка вернулась к значению по умолчанию:

```response
┌─value───┐
│ 0       │
└─────────┘
```


## Пользовательские настройки {#custom_settings}

Помимо стандартных [настроек](/operations/settings/settings.md), пользователи могут определять собственные настройки.

Имя пользовательской настройки должно начинаться с одного из предопределённых префиксов. Список этих префиксов должен быть объявлен в параметре [custom_settings_prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) в конфигурационном файле сервера.

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

Для определения пользовательской настройки используйте команду `SET`:

```sql
SET custom_a = 123;
```

Для получения текущего значения пользовательской настройки используйте функцию `getSetting()`:

```sql
SELECT getSetting('custom_a');
```


## Примеры {#examples}

Все эти примеры устанавливают значение настройки `async_insert` равным `1` и
демонстрируют, как проверить настройки в работающей системе.

### Применение настройки к пользователю напрямую с помощью SQL {#using-sql-to-apply-a-setting-to-a-user-directly}

Этот запрос создаёт пользователя `ingester` с настройкой `async_insert = 1`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```

#### Проверка профиля настроек и назначения {#examine-the-settings-profile-and-assignment}

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

### Создание профиля настроек и назначение его пользователю с помощью SQL {#using-sql-to-create-a-settings-profile-and-assign-to-a-user}

Создание профиля `log_ingest` с настройкой `async_inset = 1`:

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

Создание пользователя `ingester` и назначение ему профиля настроек `log_ingest`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```

### Создание профиля настроек и пользователя с помощью XML {#using-xml-to-create-a-settings-profile-and-user}


```xml title=/etc/clickhouse-server/users.d/users.xml
<clickhouse>
# highlight-start
    <profiles>
        <log_ingest>
            <async_insert>1</async_insert>
        </log_ingest>
    </profiles>
# highlight-end
```


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

#### Проверка профиля настроек и назначения {#examine-the-settings-profile-and-assignment-1}

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

### Назначение настройки для сеанса {#assign-a-setting-to-a-session}

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### Назначение настройки при выполнении запроса {#assign-a-setting-during-a-query}

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```


## См. также {#see-also}

- См. страницу [Настройки](/operations/settings/settings.md) с описанием настроек ClickHouse.
- [Глобальные настройки сервера](/operations/server-configuration-parameters/settings.md)
