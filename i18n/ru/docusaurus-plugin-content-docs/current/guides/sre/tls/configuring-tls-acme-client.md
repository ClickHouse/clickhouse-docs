---
slug: /guides/sre/configuring-tls-acme-client
sidebar_label: 'Настройка автоматического получения сертификатов TLS через ACME'
sidebar_position: 20
title: 'Настройка клиента ACME'
description: 'В этом руководстве приведены простые и минимально необходимые настройки, позволяющие настроить ClickHouse на использование сертификатов OpenSSL для проверки подключений.'
keywords: ['настройка ACME', 'настройка TLS', 'сертификаты OpenSSL', 'защищённые подключения', 'руководство для SRE', 'Let`s Encrypt']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Настройка автоматической выдачи TLS-сертификатов через ACME {#configuring-automatic-tls-provisioning-via-acme}

<ExperimentalBadge/>

<SelfManaged />

В этом руководстве описывается, как настроить ClickHouse для использования протокола [ACME](https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment) (описанного в [RFC8555](https://www.rfc-editor.org/rfc/rfc8555)).
При наличии поддержки ACME ClickHouse может автоматически получать и продлевать сертификаты у провайдеров, таких как [Let's Encrypt](https://letsencrypt.org/) или [ZeroSSL](https://zerossl.com/).
Шифрование TLS защищает данные, передаваемые между клиентами и серверами ClickHouse, предотвращая перехват конфиденциальных запросов и результатов.

## Обзор {#overview}

Протокол ACME определяет процесс автоматического получения и обновления сертификатов с использованием сервисов вроде [Let&#39;s Encrypt](https://letsencrypt.org/) или [ZeroSSL](https://zerossl.com/). Вкратце, ClickHouse как инициатор запроса сертификата должен подтвердить владение доменом с помощью предопределённых типов challenge, чтобы получить сертификат.

Чтобы включить ACME, настройте HTTP- и HTTPS-порты вместе с блоком `acme`:

```xml
<http_port>80</http_port>
<https_port>443</https_port>

<acme>
    <email>valid_email@example.com</email>
    <terms_of_service_agreed>true</terms_of_service_agreed>
    <domains>
        <domain>example.com</domain>
    </domains>
</acme>
```

HTTP-порт обслуживает запросы проверки домена для челленджа ACME `HTTP-01` (подробнее о типах челленджей [здесь](https://letsencrypt.org/docs/challenge-types/)). После завершения проверки и выдачи сертификата HTTPS-порт обслуживает зашифрованный трафик с использованием полученного сертификата.

HTTP-порт не обязательно должен быть 80 на самом сервере; он может быть переназначен с помощью `nftables` или аналогичных инструментов. Ознакомьтесь с документацией вашего ACME-провайдера по допустимым портам для челленджей `HTTP-01`.

В блоке `acme` мы задаём `email` для создания учётной записи и принимаем условия использования ACME-сервиса.
После этого нам нужен только список доменов.


### Текущие ограничения {#current-limitations}

- Поддерживается только тип проверки `HTTP-01`.
- Поддерживаются только ключи `RSA 2048`.
- Не реализована обработка лимитов частоты запросов (rate limiting).

## Параметры конфигурации {#configuration-parameters}

Параметры конфигурации, доступные в разделе `acme`:

| Параметр                             | Значение по умолчанию | Описание |
|--------------------------------------|------------------------|----------|
| `zookeeper_path`                     | `/clickhouse/acme`   | Путь в ZooKeeper, используемый для хранения данных учетной записи ACME, сертификатов и состояния координации между узлами ClickHouse. |
| `directory_url`                     | `https://acme-v02.api.letsencrypt.org/directory` | Endpoint каталога ACME, используемый для выпуска сертификатов. По умолчанию используется production-сервер Let's Encrypt. |
| `email`                              |              | Адрес электронной почты, используемый для создания и управления учетной записью ACME. Поставщики ACME могут использовать его для уведомлений об истечении срока действия и важных обновлениях. |
| `terms_of_service_agreed`            | `false`       | Указывает на то, приняты ли условия использования (Terms of Service) поставщика ACME. Должен быть установлен в `true` для включения ACME. |
| `domains`                            |              | Список доменных имен, для которых должны выпускаться TLS-сертификаты. Каждый домен указывается как элемент `<domain>`. |
| `refresh_certificates_before`        | `2592000` (один месяц, в секундах)         | Время до истечения срока действия сертификата, за которое ClickHouse попытается продлить сертификат. |
| `refresh_certificates_task_interval` | `3600` (один час, в секундах)          | Интервал, с которым ClickHouse проверяет, требуется ли продление сертификатов. |

Обратите внимание, что по умолчанию в конфигурации используется production-каталог Let's Encrypt. Чтобы избежать превышения квоты запросов из‑за возможных ошибок в конфигурации, рекомендуется сначала протестировать процесс выпуска сертификатов с [staging-каталогом](https://letsencrypt.org/docs/staging-environment/).

# Администрирование {#administration}

## Первоначальное развертывание {#initial-deployment}

При включении клиента ACME в кластере с несколькими репликами требуется дополнительное внимание во время первоначальной выдачи сертификата.

Первая реплика, которая запустится с включённым ACME, немедленно попытается создать ACME-заказ и выполнить проверку HTTP-01 challenge. Если в этот момент только часть реплик обслуживает трафик, проверка, вероятнее всего, завершится неудачно, так как остальные реплики не смогут ответить на запросы валидации.

По возможности рекомендуется временно направить трафик на одну реплику (например, изменив DNS-записи) и дождаться завершения процедуры первоначальной выдачи сертификата. После того как сертификат будет успешно выпущен и сохранён в Keeper, ACME можно включить на оставшихся репликах. Они автоматически повторно используют существующий сертификат и будут участвовать в последующих продлениях.

Если направить трафик на одну реплику невозможно, альтернативный подход заключается в ручной загрузке существующего сертификата и приватного ключа в Keeper до включения клиента ACME. Это позволяет избежать первоначального шага валидации и запустить все реплики уже с действующим сертификатом.

После того как первоначальный сертификат был выпущен или импортирован, продление сертификата не требует специальной обработки, так как все реплики уже будут запускать клиент ACME и разделять состояние через Keeper.

## Структура данных Keeper {#keeper-data-structure}

```text
/clickhouse/acme
└── <acme-directory-host>
    ├── account_private_key          # ACME account private key (PEM)
    ├── challenges                   # Active HTTP-01 challenge state
    └── domains
        └── <domain-name>
            ├── certificate          # Issued TLS certificate (PEM)
            └── private_key          # Domain private key (PEM)
```


## Миграция с других ACME‑клиентов {#migrating-from-other-acme-clients}

Можно перенести текущие TLS‑сертификат и ключ в Keeper для упрощения миграции.
На данный момент сервер поддерживает только ключи `RSA 2048`.

Предположим, что мы мигрируем с `certbot` и используем каталог `/etc/letsencrypt/live`. Тогда можно выполнить следующие команды:

```bash
DOMAIN=example.com
CERT_DIR=/etc/letsencrypt/live/$DOMAIN
ZK_BASE=/clickhouse/acme/acme-v02.api.letsencrypt.org/domains/$DOMAIN

clickhouse keeper-client -q "create '/clickhouse' ''"
clickhouse keeper-client -q "create '/clickhouse/acme' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org/domains' ''"
clickhouse keeper-client -q "create '$ZK_BASE' ''"

clickhouse keeper-client -q "create '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""

clickhouse keeper-client -q "create '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
```
