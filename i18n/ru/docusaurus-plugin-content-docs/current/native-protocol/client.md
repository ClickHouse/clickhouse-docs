---
slug: /native-protocol/client
sidebar_position: 2
title: 'Пакеты клиента нативного протокола'
description: 'Клиент нативного протокола'
doc_type: 'reference'
keywords: ['пакеты клиента', 'клиент нативного протокола', 'пакеты протокола', 'взаимодействие клиента', 'TCP-клиент']
---



# Пакеты клиента

| value | name              | description                 |
|-------|-------------------|-----------------------------|
| 0     | [Hello](#hello)   | Инициализация рукопожатия клиента |
| 1     | [Query](#query)   | Запрос                      |
| 2     | [Data](#data)     | Блок с данными              |
| 3     | [Cancel](#cancel) | Отмена запроса              |
| 4     | [Ping](#ping)     | Ping-запрос                 |
| 5     | TableStatus       | Запрос статуса таблицы      |

`Data` может быть сжатым.



## Приветствие {#hello}

Например, мы используем `Go Client` версии 1.10, который поддерживает версию протокола `54451`, и
хотим подключиться к базе данных `default` с пользователем `default` и паролем `secret`.

| field            | type    | value         | description                      |
| ---------------- | ------- | ------------- | -------------------------------- |
| client_name      | String  | `"Go Client"` | Название реализации клиента      |
| version_major    | UVarInt | `1`           | Мажорная версия клиента          |
| version_minor    | UVarInt | `10`          | Минорная версия клиента          |
| protocol_version | UVarInt | `54451`       | Версия протокола TCP             |
| database         | String  | `"default"`   | Имя базы данных                  |
| username         | String  | `"default"`   | Имя пользователя                 |
| password         | String  | `"secret"`    | Пароль                           |

### Версия протокола {#protocol-version}

Версия протокола — это версия TCP-протокола клиента.

Обычно она соответствует последней совместимой ревизии сервера, но
не следует путать эти понятия.

### Значения по умолчанию {#defaults}

Все значения должны быть **явно заданы**, на стороне сервера значения по умолчанию отсутствуют.
На стороне клиента в качестве значений по умолчанию используйте базу данных `"default"`, имя пользователя `"default"` и `""` (пустую строку)
в качестве пароля.


## Запрос {#query}

| field           | type                       | value      | description               |
| --------------- | -------------------------- | ---------- | ------------------------- |
| query_id        | String                     | `1ff-a123` | Идентификатор запроса, может быть UUIDv4 |
| client_info     | [ClientInfo](#client-info) | See type   | Данные о клиенте                  |
| settings        | [Settings](#settings)      | See type   | Список настроек                   |
| secret          | String                     | `secret`   | Межсерверный секрет               |
| [stage](#stage) | UVarInt                    | `2`        | Выполнять до указанной стадии запроса |
| compression     | UVarInt                    | `0`        | Отключено=0, включено=1           |
| body            | String                     | `SELECT 1` | Текст запроса                     |

### Информация о клиенте {#client-info}

| field             | type            | description                    |
| ----------------- | --------------- | ------------------------------ |
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | Исходный пользователь             |
| initial_query_id  | String          | Исходный идентификатор запроса    |
| initial_address   | String          | Исходный адрес                    |
| initial_time      | Int64           | Исходное время                    |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | Пользователь ОС                   |
| client_hostname   | String          | Имя хоста клиента                 |
| client_name       | String          | Имя клиента                       |
| version_major     | UVarInt         | Мажорная версия клиента           |
| version_minor     | UVarInt         | Минорная версия клиента           |
| protocol_version  | UVarInt         | Версия протокола клиента          |
| quota_key         | String          | Ключ квоты                        |
| distributed_depth | UVarInt         | Глубина распределённого выполнения |
| version_patch     | UVarInt         | Патч-версия клиента               |
| otel              | Bool            | Поля трассировки присутствуют     |
| trace_id          | FixedString(16) | Идентификатор трассировки         |
| span_id           | FixedString(8)  | Идентификатор span                |
| trace_state       | String          | Состояние трассировки             |
| trace_flags       | Byte            | Флаги трассировки                 |

### Настройки {#settings}

| field     | type   | value             | description           |
| --------- | ------ | ----------------- | --------------------- |
| key       | String | `send_logs_level` | Ключ настройки                   |
| value     | String | `trace`           | Значение настройки               |
| important | Bool   | `true`            | Может ли быть проигнорирована    |

Кодируется как список, пустые ключ и значение обозначают конец списка.

### Стадия {#stage}

| value | name               | description                                 |
| ----- | ------------------ | ------------------------------------------- |
| 0     | FetchColumns       | Только получить типы столбцов                    |
| 1     | WithMergeableState | До состояния, пригодного для слияния             |
| 2     | Complete           | До полного завершения (должно быть по умолчанию) |


## Данные {#data}

| поле    | тип                 | описание           |
| ------- | ------------------- | ------------------ |
| info    | BlockInfo           | Закодированная информация блока |
| columns | UVarInt             | Количество столбцов |
| rows    | UVarInt             | Количество строк   |
| columns | [[]Column](#column) | Столбцы с данными  |

### Столбец {#column}

| поле  | тип    | значение        | описание    |
| ----- | ------ | --------------- | ----------- |
| name  | String | `foo`           | Имя столбца |
| type  | String | `DateTime64(9)` | Тип столбца |
| data  | bytes  | ~               | Данные столбца |


## Cancel {#cancel}

Тело пакета отсутствует. Сервер должен отменить выполнение запроса.


## Ping {#ping}

Тело пакета отсутствует. Сервер должен [ответить сообщением pong](./server.md#pong).
