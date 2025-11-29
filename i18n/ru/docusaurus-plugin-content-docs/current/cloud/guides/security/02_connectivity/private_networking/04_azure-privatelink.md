---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'Настройка Azure Private Link'
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


# Azure Private Link {#azure-private-link}

<ScalePlanFeatureBadge feature="Azure Private Link"/>

В этом руководстве показано, как использовать Azure Private Link для организации частного подключения через виртуальную сеть между Azure (включая сервисы, принадлежащие клиентам и партнёрам Microsoft) и ClickHouse Cloud. Azure Private Link упрощает сетевую архитектуру и защищает соединение между конечными точками в Azure, исключая передачу данных через общедоступный интернет.

<Image img={azure_pe} size="lg" alt="Обзор PrivateLink" background='white' />

Azure поддерживает межрегиональное подключение через Private Link. Это позволяет устанавливать подключения между виртуальными сетями (VNet) в разных регионах, в которых у вас развернуты сервисы ClickHouse.

:::note
За межрегиональный трафик могут взиматься дополнительные платежи. Пожалуйста, ознакомьтесь с актуальной документацией Azure.
:::

**Выполните следующие шаги, чтобы включить Azure Private Link:**

1. Получите псевдоним подключения (connection alias) Azure для Private Link
1. Создайте Private Endpoint в Azure
1. Добавьте Resource ID Private Endpoint в вашу организацию ClickHouse Cloud
1. Добавьте Resource ID Private Endpoint в allow list вашего сервиса (ваших сервисов)
1. Подключайтесь к вашему сервису ClickHouse Cloud через Private Link

:::note
В ClickHouse Cloud для Azure PrivateLink фильтрация была переведена с использования resourceGUID на фильтры по Resource ID. Вы всё ещё можете использовать resourceGUID, так как он сохраняет обратную совместимость, но мы рекомендуем перейти на фильтры по Resource ID. Для миграции просто создайте новую конечную точку (endpoint) с использованием Resource ID, привяжите её к сервису и удалите старую конечную точку, основанную на resourceGUID.
:::



## Внимание {#attention}
ClickHouse пытается сгруппировать ваши сервисы, чтобы повторно использовать одну и ту же опубликованную [службу Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) в пределах региона Azure. Однако такая группировка не гарантируется, особенно если вы распределяете свои сервисы между несколькими организациями ClickHouse.
Если у вас уже настроен Private Link для других сервисов в вашей организации ClickHouse, вы в большинстве случаев можете пропустить основную часть шагов благодаря этой группировке и перейти сразу к последнему шагу: [добавить идентификатор ресурса Private Endpoint в список разрешённых для ваших сервисов](#add-private-endpoint-id-to-services-allow-list).

Примеры Terraform можно найти в репозитории [Terraform Provider для ClickHouse](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).



## Получение псевдонима подключения Azure для Private Link {#obtain-azure-connection-alias-for-private-link}

### Вариант 1: консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через Private Link, затем откройте меню **Settings**. Нажмите кнопку **Set up private endpoint**. Запишите значения `Service name` и `DNS name`, которые будут использованы для настройки Private Link.

<Image img={azure_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

Запишите `Service name` и `DNS name` — они понадобятся на следующих этапах.

### Вариант 2: API {#option-2-api}

Прежде чем начать, вам понадобится ключ API ClickHouse Cloud. Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать уже существующий.

После того как у вас будет ключ API, перед выполнением каких‑либо команд задайте следующие переменные окружения:

```bash
REGION=<код региона, используйте формат Azure, например: westus3>
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<секрет ключа>
ORG_ID=<укажите ID организации ClickHouse>
SERVICE_NAME=<имя вашего сервиса ClickHouse>
```

Получите значение `INSTANCE_ID` для вашего ClickHouse, отфильтровав результаты по региону, провайдеру и названию сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите псевдоним подключения Azure и имя хоста частной DNS (Private DNS) для Private Link:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

Сохраните значение `endpointServiceId`. Оно потребуется на следующем шаге.


## Создание приватной конечной точки в Azure {#create-private-endpoint-in-azure}

:::important
В этом разделе рассматриваются специфические для ClickHouse детали настройки ClickHouse через Azure Private Link. Шаги, относящиеся к Azure, приведены в качестве ориентира, чтобы показать, где и что нужно настраивать, но они могут со временем меняться без уведомления со стороны облачного провайдера Azure. Настраивайте Azure с учётом вашего конкретного сценария использования.

Обратите внимание, что ClickHouse не несёт ответственность за настройку требуемых приватных конечных точек Azure и DNS-записей.

По любым вопросам, связанным с задачами конфигурации Azure, обращайтесь напрямую в службу поддержки Azure.
:::

В этом разделе мы создадим Private Endpoint в Azure. Вы можете использовать как Azure Portal, так и Terraform.

### Вариант 1. Использование Azure Portal для создания приватной конечной точки в Azure {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

В Azure Portal откройте **Private Link Center → Private Endpoints**.

<Image img={azure_private_link_center} size="lg" alt="Открытие Azure Private Link Center" border />

Откройте диалог создания Private Endpoint, нажав кнопку **Create**.

<Image img={azure_private_link_center} size="lg" alt="Открытие Azure Private Link Center" border />

***

На следующем экране укажите следующие параметры:

* **Subscription** / **Resource Group**: выберите подписку Azure и группу ресурсов для Private Endpoint.
* **Name**: задайте имя для **Private Endpoint**.
* **Region**: выберите регион, в котором развернут VNet, который будет подключён к ClickHouse Cloud через Private Link.

После выполнения вышеуказанных шагов нажмите кнопку **Next: Resource**.

<Image img={azure_pe_create_basic} size="md" alt="Создание Private Endpoint: базовые параметры" border />

***

Выберите опцию **Connect to an Azure resource by resource ID or alias**.

Для **Resource ID or alias** используйте `endpointServiceId`, полученный на шаге [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link).

Нажмите кнопку **Next: Virtual Network**.

<Image img={azure_pe_resource} size="md" alt="Выбор ресурса для Private Endpoint" border />

***

* **Virtual network**: выберите VNet, который вы хотите подключить к ClickHouse Cloud с помощью Private Link.
* **Subnet**: выберите подсеть, в которой будет создан Private Endpoint.

Необязательно:

* **Application security group**: вы можете привязать ASG к Private Endpoint и использовать её в Network Security Groups для фильтрации сетевого трафика к/от Private Endpoint.

Нажмите кнопку **Next: DNS**.

<Image img={azure_pe_create_vnet} size="md" alt="Выбор виртуальной сети для Private Endpoint" border />

Нажмите кнопку **Next: Tags**.

***

<Image img={azure_pe_create_dns} size="md" alt="Настройка DNS для Private Endpoint" border />

При необходимости вы можете добавить теги к своему Private Endpoint.

Нажмите кнопку **Next: Review + create**.

***

<Image img={azure_pe_create_tags} size="md" alt="Теги Private Endpoint" border />

В завершение нажмите кнопку **Create**.

<Image img={azure_pe_create_review} size="md" alt="Просмотр настроек Private Endpoint" border />

**Connection status** созданного Private Endpoint будет в состоянии **Pending**. Он изменится на **Approved** после того, как вы добавите этот Private Endpoint в список разрешённых подключений сервиса.

Откройте сетевой интерфейс, связанный с Private Endpoint, и скопируйте **Private IPv4 address** (10.0.0.4 в этом примере). Эта информация потребуется на следующих шагах.

<Image img={azure_pe_ip} size="lg" alt="IP-адрес Private Endpoint" border />

### Вариант 2. Использование Terraform для создания приватной конечной точки в Azure {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Используйте приведённый ниже шаблон, чтобы создать Private Endpoint с помощью Terraform:

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<данные из шага «Получение псевдонима подключения Azure для Private Link»>"
    is_manual_connection              = true
  }
}
```

### Получение идентификатора ресурса частной конечной точки {#obtaining-private-endpoint-resourceid}

Чтобы использовать Private Link, вам необходимо добавить идентификатор ресурса подключения частной конечной точки в список разрешённых для вашего сервиса.

Идентификатор ресурса частной конечной точки доступен в портале Azure. Откройте частную конечную точку, созданную на предыдущем шаге, и нажмите **JSON View**:


<Image img={azure_pe_view} size="lg" alt="Просмотр частной конечной точки" border />

В разделе «Свойства» найдите поле `id` и скопируйте его значение:

**Предпочтительный способ: использование Resource ID**
<Image img={azure_pe_resource_id} size="lg" alt="Resource ID частной конечной точки" border />

**Устаревший способ: использование resourceGUID**
Вы по-прежнему можете использовать resourceGUID для обеспечения обратной совместимости. Найдите поле `resourceGuid` и скопируйте его значение:

<Image img={azure_pe_resource_guid} size="lg" alt="Resource GUID частной конечной точки" border />



## Настройка DNS для Private Link {#setting-up-dns-for-private-link}

Вам необходимо создать зону Private DNS (`${location_code}.privatelink.azure.clickhouse.cloud`) и подключить её к вашей виртуальной сети (VNet), чтобы получить доступ к ресурсам через Private Link.

### Создание зоны Private DNS {#create-private-dns-zone}

**Вариант 1: использование портала Azure**

Следуйте этому руководству, чтобы [создать зону Azure Private DNS с помощью портала Azure](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Вариант 2: использование Terraform**

Используйте следующий шаблон Terraform для создания зоны Private DNS:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Создание подстановочной записи DNS {#create-a-wildcard-dns-record}

Создайте подстановочную DNS-запись и укажите ваш Private Endpoint:

**Вариант 1: с помощью портала Azure**

1. Откройте группу ресурсов `MyAzureResourceGroup` и выберите частную зону `${region_code}.privatelink.azure.clickhouse.cloud`.
2. Выберите + **Record set**.
3. В поле Name введите `*`.
4. В поле IP Address введите IP-адрес, указанный для Private Endpoint.
5. Нажмите **OK**.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Настройка подстановочной записи DNS для Private Link" border />

**Вариант 2: с помощью Terraform**

Используйте следующий шаблон Terraform, чтобы создать подстановочную DNS-запись:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### Создайте привязку к виртуальной сети {#create-a-virtual-network-link}

Чтобы связать частную зону DNS с виртуальной сетью, вам необходимо создать привязку к виртуальной сети.

**Вариант 1: через портал Azure**

Следуйте этой инструкции, чтобы [связать виртуальную сеть с частной зоной DNS](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Вариант 2: с использованием Terraform**

:::note
Существует множество способов настройки DNS. Настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вам нужно направить значение поля «DNS name», полученное на шаге [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link), на IP-адрес Private Endpoint. Это гарантирует, что сервисы и компоненты внутри вашей VPC/сети смогут корректно разрешать это имя.

### Проверка настройки DNS {#verify-dns-setup}

Домен `xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` должен быть направлен на IP-адрес Private Endpoint (10.0.0.4 в этом примере).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Сервер: 127.0.0.53
Адрес: 127.0.0.53#53

Неавторитетный ответ:
Имя: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Адрес: 10.0.0.4
```


## Добавление идентификатора ресурса Private Endpoint в организацию ClickHouse Cloud {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### Вариант 1: консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Add the Private Endpoint Resource ID to your service(s) allow list](#add-private-endpoint-id-to-services-allow-list). Добавление идентификатора ресурса Private Endpoint в список разрешённых сервисов через консоль ClickHouse Cloud автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Organization details -&gt; Private Endpoints** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Удаление Private Endpoint" border />

### Вариант 2: API {#option-2-api-1}

Перед выполнением каких-либо команд задайте следующие переменные окружения:

```bash
PROVIDER=azure
KEY_ID=<идентификатор ключа>
KEY_SECRET=<секрет ключа>
ORG_ID=<укажите идентификатор организации ClickHouse>
ENDPOINT_ID=<идентификатор ресурса частной конечной точки (Private Endpoint)>
REGION=<код региона в формате Azure>
```

Установите переменную среды `ENDPOINT_ID`, используя данные из шага [Получение идентификатора ресурса частной конечной точки](#obtaining-private-endpoint-resourceid).

Выполните следующую команду, чтобы добавить частную конечную точку:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Частная конечная точка Azure",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Также можно выполнить следующую команду, чтобы удалить частную конечную точку:

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

После добавления или удаления частной конечной точки выполните следующую команду, чтобы применить изменения в организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## Добавьте идентификатор ресурса частной конечной точки (Private Endpoint Resource ID) в allow list вашего сервиса (или сервисов) {#add-private-endpoint-id-to-services-allow-list}

По умолчанию сервис ClickHouse Cloud недоступен по соединению Private Link, даже если соединение Private Link одобрено и установлено. Необходимо явно добавить идентификатор ресурса частной конечной точки (Private Endpoint Resource ID) для каждого сервиса, который должен быть доступен через Private Link.

### Вариант 1: консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в раздел **Settings**. Введите `Resource ID`, полученный на [предыдущем](#obtaining-private-endpoint-resourceid) шаге.

:::note
Если вы хотите разрешить доступ из уже существующего соединения PrivateLink, используйте существующую конечную точку из выпадающего списка.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Фильтр частных конечных точек" border />

### Вариант 2: API {#option-2-api-2}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
PROVIDER=azure
KEY_ID=<идентификатор ключа>
KEY_SECRET=<секретный ключ>
ORG_ID=<укажите идентификатор организации ClickHouse>
ENDPOINT_ID=<идентификатор ресурса Private Endpoint>
INSTANCE_ID=<идентификатор экземпляра>
```

Выполните эту команду для каждого сервиса, который должен быть доступен через Private Link.

Запустите следующую команду, чтобы добавить Private Endpoint в список разрешённых сервисов:

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

Вы также можете выполнить следующую команду, чтобы удалить закрытую конечную точку (Private Endpoint) из списка разрешённых для сервисов подключений:

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

После добавления или удаления Private Endpoint в списке разрешённых сервисов выполните следующую команду, чтобы применить изменения к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```


## Доступ к вашему сервису ClickHouse Cloud с использованием Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Каждый сервис с включённым Private Link имеет публичную и приватную конечную точку. Для подключения через Private Link необходимо использовать приватную конечную точку — это `privateDnsHostname`<sup>API</sup> или `DNS name`<sup>console</sup>, полученные на шаге [Получение псевдонима подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

### Получение приватного DNS-имени хоста {#obtaining-the-private-dns-hostname}

#### Вариант 1: консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в раздел **Settings**. Нажмите кнопку **Set up private endpoint**. В открывшейся панели скопируйте значение **DNS Name**.

<Image img={azure_privatelink_pe_dns} size="lg" alt="DNS-имя приватной конечной точки" border />

#### Вариант 2: API {#option-2-api-3}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<секрет ключа>
ORG_ID=<идентификатор организации ClickHouse>
INSTANCE_ID=<идентификатор экземпляра>
```

Выполните следующую команду:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

Вы должны получить ответ, аналогичный следующему:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.&lt;код региона&gt;.privatelink.azure.clickhouse.cloud"
}
```

В этом примере подключение к имени хоста `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` будет направляться через Private Link, а `xxxxxxx.region_code.azure.clickhouse.cloud` — через Интернет.

Используйте `privateDnsHostname` для подключения к вашей службе ClickHouse Cloud через Private Link.


## Устранение неполадок {#troubleshooting}

### Проверка настроек DNS {#test-dns-setup}

Выполните следующую команду:

```bash
nslookup &lt;имя DNS&gt;
```

где «dns name» — это `privateDnsHostname`<sup>API</sup> или `DNS name`<sup>console</sup> из раздела [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link)

В ответ вы получите следующее:

```response
Неавторитетный ответ:
Имя: <dns name>
Адрес: 10.0.0.4
```

### Сброс соединения удалённым узлом {#connection-reset-by-peer}

Скорее всего, идентификатор ресурса Private Endpoint не был добавлен в список разрешённых для сервиса (allow-list). Вернитесь к шагу [*Add Private Endpoint Resource ID to your services allow-list*](#add-private-endpoint-id-to-services-allow-list).

### Private Endpoint находится в состоянии pending {#private-endpoint-is-in-pending-state}

Скорее всего, идентификатор ресурса Private Endpoint не был добавлен в список разрешённых для сервиса (allow-list). Вернитесь к шагу [*Add Private Endpoint Resource ID to your services allow-list*](#add-private-endpoint-id-to-services-allow-list).

### Проверка подключения {#test-connectivity}

Если у вас возникают проблемы с подключением с использованием Private Link, проверьте подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Link — `Accepted`.

OpenSSL должен успешно подключиться (см. CONNECTED в выводе команды). Значение `errno=104` является ожидаемым.

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud:9440
```


```response
# highlight-next-line {#highlight-next-line}
CONNECTED(00000003)
write:errno=104
---
сертификат удалённой стороны недоступен
---
имена УЦ для клиентских сертификатов не отправлены
---
при SSL-рукопожатии прочитано 0 байт и записано 335 байт
Проверка: успешно
---
Новое соединение, (NONE), шифр: (NONE)
Безопасная повторная инициализация НЕ поддерживается
Сжатие: нет
Декомпрессия: нет
Протокол ALPN не согласован
ранние данные не отправлялись
Код возврата проверки: 0 (успешно)
```

### Проверка фильтров частных конечных точек {#checking-private-endpoint-filters}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
KEY_ID=<идентификатор ключа>
KEY_SECRET=<секретный ключ>
ORG_ID=<укажите идентификатор организации ClickHouse>
INSTANCE_ID=<идентификатор инстанса>
```

Выполните следующую команду, чтобы проверить фильтры Private Endpoint:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```


## Дополнительная информация {#more-information}

Для получения дополнительной информации об Azure Private Link посетите [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
