---
title: 'GCP Private Service Connect'
description: 'Этот документ описывает, как подключиться к ClickHouse Cloud с использованием Google Cloud Platform (GCP) Private Service Connect (PSC), и как отключить доступ к вашим услугам ClickHouse Cloud с адресов, отличных от адресов GCP PSC, используя списки доступа по IP ClickHouse Cloud.'
sidebar_label: 'GCP Private Service Connect'
slug: /manage/security/gcp-private-service-connect
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import gcp_psc_overview from '@site/static/images/cloud/security/gcp-psc-overview.png';
import gcp_privatelink_pe_create from '@site/static/images/cloud/security/gcp-privatelink-pe-create.png';
import gcp_psc_open from '@site/static/images/cloud/security/gcp-psc-open.png';
import gcp_psc_enable_global_access from '@site/static/images/cloud/security/gcp-psc-enable-global-access.png';
import gcp_psc_copy_connection_id from '@site/static/images/cloud/security/gcp-psc-copy-connection-id.png';
import gcp_psc_create_zone from '@site/static/images/cloud/security/gcp-psc-create-zone.png';
import gcp_psc_zone_type from '@site/static/images/cloud/security/gcp-psc-zone-type.png';
import gcp_psc_dns_record from '@site/static/images/cloud/security/gcp-psc-dns-record.png';
import gcp_pe_remove_private_endpoint from '@site/static/images/cloud/security/gcp-pe-remove-private-endpoint.png';
import gcp_privatelink_pe_filters from '@site/static/images/cloud/security/gcp-privatelink-pe-filters.png';
import gcp_privatelink_pe_dns from '@site/static/images/cloud/security/gcp-privatelink-pe-dns.png';


# Private Service Connect {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect (PSC) — это сетевые возможности Google Cloud, которые позволяют пользователям получать доступ к управляемым услугам приватно внутри своей виртуальной частной облачной сети (VPC). Аналогично, они позволяют производителям управляемых услуг размещать эти услуги в своих собственных отдельных сетях VPC и предлагать приватное соединение своим потребителям.

Производители услуг публикуют свои приложения для пользователей, создавая услуги Private Service Connect. Потребители услуг получают доступ к этим услугам Private Service Connect напрямую через один из этих типов Private Service Connect.

<Image img={gcp_psc_overview} size="lg" alt="Обзор Private Service Connect" border />

:::important
По умолчанию услуга ClickHouse недоступна через частное сервисное соединение, даже если соединение PSC одобрено и установлено; вам необходимо явно добавить ID PSC в список разрешенных на уровне экземпляра, выполнив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::

**Важные моменты при использовании Global Access Private Service Connect**:
1. Регионы, использующие глобальный доступ, должны принадлежать одной и той же VPC.
1. Глобальный доступ должен быть явно включен на уровне PSC (см. скриншот ниже).
1. Убедитесь, что ваши настройки брандмауэра не блокируют доступ к PSC из других регионов.
1. Имейте в виду, что вы можете понести расходы на межрегиональную передачу данных GCP.

Кросс-региональное подключение не поддерживается. Регионы производителя и потребителя должны быть одинаковыми. Тем не менее, вы можете подключаться из других регионов в рамках вашей VPC, включив [глобальный доступ](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Private Service Connect (PSC).

**Пожалуйста, выполните следующие шаги для включения GCP PSC**:
1. Получите присоединение службы GCP для Private Service Connect.
1. Создайте конечную точку службы.
1. Добавьте "Endpoint ID" в услугу ClickHouse Cloud.
1. Добавьте "Endpoint ID" в список разрешенных услуг ClickHouse.

## Внимание {#attention}
ClickHouse пытается сгруппировать ваши услуги, чтобы повторно использовать один и тот же опубликованный [PSC endpoint](https://cloud.google.com/vpc/docs/private-service-connect) в регионе GCP. Однако такая группировка не гарантируется, особенно если вы распределяете свои услуги между несколькими организациями ClickHouse. Если у вас уже настроен PSC для других услуг в вашей организации ClickHouse, вы часто можете пропустить большинство шагов благодаря этой группировке и перейти сразу к последнему шагу: [Добавить "Endpoint ID" в список разрешенных услуг ClickHouse](#add-endpoint-id-to-services-allow-list).

Найдите примеры Terraform [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Перед тем как начать {#before-you-get-started}

:::note
Примеры кода приведены ниже, чтобы показать, как настроить Private Service Connect в рамках услуги ClickHouse Cloud. В наших примерах мы будем использовать:
 - Регион GCP: `us-central1`
 - Проект GCP (проект GCP клиента): `my-gcp-project`
 - Приватный IP-адрес GCP в проекте GCP клиента: `10.128.0.2`
 - VPC GCP в проекте GCP клиента: `default`
:::

Вам необходимо получить информацию о вашей услуге ClickHouse Cloud. Вы можете сделать это либо через консоль ClickHouse Cloud, либо через API ClickHouse. Если вы собираетесь использовать API ClickHouse, пожалуйста, установите следующие переменные окружения перед продолжением:

```shell
REGION=<Ваш код региона в формате GCP, например: us-central1>
PROVIDER=gcp
KEY_ID=<Ваш ClickHouse key ID>
KEY_SECRET=<Ваш ClickHouse key secret>
ORG_ID=<Ваш ClickHouse organization ID>
SERVICE_NAME=<Ваш ClickHouse service name>
```

Вы можете [создать новый ключ API ClickHouse Cloud](/cloud/manage/openapi) или использовать существующий.

Получите ваш `INSTANCE_ID` ClickHouse, отфильтровав по региону, поставщику и имени услуги:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - Вы можете получить свой ID организации в консоли ClickHouse (Организация -> Подробности организации).
 - Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.
:::

## Получите присоединение службы GCP и DNS-имя для Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте услугу, к которой вы хотите подключиться через Private Service Connect, затем откройте меню **Настройки**. Нажмите кнопку **Настроить приватную конечную точку**. Обратите внимание на **Имя службы** (`endpointServiceId`) и **DNS-имя** (`privateDnsHostname`). Они понадобятся вам в следующих шагах.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Приватные конечные точки" border />

### Вариант 2: API {#option-2-api}

:::note
Вам необходимо, чтобы по крайней мере один экземпляр был развернут в регионе для выполнения этого шага.
:::

Получите присоединение службы GCP и DNS-имя для Private Service Connect:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Обратите внимание на `endpointServiceId` и `privateDnsHostname`. Они понадобятся вам в следующих шагах.

## Создать конечную точку службы {#create-service-endpoint}

:::important
Этот раздел охватывает специфические детали ClickHouse для настройки ClickHouse через GCP PSC (Private Service Connect). Шаги, специфичные для GCP, предоставлены в качестве справки, чтобы направить вас на правильный путь, но они могут изменяться со временем без предварительного уведомления поставщика облачных услуг GCP. Пожалуйста, принимайте во внимание настройки GCP в зависимости от вашего конкретного случая.

Обратите внимание, что ClickHouse не несет ответственность за настройку необходимых конечных точек PSC GCP, DNS-записей.

По любым вопросам, связанным с задачами настройки GCP, обращайтесь в службу поддержки GCP напрямую.
:::

В этом разделе мы собираемся создать конечную точку службы.

### Добавление частного сервисного подключения {#adding-a-private-service-connection}

Для начала мы создадим частное сервисное подключение.

#### Вариант 1: Используя консоль Google Cloud {#option-1-using-google-cloud-console}

В консоли Google Cloud перейдите в **Сетевые услуги -> Private Service Connect**.

<Image img={gcp_psc_open} size="lg" alt="Открыть Private Service Connect в консоли Google Cloud" border />

Откройте диалоговое окно создания Private Service Connect, нажав кнопку **Подключить конечную точку**.

- **Цель**: используйте **Опубликованную услугу**
- **Целевая служба**: используйте `endpointServiceId`<sup>API</sup> или `Имя службы`<sup>консоль</sup> из шага [Получите присоединение службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
- **Имя конечной точки**: задайте имя для **Имени конечной точки** PSC.
- **Сеть/Подсеть/IP-адрес**: выберите сеть, которую вы хотите использовать для подключения. Вам нужно будет создать IP-адрес или использовать существующий для конечной точки Private Service Connect. В нашем примере мы заранее создали адрес с именем **your-ip-address** и назначили IP-адрес `10.128.0.2`.
- Чтобы сделать конечную точку доступной из любого региона, вы можете включить флажок **Включить глобальный доступ**.

<Image img={gcp_psc_enable_global_access} size="md" alt="Включить глобальный доступ для Private Service Connect" border />

Для создания конечной точки PSC используйте кнопку **ДОБАВИТЬ КОНЕЧНУЮ ТОЧКУ**.

Столбец **Статус** изменится с **Ожидание** на **Принято**, после того как подключение будет одобрено.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Скопировать ID соединения PSC" border />

Скопируйте ***ID соединения PSC***, мы собираемся использовать его как ***Endpoint ID*** в следующих шагах.

#### Вариант 2: Используя Terraform {#option-2-using-terraform}

```json
provider "google" {
  project = "my-gcp-project"
  region  = "us-central1"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "subnetwork" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/regions/us-central1/subnetworks/default"
}

variable "network" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
}

resource "google_compute_address" "psc_endpoint_ip" {
  address      = "10.128.0.2"
  address_type = "INTERNAL"
  name         = "your-ip-address"
  purpose      = "GCE_ENDPOINT"
  region       = var.region
  subnetwork   = var.subnetwork
}

resource "google_compute_forwarding_rule" "clickhouse_cloud_psc" {
  ip_address            = google_compute_address.psc_endpoint_ip.self_link
  name                  = "ch-cloud-${var.region}"
  network               = var.network
  region                = var.region
  load_balancing_scheme = ""
  # service attachment
  target = "https://www.googleapis.com/compute/v1/$TARGET" # См. ниже в примечаниях
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Добавьте GCP PSC Connection ID в список разрешенных на уровне экземпляра."
}
```

:::note
используйте `endpointServiceId`<sup>API</sup> или `Имя службы`<sup>консоль</sup> из шага [Получите присоединение службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)
:::

## Установите частное DNS-имя для конечной точки {#setting-up-dns}

:::note
Существует несколько способов настройки DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем.
:::

Вам необходимо указать "DNS имя", полученное из шага [Получите присоединение службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP-адрес конечной точки GCP Private Service Connect. Это обеспечит правильное разрешение для служб/компонентов в вашей VPC/Сети.

## Добавить ID конечной точки в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в вашу организацию, перейдите к шагу [Добавить "Endpoint ID" в список разрешенных услуг ClickHouse](#add-endpoint-id-to-services-allow-list). Добавление `PSC Connection ID` с помощью консоли ClickHouse Cloud в список разрешенных услуг автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Подробности организации -> Приватные конечные точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Удалить частную конечную точку из ClickHouse Cloud" border />

### Вариант 2: API {#option-2-api-1}

Установите эти переменные окружения перед выполнением любых команд:

Замените `ENDPOINT_ID` ниже на значение из **Endpoint ID** из шага [Добавление частного сервисного подключения](#adding-a-private-service-connection)

Чтобы добавить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "Частная конечная точка GCP",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Чтобы удалить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Добавьте/удалите частную конечную точку в организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавить "Endpoint ID" в список разрешенных услуг ClickHouse {#add-endpoint-id-to-services-allow-list}

Вам необходимо добавить ID конечной точки в список разрешенных для каждого экземпляра, который должен быть доступен с использованием Private Service Connect.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте услугу, к которой вы хотите подключиться через Private Service Connect, затем перейдите в **Настройки**. Введите `Endpoint ID`, полученный из шага [Добавление частного сервисного подключения](#adding-a-private-service-connection). Нажмите **Создать конечную точку**.

:::note
Если вы хотите разрешить доступ из существующего соединения Private Service Connect, используйте выпадающее меню существующей конечной точки.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Фильтр частных конечных точек" border />

### Вариант 2: API {#option-2-api-2}

Установите эти переменные окружения перед выполнением любых команд:

Замените **ENDPOINT_ID** ниже на значение из **Endpoint ID** из шага [Добавление частного сервисного подключения](#adding-a-private-service-connection)

Выполните это для каждой службы, которая должна быть доступна с использованием Private Service Connect.

Чтобы добавить:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

Чтобы удалить:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Доступ к экземпляру с использованием Private Service Connect {#accessing-instance-using-private-service-connect}

Каждая служба с включенным Private Link имеет публичную и приватную конечную точку. Чтобы подключиться с использованием Private Link, вам необходимо использовать приватную конечную точку, которая будет `privateDnsHostname`, взятая из шага [Получите присоединение службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).

### Получение приватного DNS-имени {#getting-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите кнопку **Настроить приватную конечную точку**. В открывшемся меню скопируйте **DNS-имя**.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="DNS-имя приватной конечной точки" border />

#### Вариант 2: API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<код региона>.p.gcp.clickhouse.cloud"
}
```

В этом примере подключение к хосту `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет маршрутизироваться через Private Service Connect. Тем временем, `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет маршрутизироваться через интернет.

## Устранение неполадок {#troubleshooting}

### Проверка настроек DNS {#test-dns-setup}

DNS_NAME - Используйте `privateDnsHostname` из шага [Получите присоединение службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
nslookup $DNS_NAME
```

```response
Ответ без авторитета:
...
Адрес: 10.128.0.2
```

### Соединение сброшено соперником {#connection-reset-by-peer}

- Скорее всего, ID конечной точки не был добавлен в список разрешенных услуг. Вернитесь к шагу [_Добавить ID конечной точки в список разрешенных услуг_](#add-endpoint-id-to-services-allow-list).

### Проверка подключения {#test-connectivity}

Если у вас возникли проблемы с подключением с использованием PSC ссылки, проверьте ваше подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Service Connect — `Принято`:

OpenSSL должен быть в состоянии подключиться (посмотрите CONNECTED в выводе). `errno=104` ожидается.

DNS_NAME - Используйте `privateDnsHostname` из шага [Получите присоединение службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
нет информации о сертификате соперника
---
Не отправлены имена CA клиентского сертификата
---
SSL handshake прочитал 0 байт и записал 335 байт
Проверка: ОК
---
Новой, (НИЧЕГО), Шифр (НИЧЕГО)
Поддержка безопасной переоценки НЕ поддерживается
Сжатие: НЕТ
Расширение: НЕТ
ALPN не согласовано
Ранние данные не были отправлены
Код возврата проверки: 0 (ок)
```

### Проверка фильтров конечной точки {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Подключение к удалённой базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) функции таблиц в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в GCP. GCP PSC не может быть использован для безопасного подключения. PSC — это однонаправленное соединение. Оно позволяет вашей внутренней сети или GCP VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации GCP Private Service Connect](https://cloud.google.com/vpc/docs/private-service-connect):

> Ориентированный на услуги проект: Услуги производителей публикуются через балансировщики нагрузки, которые открывают один IP-адрес для сети VPC потребителя. Трафик потребителей, который обращается к услугам производителей, одномерен и может получить доступ только к IP-адресу службы, а не ко всей сети VPC, с которой создано соединение.

Для этого настройте правила брандмауэра вашей GCP VPC, чтобы разрешить подключения от ClickHouse Cloud к вашей внутренней/приватной службе базы данных. Проверьте [стандартные исходящие IP-адреса для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).

## Дополнительная информация {#more-information}

Для получения более подробной информации посетите [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
