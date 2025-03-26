---
slug: /native-protocol/client
sidebar_position: 2
title: 'Пакеты клиента'
description: 'Клиент протокола'
---


# Пакеты клиента

| value | name              | description            |
|-------|-------------------|------------------------|
| 0     | [Hello](#hello)   | Начало рукопожатия клиента |
| 1     | [Query](#query)   | Запрос к выполнению          |
| 2     | [Data](#data)     | Блок с данными        |
| 3     | [Cancel](#cancel) | Отмена запроса           |
| 4     | [Ping](#ping)     | Запрос пинга           |
| 5     | TableStatus       | Запрос статуса таблицы   |

`Data` может быть сжата.

## Hello {#hello}

Например, мы — `Go Client` v1.10, который поддерживает версию протокола `54451` и
хочем подключиться к базе данных `default` с пользователем `default` и паролем `secret`.

| field            | type    | value         | description                |
|------------------|---------|---------------|----------------------------|
| client_name      | String  | `"Go Client"` | Имя реализации клиента |
| version_major    | UVarInt | `1`           | Главная версия клиента       |
| version_minor    | UVarInt | `10`          | Неосновная версия клиента       |
| protocol_version | UVarInt | `54451`       | Версия TCP-протокола       |
| database         | String  | `"default"`   | Имя базы данных              |
| username         | String  | `"default"`   | Имя пользователя                   |
| password         | String  | `"secret"`    | Пароль                   |

### Версия протокола {#protocol-version}

Версия протокола — это версия TCP-протокола клиента.

Обычно она равна последней совместимой ревизии сервера, но
не следует путать с ней.

### Значения по умолчанию {#defaults}

Все значения должны быть **явно заданы**, на стороне сервера нет значений по умолчанию.
На стороне клиента используйте базу данных `"default"`, имя пользователя `"default"` и пароль `""` (пустая строка)
в качестве значений по умолчанию.

## Запрос {#query}

| field           | type                       | value      | description               |
|-----------------|----------------------------|------------|---------------------------|
| query_id        | String                     | `1ff-a123` | Идентификатор запроса, может быть UUIDv4   |
| client_info     | [ClientInfo](#client-info) | См. тип    | Данные о клиенте         |
| settings        | [Settings](#settings)      | См. тип    | Список настроек          |
| secret          | String                     | `secret`   | Межсерверный секрет       |
| [stage](#stage) | UVarInt                    | `2`        | Выполнение до стадии запроса |
| compression     | UVarInt                    | `0`        | Отключено=0, включено=1     |
| body            | String                     | `SELECT 1` | Текст запроса                |

### Информация о клиенте {#client-info}

| field             | type            | description                    |
|-------------------|-----------------|--------------------------------|
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | Начальный пользователь                   |
| initial_query_id  | String          | Идентификатор начального запроса               |
| initial_address   | String          | Начальный адрес                |
| initial_time      | Int64           | Начальное время                   |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | Пользователь ОС                        |
| client_hostname   | String          | Имя хоста клиента                |
| client_name       | String          | Имя клиента                    |
| version_major     | UVarInt         | Главная версия клиента           |
| version_minor     | UVarInt         | Неосновная версия клиента           |
| protocol_version  | UVarInt         | Версия протокола клиента        |
| quota_key         | String          | Ключ квоты                      |
| distributed_depth | UVarInt         | Глубина распределения              |
| version_patch     | UVarInt         | Версия патча клиента           |
| otel              | Bool            | Поля трассировки присутствуют       |
| trace_id          | FixedString(16) | Идентификатор трассировки                       |
| span_id           | FixedString(8)  | Идентификатор диапазона                        |
| trace_state       | String          | Состояние трассировки                  |
| trace_flags       | Byte            | Флаги трассировки                  |

### Настройки {#settings}

| field     | type   | value             | description           |
|-----------|--------|-------------------|-----------------------|
| key       | String | `send_logs_level` | Ключ настройки        |
| value     | String | `trace`           | Значение настройки      |
| important | Bool   | `true`            | Можно игнорировать или нет |

Закодировано как список, пустой ключ и значение обозначают конец списка.

### Стадия {#stage}

| value | name               | description                                 |
|-------|--------------------|---------------------------------------------|
| 0     | FetchColumns       | Только получение типов столбцов                     |
| 1     | WithMergeableState | До состояния слияния                       |
| 2     | Complete           | До полной завершенности (должно быть по умолчанию) |

## Данные {#data}

| field   | type                | description        |
|---------|---------------------|--------------------|
| info    | BlockInfo           | Закодированная информация блока |
| columns | UVarInt             | Количество столбцов      |
| rows    | UVarInt             | Количество строк         |
| columns | [[]Column](#column) | Столбцы с данными  |

### Столбец {#column}

| field | type   | value           | description |
|-------|--------|-----------------|-------------|
| name  | String | `foo`           | Имя столбца |
| type  | String | `DateTime64(9)` | Тип столбца |
| data  | bytes  | ~               | Данные столбца |

## Отмена {#cancel}

Нет тела пакета. Сервер должен отменить запрос.

## Пинг {#ping}

Нет тела пакета. Сервер должен [ответить с pong](./server.md#pong).
