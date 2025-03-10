---
title: 'GCP Private Service Connect'
description: 'Этот документ описывает, как подключиться к ClickHouse Cloud, используя Google Cloud Platform (GCP) Private Service Connect (PSC), и как отключить доступ к вашим сервисам ClickHouse Cloud с адресов, отличных от адресов GCP PSC, используя списки контроля доступа по IP ClickHouse Cloud.'
sidebar_label: 'GCP Private Service Connect'
slug: /manage/security/gcp-private-service-connect
---

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

## Private Service Connect {#private-service-connect}

Private Service Connect (PSC) — это функция сетевого взаимодействия Google Cloud, которая позволяет пользователям получить доступ к управляемым сервисам приватно внутри их сети виртуального частного облака (VPC). Аналогично, она позволяет производителям управляемых услуг размещать эти сервисы в своих собственных отдельных сетях VPC и предлагать частное соединение своим пользователям.

Производители услуг публикуют свои приложения для пользователей, создавая Private Service Connect сервисы. Потребители услуг получают доступ к этим сервисам Private Service Connect непосредственно через один из типов Private Service Connect.

<img src={gcp_psc_overview} alt="Обзор Private Service Connect" />

:::important
По умолчанию сервис ClickHouse недоступен через Private Service Connect, даже если соединение PSC одобрено и установлено; вам необходимо явно добавить PSC ID в белый список на уровне экземпляра, завершив [шаг](#add-endpoint-id-to-services-allow-list) ниже.
:::
:::note
GCP Private Service Connect может быть активирован только на продуктивных сервисах ClickHouse Cloud.
:::

Подключение между регионами не поддерживается. Регионы производителей и потребителей должны совпадать. Тем не менее, вы можете подключаться из других регионов внутри вашего VPC, активировав [глобальный доступ](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) на уровне Private Service Connect (PSC).

:::note
Важные рекомендации по использованию Глобального доступа Private Service Connect:
1. Регионы, использующие Глобальный доступ, должны принадлежать одному VPC.
2. Глобальный доступ должен быть явно активирован на уровне PSC (обратитесь к скриншоту ниже).
3. Убедитесь, что ваши настройки брандмауэра не блокируют доступ к PSC из других регионов.
4. Обратите внимание, что вы можете понести расходы на передачу данных между регионами GCP.

Процесс разбит на четыре шага:

1. Получите подключение GCP для Private Service Connect.
1. Создайте конечную точку сервиса.
1. Добавьте идентификатор конечной точки в организацию ClickHouse Cloud.
1. Добавьте идентификатор конечной точки в белый список сервисов.

:::note
В своих примерах ниже мы будем использовать:
 - Регион GCP: `us-central1`
 - Проект GCP (проект клиента GCP): `my-gcp-project`
 - Частный IP-адрес в проекте клиента GCP: `10.128.0.2`
 - VPC в проекте клиента GCP: `default`

Примеры кода приведены ниже, чтобы показать, как настроить Private Service Connect внутри сервиса ClickHouse Cloud.
:::

## Перед тем как начать {#before-you-get-started}

Вам нужно будет получить информацию о вашем сервисе ClickHouse Cloud. Вы можете сделать это либо через консоль ClickHouse Cloud, либо через API ClickHouse. Если вы собираетесь использовать API ClickHouse, пожалуйста, установите следующие переменные окружения перед продолжением:

```bash
export REGION=us-central1
export PROVIDER=gcp
export KEY_ID=<Key ID>
export KEY_SECRET=<Key secret>
export ORG_ID=<ID организации ClickHouse>
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1)
```
:::note
 - Вы можете получить свой ID организации из консоли ClickHouse (Организация -> Сведения об организации).
 - Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.
:::

## Получите подключение GCP и DNS имя для Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через Private Service Connect, затем откройте меню **Настройки**. Нажмите кнопку **Настроить частную конечную точку**. Обратите внимание на **Имя сервиса** (`endpointServiceId`) и **Имя DNS** (`privateDnsHostname`). Вы будете использовать их на следующих шагах.

<img src={gcp_privatelink_pe_create} alt="Частные Конечные Точки" />

### Вариант 2: API {#option-2-api}

:::note
Для выполнения этого шага необходимо развернуть как минимум один экземпляр в регионе.
:::

Получите подключение GCP и DNS имя для Private Service Connect:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xb164akwxw.us-central1.p.gcp.clickhouse.cloud"
}
```

Запишите `endpointServiceId` и `privateDnsHostname`. Вы будете использовать их на следующих шагах.

## Создайте конечную точку сервиса {#create-service-endpoint}

В этом разделе мы собираемся создать конечную точку сервиса.

### Добавление частного соединения сервиса {#adding-a-private-service-connection}

Сначала мы создадим частное соединение сервиса.

#### Вариант 1: Используя консоль Google Cloud {#option-1-using-google-cloud-console}

В консоли Google Cloud перейдите в **Сетевые службы -> Private Service Connect**.

<img src={gcp_psc_open} alt="Открыть Private Service Connect в консоли Google Cloud" />

Откройте диалог создания Private Service Connect, нажав на кнопку **Подключить конечную точку**.

- **Цель**: выберите **Опубликованная служба**
- **Целевая служба**: используйте `endpointServiceId` из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).
- **Имя конечной точки**: установите имя для PSC **Имя конечной точки**.
- **Сеть/Подсеть/IP-адрес**: выберите сеть, которую вы хотите использовать для соединения. Вам нужно будет создать IP-адрес или использовать существующий для конечной точки Private Service Connect. В нашем примере мы предварительно создали адрес с именем **your-ip-address** и назначили IP-адрес `10.128.0.2`.
- Чтобы сделать конечную точку доступной из любого региона, вы можете активировать флажок **Включить глобальный доступ**.

<img src={gcp_psc_enable_global_access} alt="Включить глобальный доступ для Private Service Connect" />

Чтобы создать конечную точку PSC, используйте кнопку **ДОБАВИТЬ КОНЕЧНУЮ ТОЧКУ**.

Столбец **Статус** изменится с **Ожидание** на **Принято**, как только соединение будет одобрено.

<img src={gcp_psc_copy_connection_id} alt="Скопировать ID соединения PSC" />

Скопируйте ***ID соединения PSC***, мы будем использовать его как ***ID конечной точки*** на следующих шагах.

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
  description = "Добавьте ID соединения GCP PSC в белый список на уровне экземпляра."
}
```

:::note
TARGET - Используйте `endpointServiceId` из [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага
:::

## Настройка DNS {#setting-up-dns}

Представлены два варианта, использование консоли Google Cloud и использование CLI `gcloud`.

### Вариант 1: Используя консоль Google Cloud {#option-1-using-the-google-cloud-console}

- Создайте частную DNS зону из **Поддерживаемых регионов**.
- Откройте **Сетевые службы -> Cloud DNS**.
- Выберите **Создать зону**:

<img src={gcp_psc_create_zone} alt="Создать DNS зону для PSC" />

В диалоговом окне типа зоны установите:

- Тип зоны: **Частная**
- Имя зоны: введите соответствующее имя зоны.
- Имя DNS: используйте столбец **Частный DNS домен** из таблицы **Поддерживаемые регионы** для вашего региона.
- Сети: прикрепите DNS зону к сетям, которые вы планируете использовать для подключений к ClickHouse Cloud через PSC.

<img src={gcp_psc_zone_type} alt="Выбор типа частной DNS зоны" />

#### Создание DNS записи в частной DNS зоне {#create-dns-record-in-private-dns-zone}

Укажите ее на IP-адрес, созданный на шаге [Добавление частного соединения сервиса](#adding-a-private-service-connection)

<img src={gcp_psc_dns_record} alt="Создание DNS записи для PSC" />

### Вариант 2: Используя CLI `gcloud` {#option-2-using-the-gcloud-cli}

#### Создание DNS зоны {#create-dns-zone}

```bash
gcloud dns \
  --project=my-gcp-project \
  managed-zones create ch-cloud-us-central1 \
  --description="Частная DNS зона для PSC" \
  --dns-name="us-central1.p.gcp.clickhouse.cloud." \
  --visibility="private" \
  --networks="https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
```

#### Создание DNS записи {#create-dns-record}

```bash
gcloud dns \
  --project=my-gcp-project \
  record-sets create $DNS_RECORD \
  --zone="ch-cloud-us-central1" \
  --type="A" \
  --ttl="300" \
  --rrdatas="10.128.0.2"
```
:::note
DNS_RECORD - используйте `privateDnsHostname` из [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага
:::

### Вариант 3: Используя Terraform {#option-3-using-terraform}

```json
variable "ch_dns_record" {
  type    = string
  default = "$DNS_NAME" # See below in notes
}

resource "google_dns_managed_zone" "clickhouse_cloud_private_service_connect" {
  description   = "Частная DNS зона для доступа к ClickHouse Cloud с использованием Private Service Connect"
  dns_name      = "${var.region}.p.gcp.clickhouse.cloud."
  force_destroy = false
  name          = "clickhouse-cloud-private-service-connect-${var.region}"
  visibility    = "private"
}

resource "google_dns_record_set" "psc_dns_record" {
  managed_zone = google_dns_managed_zone.clickhouse_cloud_private_service_connect.name
  name         = "${var.ch_dns_record}"
  type         = "A"
  rrdatas      = [google_compute_address.psc_endpoint_ip.address]
}
```

:::note
DNS_NAME - Используйте `privateDnsHostname` из [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага
:::

## Проверьте настройку DNS {#verify-dns-setup}

DNS_RECORD - используйте `privateDnsHostname` из [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага

```bash
ping $DNS_RECORD
```

## Добавить ID конечной точки в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в вашу организацию, перейдите к шагу [Добавить ID конечной точки в белый список сервисов](#add-endpoint-id-to-services-allow-list). Добавление `ID соединения PSC` с использованием консоли ClickHouse Cloud в белый список сервисов автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Сведения об организации -> Частные конечные точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<img src={gcp_pe_remove_private_endpoint} alt="Удалить частную конечную точку из ClickHouse Cloud" />

### Вариант 2: API {#option-2-api-1}

Установите эти переменные окружения перед выполнением любых команд:

Замените `ENDPOINT_ID` ниже значением из **ID конечной точки** из шага [Добавление частного соединения сервиса](#adding-a-private-service-connection)

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

Добавьте/удалите частную конечную точку в организацию:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## Добавить ID конечной точки в белый список сервисов {#add-endpoint-id-to-services-allow-list}

Вам необходимо добавить ID конечной точки в разрешенный список для каждого экземпляра, который должен быть доступен с использованием Private Service Connect.

:::note
Этот шаг не может быть выполнен для сервисов разработки.
:::

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через Private Service Connect, затем перейдите в **Настройки**. Введите `ID конечной точки`, полученный на шаге [Добавление частного соединения сервиса](#adding-a-private-service-connection). Нажмите **Создать конечную точку**.

:::note
Если вы хотите разрешить доступ из существующего соединения Private Service Connect, используйте выпадающее меню существующей конечной точки.
:::

<img src={gcp_privatelink_pe_filters} alt="Фильтр для частных конечных точек" />

### Вариант 2: API {#option-2-api-2}

Установите эти переменные окружения перед выполнением любых команд:

Замените **ENDPOINT_ID** ниже значением из **ID конечной точки** из шага [Добавление частного соединения сервиса](#adding-a-private-service-connection)

Выполните эту команду для каждого сервиса, который должен быть доступен с использованием Private Service Connect.

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
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} -d @pl_config.json | jq
```

## Доступ к экземпляру с использованием Private Service Connect {#accessing-instance-using-private-service-connect}

Каждый экземпляр с настроенными фильтрами Private Service Connect имеет две конечные точки: публичную и частную. Чтобы подключиться с использованием Private Service Connect, вам необходимо использовать частную конечную точку, смотрите `endpointServiceId` из шага [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 

:::note
Частное DNS имя доступно только из вашего VPC GCP. Не пытайтесь разрешить DNS хост с машины, находящейся за пределами VPC GCP.
:::

### Получение частного DNS имени {#getting-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. В открывшемся меню скопируйте **Имя DNS**.

<img src={gcp_privatelink_pe_dns} alt="Имя DNS частной конечной точки" />

#### Вариант 2: API {#option-2-api-3}

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<код региона>.p.gcp.clickhouse.cloud"
}
```

В этом примере подключение к `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` будет маршрутизироваться на Private Service Connect. В то время как `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` будет маршрутизироваться через интернет.

## Устранение неполадок {#troubleshooting}

### Проверка настройки DNS {#test-dns-setup}

DNS_NAME - используйте `privateDnsHostname` из [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага

```bash
nslookup $DNS_NAME
```

```response
Ненадежный ответ:
...
Адрес: 10.128.0.2
```

### Сброс соединения соединителем {#connection-reset-by-peer}

- Скорее всего, ID конечной точки не был добавлен в белый список сервисов. Вернитесь к шагу [_Добавить ID конечной точки в белый список сервисов_](#add-endpoint-id-to-services-allow-list).

### Проверка подключения {#test-connectivity}

Если у вас возникли проблемы с подключением с использованием ссылки PSC, проверьте ваше соединение с помощью `openssl`. Убедитесь, что статус конечной точки Private Service Connect равен `Принято`:

OpenSSL должен быть в состоянии подключиться (см. CONNECTED в выводе). `errno=104` ожидается.

DNS_NAME - используйте `privateDnsHostname` из [Получите подключение GCP для Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) шага

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# выделить следующую строку
CONNECTED(00000003)
write:errno=104
---
сертификат пира недоступен
---
Имена CA для клиентского сертификата не отправлены
---
SSL рукопожатие прочитано 0 байт и записано 335 байт
Проверка: ОК
---
Новый, (НИЧЕГО), шифр - (НИЧЕГО)
Поддержка защищенной повторной переговоры НЕ поддерживается
Сжатие: НЕТ
Расширение: НЕТ
Не торжественно утверждено
Ранние данные не были отправлены
Код проверки возврата: 0 (ок)
```

### Проверка фильтров конечной точки {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Допустим, вы пытаетесь использовать функции таблиц [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в GCP. GCP PSC не может быть использован для безопасного подключения к этой базе данных. PSC — это одностороннее, унидиерционное соединение. Оно позволяет вашей внутренней сети или VPC GCP безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации GCP Private Service Connect](https://cloud.google.com/vpc/docs/private-service-connect):

> Проектирование, ориентированное на услуги: Услуги производителей публикуются через балансировщики нагрузки, которые предоставляют единственный IP-адрес для сети потребителя VPC. Трафик потребителей, который получает доступ к услугам производителей, односторонний и может получать доступ только к IP-адресу сервиса, а не к целой сетевой сети VPC.

Для этого настройте правила брандмауэра VPC GCP, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Проверьте [стандартные исходящие IP-адреса для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).

## Дополнительная информация {#more-information}

Для получения более подробной информации посетите [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
