---
slug: /native-protocol/client
sidebar_position: 2
title: 'Пакеты клиентской части'
description: 'Клиент нативного протокола'
---


# Пакеты клиентской части

| value | name              | description            |
|-------|-------------------|------------------------|
| 0     | [Hello](#hello)   | Начало рукопожатия клиента |
| 1     | [Query](#query)   | Запрос на выполнение запроса |
| 2     | [Data](#data)     | Блок с данными        |
| 3     | [Cancel](#cancel) | Отмена запроса        |
| 4     | [Ping](#ping)     | Запрос на пинг       |
| 5     | TableStatus       | Запрос на статус таблицы |

`Data` может быть сжата.

## Hello {#hello}

Например, мы используем `Go Client` v1.10, который поддерживает версию протокола `54451` и хотим подключиться к базе данных `default` с пользователем `default` и паролем `secret`.

| field            | type    | value         | description                |
|------------------|---------|---------------|----------------------------|
| client_name      | String  | `"Go Client"` | Имя реализации клиента     |
| version_major    | UVarInt | `1`           | Основная версия клиента    |
| version_minor    | UVarInt | `10`          | Небольшая версия клиента   |
| protocol_version | UVarInt | `54451`       | Версия TCP протокола      |
| database         | String  | `"default"`   | Имя базы данных           |
| username         | String  | `"default"`   | Имя пользователя           |
| password         | String  | `"secret"`    | Пароль                    |

### Версия протокола {#protocol-version}

Версия протокола — это версия TCP протокола клиента.

Обычно она совпадает с последней совместимой ревизией сервера, но не следует путать их.

### По умолчанию {#defaults}

Все значения должны быть **явно установлены**, на стороне сервера нет значений по умолчанию.
На стороне клиента используйте базу данных `"default"`, имя пользователя `"default"` и `""` (пустая строка) как значения по умолчанию.

## Запрос {#query}

| field           | type                       | value      | description               |
|-----------------|----------------------------|------------|---------------------------|
| query_id        | String                     | `1ff-a123` | ID запроса, может быть UUIDv4   |
| client_info     | [ClientInfo](#client-info) | См. тип    | Данные о клиенте         |
| settings        | [Settings](#settings)      | См. тип    | Список настроек          |
| secret          | String                     | `secret`   | Секрет для межсерверного взаимодействия       |
| [stage](#stage) | UVarInt                    | `2`        | Выполнять до стадии запроса |
| compression     | UVarInt                    | `0`        | Отключено=0, включено=1     |
| body            | String                     | `SELECT 1` | Текст запроса            |

### Информация о клиенте {#client-info}

| field             | type            | description                    |
|-------------------|-----------------|--------------------------------|
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | Начальный пользователь         |
| initial_query_id  | String          | Начальный ID запроса           |
| initial_address   | String          | Начальный адрес                |
| initial_time      | Int64           | Начальное время                |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | Пользователь ОС                |
| client_hostname   | String          | Имя хоста клиента              |
| client_name       | String          | Имя клиента                    |
| version_major     | UVarInt         | Основная версия клиента        |
| version_minor     | UVarInt         | Небольшая версия клиента       |
| protocol_version  | UVarInt         | Версия протокола клиента      |
| quota_key         | String          | Ключ квоты                    |
| distributed_depth | UVarInt         | Глубина распределения          |
| version_patch     | UVarInt         | Версия патча клиента          |
| otel              | Bool            | Полевые данные трассировки присутствуют  |
| trace_id          | FixedString(16) | ID трассировки                 |
| span_id           | FixedString(8)  | ID промежутка                  |
| trace_state       | String          | Состояние трассировки          |
| trace_flags       | Byte            | Флаги трассировки              |

### Настройки {#settings}

| field     | type   | value             | description           |
|-----------|--------|-------------------|-----------------------|
| key       | String | `send_logs_level` | Ключ настройки        |
| value     | String | `trace`           | Значение настройки     |
| important | Bool   | `true`            | Может быть проигнорировано или нет |

Закодировано как список, пустые ключ и значение обозначают конец списка.

### Этап {#stage}

| value | name               | description                                 |
|-------|--------------------|---------------------------------------------|
| 0     | FetchColumns       | Только извлечение типов столбцов           |
| 1     | WithMergeableState | До слияния состояния                        |
| 2     | Complete           | До полной завершенности (должно быть по умолчанию) |

## Данные {#data}

| field   | type                | description        |
|---------|---------------------|--------------------|
| info    | BlockInfo           | Закодированная информация о блоке |
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

Нет тела пакета. Сервер должен [ответить pong](./server.md#pong).
