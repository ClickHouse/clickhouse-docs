---
title: 'GCP Частное Соединение Сервисов'
description: 'В этом документе описывается, как подключиться к ClickHouse Cloud с использованием Частного Соединения Сервисов (PSC) Google Cloud Platform (GCP) и как отключить доступ к вашим сервисам ClickHouse Cloud с адресов, отличных от адресов GCP PSC, с помощью IP списков доступа ClickHouse Cloud.'
sidebar_label: 'GCP Частное Соединение Сервисов'
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


# Частное Соединение Сервисов {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Частное Соединение Сервисов (PSC) — это функция сетевого взаимодействия Google Cloud, которая позволяет пользователям получать доступ к управляемым сервисам в частной сети виртуального частного облака (VPC). Аналогично, она позволяет производителям управляемых сервисов размещать эти услуги в своих отдельных сетях VPC и предлагать частное подключение своим пользователям.

Производители услуг публикуют свои приложения для пользователей, создавая сервисы Частного Соединения Сервисов. Пользователи получают доступ к этим сервисам Частного Соединения Сервисов напрямую через один из этих типов Частного Соединения Сервисов.

<Image img={gcp_psc_overview} size="lg" alt="Обзор Частного Соединения Сервисов" border />

:::important
По умолчанию сервис ClickHouse недоступен через подключение Частного Сервиса, даже если соединение PSC одобрено и установлено; вам нужно явно добавить идентификатор PSC в список разрешенных на уровне экземпляра, выполнив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::


**Важно учитывать при использовании Глобального Доступа Частного Соединения Сервисов**:
1. Регионы, использующие Глобальный Доступ, должны принадлежать одной и той же VPC.
1. Глобальный Доступ должен быть явно включен на уровне PSC (см. скриншот ниже).
1. Убедитесь, что настройки вашего межсетевого экрана не блокируют доступ к PSC из других регионов.
1. Имейте в виду, что вы можете подвергнуться сборам за передачу данных между регионами GCP.

Сквозная связь между регионами не поддерживается. Регионы производителя и потребителя должны быть одинаковыми. Однако вы можете подключиться из других регионов внутри своей VPC, включив [Глобальный доступ](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Частного Соединения Сервисов (PSC).

**Пожалуйста, выполните следующее для включения GCP PSC**:
1. Получите присоединение услуги GCP для Частного Соединения Сервисов.
1. Создайте конечную точку сервиса.
1. Добавьте "Идентификатор конечной точки" в сервис ClickHouse Cloud.
1. Добавьте "Идентификатор конечной точки" в список разрешенных сервисов ClickHouse.

## Внимание {#attention}
ClickHouse пытается группировать ваши сервисы для повторного использования одной и той же опубликованной [конечной точки PSC](https://cloud.google.com/vpc/docs/private-service-connect) в регионе GCP. Однако эта группировка не гарантируется, особенно если вы распределяете свои сервисы между несколькими организациями ClickHouse.
Если у вас уже настроено PSC для других сервисов в вашей организации ClickHouse, вы часто можете пропустить большинство шагов благодаря этой группировке и перейти напрямую к последнему шагу: [Добавьте "Идентификатор конечной точки" в список разрешенных сервисов ClickHouse](#add-endpoint-id-to-services-allow-list).

Примеры Terraform найдите [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Прежде чем начать {#before-you-get-started}

:::note
Примеры кода приведены ниже, чтобы показать, как настроить Частное Соединение Сервисов в рамках сервиса ClickHouse Cloud. В наших примерах ниже мы будем использовать:
 - Регион GCP: `us-central1`
 - Проект GCP (проект клиента GCP): `my-gcp-project`
 - Частный IP адрес GCP в проекте клиента GCP: `10.128.0.2`
 - VPC GCP в проекте клиента GCP: `default`
:::

Вам понадобится получить информацию о вашем сервисе ClickHouse Cloud. Вы можете сделать это либо через Консоль ClickHouse Cloud, либо через API ClickHouse. Если вы собираетесь использовать API ClickHouse, пожалуйста, установите следующие переменные окружения перед продолжением:

```shell
REGION=<Код вашего региона в формате GCP, например: us-central1>
PROVIDER=gcp
KEY_ID=<Ваш идентификатор ключа ClickHouse>
KEY_SECRET=<Ваш секрет ключа ClickHouse>
ORG_ID=<Ваш идентификатор организации ClickHouse>
SERVICE_NAME=<Имя вашего сервиса ClickHouse>
```

Вы можете [создать новый ключ API ClickHouse Cloud](/cloud/manage/openapi) или использовать существующий.

Получите идентификатор вашего ClickHouse `INSTANCE_ID`, отфильтровав по региону, провайдеру и имени сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - Вы можете получить идентификатор вашей организации в консоли ClickHouse (Организация -> Подробности об Организации).
 - Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.
:::

## Получите присоединение услуги GCP и DNS имя для Частного Соединения Сервисов {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через Частное Соединение Сервисов, затем откройте меню **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. Запомните **Имя сервиса** (`endpointServiceId`) и **DNS имя** (`privateDnsHostname`). Вы будете использовать их на следующих шагах.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Частные Конечные Точки" border />

### Вариант 2: API {#option-2-api}

:::note
Для выполнения этого шага у вас должна быть развернута хотя бы одна конечная точка в регионе.
:::

Получите присоединение услуги GCP и DNS имя для Частного Соединения Сервисов:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Запомните `endpointServiceId` и `privateDnsHostname`. Вы будете использовать их на следующих шагах.

## Создайте конечную точку сервиса {#create-service-endpoint}

:::important
В этом разделе рассматриваются специфические для ClickHouse детали настройки ClickHouse через GCP PSC (Частное Соединение Сервисов). Шаги, специфичные для GCP, предоставлены в качестве справки, чтобы направить вас по месту, но могут меняться со временем без уведомления со стороны провайдера облачных услуг GCP. Пожалуйста, рассмотрите конфигурацию GCP, основываясь на вашем конкретном случае использования.  

Обратите внимание, что ClickHouse не отвечает за настройку необходимых конечных точек GCP PSC, DNS записи.  

По всем вопросам, связанным с задачами конфигурации GCP, обращайтесь напрямую в поддержку GCP.
:::

В этом разделе мы собираемся создать конечную точку сервиса.

### Добавление Частного Соединения Сервиса {#adding-a-private-service-connection}

Сначала мы создадим Частное Соединение Сервиса.

#### Вариант 1: Используя консоль Google Cloud {#option-1-using-google-cloud-console}

В консоли Google Cloud перейдите в **Сетевые услуги -> Частное Соединение Сервисов**.

<Image img={gcp_psc_open} size="lg" alt="Откройте Частное Соединение Сервисов в консоли Google Cloud" border />

Откройте диалоговое окно создания Частного Соединения Сервисов, нажав на кнопку **Подключить Конечную Точку**.

- **Цель**: используйте **Опубликованную услугу**
- **Целевая служба**: используйте `endpointServiceId`<sup>API</sup> или `Имя сервиса`<sup>консоль</sup> из шага [Получите присоединение услуги GCP для Частного Соединения Сервисов](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
- **Имя конечной точки**: задайте имя для **Имени конечной точки** PSC.
- **Сеть/Подсеть/IP адрес**: выберите сеть, которую вы хотите использовать для подключения. Вам нужно будет создать IP адрес или использовать существующий для конечной точки Частного Соединения Сервисов. В нашем примере мы предварительно создали адрес с именем **ваш-ip-адрес** и назначили IP адрес `10.128.0.2`.
- Чтобы сделать конечную точку доступной из любого региона, вы можете включить флажок **Включить глобальный доступ**.

<Image img={gcp_psc_enable_global_access} size="md" alt="Включите Глобальный Доступ для Частного Соединения Сервисов" border />

Для создания конечной точки PSC используйте кнопку **ДОБАВИТЬ КОНЕЧНУЮ ТОЧКУ**.

Столбец **Статус** изменится с **Ожидание** на **Принято**, как только соединение будет одобрено.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Скопируйте Идентификатор Подключения PSC" border />

Скопируйте ***Идентификатор Подключения PSC***, мы будем использовать его в качестве ***Идентификатора Конечной Точки*** на следующих шагах.

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
  name         = "ваш-ip-адрес"
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
  # присоединение услуги
  target = "https://www.googleapis.com/compute/v1/$TARGET" # см. ниже в примечаниях
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Добавьте идентификатор подключения GCP PSC в список разрешенных на уровне экземпляра."
}
```

:::note
используйте `endpointServiceId`<sup>API</sup> или `Имя сервиса`<sup>консоль</sup> из шага [Получите присоединение услуги GCP для Частного Соединения Сервисов](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)
:::

## Установите частное DNS имя для Конечной Точки {#setting-up-dns}

:::note
Существует множество способов настроить DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вам нужно указать "DNS имя", взятое из шага [Получите присоединение услуги GCP для Частного Соединения Сервисов](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP адрес конечной точки Частного Соединения Сервисов GCP. Это гарантирует, что службы/компоненты в вашей VPC/Сети могут должным образом разрешать его.

## Добавьте Идентификатор Конечной Точки в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в вашу организацию, перейдите к шагу [Добавьте "Идентификатор Конечной Точки" в список разрешенных сервисов ClickHouse](#add-endpoint-id-to-services-allow-list). Добавление `Идентификатора Подключения PSC` с помощью консоли ClickHouse Cloud в список разрешенных сервисов автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Подробности организации -> Частные Конечные Точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Удалите Частную Конечную Точку из ClickHouse Cloud" border />

### Вариант 2: API {#option-2-api-1}

Установите эти переменные окружения перед выполнением любых команд:

Замените `ENDPOINT_ID` ниже значением из **Идентификатора Конечной Точки** из шага [Добавление Частного Соединения Сервисов](#adding-a-private-service-connection)

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

Добавьте/удалите Частную Конечную Точку из организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавьте "Идентификатор Конечной Точки" в список разрешенных сервисов ClickHouse {#add-endpoint-id-to-services-allow-list}

Вам нужно добавить Идентификатор Конечной Точки в список разрешений для каждого экземпляра, который должен быть доступен с использованием Частного Соединения Сервисов.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через Частное Соединение Сервисов, затем перейдите в **Настройки**. Введите `Идентификатор Конечной Точки`, полученный из шага [Добавление Частного Соединения Сервисов](#adding-a-private-service-connection). Нажмите **Создать конечную точку**.

:::note
Если вы хотите разрешить доступ из существующего соединения Частного Соединения Сервисов, используйте выпадающее меню существующей конечной точки.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Фильтр Частных Конечных Точек" border />

### Вариант 2: API {#option-2-api-2}

Установите эти переменные окружения перед выполнением любых команд:

Замените **ENDPOINT_ID** ниже значением из **Идентификатора Конечной Точки** из шага [Добавление Частного Соединения Сервисов](#adding-a-private-service-connection)

Выполните его для каждого сервиса, который должен быть доступен с использованием Частного Соединения Сервисов.

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

## Доступ к экземпляру с использованием Частного Соединения Сервисов {#accessing-instance-using-private-service-connect}

Каждый сервис с включенной Частной Ссылкой имеет публичную и частную конечные точки. Чтобы подключиться с использованием Частной Ссылки, вам нужно использовать частную конечную точку, которая будет `privateDnsHostname`, взятая из [Получите присоединение услуги GCP для Частного Соединения Сервисов](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).


### Получение Частного DNS Именования {#getting-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. В открывшемся окне скопируйте **DNS Имя**.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="Частное Имя конечной точки DNS" border />

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

В этом примере подключение к хосту `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет направлено на Частное Соединение Сервисов. В то же время, `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет маршрутизироваться через интернет.

## Устранение неполадок {#troubleshooting}

### Проверьте настройки DNS {#test-dns-setup}

DNS_NAME - Используйте `privateDnsHostname` из [Получите присоединение услуги GCP для Частного Соединения Сервисов](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага

```bash
nslookup $DNS_NAME
```

```response
Ненадежный ответ:
...
Адрес: 10.128.0.2
```

### Соединение сброшено стороной {#connection-reset-by-peer}

- Скорее всего, Идентификатор Конечной Точки не был добавлен в список разрешенных сервисов. Пересмотрите[_Добавьте идентификатор конечной точки в список разрешенных сервисов_](#add-endpoint-id-to-services-allow-list).

### Проверьте доступность соединения {#test-connectivity}

Если у вас возникли проблемы с подключением через ссылку PSC, проверьте свою доступность с помощью `openssl`. Убедитесь, что статус конечной точки Частного Соединения Сервисов равен `Accepted`:

OpenSSL должен быть в состоянии подключиться (см. CONNECTED в выводе). `errno=104` ожидается.

DNS_NAME - Используйте `privateDnsHostname` из [Получите присоединение услуги GCP для Частного Соединения Сервисов](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
нет доступного сертификата от партнера
---
Не были отправлены имена CA клиентского сертификата
---
SSL-обмен прочитал 0 байт и записал 335 байт
Проверка: OK
---
Новый, (НИЧЕГО), Шифр (НИЧЕГО)
Поддержка безопасной повторной переговоры НЕ поддерживается
Сжатие: НЕТ
Расширение: НЕТ
Не согласован ALPN
Ранние данные не были отправлены
Код проверки: 0 (в порядке)
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

Допустим, вы пытаетесь использовать таблицы [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в GCP. GCP PSC не может быть использовано для безопасного подключения к этому. PSC является односторонним, унидирекциональным соединением. Она позволяет вашей внутренней сети или VPC GCP безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации GCP Частного Соединения Сервисов](https://cloud.google.com/vpc/docs/private-service-connect):

> Услуга-ориентированный дизайн: Производственные услуги публикуются через балансировщики нагрузки, которые предоставляют единственный IP адрес для сети потребителей VPC. Трафик потребителей, который получает доступ к услугам производителей, является унидирекционным и может получить доступ только к IP адресу сервиса, а не иметь доступ ко всей сетевой сети VPC.

Для этого настройте правила межсетевого экрана GCP VPC, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Проверьте [IP адреса по умолчанию для egress для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP адреса](https://api.clickhouse.cloud/static-ips.json).

## Дополнительная информация {#more-information}

Для получения более подробной информации посетите [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
