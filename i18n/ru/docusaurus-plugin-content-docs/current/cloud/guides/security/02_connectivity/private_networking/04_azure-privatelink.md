---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'Как настроить Azure Private Link'
keywords: ['azure', 'private link', 'privatelink']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import azure_pe from '@site/static/images/cloud/security/azure-pe.png';
import azure_privatelink_pe_create from '@site/static/images/cloud/security/azure-privatelink-pe-create.png';
import azure_private_link_center from '@site/static/images/cloud/security/azure-private-link-center.png';
import azure_pe_create_basic from '@site/static/images/cloud/security/azure-pe-create-basic.png';
import azure_pe_resource from '@site/static/images/cloud/security/azure-pe-resource.png';
import azure_pe_create_vnet from '@site/static/images/cloud/security/azure-pe-create-vnet.png';
import azure_pe_create_dns from '@site/static/images/cloud/security/azure-pe-create-dns.png';
import azure_pe_create_tags from '@site/static/images/cloud/security/azure-pe-create-tags.png';
import azure_pe_create_review from '@site/static/images/cloud/security/azure-pe-create-review.png';
import azure_pe_ip from '@site/static/images/cloud/security/azure-pe-ip.png';
import azure_pe_view from '@site/static/images/cloud/security/azure-pe-view.png';
import azure_pe_resource_id from '@site/static/images/cloud/security/azure-pe-resource-id.png';
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

В этом руководстве показано, как использовать Azure Private Link для организации приватного подключения через виртуальную сеть между Azure (включая сервисы, принадлежащие клиенту и партнёрам Microsoft) и ClickHouse Cloud. Azure Private Link упрощает сетевую архитектуру и защищает соединение между конечными точками в Azure, исключая передачу данных через общедоступный интернет.

<Image img={azure_pe} size="lg" alt="Обзор PrivateLink" background='white' />

Azure поддерживает межрегиональное подключение через Private Link. Это позволяет создавать подключения между виртуальными сетями (VNet), расположенными в разных регионах, где развернуты ваши сервисы ClickHouse.

:::note
За межрегиональный трафик могут взиматься дополнительные платежи. Пожалуйста, ознакомьтесь с актуальной документацией Azure.
:::

**Выполните следующие шаги, чтобы включить Azure Private Link:**

1. Получите Azure connection alias для Private Link
1. Создайте Private Endpoint в Azure
1. Добавьте Resource ID Private Endpoint в вашу организацию ClickHouse Cloud
1. Добавьте Resource ID Private Endpoint в список разрешённых (allow list) для вашего(-их) сервиса(-ов)
1. Подключитесь к вашему сервису ClickHouse Cloud через Private Link

:::note
В ClickHouse Cloud Azure PrivateLink произошёл переход с использования фильтров по resourceGUID на фильтры по Resource ID. Вы по-прежнему можете использовать resourceGUID, так как он обратно совместим, но мы рекомендуем перейти на фильтры по Resource ID. Для миграции просто создайте новый endpoint с использованием Resource ID, привяжите его к сервису и удалите старый endpoint, основанный на resourceGUID.
:::



## Внимание {#attention}

ClickHouse пытается группировать ваши сервисы для повторного использования одной и той же опубликованной [службы Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) в пределах региона Azure. Однако такая группировка не гарантируется, особенно если вы распределяете свои сервисы по нескольким организациям ClickHouse.
Если у вас уже настроен Private Link для других сервисов в вашей организации ClickHouse, вы часто можете пропустить большинство шагов благодаря этой группировке и перейти сразу к финальному шагу: [Добавьте идентификатор ресурса Private Endpoint в список разрешённых для ваших сервисов](#add-private-endpoint-id-to-services-allow-list).

Примеры Terraform можно найти в [репозитории Terraform Provider для ClickHouse](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).


## Получение псевдонима подключения Azure для Private Link {#obtain-azure-connection-alias-for-private-link}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем откройте меню **Settings**. Нажмите кнопку **Set up private endpoint**. Запишите значения `Service name` и `DNS name` — они потребуются для настройки Private Link.

<Image
  img={azure_privatelink_pe_create}
  size='lg'
  alt='Частные конечные точки'
  border
/>

Запишите значения `Service name` и `DNS name` — они понадобятся на следующих шагах.

### Вариант 2: API {#option-2-api}

Прежде чем начать, вам потребуется ключ API ClickHouse Cloud. Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.

После получения ключа API установите следующие переменные окружения перед выполнением команд:

```bash
REGION=<код региона, используйте формат Azure, например: westus3>
PROVIDER=azure
KEY_ID=<идентификатор ключа>
KEY_SECRET=<секретный ключ>
ORG_ID=<идентификатор организации ClickHouse>
SERVICE_NAME=<имя вашего сервиса ClickHouse>
```

Получите ваш `INSTANCE_ID` ClickHouse, отфильтровав по региону, провайдеру и имени сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите псевдоним подключения Azure и имя хоста Private DNS для Private Link:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

Запишите значение `endpointServiceId` — оно потребуется на следующем шаге.


## Создание частной конечной точки в Azure {#create-private-endpoint-in-azure}

:::important
В этом разделе описаны особенности настройки ClickHouse через Azure Private Link. Шаги, специфичные для Azure, приведены в качестве справочной информации, но они могут измениться без предварительного уведомления со стороны облачного провайдера Azure. Учитывайте конфигурацию Azure в соответствии с вашим конкретным сценарием использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых частных конечных точек Azure и DNS-записей.

По любым вопросам, связанным с настройкой Azure, обращайтесь напрямую в службу поддержки Azure.
:::

В этом разделе мы создадим частную конечную точку в Azure. Вы можете использовать либо портал Azure, либо Terraform.

### Вариант 1: Использование портала Azure для создания частной конечной точки {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

На портале Azure откройте **Private Link Center → Private Endpoints**.

<Image
  img={azure_private_link_center}
  size='lg'
  alt='Открытие Azure Private Center'
  border
/>

Откройте диалоговое окно создания частной конечной точки, нажав кнопку **Create**.

<Image
  img={azure_private_link_center}
  size='lg'
  alt='Открытие Azure Private Center'
  border
/>

---

На следующем экране укажите следующие параметры:

- **Subscription** / **Resource Group**: Выберите подписку Azure и группу ресурсов для частной конечной точки.
- **Name**: Задайте имя для **Private Endpoint**.
- **Region**: Выберите регион, в котором развернута виртуальная сеть, которая будет подключена к ClickHouse Cloud через Private Link.

После выполнения указанных выше шагов нажмите кнопку **Next: Resource**.

<Image
  img={azure_pe_create_basic}
  size='md'
  alt='Создание частной конечной точки — базовые настройки'
  border
/>

---

Выберите опцию **Connect to an Azure resource by resource ID or alias**.

В поле **Resource ID or alias** используйте `endpointServiceId`, полученный на шаге [Получение псевдонима подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

Нажмите кнопку **Next: Virtual Network**.

<Image
  img={azure_pe_resource}
  size='md'
  alt='Выбор ресурса частной конечной точки'
  border
/>

---

- **Virtual network**: Выберите виртуальную сеть, которую вы хотите подключить к ClickHouse Cloud с помощью Private Link
- **Subnet**: Выберите подсеть, в которой будет создана частная конечная точка

Необязательно:

- **Application security group**: Вы можете присоединить ASG к частной конечной точке и использовать её в группах безопасности сети для фильтрации сетевого трафика к/от частной конечной точки.

Нажмите кнопку **Next: DNS**.

<Image
  img={azure_pe_create_vnet}
  size='md'
  alt='Выбор виртуальной сети для частной конечной точки'
  border
/>

Нажмите кнопку **Next: Tags**.

---

<Image
  img={azure_pe_create_dns}
  size='md'
  alt='Настройка DNS для частной конечной точки'
  border
/>

При желании вы можете добавить теги к вашей частной конечной точке.

Нажмите кнопку **Next: Review + create**.

---

<Image
  img={azure_pe_create_tags}
  size='md'
  alt='Теги частной конечной точки'
  border
/>

Наконец, нажмите кнопку **Create**.

<Image
  img={azure_pe_create_review}
  size='md'
  alt='Проверка частной конечной точки'
  border
/>

**Connection status** созданной частной конечной точки будет в состоянии **Pending**. Он изменится на **Approved** после того, как вы добавите эту частную конечную точку в список разрешенных для сервиса.

Откройте сетевой интерфейс, связанный с частной конечной точкой, и скопируйте **Private IPv4 address** (10.0.0.4 в этом примере) — эта информация понадобится вам на следующих шагах.

<Image img={azure_pe_ip} size='lg' alt='IP-адрес частной конечной точки' border />

### Вариант 2: Использование Terraform для создания частной конечной точки {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Используйте приведенный ниже шаблон для создания частной конечной точки с помощью Terraform:

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<данные из шага 'Получение псевдонима подключения Azure для Private Link'>"
    is_manual_connection              = true
  }
}
```

### Получение идентификатора ресурса частной конечной точки {#obtaining-private-endpoint-resourceid}

Чтобы использовать Private Link, необходимо добавить идентификатор ресурса подключения частной конечной точки в список разрешенных для вашего сервиса.

Идентификатор ресурса частной конечной точки доступен на портале Azure. Откройте частную конечную точку, созданную на предыдущем шаге, и нажмите **JSON View**:


<Image img={azure_pe_view} size="lg" alt="Просмотр приватной конечной точки" border />

В разделе properties найдите поле `id` и скопируйте его значение:

**Рекомендуемый способ: с использованием Resource ID**
<Image img={azure_pe_resource_id} size="lg" alt="Resource ID приватной конечной точки" border />

**Устаревший способ: с использованием resourceGUID**
Вы по-прежнему можете использовать resourceGUID для обеспечения обратной совместимости. Найдите поле `resourceGuid` и скопируйте его значение:

<Image img={azure_pe_resource_guid} size="lg" alt="Resource GUID приватной конечной точки" border />



## Настройка DNS для Private Link {#setting-up-dns-for-private-link}

Для доступа к ресурсам через Private Link необходимо создать зону Private DNS (`${location_code}.privatelink.azure.clickhouse.cloud`) и привязать её к вашей виртуальной сети (VNet).

### Создание зоны Private DNS {#create-private-dns-zone}

**Вариант 1: Через портал Azure**

Следуйте инструкциям в руководстве по [созданию зоны Azure private DNS через портал Azure](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Вариант 2: С помощью Terraform**

Используйте следующий шаблон Terraform для создания зоны Private DNS:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Создание wildcard-записи DNS {#create-a-wildcard-dns-record}

Создайте wildcard-запись, указывающую на ваш Private Endpoint:

**Вариант 1: Через портал Azure**

1. Откройте группу ресурсов `MyAzureResourceGroup` и выберите приватную зону `${region_code}.privatelink.azure.clickhouse.cloud`.
2. Нажмите + Record set.
3. В поле Name введите `*`.
4. В поле IP Address введите IP-адрес вашего Private Endpoint.
5. Нажмите **OK**.

<Image
  img={azure_pl_dns_wildcard}
  size='lg'
  alt='Настройка wildcard DNS для Private Link'
  border
/>

**Вариант 2: С помощью Terraform**

Используйте следующий шаблон Terraform для создания wildcard-записи DNS:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### Создание связи с виртуальной сетью {#create-a-virtual-network-link}

Для привязки зоны private DNS к виртуальной сети необходимо создать связь с виртуальной сетью.

**Вариант 1: Через портал Azure**

Следуйте инструкциям в руководстве по [привязке виртуальной сети к зоне private DNS](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Вариант 2: С помощью Terraform**

:::note
Существуют различные способы настройки DNS. Настройте DNS в соответствии с вашим конкретным сценарием использования.
:::

Необходимо направить "DNS name", полученное на шаге [Получение псевдонима подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link), на IP-адрес Private Endpoint. Это обеспечит корректное разрешение имени сервисами и компонентами внутри вашей VPC/сети.

### Проверка настройки DNS {#verify-dns-setup}

Домен `xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` должен указывать на IP-адрес Private Endpoint (в данном примере 10.0.0.4).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```


## Добавление идентификатора ресурса приватной конечной точки в организацию ClickHouse Cloud {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Добавление идентификатора ресурса приватной конечной точки в список разрешенных для ваших сервисов](#add-private-endpoint-id-to-services-allow-list). Добавление идентификатора ресурса приватной конечной точки через консоль ClickHouse Cloud в список разрешенных сервисов автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Organization details -> Private Endpoints** и нажмите кнопку удаления.

<Image
  img={azure_pe_remove_private_endpoint}
  size='lg'
  alt='Удаление приватной конечной точки'
  border
/>

### Вариант 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением команд:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Получение идентификатора ресурса приватной конечной точки](#obtaining-private-endpoint-resourceid).

Выполните следующую команду для добавления приватной конечной точки:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Вы также можете выполнить следующую команду для удаления приватной конечной точки:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

После добавления или удаления приватной конечной точки выполните следующую команду для применения изменений в организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## Добавление идентификатора ресурса Private Endpoint в список разрешенных для ваших сервисов {#add-private-endpoint-id-to-services-allow-list}

По умолчанию сервис ClickHouse Cloud недоступен через соединение Private Link, даже если соединение Private Link одобрено и установлено. Необходимо явно добавить идентификатор ресурса Private Endpoint для каждого сервиса, который должен быть доступен через Private Link.

### Вариант 1: консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в раздел **Settings**. Введите `Resource ID`, полученный на [предыдущем](#obtaining-private-endpoint-resourceid) шаге.

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню существующих endpoint.
:::

<Image
  img={azure_privatelink_pe_filter}
  size='lg'
  alt='Фильтр Private Endpoints'
  border
/>

### Вариант 2: API {#option-2-api-2}

Установите следующие переменные окружения перед выполнением команд:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

Выполните это для каждого сервиса, который должен быть доступен через Private Link.

Выполните следующую команду, чтобы добавить Private Endpoint в список разрешенных для сервисов:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF
```

Вы также можете выполнить следующую команду, чтобы удалить Private Endpoint из списка разрешенных для сервисов:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF
```

После добавления или удаления Private Endpoint из списка разрешенных для сервисов выполните следующую команду, чтобы применить изменения к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```


## Доступ к сервису ClickHouse Cloud через Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Каждый сервис с включенным Private Link имеет публичную и приватную конечные точки. Для подключения через Private Link необходимо использовать приватную конечную точку, которая будет представлена как `privateDnsHostname`<sup>API</sup> или `DNS name`<sup>консоль</sup>, полученные из раздела [Получение псевдонима подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

### Получение приватного DNS-имени хоста {#obtaining-the-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в раздел **Settings**. Нажмите кнопку **Set up private endpoint**. В открывшейся панели скопируйте **DNS Name**.

<Image
  img={azure_privatelink_pe_dns}
  size='lg'
  alt='DNS-имя приватной конечной точки'
  border
/>

#### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением команд:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Выполните следующую команду:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

Вы должны получить ответ, аналогичный следующему:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

В этом примере подключение к хосту `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` будет маршрутизироваться через Private Link. В то же время подключение к `xxxxxxx.region_code.azure.clickhouse.cloud` будет маршрутизироваться через интернет.

Используйте `privateDnsHostname` для подключения к вашему сервису ClickHouse Cloud через Private Link.


## Устранение неполадок {#troubleshooting}

### Проверка настройки DNS {#test-dns-setup}

Выполните следующую команду:

```bash
nslookup <dns name>
```

где "dns name" — это `privateDnsHostname`<sup>API</sup> или `DNS name`<sup>console</sup> из раздела [Получение псевдонима подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link)

Вы должны получить следующий ответ:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### Соединение сброшено удалённой стороной {#connection-reset-by-peer}

Скорее всего, идентификатор ресурса Private Endpoint не был добавлен в список разрешённых для сервиса. Вернитесь к шагу [_Добавление идентификатора ресурса Private Endpoint в список разрешённых для сервиса_](#add-private-endpoint-id-to-services-allow-list).

### Private Endpoint находится в состоянии ожидания {#private-endpoint-is-in-pending-state}

Скорее всего, идентификатор ресурса Private Endpoint не был добавлен в список разрешённых для сервиса. Вернитесь к шагу [_Добавление идентификатора ресурса Private Endpoint в список разрешённых для сервиса_](#add-private-endpoint-id-to-services-allow-list).

### Проверка подключения {#test-connectivity}

Если у вас возникли проблемы с подключением через Private Link, проверьте подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Link — `Accepted`.

OpenSSL должен успешно подключиться (в выводе должно быть указано CONNECTED). Ошибка `errno=104` является ожидаемой.

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud:9440
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

### Проверка фильтров приватных конечных точек {#checking-private-endpoint-filters}

Установите следующие переменные окружения перед выполнением команд:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Выполните следующую команду для проверки фильтров приватных конечных точек:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```


## Дополнительная информация {#more-information}

Дополнительную информацию об Azure Private Link можно найти на странице [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
