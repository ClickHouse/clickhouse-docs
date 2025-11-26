---
description: 'Настройки на уровне запроса'
sidebar_label: 'Настройки сессии на уровне запроса'
slug: /operations/settings/query-level
title: 'Настройки сессии на уровне запроса'
doc_type: 'reference'
---



## Обзор {#overview}

Существует несколько способов выполнять запросы с определёнными настройками.
Настройки задаются послойно, и каждый последующий слой переопределяет значения параметров, заданные на предыдущем.



## Порядок приоритета {#order-of-priority}

Порядок приоритета способов задания настройки:

1. Применение настройки непосредственно к пользователю или через профиль настроек

    - SQL (рекомендуется)
    - добавление одного или нескольких XML- или YAML-файлов в `/etc/clickhouse-server/users.d`

2. Параметры сессии

    - Отправьте `SET setting=value` из SQL-консоли ClickHouse Cloud или
    `clickhouse client` в интерактивном режиме. Аналогичным образом можно
    использовать сессии ClickHouse в протоколе HTTP. Для этого необходимо указать
    HTTP-параметр `session_id`.

3. Параметры запроса

    - При запуске `clickhouse client` в неинтерактивном режиме задайте
    параметр запуска `--setting=value`.
    - При использовании HTTP API передавайте параметры CGI (`URL?setting_1=value&setting_2=value...`).
    - Задавайте настройки в секции
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    запроса SELECT. Значение настройки применяется только к данному запросу и
    сбрасывается к значению по умолчанию или к предыдущему значению после
    завершения выполнения запроса.



## Возврат настройки к значению по умолчанию

Если вы изменили настройку и хотите вернуть ее к значению по умолчанию, установите для нее значение `DEFAULT`. Синтаксис выглядит так:

```sql
SET setting_name = DEFAULT
```

Например, значение параметра `async_insert` по умолчанию — `0`. Предположим, вы изменяете его на `1`:

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

Следующая команда сбрасывает его значение обратно на 0:

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

Настройка возвращена к значению по умолчанию:

```response
┌─value───┐
│ 0       │
└─────────┘
```


## Пользовательские настройки

В дополнение к общим [настройкам](/operations/settings/settings.md) пользователи могут задавать пользовательские настройки.

Имя пользовательской настройки должно начинаться с одного из предопределённых префиксов. Список этих префиксов задаётся параметром [custom&#95;settings&#95;prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) в конфигурационном файле сервера.

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


## Примеры

Во всех приведённых ниже примерах значение настройки `async_insert` устанавливается в `1`
и показывается, как просматривать настройки в работающей системе.

### Использование SQL для непосредственного применения настройки к пользователю

Этот пример создаёт пользователя `ingester` с настройкой `async_inset = 1`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- выделить-следующую-строку
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

Это создаёт профиль `log_ingest` с параметром `async_inset`, установленным в `1`:

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

Это создаёт пользователя `ingester` и назначает ему профиль настроек `log_ingest`:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- выделить-следующую-строку
SETTINGS PROFILE log_ingest
```

### Использование XML для создания профиля настроек и пользователя


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

#### Проверьте профиль настроек и его назначение {#examine-the-settings-profile-and-assignment-1}

```sql
SHOW ACCESS
```


```response
┌─ДОСТУП─────────────────────────────────────────────────────────────────────────────┐
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

### Назначение параметра сеансу

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### Назначить настройку при выполнении запроса

```sql
INSERT INTO YourTable
-- выделить-следующую-строку
SETTINGS async_insert=1
VALUES (...)
```


## См. также {#see-also}

- См. страницу [Settings](/operations/settings/settings.md) с описанием настроек ClickHouse.
- [Глобальные настройки сервера](/operations/server-configuration-parameters/settings.md)
