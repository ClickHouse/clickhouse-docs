---
description: 'Документация по аутентификации сертификатов Ssl X509'
slug: /operations/external-authenticators/ssl-x509
title: 'Аутентификация сертификатов SSL X.509'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[Параметр 'strict' SSL](../server-configuration-parameters/settings.md#openssl) включает обязательное подтверждение сертификатов для входящих подключений. В этом случае могут устанавливаться только соединения с доверенными сертификатами. Соединения с недоверенными сертификатами будут отклонены. Таким образом, подтверждение сертификатов позволяет однозначно аутентифицировать входящее соединение. Поле `Common Name` или расширение `subjectAltName` сертификата используется для идентификации подключенного пользователя. Расширение `subjectAltName` поддерживает использование одного подстановочного знака '*' в конфигурации сервера. Это позволяет ассоциировать несколько сертификатов с одним и тем же пользователем. Кроме того, повторная выдача и отзыва сертификатов не затрагивают конфигурацию ClickHouse.

Чтобы включить аутентификацию по сертификату SSL, в файле настроек `users.xml` должен быть указан список `Common Name` или `Subject Alt Name` для каждого пользователя ClickHouse:

**Пример**
```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- Больше имен -->
            </ssl_certificates>
            <!-- Другие настройки -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- Больше имен -->
            </ssl_certificates>
            <!-- Другие настройки -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- Поддержка подстановочного знака -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

Чтобы [`цепочка доверия`](https://en.wikipedia.org/wiki/Chain_of_trust) работала корректно, также важно убедиться, что параметр [`caConfig`](../server-configuration-parameters/settings.md#openssl) настроен правильно.
