---
slug: /operations/external-authenticators/ssl-x509
title: 'Аутентификация с помощью сертификатов SSL X.509'
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[Опция 'strict' SSL](../server-configuration-parameters/settings.md#openssl) включает обязательную проверку сертификатов для входящих соединений. В этом случае могут быть установлены только соединения с доверенными сертификатами. Соединения с недоверенными сертификатами будут отклонены. Таким образом, проверка сертификата позволяет уникально аутентифицировать входящее соединение. Поле `Common Name` или `subjectAltName extension` сертификата используется для идентификации подключенного пользователя. Расширение `subjectAltName` поддерживает использование одного подстановочного знака '*' в конфигурации сервера. Это позволяет ассоциировать несколько сертификатов с одним и тем же пользователем. Кроме того, переоформление и отзыв сертификатов не влияют на конфигурацию ClickHouse.

Чтобы включить аутентификацию с помощью сертификатов SSL, необходимо указать список `Common Name` или `Subject Alt Name` для каждого пользователя ClickHouse в файле настроек `users.xml`:

**Пример**
```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- Другие имена -->
            </ssl_certificates>
            <!-- Другие настройки -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- Другие имена -->
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

Для правильной работы SSL [`цепочки доверия`](https://en.wikipedia.org/wiki/Chain_of_trust) также важно убедиться, что параметр [`caConfig`](../server-configuration-parameters/settings.md#openssl) настроен должным образом.
