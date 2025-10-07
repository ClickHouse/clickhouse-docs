---
slug: '/operations/external-authenticators/ssl-x509'
description: 'Документация для Ssl X509'
title: 'Аутентификация по сертификату SSL X.509'
doc_type: reference
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[Опция SSL 'strict'](../server-configuration-parameters/settings.md#openssl) включает обязательную проверку сертификатов для входящих соединений. В этом случае могут быть установлены только соединения с доверенными сертификатами. Соединения с недоверенными сертификатами будут отклонены. Таким образом, проверка сертификатов позволяет уникально аутентифицировать входящее соединение. Поле `Common Name` или расширение `subjectAltName` сертификата используется для идентификации подключенного пользователя. Расширение `subjectAltName` поддерживает использование одного подстановочного символа '*' в конфигурации сервера. Это позволяет ассоциировать несколько сертификатов с одним и тем же пользователем. Кроме того, переиздание и аннулирование сертификатов не влияют на конфигурацию ClickHouse.

Для включения аутентификации по SSL-сертификату необходимо указать список `Common Name` или `Subject Alt Name` для каждого пользователя ClickHouse в файле настроек `users.xml`:

**Пример**
```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- More names -->
            </ssl_certificates>
            <!-- Other settings -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- More names -->
            </ssl_certificates>
            <!-- Other settings -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- Wildcard support -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

Для корректной работы [цепочки доверия](https://en.wikipedia.org/wiki/Chain_of_trust) важно также убедиться, что параметр [`caConfig`](../server-configuration-parameters/settings.md#openssl) настроен правильно.