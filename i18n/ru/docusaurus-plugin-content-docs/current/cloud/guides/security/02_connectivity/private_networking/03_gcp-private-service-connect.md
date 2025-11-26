---
title: "GCP Private Service Connect"
description: "В этом документе описывается, как подключиться к ClickHouse Cloud с помощью Google Cloud Platform (GCP) Private Service Connect (PSC) и как с помощью списков IP-доступа ClickHouse Cloud запретить доступ к вашим сервисам ClickHouse Cloud с любых адресов, кроме адресов GCP PSC."
sidebar_label: "GCP Private Service Connect"
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

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect (PSC) — это сетевая возможность Google Cloud, которая позволяет потребителям приватно получать доступ к управляемым сервисам внутри их виртуальной частной облачной сети (VPC). Аналогично, она позволяет поставщикам управляемых сервисов размещать эти сервисы в отдельных VPC-сетях и предоставлять своим потребителям приватное подключение.

Поставщики сервисов публикуют свои приложения для потребителей, создавая сервисы Private Service Connect. Потребители сервисов получают доступ к этим сервисам Private Service Connect напрямую через один из типов подключений Private Service Connect.

<Image img={gcp_psc_overview} size="lg" alt="Overview of Private Service Connect" border />

:::important
По умолчанию сервис ClickHouse недоступен через подключение Private Service Connect, даже если PSC-подключение одобрено и установлено; необходимо явно добавить идентификатор PSC в список разрешённых подключений на уровне инстанса, выполнив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::

**Важные замечания по использованию Private Service Connect Global Access**:
1. Регионы, использующие Global Access, должны принадлежать одной и той же VPC.
1. Global Access необходимо явно включить на уровне PSC (см. скриншот ниже).
1. Убедитесь, что настройки межсетевого экрана не блокируют доступ к PSC из других регионов.
1. Имейте в виду, что у вас могут возникнуть расходы на межрегиональную передачу данных GCP.

Межрегиональные подключения не поддерживаются. Регионы поставщика и потребителя должны совпадать. Однако вы можете подключаться из других регионов внутри вашей VPC, включив [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Private Service Connect (PSC).

**Выполните следующие действия, чтобы включить GCP PSC**:
1. Получите ресурс service attachment в GCP для Private Service Connect.
1. Создайте endpoint сервиса (service endpoint).
1. Добавьте идентификатор конечной точки (Endpoint ID) в сервис ClickHouse Cloud.
1. Добавьте идентификатор конечной точки (Endpoint ID) в список разрешённых подключений (allow list) сервиса ClickHouse.



## Внимание {#attention}
ClickHouse пытается группировать ваши сервисы, чтобы повторно использовать один и тот же опубликованный [PSC endpoint](https://cloud.google.com/vpc/docs/private-service-connect) в пределах региона GCP. Однако такая группировка не гарантируется, особенно если вы распределяете свои сервисы между несколькими организациями ClickHouse.
Если у вас уже настроен PSC для других сервисов в вашей организации ClickHouse, вы часто можете пропустить большинство шагов благодаря этой группировке и перейти непосредственно к заключительному шагу: [добавить «Endpoint ID» в список разрешённых сервисов ClickHouse](#add-endpoint-id-to-services-allow-list).

Примеры Terraform доступны [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).



## Прежде чем начать

:::note
Примеры кода ниже демонстрируют, как настроить Private Service Connect в сервисе ClickHouse Cloud. В наших примерах мы будем использовать:

* регион GCP: `us-central1`
* проект GCP (проект GCP клиента): `my-gcp-project`
* приватный IP-адрес GCP в проекте GCP клиента: `10.128.0.2`
* VPC GCP в проекте GCP клиента: `default`
  :::

Вам потребуется получить сведения о своем сервисе ClickHouse Cloud. Это можно сделать либо через консоль ClickHouse Cloud, либо через ClickHouse API. Если вы собираетесь использовать ClickHouse API, перед продолжением установите следующие переменные среды:

```shell
REGION=<Код региона в формате GCP, например: us-central1>
PROVIDER=gcp
KEY_ID=<ID ключа ClickHouse>
KEY_SECRET=<Секретная часть ключа ClickHouse>
ORG_ID=<ID организации ClickHouse>
SERVICE_NAME=<Имя сервиса ClickHouse>
```

Вы можете [создать новый API-ключ ClickHouse Cloud](/cloud/manage/openapi) или использовать уже существующий.

Получите свой `INSTANCE_ID` ClickHouse, отфильтровав по региону, провайдеру и имени сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

* Вы можете получить ID организации (Organization ID) в консоли ClickHouse (Organization -&gt; Organization Details).
* Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать уже существующий.
  :::


## Получите подключение сервиса GCP (service attachment) и имя DNS для Private Service Connect

### Вариант 1: консоль ClickHouse Cloud

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через Private Service Connect, затем откройте меню **Settings**. Нажмите кнопку **Set up private endpoint**. Запишите значения **Service name** (`endpointServiceId`) и **DNS name** (`privateDnsHostname`). Вы будете использовать их в последующих шагах.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Приватные конечные точки" border />

### Вариант 2: API

:::note
Для выполнения этого шага в регионе должен быть развернут как минимум один инстанс.
:::

Получите подключение сервиса GCP (service attachment) и имя DNS для Private Service Connect:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Запомните значения `endpointServiceId` и `privateDnsHostname`. Они понадобятся на следующих шагах.


## Создание конечной точки сервиса

:::important
В этом разделе рассматриваются специфичные для ClickHouse детали настройки ClickHouse через GCP PSC (Private Service Connect). Шаги, связанные с GCP, приведены в качестве справочной информации, чтобы указать, где искать нужные настройки, но со временем они могут меняться без уведомления со стороны облачного провайдера GCP. Пожалуйста, настраивайте GCP в соответствии с вашим конкретным сценарием использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых конечных точек GCP PSC и DNS-записей.

По любым вопросам, связанным с задачами по настройке GCP, обращайтесь непосредственно в службу поддержки GCP.
:::

В этом разделе мы создадим конечную точку сервиса.

### Добавление частного сервисного подключения

Сначала мы создадим Private Service Connection.

#### Вариант 1: Использование консоли Google Cloud

В консоли Google Cloud перейдите в **Network services -&gt; Private Service Connect**.

<Image img={gcp_psc_open} size="lg" alt="Открыть Private Service Connect в консоли Google Cloud" border />

Откройте диалог создания Private Service Connect, нажав кнопку **Connect Endpoint**.

* **Target**: используйте **Published service**
* **Target service**: используйте `endpointServiceId`<sup>API</sup> или `Service name`<sup>console</sup> из шага [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
* **Endpoint name**: задайте имя для **Endpoint name** PSC.
* **Network/Subnetwork/IP address**: выберите сеть, которую вы хотите использовать для подключения. Вам нужно создать IP-адрес или использовать существующий для конечной точки Private Service Connect. В нашем примере мы предварительно создали адрес с именем **your-ip-address** и назначенным IP-адресом `10.128.0.2`.
* Чтобы сделать конечную точку доступной из любого региона, вы можете включить флажок **Enable global access**.

<Image img={gcp_psc_enable_global_access} size="md" alt="Включение Global Access для Private Service Connect" border />

Чтобы создать конечную точку PSC, используйте кнопку **ADD ENDPOINT**.

Столбец **Status** изменится с **Pending** на **Accepted**, как только подключение будет одобрено.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Копирование PSC Connection ID" border />

Скопируйте ***PSC Connection ID*** — мы будем использовать его как ***Endpoint ID*** на следующих шагах.

#### Вариант 2: Использование Terraform

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
  target = "https://www.googleapis.com/compute/v1/$TARGET" # See below in notes
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Добавьте идентификатор подключения GCP PSC в список разрешений на уровне экземпляра."
}
```

:::note
используйте значение `endpointServiceId`<sup>API</sup> или `Service name`<sup>console</sup> из шага [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)
:::


## Задайте приватное DNS-имя для конечной точки {#set-private-dns-name-for-endpoint}

:::note
Существует несколько способов настройки DNS. Настройте DNS в соответствии с вашим конкретным сценарием использования.
:::

Необходимо указать DNS-имя, полученное на шаге [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP-адрес конечной точки GCP Private Service Connect. Это гарантирует, что сервисы и компоненты внутри вашей VPC/сети смогут корректно разрешать это имя.



## Добавление Endpoint ID в организацию ClickHouse Cloud

### Вариант 1: консоль ClickHouse Cloud

Чтобы добавить endpoint в вашу организацию, перейдите к шагу [Добавление «Endpoint ID» в список разрешённых сервисов ClickHouse](#add-endpoint-id-to-services-allow-list). Добавление `PSC Connection ID` в список разрешённых сервисов через консоль ClickHouse Cloud автоматически добавляет его в организацию.

Чтобы удалить endpoint, откройте **Organization details → Private Endpoints** и нажмите кнопку удаления, чтобы удалить endpoint.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Удаление Private Endpoint из ClickHouse Cloud" border />

### Вариант 2: API

Перед выполнением каких-либо команд задайте следующие переменные окружения:

Замените `ENDPOINT_ID` ниже значением из **Endpoint ID** на шаге [Добавление Private Service Connection](#adding-a-private-service-connection).

Чтобы добавить endpoint, выполните:

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

Добавление и удаление частной конечной точки для организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## Добавить «Endpoint ID» в список разрешённых для сервиса ClickHouse

Необходимо добавить Endpoint ID в список разрешённых для каждого экземпляра сервиса, который должен быть доступен через Private Service Connect.

### Вариант 1: консоль ClickHouse Cloud

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через Private Service Connect, затем перейдите в **Settings**. Введите `Endpoint ID`, полученный на шаге [Adding a Private Service Connection](#adding-a-private-service-connection). Нажмите **Create endpoint**.

:::note
Если вы хотите разрешить доступ из уже существующего соединения Private Service Connect, выберите существующий endpoint в выпадающем меню.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Фильтр Private Endpoints" border />

### Вариант 2: API

Перед выполнением любых команд задайте следующие переменные окружения:

Замените **ENDPOINT&#95;ID** ниже на значение поля **Endpoint ID** со шага [Adding a Private Service Connection](#adding-a-private-service-connection).

Выполните это для каждого сервиса, который должен быть доступен через Private Service Connect.

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


## Доступ к экземпляру с использованием Private Service Connect

Каждый сервис с включённым Private Link имеет две конечные точки: публичную и приватную. Для подключения по Private Link необходимо использовать приватную конечную точку `privateDnsHostname`, значение которой берётся из раздела [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).

### Получение приватного DNS-имени хоста

#### Вариант 1: консоль ClickHouse Cloud

В консоли ClickHouse Cloud перейдите в раздел **Settings**. Нажмите кнопку **Set up private endpoint**. В открывшейся панели скопируйте значение **DNS Name**.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="DNS-имя приватной конечной точки" border />

#### Вариант 2: API

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

В этом примере подключение к хосту `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет выполняться через Private Service Connect, тогда как `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет использовать соединение через интернет.


## Устранение неполадок

### Проверка конфигурации DNS

DNS&#95;NAME — используйте значение `privateDnsHostname` из шага [Получение service attachment GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
nslookup $DNS_NAME
```

```response
Неавторитативный ответ:
...
Адрес: 10.128.0.2
```

### Сброс соединения удалённой стороной (Connection reset by peer)

* Скорее всего, Endpoint ID не был добавлен в список разрешённых сервисов (allow-list). Повторно выполните шаг [*Add endpoint ID to services allow-list*](#add-endpoint-id-to-services-allow-list).

### Проверка подключения

Если у вас возникают проблемы с подключением через PSC-ссылку, проверьте подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Service Connect — `Accepted`:

OpenSSL должен суметь подключиться (см. CONNECTED в выводе команды). `errno=104` является ожидаемым.

DNS&#95;NAME — используйте `privateDnsHostname` из шага [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).

```bash
openssl s_client -connect ${DNS_NAME}:9440
```


```response
# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
сертификат узла недоступен
---
Имена CA сертификата клиента не отправлены
---
SSL-рукопожатие прочитало 0 байт и записало 335 байт
Проверка: OK
---
Новое, (НЕТ), Шифр (НЕТ)
Безопасное переподключение НЕ поддерживается
Сжатие: НЕТ
Расширение: НЕТ
ALPN не согласован
Ранние данные не отправлены
Код возврата проверки: 0 (ok)
```

### Проверка фильтров конечных точек

#### REST API

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Подключение к удалённой базе данных

Предположим, вы пытаетесь использовать табличные функции [MySQL](/sql-reference/table-functions/mysql) или [PostgreSQL](/sql-reference/table-functions/postgresql) в ClickHouse Cloud и подключиться к базе данных, размещённой в GCP. GCP PSC не может быть использован для безопасной организации такого подключения. PSC — это однонаправленное соединение. Оно позволяет вашей внутренней сети или GCP VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации GCP Private Service Connect](https://cloud.google.com/vpc/docs/private-service-connect):

> Сервис-ориентированная архитектура: сервисы-поставщики публикуются через балансировщики нагрузки, которые предоставляют один IP-адрес для потребительской VPC-сети. Трафик потребителя, обращающийся к сервисам-поставщикам, является однонаправленным и может получать доступ только к IP-адресу сервиса, а не ко всей пиринговой VPC-сети.

Чтобы настроить такое подключение, задайте правила межсетевого экрана (firewall) в вашем GCP VPC так, чтобы разрешить подключения из ClickHouse Cloud к вашему внутреннему/приватному сервису базы данных. Ознакомьтесь со [стандартными исходящими (egress) IP-адресами для регионов ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api), а также с [доступными статическими IP-адресами](https://api.clickhouse.cloud/static-ips.json).


## Дополнительная информация {#more-information}

Для получения более подробной информации см. [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
