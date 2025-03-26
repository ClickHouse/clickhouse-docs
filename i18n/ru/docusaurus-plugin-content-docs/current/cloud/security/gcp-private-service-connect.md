---
title: 'GCP Private Service Connect'
description: 'В этом документе описывается, как подключиться к ClickHouse Cloud, используя Private Service Connect (PSC) Google Cloud Platform (GCP), и как отключить доступ к вашим услугам ClickHouse Cloud с адресов, отличных от адресов GCP PSC, с помощью списков IP-доступа ClickHouse Cloud.'
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

Private Service Connect(PSC) — это функция сетевого взаимодействия Google Cloud, которая позволяет пользователям получать доступ к управляемым службам приватно в пределах их виртуальной частной облачной сети (VPC). Аналогично, это позволяет поставщикам управляемых услуг размещать эти службы в своих собственных отдельных VPC и предлагать частное соединение своим потребителям.

Поставщики услуг публикуют свои приложения для потребителей, создавая службы Private Service Connect. Потребители услуг получают доступ к этим службам Private Service Connect напрямую через один из этих типов Private Service Connect.

<Image img={gcp_psc_overview} size="lg" alt="Обзор Private Service Connect" border />

:::important
По умолчанию служба ClickHouse недоступна через Private Service Connect, даже если соединение PSC одобрено и установлено; вы должны явно добавить идентификатор PSC в список разрешенных на уровне экземпляра, выполнив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::


**Важные соображения при использовании Global Access для Private Service Connect**:
1. Регионы, использующие Global Access, должны принадлежать одной и той же VPC.
1. Global Access должен быть явно включен на уровне PSC (смотрите снимок экрана ниже).
1. Убедитесь, что настройки вашего брандмауэра не блокируют доступ к PSC из других регионов.
1. Имейте в виду, что могут возникнуть расходы на межрегиональную передачу данных GCP.

Кросс-региональная связность не поддерживается. Регионы производителей и потребителей должны совпадать. Однако вы можете подключаться из других регионов внутри вашей VPC, включив [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Private Service Connect (PSC).

**Пожалуйста, выполните следующие шаги для включения GCP PSC**:
1. Получите привязку службы GCP для Private Service Connect.
1. Создайте конечную точку службы.
1. Добавьте "Endpoint ID" в службу ClickHouse Cloud.
1. Добавьте "Endpoint ID" в список разрешенных служб ClickHouse.


## Внимание {#attention}
ClickHouse пытается сгруппировать ваши службы для повторного использования одной и той же опубликованной [конечной точки PSC](https://cloud.google.com/vpc/docs/private-service-connect) в рамках региона GCP. Однако такая группировка не гарантируется, особенно если вы распределяете свои службы по нескольким организациям ClickHouse.
Если у вас уже настроен PSC для других служб в вашей организации ClickHouse, вы можете часто пропустить большую часть шагов и перейти непосредственно к последнему шагу: [Добавить "Endpoint ID" в список разрешенных служб ClickHouse](#add-endpoint-id-to-services-allow-list).

Примеры Terraform можно найти [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Перед началом {#before-you-get-started}

:::note
Примеры кода приведены ниже, чтобы показать, как настроить Private Service Connect в службе ClickHouse Cloud. В наших примерах ниже мы будем использовать:
 - Регион GCP: `us-central1`
 - Проект GCP (проект GCP клиента): `my-gcp-project`
 - Приватный IP-адрес GCP в проекте GCP клиента: `10.128.0.2`
 - VPC GCP в проекте GCP клиента: `default`
:::

Вам нужно будет получить информацию о вашей службе ClickHouse Cloud. Вы можете сделать это либо через консоль ClickHouse Cloud, либо через API ClickHouse. Если вы собираетесь использовать API ClickHouse, пожалуйста, установите следующие переменные окружения перед тем, как продолжить:

```shell
REGION=<Код вашего региона в формате GCP, например: us-central1>
PROVIDER=gcp
KEY_ID=<Ваш идентификатор ключа ClickHouse>
KEY_SECRET=<Ваш секрет ключа ClickHouse>
ORG_ID=<Ваш идентификатор организации ClickHouse>
SERVICE_NAME=<Имя вашей службы ClickHouse>
```

Вы можете [создать новый ключ API ClickHouse Cloud](/cloud/manage/openapi) или использовать существующий.

Получите ваш `INSTANCE_ID` ClickHouse с помощью фильтрации по региону, провайдеру и имени службы:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - Вы можете получить ваш идентификатор организации из консоли ClickHouse (Организация -> Подробности о организации).
 - Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.
:::

## Получение привязки службы GCP и DNS-имени для Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте службу, к которой вы хотите подключиться через Private Service Connect, затем откройте меню **Настройки**. Нажмите кнопку **Настроить приватную конечную точку**. Запомните **Имя службы** ( `endpointServiceId`) и **DNS-имя** (`privateDnsHostname`). Вы будете использовать их на следующих шагах.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Приватные конечные точки" border />

### Вариант 2: API {#option-2-api}

:::note
Вам необходимо иметь развернутое как минимум одно экземпляр в регионе для выполнения этого шага.
:::

Получите привязку службы GCP и DNS-имя для Private Service Connect:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Запомните `endpointServiceId` и `privateDnsHostname`. Вы будете использовать их на следующих шагах.

## Создание конечной точки службы {#create-service-endpoint}

:::important
В этом разделе рассматриваются специфические для ClickHouse детали настройки ClickHouse через GCP PSC (Private Service Connect). Шаги, специфические для GCP, предоставлены в качестве ссылки для вашего руководства, но они могут изменяться со временем без уведомления от провайдера облака GCP. Пожалуйста, учитывайте конфигурацию GCP с учетом вашего конкретного случая использования.  

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых конечных точек GCP PSC, DNS-записей.  

Для любых проблем, связанных с задачами настройки GCP, обращайтесь напрямую в поддержку GCP.
:::

В этом разделе мы собираемся создать конечную точку службы.

### Добавление частного соединения службы {#adding-a-private-service-connection}

Сначала мы создадим частное соединение службы.

#### Вариант 1: Использование консоли Google Cloud {#option-1-using-google-cloud-console}

В консоли Google Cloud перейдите к **Сетевые службы -> Подключение частных служб**.

<Image img={gcp_psc_open} size="lg" alt="Открыть Private Service Connect в консоли Google Cloud" border />

Откройте диалоговое окно создания Private Service Connect, нажав кнопку **Подключить конечную точку**.

- **Цель**: используйте **Опубликованная служба**
- **Целевую службу**: используйте `endpointServiceId`<sup>API</sup> или `Имя службы`<sup>консоль</sup> из шага [Получение привязки службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
- **Имя конечной точки**: установите имя для PSC **Имя конечной точки**.
- **Сеть/Подсеть/IP-адрес**: выберите сеть, которую вы хотите использовать для соединения. Вам нужно будет создать IP-адрес или использовать существующий для конечной точки Private Service Connect. В нашем примере мы предварительно создали адрес с именем **your-ip-address** и назначили IP-адрес `10.128.0.2`.
- Чтобы сделать конечную точку доступной из любого региона, вы можете включить флажок **Включить глобальный доступ**.

<Image img={gcp_psc_enable_global_access} size="md" alt="Включить глобальный доступ для Private Service Connect" border />

Для создания конечной точки PSC используйте кнопку **ДОБАВИТЬ КОНЕЧНУЮ ТОЧКУ**.

Столбец **Статус** изменится с **Ожидание** на **Принято**, как только соединение будет одобрено.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Скопировать идентификатор соединения PSC" border />

Скопируйте ***Идентификатор соединения PSC***, мы будем использовать его в качестве ***Идентификатора конечной точки*** на следующих шагах.

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
  # привязка службы
  target = "https://www.googleapis.com/compute/v1/$TARGET" # См. ниже в примечаниях
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Добавьте идентификатор соединения GCP PSC в список разрешенных на уровне экземпляра."
}
```

:::note
используйте `endpointServiceId`<sup>API</sup> или `Имя службы`<sup>консоль</sup> из шага [Получение привязки службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)
:::

## Установите частное DNS-имя для конечной точки {#setting-up-dns}

:::note
Существует множество способов настроить DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вы должны указать "DNS-имя", взятое из шага [Получение привязки службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP-адрес конечной точки GCP Private Service Connect. Это обеспечит правильное разрешение служб/компонентов внутри вашей VPC/Сети.

## Добавить идентификатор конечной точки в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в вашу организацию, перейдите к шагу [Добавить "Endpoint ID" в список разрешенных служб ClickHouse](#add-endpoint-id-to-services-allow-list). Добавление `PSC Connection ID` с помощью консоли ClickHouse Cloud в список разрешенных служб автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Подробности организации -> Приватные конечные точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Удалить частную конечную точку из ClickHouse Cloud" border />

### Вариант 2: API {#option-2-api-1}

Установите эти переменные окружения перед выполнением любых команд:

Замените `ENDPOINT_ID` ниже значением из **Endpoint ID** с шага [Добавление частного соединения службы](#adding-a-private-service-connection)

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

Добавить/удалить частную конечную точку в организацию:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавить "Endpoint ID" в список разрешенных служб ClickHouse {#add-endpoint-id-to-services-allow-list}

Вам нужно добавить идентификатор конечной точки в список разрешенных для каждого экземпляра, который должен быть доступен через Private Service Connect.


### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте службу, к которой вы хотите подключиться через Private Service Connect, затем перейдите к **Настройки**. Введите `Endpoint ID`, полученный со шага [Добавление частного соединения службы](#adding-a-private-service-connection). Нажмите **Создать конечную точку**.

:::note
Если вы хотите разрешить доступ с существующего соединения Private Service Connect, используйте выпадающее меню существующей конечной точки.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Фильтр частных конечных точек" border />

### Вариант 2: API {#option-2-api-2}

Установите эти переменные окружения перед выполнением любых команд:

Замените **ENDPOINT_ID** ниже значением из **Endpoint ID** с шага [Добавление частного соединения услуги](#adding-a-private-service-connection)

Выполните это для каждой службы, которая должна быть доступна через Private Service Connect.

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

## Доступ к экземпляру с помощью Private Service Connect {#accessing-instance-using-private-service-connect}

Каждая служба с включенной Private Link имеет публичную и частную конечную точку. Для подключения с использованием Private Link вам необходимо использовать частную конечную точку, которая будет `privateDnsHostname`, взятая из шага [Получение привязки службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).


### Получение частного DNS-имени {#getting-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите к **Настройки**. Нажмите кнопку **Настроить приватную конечную точку**. В открывшемся боковом меню скопируйте **DNS-имя**.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="DNS-имя частной конечной точки" border />

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

В этом примере соединение с `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет перенаправлено на Private Service Connect. Тем временем `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет перенаправлено через интернет.

## Устранение неполадок {#troubleshooting}

### Тестирование настройки DNS {#test-dns-setup}

DNS_NAME - Используйте `privateDnsHostname` из шага [Получение привязки службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
nslookup $DNS_NAME
```

```response
Неавторизованный ответ:
...
Адрес: 10.128.0.2
```

### Сброс соединения со стороны участника {#connection-reset-by-peer}

- Вероятно, идентификатор конечной точки не был добавлен в список разрешенных служб. Вернитесь к шагу [_Добавить идентификатор конечной точки в список разрешенных служб_](#add-endpoint-id-to-services-allow-list).

### Тестирование подключения {#test-connectivity}

Если у вас возникают проблемы с подключением с использованием ссылки PSC, проверьте подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Service Connect — `Accepted`:

OpenSSL должен успешно подключиться (смотрите CONNECTED в выводе). `errno=104` ожидается.

DNS_NAME - Используйте `privateDnsHostname` из шага [Получение привязки службы GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
нет доступного сертификата участника
---
Сертификат CA клиента не был отправлен
---
SSL-рукопожатие прочитало 0 байт и записало 335 байт
Проверка: OK
---
Новый, (НИЧЕГО), Шифр (НИЧЕГО)
Поддержка безопасной повторной переговоры НЕ поддерживается
Сжатие: НЕТ
Расширение: НЕТ
Никакое ALPN не было согласовано
Ранние данные не были отправлены
Код возврата проверки: 0 (ok)
```

### Проверка фильтров конечной точки {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать функции таблиц [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в GCP. GCP PSC не может быть использован для безопасного включения этого подключения. PSC представляет собой одностороннее, унидициональное соединение. Оно позволяет вашей внутренней сети или GCP VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации GCP Private Service Connect](https://cloud.google.com/vpc/docs/private-service-connect):

> Ориентированный на сервис дизайн: Услуги производителей публикуются через балансировщики нагрузки, которые открывают единственный IP-адрес сети VPC потребителя. Трафик потребителей, который обращается к службам производителей, является унидициональным и может получать доступ лишь к IP-адресу службы, а не к целой сети VPC.

Для этого настройте правила брандмауэра вашей VPC GCP, чтобы разрешить подключения от ClickHouse Cloud к вашей внутренней/приватной службе базы данных. Проверьте [адреса IP по умолчанию для выхода для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).

## Дополнительная информация {#more-information}

Для получения более подробной информации посетите [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
