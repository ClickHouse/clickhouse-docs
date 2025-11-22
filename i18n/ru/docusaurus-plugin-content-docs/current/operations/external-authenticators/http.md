---
description: 'Документация по HTTP-аутентификатору'
slug: /operations/external-authenticators/http
title: 'HTTP'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP-сервер может использоваться для аутентификации пользователей ClickHouse. HTTP-аутентификация может использоваться только в качестве внешнего аутентификатора для существующих пользователей, заданных в `users.xml` или в локальных путях управления доступом. В настоящее время поддерживается схема аутентификации [Basic](https://datatracker.ietf.org/doc/html/rfc7617) с использованием метода GET.


## Определение сервера HTTP-аутентификации {#http-auth-server-definition}

Для определения сервера HTTP-аутентификации необходимо добавить секцию `http_authentication_servers` в файл `config.xml`.

**Пример**

```xml
<clickhouse>
    <!- ... -->
    <http_authentication_servers>
        <basic_auth_server>
          <uri>http://localhost:8000/auth</uri>
          <connection_timeout_ms>1000</connection_timeout_ms>
          <receive_timeout_ms>1000</receive_timeout_ms>
          <send_timeout_ms>1000</send_timeout_ms>
          <max_tries>3</max_tries>
          <retry_initial_backoff_ms>50</retry_initial_backoff_ms>
          <retry_max_backoff_ms>1000</retry_max_backoff_ms>
          <forward_headers>
            <name>Custom-Auth-Header-1</name>
            <name>Custom-Auth-Header-2</name>
          </forward_headers>

        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

Обратите внимание, что внутри секции `http_authentication_servers` можно определить несколько HTTP-серверов, используя уникальные имена.

**Параметры**

- `uri` — URI для выполнения запроса аутентификации

Таймауты в миллисекундах для сокета, используемого для взаимодействия с сервером:

- `connection_timeout_ms` — По умолчанию: 1000 мс.
- `receive_timeout_ms` — По умолчанию: 1000 мс.
- `send_timeout_ms` — По умолчанию: 1000 мс.

Параметры повторных попыток:

- `max_tries` — Максимальное количество попыток выполнения запроса аутентификации. По умолчанию: 3
- `retry_initial_backoff_ms` — Начальный интервал задержки при повторной попытке. По умолчанию: 50 мс
- `retry_max_backoff_ms` — Максимальный интервал задержки. По умолчанию: 1000 мс

Пересылаемые заголовки:

Данная секция определяет, какие заголовки будут пересылаться из заголовков клиентского запроса во внешний HTTP-аутентификатор. Обратите внимание, что заголовки будут сопоставляться с заголовками в конфигурации без учета регистра, но пересылаться будут в исходном виде, то есть без изменений.

### Включение HTTP-аутентификации в `users.xml` {#enabling-http-auth-in-users-xml}

Чтобы включить HTTP-аутентификацию для пользователя, укажите секцию `http_authentication` вместо `password` или аналогичных секций в определении пользователя.

Параметры:

- `server` — Имя сервера HTTP-аутентификации, настроенного в основном файле `config.xml`, как описано выше.
- `scheme` — Схема HTTP-аутентификации. В настоящее время поддерживается только `Basic`. По умолчанию: Basic

Пример (добавляется в `users.xml`):

```xml
<clickhouse>
    <!- ... -->
    <my_user>
        <!- ... -->
        <http_authentication>
            <server>basic_server</server>
            <scheme>basic</scheme>
        </http_authentication>
    </test_user_2>
</clickhouse>
```

:::note
Обратите внимание, что HTTP-аутентификация не может использоваться одновременно с любым другим механизмом аутентификации. Наличие любых других секций, таких как `password`, наряду с `http_authentication` приведет к остановке ClickHouse.
:::

### Включение HTTP-аутентификации с помощью SQL {#enabling-http-auth-using-sql}

Когда в ClickHouse включено [управление доступом и учетными записями на основе SQL](/operations/access-rights#access-control-usage), пользователи, идентифицируемые с помощью HTTP-аутентификации, также могут быть созданы с использованием SQL-запросов.

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...или `Basic` используется по умолчанию без явного указания схемы

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### Передача настроек сессии {#passing-session-settings}

Если тело ответа от сервера HTTP-аутентификации имеет формат JSON и содержит подобъект `settings`, ClickHouse попытается разобрать его пары ключ-значение как строковые значения и установить их в качестве настроек сессии для текущей сессии аутентифицированного пользователя. Если разбор завершится неудачей, тело ответа от сервера будет проигнорировано.
