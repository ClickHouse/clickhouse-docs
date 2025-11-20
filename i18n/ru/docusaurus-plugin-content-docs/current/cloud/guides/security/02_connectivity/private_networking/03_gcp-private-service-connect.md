---
title: 'Приватное подключение сервиса GCP'
description: 'В этом документе описывается, как подключиться к ClickHouse Cloud с помощью Google Cloud Platform (GCP) Private Service Connect (PSC), а также как запретить доступ к вашим сервисам ClickHouse Cloud с IP-адресов, отличных от адресов GCP PSC, с использованием списков IP-доступа в ClickHouse Cloud.'
sidebar_label: 'Приватное подключение сервиса GCP'
slug: /manage/security/gcp-private-service-connect
doc_type: 'guide'
keywords: ['Private Service Connect']
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

<ScalePlanFeatureBadge feature='GCP PSC' />

Private Service Connect (PSC) — это функция сетевого взаимодействия Google Cloud, которая позволяет потребителям получать частный доступ к управляемым сервисам внутри их виртуальной частной облачной сети (VPC). Аналогично, она позволяет поставщикам управляемых сервисов размещать эти сервисы в своих собственных отдельных сетях VPC и предоставлять частное подключение своим потребителям.

Поставщики сервисов публикуют свои приложения для потребителей, создавая сервисы Private Service Connect. Потребители сервисов получают доступ к этим сервисам Private Service Connect напрямую через один из типов Private Service Connect.

<Image
  img={gcp_psc_overview}
  size='lg'
  alt='Обзор Private Service Connect'
  border
/>

:::important
По умолчанию сервис ClickHouse недоступен через подключение Private Service, даже если подключение PSC одобрено и установлено; необходимо явно добавить идентификатор PSC в список разрешенных на уровне экземпляра, выполнив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::

**Важные аспекты использования Private Service Connect Global Access**:

1. Регионы, использующие Global Access, должны принадлежать одной VPC.
1. Global Access должен быть явно включен на уровне PSC (см. снимок экрана ниже).
1. Убедитесь, что настройки вашего межсетевого экрана не блокируют доступ к PSC из других регионов.
1. Имейте в виду, что может взиматься плата за межрегиональную передачу данных GCP.

Межрегиональное подключение не поддерживается. Регионы поставщика и потребителя должны совпадать. Однако вы можете подключаться из других регионов внутри вашей VPC, включив [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Private Service Connect (PSC).

**Для включения GCP PSC выполните следующие действия**:

1. Получите service attachment GCP для Private Service Connect.
1. Создайте конечную точку сервиса.
1. Добавьте "Endpoint ID" в сервис ClickHouse Cloud.
1. Добавьте "Endpoint ID" в список разрешенных сервиса ClickHouse.


## Внимание {#attention}

ClickHouse пытается группировать ваши сервисы для повторного использования одной и той же опубликованной [конечной точки PSC](https://cloud.google.com/vpc/docs/private-service-connect) в пределах региона GCP. Однако такая группировка не гарантируется, особенно если ваши сервисы распределены между несколькими организациями ClickHouse.
Если у вас уже настроен PSC для других сервисов в вашей организации ClickHouse, вы можете пропустить большинство шагов благодаря этой группировке и перейти сразу к последнему шагу: [Добавить "Endpoint ID" в список разрешённых для сервиса ClickHouse](#add-endpoint-id-to-services-allow-list).

Примеры Terraform можно найти [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).


## Прежде чем начать {#before-you-get-started}

:::note
Ниже приведены примеры кода, показывающие, как настроить Private Service Connect для сервиса ClickHouse Cloud. В наших примерах используются следующие значения:

- Регион GCP: `us-central1`
- Проект GCP (клиентский проект GCP): `my-gcp-project`
- Частный IP-адрес в клиентском проекте GCP: `10.128.0.2`
- VPC в клиентском проекте GCP: `default`
  :::

Вам необходимо получить информацию о вашем сервисе ClickHouse Cloud. Это можно сделать через консоль ClickHouse Cloud или через API ClickHouse. Если вы собираетесь использовать API ClickHouse, установите следующие переменные окружения перед началом работы:

```shell
REGION=<Код вашего региона в формате GCP, например: us-central1>
PROVIDER=gcp
KEY_ID=<ID вашего ключа ClickHouse>
KEY_SECRET=<Секретный ключ ClickHouse>
ORG_ID=<ID вашей организации ClickHouse>
SERVICE_NAME=<Имя вашего сервиса ClickHouse>
```

Вы можете [создать новый ключ API ClickHouse Cloud](/cloud/manage/openapi) или использовать существующий.

Получите ваш `INSTANCE_ID` ClickHouse, отфильтровав результаты по региону, провайдеру и имени сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

- Вы можете получить ID организации в консоли ClickHouse (Organization -> Organization Details).
- Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.
  :::


## Получение service attachment GCP и DNS-имени для Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через Private Service Connect, затем откройте меню **Settings**. Нажмите кнопку **Set up private endpoint**. Запишите значения **Service name** (`endpointServiceId`) и **DNS name** (`privateDnsHostname`). Они понадобятся на следующих шагах.

<Image
  img={gcp_privatelink_pe_create}
  size='lg'
  alt='Приватные эндпоинты'
  border
/>

### Вариант 2: API {#option-2-api}

:::note
Для выполнения этого шага в регионе должен быть развернут хотя бы один инстанс.
:::

Получите service attachment GCP и DNS-имя для Private Service Connect:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Запишите значения `endpointServiceId` и `privateDnsHostname`. Они понадобятся на следующих шагах.


## Создание конечной точки сервиса {#create-service-endpoint}

:::important
В этом разделе описываются особенности настройки ClickHouse через GCP PSC (Private Service Connect). Шаги, специфичные для GCP, приведены в качестве справочной информации, но они могут измениться со временем без уведомления со стороны облачного провайдера GCP. Учитывайте конфигурацию GCP в соответствии с вашим конкретным сценарием использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых конечных точек GCP PSC и DNS-записей.

По любым вопросам, связанным с настройкой GCP, обращайтесь напрямую в службу поддержки GCP.
:::

В этом разделе мы создадим конечную точку сервиса.

### Добавление частного подключения к сервису {#adding-a-private-service-connection}

Сначала создадим частное подключение к сервису (Private Service Connection).

#### Вариант 1: Использование консоли Google Cloud {#option-1-using-google-cloud-console}

В консоли Google Cloud перейдите в раздел **Network services -> Private Service Connect**.

<Image
  img={gcp_psc_open}
  size='lg'
  alt='Открытие Private Service Connect в консоли Google Cloud'
  border
/>

Откройте диалоговое окно создания Private Service Connect, нажав на кнопку **Connect Endpoint**.

- **Target**: используйте **Published service**
- **Target service**: используйте `endpointServiceId`<sup>API</sup> или `Service name`<sup>console</sup> из шага [Получение service attachment GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
- **Endpoint name**: задайте имя для **Endpoint name** PSC.
- **Network/Subnetwork/IP address**: Выберите сеть, которую вы хотите использовать для подключения. Вам потребуется создать IP-адрес или использовать существующий для конечной точки Private Service Connect. В нашем примере мы предварительно создали адрес с именем **your-ip-address** и назначили IP-адрес `10.128.0.2`
- Чтобы сделать конечную точку доступной из любого региона, включите флажок **Enable global access**.

<Image
  img={gcp_psc_enable_global_access}
  size='md'
  alt='Включение глобального доступа для Private Service Connect'
  border
/>

Для создания конечной точки PSC нажмите кнопку **ADD ENDPOINT**.

Столбец **Status** изменится с **Pending** на **Accepted** после одобрения подключения.

<Image
  img={gcp_psc_copy_connection_id}
  size='lg'
  alt='Копирование идентификатора подключения PSC'
  border
/>

Скопируйте **_PSC Connection ID_** — мы будем использовать его в качестве **_Endpoint ID_** на следующих шагах.

#### Вариант 2: Использование Terraform {#option-2-using-terraform}

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
  target = "https://www.googleapis.com/compute/v1/$TARGET" # См. примечание ниже
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Добавьте идентификатор подключения GCP PSC в список разрешенных на уровне экземпляра."
}
```

:::note
используйте `endpointServiceId`<sup>API</sup> или `Service name`<sup>console</sup> из шага [Получение service attachment GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)
:::


## Настройка частного DNS-имени для конечной точки {#set-private-dns-name-for-endpoint}

:::note
Существует несколько способов настройки DNS. Настройте DNS в соответствии с вашим конкретным сценарием использования.
:::

Необходимо направить «DNS name», полученное на шаге [Получение service attachment GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP-адрес конечной точки GCP Private Service Connect. Это обеспечит корректное разрешение имени службами и компонентами внутри вашей VPC/сети.


## Добавление идентификатора конечной точки в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

### Вариант 1: консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в вашу организацию, перейдите к шагу [Добавление "Endpoint ID" в список разрешённых для сервиса ClickHouse](#add-endpoint-id-to-services-allow-list). Добавление `PSC Connection ID` в список разрешённых для сервисов через консоль ClickHouse Cloud автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Organization details -> Private Endpoints** и нажмите кнопку удаления конечной точки.

<Image
  img={gcp_pe_remove_private_endpoint}
  size='lg'
  alt='Удаление приватной конечной точки из ClickHouse Cloud'
  border
/>

### Вариант 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением команд:

Замените `ENDPOINT_ID` ниже значением из **Endpoint ID**, полученным на шаге [Добавление Private Service Connection](#adding-a-private-service-connection)

Чтобы добавить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "Приватная конечная точка GCP",
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

Добавление/удаление приватной конечной точки в организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## Добавление Endpoint ID в список разрешённых для сервиса ClickHouse {#add-endpoint-id-to-services-allow-list}

Необходимо добавить Endpoint ID в список разрешённых для каждого экземпляра, который должен быть доступен через Private Service Connect.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через Private Service Connect, затем перейдите в раздел **Settings**. Введите `Endpoint ID`, полученный на шаге [Добавление подключения Private Service Connection](#adding-a-private-service-connection). Нажмите **Create endpoint**.

:::note
Если вы хотите разрешить доступ из существующего подключения Private Service Connect, используйте выпадающее меню существующих endpoint.
:::

<Image
  img={gcp_privatelink_pe_filters}
  size='lg'
  alt='Фильтр Private Endpoints'
  border
/>

### Вариант 2: API {#option-2-api-2}

Установите следующие переменные окружения перед выполнением команд:

Замените **ENDPOINT_ID** ниже значением **Endpoint ID**, полученным на шаге [Добавление подключения Private Service Connection](#adding-a-private-service-connection)

Выполните это для каждого сервиса, который должен быть доступен через Private Service Connect.

Для добавления:

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

Для удаления:

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


## Доступ к экземпляру через Private Service Connect {#accessing-instance-using-private-service-connect}

Каждый сервис с включенным Private Link имеет публичную и приватную конечные точки. Для подключения через Private Link необходимо использовать приватную конечную точку, которая указывается в параметре `privateDnsHostname`, полученном из раздела [Получение service attachment GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).

### Получение приватного DNS-имени хоста {#getting-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в раздел **Settings**. Нажмите кнопку **Set up private endpoint**. В открывшейся панели скопируйте значение **DNS Name**.

<Image
  img={gcp_privatelink_pe_dns}
  size='lg'
  alt='DNS-имя приватной конечной точки'
  border
/>

#### Вариант 2: API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

В данном примере подключение к хосту `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет маршрутизироваться через Private Service Connect, в то время как подключение к `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет осуществляться через интернет.


## Устранение неполадок {#troubleshooting}

### Проверка настройки DNS {#test-dns-setup}

DNS_NAME — используйте `privateDnsHostname` из шага [Получение вложения сервиса GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### Соединение сброшено удалённой стороной {#connection-reset-by-peer}

- Скорее всего, идентификатор конечной точки не был добавлен в список разрешённых для сервиса. Вернитесь к шагу [_Добавление идентификатора конечной точки в список разрешённых для сервиса_](#add-endpoint-id-to-services-allow-list).

### Проверка подключения {#test-connectivity}

Если у вас возникли проблемы с подключением через PSC, проверьте подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Service Connect имеет значение `Accepted`:

OpenSSL должен успешно подключиться (в выводе должно быть CONNECTED). Ошибка `errno=104` ожидаема.

DNS_NAME — используйте `privateDnsHostname` из шага [Получение вложения сервиса GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
openssl s_client -connect ${DNS_NAME}:9440
```


```response
# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
no peer certificate available
---
No client certificate CA names sent
---
SSL handshake has read 0 bytes and written 335 bytes
Verification: OK
---
New, (NONE), Cipher is (NONE)
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
```

### Проверка фильтров эндпоинтов {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Подключение к удалённой базе данных {#connecting-to-a-remote-database}

Предположим, вы хотите использовать табличные функции [MySQL](/sql-reference/table-functions/mysql) или [PostgreSQL](/sql-reference/table-functions/postgresql) в ClickHouse Cloud и подключиться к вашей базе данных, размещённой в GCP. GCP PSC нельзя использовать для безопасного установления такого соединения. PSC — это односторонняя, однонаправленная связь. Она позволяет вашей внутренней сети или GCP VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

According to the [GCP Private Service Connect documentation](https://cloud.google.com/vpc/docs/private-service-connect):

> Сервис-ориентированная архитектура: сервисы-производители публикуются через балансировщики нагрузки, которые предоставляют один IP-адрес сети VPC потребителя. Трафик потребителя, обращающийся к сервисам-производителям, является однонаправленным и может получить доступ только к IP-адресу сервиса, а не ко всей пиринговой сети VPC.

Для этого настройте правила файрвола GCP VPC так, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/приватному сервису базы данных. Ознакомьтесь с [исходящими IP-адресами по умолчанию для регионов ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api), а также с [доступными статическими IP-адресами](https://api.clickhouse.cloud/static-ips.json).


## Дополнительная информация {#more-information}

Подробнее см. [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
