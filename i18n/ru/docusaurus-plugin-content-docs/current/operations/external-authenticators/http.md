---
description: 'Документация для HTTP'
slug: /operations/external-authenticators/http
title: 'HTTP'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP сервер может быть использован для аутентификации пользователей ClickHouse. Аутентификация по HTTP может использоваться только в качестве внешнего аутентификатора для существующих пользователей, которые определены в `users.xml` или в локальных путях контроля доступа. В настоящее время поддерживается схема аутентификации [Basic](https://datatracker.ietf.org/doc/html/rfc7617) с использованием метода GET.

## Определение HTTP аутентификационного сервера {#http-auth-server-definition}

Чтобы определить HTTP аутентификационный сервер, вы должны добавить раздел `http_authentication_servers` в `config.xml`.

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

Обратите внимание, что вы можете определить несколько HTTP серверов внутри раздела `http_authentication_servers`, используя разные имена.

**Параметры**
- `uri` - URI для выполнения аутентификационного запроса

Тайм-ауты в миллисекундах на сокете, используемом для связи с сервером:
- `connection_timeout_ms` - По умолчанию: 1000 мс.
- `receive_timeout_ms` - По умолчанию: 1000 мс.
- `send_timeout_ms` - По умолчанию: 1000 мс.

Параметры повторной попытки:
- `max_tries` - Максимальное количество попыток выполнить аутентификационный запрос. По умолчанию: 3
- `retry_initial_backoff_ms` - Начальный интервал ожидания между повторами. По умолчанию: 50 мс
- `retry_max_backoff_ms` - Максимальный интервал ожидания. По умолчанию: 1000 мс

Пересылаемые заголовки:

Эта часть определяет, какие заголовки будут пересланы от заголовков клиентского запроса к внешнему HTTP аутентификатору.

### Включение HTTP аутентификации в `users.xml` {#enabling-http-auth-in-users-xml}

Чтобы включить HTTP аутентификацию для пользователя, укажите раздел `http_authentication` вместо `password` или аналогичных разделов в определении пользователя.

Параметры:
- `server` - Имя HTTP аутентификационного сервера, сконфигурированного в основном файле `config.xml`, как описано ранее.
- `scheme` - Схема аутентификации по HTTP. В настоящее время поддерживается только `Basic`. По умолчанию: Basic

Пример (вставляется в `users.xml`):
```xml
<clickhouse>
    <!- ... -->
    <my_user>
        <!- ... -->
        <http_authentication>
            <server>basic_server</server>
            <scheme>basic</scheme>
        </http_authentication>
    </my_user>
</clickhouse>
```

:::note
Обратите внимание, что HTTP аутентификация не может быть использована вместе с каким-либо другим механизмом аутентификации. Наличие любых других разделов, таких как `password`, наряду с `http_authentication`, приведет к завершению работы ClickHouse.
:::

### Включение HTTP аутентификации с использованием SQL {#enabling-http-auth-using-sql}

Когда [SQL-управляемый контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage) включен в ClickHouse, пользователи, идентифицированные по HTTP аутентификации, также могут быть созданы с использованием SQL-запросов.

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...или, `Basic` является значением по умолчанию без явного определения схемы

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### Передача настроек сессии {#passing-session-settings}

Если тело ответа от HTTP аутентификационного сервера имеет формат JSON и содержит подобъект `settings`, ClickHouse попытается разобрать его пары ключ: значение как строковые значения и установить их в качестве настроек сессии для текущей сессии аутентифицированного пользователя. Если разбор не удался, тело ответа от сервера будет проигнорировано.
