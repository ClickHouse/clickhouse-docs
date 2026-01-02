---
description: 'Документация по HTTP API ClickHouse Keeper и встроенной панели мониторинга'
sidebar_label: 'Keeper HTTP API'
sidebar_position: 70
slug: /operations/utilities/clickhouse-keeper-http-api
title: 'HTTP API ClickHouse Keeper и панель мониторинга'
doc_type: 'reference'
---

# HTTP API и панель управления Keeper {#keeper-http-api-and-dashboard}

ClickHouse Keeper предоставляет HTTP API и встроенную веб-панель для мониторинга, проверки работоспособности и управления хранилищем. 
Этот интерфейс позволяет операторам просматривать состояние кластера, выполнять команды и управлять хранилищем Keeper через веб-браузер или HTTP‑клиенты.

## Конфигурация {#configuration}

Чтобы включить HTTP API, добавьте раздел `http_control` в конфигурацию `keeper_server`:

```xml
<keeper_server>
    <!-- Other keeper_server configuration -->

    <http_control>
        <port>9182</port>
        <!-- <secure_port>9443</secure_port> -->
    </http_control>
</keeper_server>
```


### Параметры конфигурации {#configuration-options}

| Параметр                                 | По умолчанию | Описание                                      |
|------------------------------------------|--------------|-----------------------------------------------|
| `http_control.port`                      | -            | HTTP-порт для дашборда и API                  |
| `http_control.secure_port`               | -            | HTTPS-порт (требуется настройка SSL)          |
| `http_control.readiness.endpoint`        | `/ready`     | Настраиваемый путь для пробы готовности       |
| `http_control.storage.session_timeout_ms`| `30000`      | Тайм-аут сеанса для операций API хранилища    |

## Эндпоинты {#endpoints}

### Панель мониторинга {#dashboard}

- **Path**: `/dashboard`
- **Method**: GET
- **Description**: Предоставляет встроенную веб-панель мониторинга и управления Keeper

Панель мониторинга включает:

- Визуализацию состояния кластера в реальном времени
- Мониторинг узлов (роль, задержка, соединения)
- Браузер хранилища
- Интерфейс для выполнения команд

### Проверка готовности (readiness probe) {#readiness-probe}

* **Путь**: `/ready` (можно изменить)
* **Метод**: GET
* **Описание**: конечная точка проверки работоспособности

Успешный ответ (HTTP 200):

```json
{
  "status": "ok",
  "details": {
    "role": "leader",
    "hasLeader": true
  }
}
```


### API команд {#commands-api}

* **Path**: `/api/v1/commands/{command}`
* **Methods**: GET, POST
* **Description**: Выполняет команды Four-Letter Word или команды CLI ClickHouse Keeper Client

Параметры запроса:

* `command` - Команда, которую нужно выполнить
* `cwd` - Текущий рабочий каталог для команд, работающих с путями (по умолчанию: `/`)

Примеры:

```bash
# Four-Letter Word command
curl http://localhost:9182/api/v1/commands/stat

# ZooKeeper CLI command
curl "http://localhost:9182/api/v1/commands/ls?command=ls%20'/'&cwd=/"
```


### Storage API {#storage-api}

- **Базовый путь**: `/api/v1/storage`
- **Описание**: REST API для операций с хранилищем Keeper

Storage API следует REST‑соглашениям, где HTTP-методы определяют тип операции:

| Операция | Путь                                       | Метод | Код статуса | Описание                    |
|----------|--------------------------------------------|-------|-------------|-----------------------------|
| Get      | `/api/v1/storage/{path}`                   | GET   | 200         | Получить данные узла       |
| List     | `/api/v1/storage/{path}?children=true`     | GET   | 200         | Список дочерних узлов      |
| Exists   | `/api/v1/storage/{path}`                   | HEAD  | 200         | Проверить, существует ли узел |
| Create   | `/api/v1/storage/{path}`                   | POST  | 201         | Создать новый узел         |
| Update   | `/api/v1/storage/{path}?version={v}`       | PUT   | 200         | Обновить данные узла       |
| Delete   | `/api/v1/storage/{path}?version={v}`       | DELETE| 204         | Удалить узел               |