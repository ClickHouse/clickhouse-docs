---
'title': 'GCP Private Service Connect'
'description': 'Этот документ описывает, как подключиться к ClickHouse Cloud с использованием
  Google Cloud Platform (GCP) Private Service Connect (PSC), и как отключить доступ
  к вашим сервисам ClickHouse Cloud с адресов, отличных от адресов GCP PSC, используя
  списки доступа IP ClickHouse Cloud.'
'sidebar_label': 'GCP Private Service Connect'
'slug': '/manage/security/gcp-private-service-connect'
'doc_type': 'guide'
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

Private Service Connect (PSC) — это функция сети Google Cloud, которая позволяет потребителям получать доступ к управляемым услугам в приватном режиме внутри их сети виртуального частного облака (VPC). Аналогично, она позволяет производителям управляемых услуг размещать эти услуги в своих собственных отдельных сетях VPC и предлагать частное соединение своим потребителям.

Производители услуг публикуют свои приложения для потребителей, создавая услуги Private Service Connect. Потребители услуг получают доступ к этим услугам Private Service Connect напрямую через один из типов Private Service Connect.

<Image img={gcp_psc_overview} size="lg" alt="Обзор Private Service Connect" border />

:::important
По умолчанию сервис ClickHouse недоступен через частное соединение, даже если соединение PSC одобрено и установлено; вам необходимо явно добавить ID PSC в список разрешенных на уровне экземпляра, выполнив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::

**Важные моменты при использовании Global Access для Private Service Connect**:
1. Регионы, использующие Global Access, должны принадлежать одному и тому же VPC.
1. Global Access должен быть явно включен на уровне PSC (см. скриншот ниже).
1. Убедитесь, что настройки вашего брандмауэра не блокируют доступ к PSC из других регионов.
1. Имейте в виду, что вы можете понести расходы на межрегиональную передачу данных GCP.

Подключение между регионами не поддерживается. Регионы производителя и потребителя должны совпадать. Однако вы можете подключаться из других регионов внутри вашего VPC, включив [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Private Service Connect (PSC).

**Пожалуйста, выполните следующее, чтобы включить GCP PSC**:
1. Получите подключение GCP для Private Service Connect.
1. Создайте конечную точку сервиса.
1. Добавьте "Endpoint ID" в сервис ClickHouse Cloud.
1. Добавьте "Endpoint ID" в список разрешенных сервисов ClickHouse.

## Внимание {#attention}
ClickHouse пытается сгруппировать ваши сервисы для повторного использования того же опубликованного [PSC endpoint](https://cloud.google.com/vpc/docs/private-service-connect) внутри региона GCP. Однако эта группировка не гарантируется, особенно если вы распределяете свои сервисы по нескольким организациям ClickHouse. Если у вас уже настроен PSC для других сервисов в вашей организации ClickHouse, вы можете часто пропустить большую часть шагов благодаря этой группировке и перейти сразу к последнему шагу: [Добавьте "Endpoint ID" в список разрешенных сервисов ClickHouse](#add-endpoint-id-to-services-allow-list).

Найдите примеры Terraform [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Прежде чем начать {#before-you-get-started}

:::note
Примеры кода приведены ниже, чтобы показать, как настроить Private Service Connect в сервисе ClickHouse Cloud. В наших примерах мы будем использовать:
- Регион GCP: `us-central1`
- Проект GCP (проект клиента GCP): `my-gcp-project`
- Частный IP адресу GCP в проекте клиента GCP: `10.128.0.2`
- VPC GCP в проекте клиента GCP: `default`
:::

Вам нужно будет получить информацию о вашем сервисе ClickHouse Cloud. Вы можете сделать это либо через консоль ClickHouse Cloud, либо через API ClickHouse. Если вы собираетесь использовать API ClickHouse, пожалуйста, установите следующие переменные окружения перед продолжением:

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Вы можете [создать новый ключ API ClickHouse Cloud](/cloud/manage/openapi) или использовать существующий.

Получите ваш ClickHouse `INSTANCE_ID`, отфильтровав по региону, провайдеру и названию сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
- Вы можете получить ваш ID организации в консоли ClickHouse (Организация -> Сведения об организации).
- Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.
:::

## Получите подключение GCP и DNS имя для Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через Private Service Connect, затем откройте меню **Настройки**. Нажмите кнопку **Настроить частный конечный пункт**. Запомните **Имя сервиса** (`endpointServiceId`) и **DNS имя** (`privateDnsHostname`). Вы будете использовать их в следующих шагах.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Частные конечные точки" border />

### Вариант 2: API {#option-2-api}

:::note
Вам нужно иметь как минимум один экземпляр, развернутый в регионе, чтобы выполнить этот шаг.
:::

Получите подключение GCP и DNS имя для Private Service Connect:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Запомните `endpointServiceId` и `privateDnsHostname`. Вы будете использовать их в следующих шагах.

## Создайте конечную точку сервиса {#create-service-endpoint}

:::important
Этот раздел охватывает специфические для ClickHouse детали настройки ClickHouse через GCP PSC (Private Service Connect). Специфические для GCP шаги предоставлены в качестве ссылки, чтобы направить вас к тому, где искать, но они могут изменяться со временем без уведомления со стороны провайдера облака GCP. Пожалуйста, учитывайте конфигурацию GCP в зависимости от вашего конкретного сценария.  

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых конечных точек GCP PSC и DNS записей.  

Для любых проблем, связанных с задачами конфигурации GCP, обращайтесь непосредственно в службу поддержки GCP.
:::

В этом разделе мы собираемся создать конечную точку сервиса.

### Добавление частного сервисного соединения {#adding-a-private-service-connection}

Сначала мы собираемся создать частное сервисное соединение.

#### Вариант 1: Используя консоль Google Cloud {#option-1-using-google-cloud-console}

В консоли Google Cloud перейдите в **Сетевые службы -> Private Service Connect**.

<Image img={gcp_psc_open} size="lg" alt="Открыть Private Service Connect в консоли Google Cloud" border />

Откройте диалоговое окно создания Private Service Connect, нажав кнопку **Подключить конечный пункт**.

- **Цель**: выберите **Опубликованная услуга**
- **Целевая служба**: используйте `endpointServiceId`<sup>API</sup> или `Имя службы`<sup>консоль</sup> из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
- **Имя конечного пункта**: задайте имя для PSC **Имени конечного пункта**.
- **Сеть/Подсеть/IP адрес**: Выберите сеть, которую вы хотите использовать для соединения. Вам нужно будет создать IP адрес или использовать существующий для конечной точки Private Service Connect. В нашем примере мы заранее создали адрес с именем **your-ip-address** и присвоили IP адрес `10.128.0.2`
- Чтобы сделать конечный пункт доступным из любого региона, вы можете включить флажок **Включить глобальный доступ**.

<Image img={gcp_psc_enable_global_access} size="md" alt="Включить глобальный доступ для Private Service Connect" border />

Для создания конечного пункта PSC используйте кнопку **ДОБАВИТЬ КОНЕЧНЫЙ ПУНКТ**.

Столбец **Статус** изменится с **Ожидание** на **Принято**, как только соединение будет одобрено.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Скопируйте ID соединения PSC" border />

Скопируйте ***ID соединения PSC***, мы будем использовать его как ***Endpoint ID*** в следующих шагах.

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
  target = "https://www.googleapis.com/compute/v1/$TARGET" # See below in notes
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Add GCP PSC Connection ID to allow list on instance level."
}
```

:::note
используйте `endpointServiceId`<sup>API</sup> или `Имя службы`<sup>консоль</sup> из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)
:::

## Установите частное DNS имя для конечного пункта {#set-private-dns-name-for-endpoint}

:::note
Существует множество способов настройки DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем.
:::

Вам нужно указать "DNS имя", взятое из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP адрес конечной точки GCP Private Service Connect. Это гарантирует, что службы/компоненты внутри вашего VPC/Сети могут разрешать его правильно.

## Добавьте Endpoint ID в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечный пункт в вашу организацию, перейдите к шагу [Добавить "Endpoint ID" в список разрешенных сервисов ClickHouse](#add-endpoint-id-to-services-allow-list). Добавление `ID соединения PSC` с помощью консоли ClickHouse Cloud в список разрешенных сервисов автоматически добавляет его в организацию.

Чтобы удалить конечный пункт, откройте **Сведения об организации -> Частные конечные точки** и щелкните кнопку удаления, чтобы удалить конечный пункт.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Удалить частный конечный пункт из ClickHouse Cloud" border />

### Вариант 2: API {#option-2-api-1}

Перед запуском любых команд установите эти переменные окружения:

Замените `ENDPOINT_ID` ниже значением из **Endpoint ID** из шага [Добавление частного сервисного соединения](#adding-a-private-service-connection)

Чтобы добавить конечный пункт, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "A GCP private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Чтобы удалить конечный пункт, выполните:

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

Добавить/удалить частный конечный пункт в организацию:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавить "Endpoint ID" в список разрешенных сервисов ClickHouse {#add-endpoint-id-to-services-allow-list}

Вам нужно добавить Endpoint ID в список разрешенных для каждого экземпляра, который должен быть доступен с использованием Private Service Connect.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через Private Service Connect, затем перейдите в **Настройки**. Введите `Endpoint ID`, полученный из шага [Добавление частного сервисного соединения](#adding-a-private-service-connection). Нажмите **Создать конечный пункт**.

:::note
Если вы хотите разрешить доступ из существующего соединения Private Service Connect, используйте существующее выпадающее меню конечных пунктов.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Фильтр частных конечных точек" border />

### Вариант 2: API {#option-2-api-2}

Перед запуском любых команд установите эти переменные окружения:

Замените **ENDPOINT_ID** ниже значением из **Endpoint ID** из шага [Добавление частного сервисного соединения](#adding-a-private-service-connection)

Выполните его для каждого сервиса, который должен быть доступен с использованием Private Service Connect.

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

Каждый сервис с включенным Private Link имеет общую и частную конечную точку. Чтобы подключиться с помощью Private Link, вам необходимо использовать частную конечную точку, которая будет `privateDnsHostname`, взятая из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).

### Получение частного DNS имени {#getting-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите на кнопку **Настроить частный конечный пункт**. В открывшемся окне скопируйте **DNS имя**.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="Частное DNS имя конечного пункта" border />

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

В этом примере соединение с хостнеймом `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет направлено на Private Service Connect. Между тем, `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет направлено через интернет.

## Устранение неполадок {#troubleshooting}

### Тестирование настройки DNS {#test-dns-setup}

DNS_NAME - используйте `privateDnsHostname` из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### Соединение сброшено пиром {#connection-reset-by-peer}

- Скорее всего, ID конечного пункта не был добавлен в список разрешенных сервисов. Повторно посетите [_Добавление ID конечного пункта в список разрешенных сервисов_ шаг](#add-endpoint-id-to-services-allow-list).

### Тестирование связности {#test-connectivity}

Если у вас проблемы с подключением через PSC link, проверьте вашу связность с помощью `openssl`. Убедитесь, что статус конечной точки Private Service Connect равен `Принято`:

OpenSSL должен быть способен подключиться (см. CONNECTED в выводе). `errno=104` ожидается.

DNS_NAME - используйте `privateDnsHostname` из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

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

### Проверка фильтров конечных точек {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать [MySQL](/sql-reference/table-functions/mysql) или [PostgreSQL](/sql-reference/table-functions/postgresql) табличные функции в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в GCP. GCP PSC не может использоваться для безопасного подключения. PSC — это однонаправленное соединение. Оно позволяет вашей внутренней сети или VPC GCP безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации GCP Private Service Connect](https://cloud.google.com/vpc/docs/private-service-connect):

> Ориентированный на сервис дизайн: Производитель услуг публикует свои услуги через балансировщики нагрузки, которые открывают один IP адрес для сети VPC потребителя. Трафик потребителя, который получает доступ к услугам производителя, односторонний и может получить доступ только к IP адресу услуги, а не ко всей соединенной сети VPC.

Для этого настройте правила брандмауэра GCP VPC, чтобы разрешить подключения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Проверьте [IP адреса egress по умолчанию для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), наряду с [доступными статическими IP адресами](https://api.clickhouse.cloud/static-ips.json).

## Дополнительная информация {#more-information}

Для получения более подробной информации посетите [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).