---
description: 'Документация по SSL X.509'
slug: /operations/external-authenticators/ssl-x509
title: 'Аутентификация по SSL-сертификату X.509'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Параметр [SSL &#39;strict&#39;](../server-configuration-parameters/settings.md#openssl) включает обязательную проверку сертификатов для входящих подключений. В этом случае могут быть установлены только соединения с доверенными сертификатами. Подключения с недоверенными сертификатами будут отклонены. Таким образом, проверка сертификатов позволяет однозначно аутентифицировать входящее подключение. Для идентификации подключенного пользователя используется поле сертификата `Common Name` или расширение `subjectAltName`. Расширение `subjectAltName` поддерживает использование одного подстановочного символа &#39;*&#39; в конфигурации сервера. Это позволяет связать несколько сертификатов с одним и тем же пользователем. Кроме того, перевыпуск и отзыв сертификатов не влияет на конфигурацию ClickHouse.

Чтобы включить аутентификацию по SSL-сертификату, в файле настроек `users.xml` должен быть указан список значений полей `Common Name` или `Subject Alt Name` для каждого пользователя ClickHouse:

**Пример**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- Дополнительные имена -->
            </ssl_certificates>
            <!-- Прочие настройки -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- Дополнительные имена -->
            </ssl_certificates>
            <!-- Прочие настройки -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- Поддержка масок -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

Чтобы SSL-цепочка доверия ([`chain of trust`](https://en.wikipedia.org/wiki/Chain_of_trust)) работала корректно, также важно убедиться, что параметр [`caConfig`](../server-configuration-parameters/settings.md#openssl) настроен правильно.
