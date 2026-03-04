---
slug: /native-protocol/client
sidebar_position: 2
title: 'Пакеты нативного клиента'
description: 'Клиент нативного протокола'
doc_type: 'reference'
keywords: ['пакеты клиента', 'клиент нативного протокола', 'пакеты протокола', 'клиентское взаимодействие', 'TCP-клиент']
---

# Пакеты клиента \{#client-packets\}

| value | name              | description                 |
|-------|-------------------|-----------------------------|
| 0     | [Hello](#hello)   | Начало рукопожатия клиента |
| 1     | [Query](#query)   | Запрос                      |
| 2     | [Data](#data)     | Блок с данными             |
| 3     | [Cancel](#cancel) | Отмена запроса             |
| 4     | [Ping](#ping)     | Ping-запрос                |
| 5     | TableStatus       | Запрос статуса таблицы     |

Пакет `Data` может быть сжат.

## Hello \{#hello\}

Например, у нас есть `Go Client` v1.10, который поддерживает версию протокола `54451` и
мы хотим подключиться к базе данных `default` с пользователем `default` и паролем `secret`.

| field            | type    | value         | description                       |
|------------------|---------|---------------|-----------------------------------|
| client&#95;name      | String  | `"Go Client"` | Имя реализации клиента           |
| version&#95;major    | UVarInt | `1`           | Старший номер версии клиента     |
| version&#95;minor    | UVarInt | `10`          | Младший номер версии клиента     |
| protocol&#95;version | UVarInt | `54451`       | Версия TCP-протокола             |
| database         | String  | `"default"`   | Имя базы данных                  |
| username         | String  | `"default"`   | Имя пользователя                 |
| password         | String  | `"secret"`    | Пароль                           |

### Protocol version \{#protocol-version\}

Версия протокола — это версия TCP-протокола клиента.

Обычно она равна последней совместимой ревизии сервера, но
её не следует с ней путать.

### Defaults \{#defaults\}

Все значения должны быть **явно заданы**, на стороне сервера нет значений по умолчанию.
На стороне клиента используйте `"default"` как имя базы данных, `"default"` как имя пользователя и `""` (пустую строку)
как пароль по умолчанию.

## Запрос \{#query\}

| field           | type                       | value      | description                               |
|-----------------|----------------------------|------------|-------------------------------------------|
| query&#95;id        | String                     | `1ff-a123` | Идентификатор запроса, может быть UUIDv4 |
| client&#95;info     | [ClientInfo](#client-info) | See type   | Данные о клиенте                          |
| settings        | [Settings](#settings)      | See type   | Список настроек                           |
| secret          | String                     | `secret`   | Межсерверный секрет                       |
| [stage](#stage) | UVarInt                    | `2`        | Выполнять до стадии обработки запроса     |
| compression     | UVarInt                    | `0`        | 0 — отключено, 1 — включено               |
| body            | String                     | `SELECT 1` | Текст запроса                             |

### Информация о клиенте \{#client-info\}

| field             | type            | description                             |
|-------------------|-----------------|-----------------------------------------|
| query&#95;kind        | byte            | None=0, Initial=1, Secondary=2         |
| initial&#95;user      | String          | Исходный пользователь                   |
| initial&#95;query&#95;id  | String          | Исходный идентификатор запроса          |
| initial&#95;address   | String          | Исходный адрес                          |
| initial&#95;time      | Int64           | Исходное время                          |
| interface         | byte            | TCP=1, HTTP=2                           |
| os&#95;user           | String          | Пользователь ОС                         |
| client&#95;hostname   | String          | Имя хоста клиента                       |
| client&#95;name       | String          | Имя клиента                             |
| version&#95;major     | UVarInt         | Основная версия клиента                 |
| version&#95;minor     | UVarInt         | Минорная версия клиента                 |
| protocol&#95;version  | UVarInt         | Версия протокола клиента                |
| quota&#95;key         | String          | Ключ квоты                              |
| distributed&#95;depth | UVarInt         | Глубина распределённого запроса         |
| version&#95;patch     | UVarInt         | Патч-версия клиента                     |
| otel              | Bool            | Присутствуют поля трассировки           |
| trace&#95;id          | FixedString(16) | Идентификатор трассы                    |
| span&#95;id           | FixedString(8)  | Идентификатор спана                     |
| trace&#95;state       | String          | Состояние трассировки                   |
| trace&#95;flags       | Byte            | Флаги трассировки                       |

### Настройки \{#settings\}

| field     | type   | value             | description                         |
|-----------|--------|-------------------|-------------------------------------|
| key       | String | `send_logs_level` | Ключ настройки                      |
| value     | String | `trace`           | Значение настройки                  |
| important | Bool   | `true`            | Можно ли игнорировать настройку     |

Кодируется в виде списка; пустые `key` и `value` обозначают конец списка.

### Стадия \{#stage\}

| value | name               | description                                                   |
|-------|--------------------|---------------------------------------------------------------|
| 0     | FetchColumns       | Только получить типы столбцов                                |
| 1     | WithMergeableState | До состояния, пригодного для слияния                         |
| 2     | Complete           | До полной завершённости (должно быть значением по умолчанию) |

## Данные \{#data\}

| field   | type                | description                      |
|---------|---------------------|----------------------------------|
| info    | BlockInfo           | Закодированная информация блока |
| columns | UVarInt             | Количество столбцов             |
| rows    | UVarInt             | Количество строк                |
| columns | [[]Column](#column) | Столбцы с данными               |

### Столбец \{#column\}

| field | type   | value           | description    |
|-------|--------|-----------------|----------------|
| name  | String | `foo`           | Имя столбца    |
| type  | String | `DateTime64(9)` | Тип столбца    |
| data  | bytes  | ~               | Данные столбца |

## Cancel \{#cancel\}

Тело пакета отсутствует. Сервер должен отменить запрос.

## Ping \{#ping\}

Не содержит тела пакета. Сервер должен [ответить сообщением pong](./server.md#pong).