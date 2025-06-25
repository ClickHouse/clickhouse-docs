---
description: 'Документация для Ssl X509'
slug: /operations/external-authenticators/ssl-x509
title: 'Аутентификация по сертификату SSL X.509'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[Опция 'strict' SSL](../server-configuration-parameters/settings.md#openssl) включает обязательную проверку сертификатов для входящих соединений. В этом случае только соединения с доверенными сертификатами могут быть установлены. Соединения с недоверенными сертификатами будут отклонены. Таким образом, проверка сертификатов позволяет уникально аутентифицировать входящее соединение. Поле `Common Name` или `subjectAltName extension` сертификата используется для идентификации подключенного пользователя. Расширение `subjectAltName` поддерживает использование одного подстановочного знака '*' в конфигурации сервера. Это позволяет связать несколько сертификатов с одним и тем же пользователем. Кроме того, переиздание и отмена сертификатов не влияют на конфигурацию ClickHouse.

Для включения аутентификации по сертификату SSL в файле настроек `users.xml` должен быть указан список `Common Name` или `Subject Alt Name` для каждого пользователя ClickHouse:

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
                <!-- Поддержка подстановочных знаков -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

Для правильной работы [цепочки доверия](https://en.wikipedia.org/wiki/Chain_of_trust) также важно убедиться, что параметр [`caConfig`](../server-configuration-parameters/settings.md#openssl) настроен правильно.
