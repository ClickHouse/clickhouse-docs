---
slug: /operations/external-authenticators/http
title: 'HTTP'
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP сервер может использоваться для аутентификации пользователей ClickHouse. HTTP аутентификация может использоваться только в качестве внешнего аутентификатора для существующих пользователей, которые определены в `users.xml` или в локальных путях управления доступом. В настоящее время поддерживается схема аутентификации [Basic](https://datatracker.ietf.org/doc/html/rfc7617) с использованием метода GET.

## Определение HTTP сервера аутентификации {#http-auth-server-definition}

Для определения HTTP сервера аутентификации необходимо добавить секцию `http_authentication_servers` в `config.xml`.

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
        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

Обратите внимание, что вы можете определить несколько HTTP серверов в секции `http_authentication_servers`, используя различные имена.

**Параметры**
- `uri` - URI для выполнения запроса аутентификации

Таймауты в миллисекундах на сокете, используемом для связи с сервером:
- `connection_timeout_ms` - По умолчанию: 1000 мс.
- `receive_timeout_ms` - По умолчанию: 1000 мс.
- `send_timeout_ms` - По умолчанию: 1000 мс.

Параметры повторной попытки:
- `max_tries` - Максимальное количество попыток для выполнения запроса аутентификации. По умолчанию: 3
- `retry_initial_backoff_ms` - Начальный интервал ожидания при повторной попытке. По умолчанию: 50 мс
- `retry_max_backoff_ms` - Максимальный интервал ожидания. По умолчанию: 1000 мс

### Включение HTTP аутентификации в `users.xml` {#enabling-http-auth-in-users-xml}

Чтобы включить HTTP аутентификацию для пользователя, укажите секцию `http_authentication` вместо `password` или аналогичных секций в определении пользователя.

Параметры:
- `server` - Имя HTTP сервера аутентификации, настроенного в основном файле `config.xml`, как описано ранее.
- `scheme` - Схема HTTP аутентификации. В настоящее время поддерживается только `Basic`. По умолчанию: Basic

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
Обратите внимание, что HTTP аутентификация не может использоваться вместе с любым другим механизмом аутентификации. Наличие любых других секций, таких как `password`, вместе с `http_authentication`, приведет к завершению работы ClickHouse.
:::

### Включение HTTP аутентификации с помощью SQL {#enabling-http-auth-using-sql}

Когда [SQL-управляемый контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage) включен в ClickHouse, пользователи, идентифицированные через HTTP аутентификацию, также могут быть созданы с использованием SQL операторов.

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...или, `Basic` по умолчанию без явного указания схемы

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### Передача настроек сессии {#passing-session-settings}

Если тело ответа от сервера HTTP аутентификации имеет формат JSON и содержит подобъект `settings`, ClickHouse попытается разобрать его пары ключ: значение как строковые значения и установить их как настройки сессии для текущей сессии авторизованного пользователя. Если разбор не удался, тело ответа с сервера будет проигнорировано.
