---
description: 'Документация по SSL X.509'
slug: /operations/external-authenticators/ssl-x509
title: 'Аутентификация с использованием сертификатов SSL X.509'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Параметр [SSL &#39;strict&#39; option](../server-configuration-parameters/settings.md#openssl) включает обязательную проверку сертификатов для входящих соединений. В этом случае могут устанавливаться только соединения с доверенными сертификатами. Соединения с недоверенными сертификатами будут отклоняться. Таким образом, проверка сертификатов позволяет однозначно аутентифицировать входящее соединение. Для идентификации подключенного пользователя используется поле сертификата `Common Name` или расширение `subjectAltName`. Расширение `subjectAltName` поддерживает использование одного подстановочного символа &#39;*&#39; в конфигурации сервера. Это позволяет связать несколько сертификатов с одним и тем же пользователем. Кроме того, перевыпуск и отзыв сертификатов не влияют на конфигурацию ClickHouse.

Чтобы включить аутентификацию по SSL-сертификату, для каждого пользователя ClickHouse в файле настроек `users.xml` должен быть указан список значений `Common Name` или `Subject Alt Name`:

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

Чтобы SSL-[цепочка доверия](https://en.wikipedia.org/wiki/Chain_of_trust) работала корректно, также важно убедиться, что параметр [`caConfig`](../server-configuration-parameters/settings.md#openssl) настроен должным образом.
