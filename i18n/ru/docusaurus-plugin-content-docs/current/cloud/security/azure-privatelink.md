---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'Как настроить Azure Private Link'
keywords: ['azure', 'private link', 'privatelink']
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
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

Данный гид показывает, как использовать Azure Private Link для обеспечения частной связи через виртуальную сеть между Azure (включая услуги, принадлежащие клиенту, и услуги Microsoft Partner) и ClickHouse Cloud. Azure Private Link упрощает сетевую архитектуру и защищает соединение между конечными точками в Azure, устраняя влияние данных на общедоступный интернет.

<Image img={azure_pe} size="lg" alt="Обзор PrivateLink" background='white' />

В отличие от AWS и GCP, Azure поддерживает связь между регионами через Private Link. Это позволяет устанавливать соединения между VNets, расположенными в разных регионах, в которых развернуты ваши службы ClickHouse.

:::note
За межрегиональный трафик могут применяться дополнительные сборы. Пожалуйста, проверьте последнюю документацию Azure.
:::

**Пожалуйста, выполните следующие шаги для включения Azure Private Link:**

1. Получите псевдоним подключения Azure для Private Link
1. Создайте частую конечную точку в Azure
1. Добавьте GUID частной конечной точки в вашу организацию ClickHouse Cloud
1. Добавьте GUID частной конечной точки в список разрешенных для вашего(их) сервиса(ов)
1. Доступ к вашему сервису ClickHouse Cloud с использованием Private Link


## Внимание {#attention}
ClickHouse пытается сгруппировать ваши сервисы, чтобы повторно использовать один и тот же опубликованный [сервис Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) внутри региона Azure. Однако эта группировка не гарантирована, особенно если вы распространите ваши сервисы по нескольким организациям ClickHouse.
Если у вас уже настроен Private Link для других сервисов в вашей организации ClickHouse, вы часто можете пропустить большинство шагов благодаря этой группировке и перейти непосредственно к последнему шагу: [Добавьте GUID частной конечной точки в список разрешенных для вашего(их) сервиса(ов)](#add-private-endpoint-guid-to-services-allow-list).

Примеры Terraform можно найти в репозитории [Terraform Provider ClickHouse](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Получите псевдоним подключения Azure для Private Link {#obtain-azure-connection-alias-for-private-link}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем откройте меню **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. Запишите `Название сервиса` и `DNS имя`, которые будут использоваться для настройки Private Link.

<Image img={azure_privatelink_pe_create} size="lg" alt="Частные конечные точки" border />

Запишите `Название сервиса` и `DNS имя`, это будет необходимо на следующих этапах.

### Вариант 2: API {#option-2-api}

Перед началом вам понадобится API ключ ClickHouse Cloud. Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.

Как только у вас есть ваш API ключ, установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<код региона, используйте формат Azure, например: westus3>
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
SERVICE_NAME=<Ваше название сервиса ClickHouse>
```

Получите ваш ClickHouse `INSTANCE_ID`, отфильтровав по региону, провайдеру и названию сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите свой псевдоним подключения Azure и частое DNS имя для Private Link:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

Запишите `endpointServiceId`. Вы будете использовать его на следующем этапе.

## Создайте частную конечную точку в Azure {#create-private-endpoint-in-azure}

:::important
Этот раздел охватывает специфические детали ClickHouse для настройки ClickHouse через Azure Private Link. Конкретные шаги по Azure предоставлены в качестве справки, чтобы направить вас на то, где нужно искать, но они могут меняться со временем без предварительного уведомления от облачного провайдера Azure. Пожалуйста, учитывайте конфигурацию Azure в зависимости от вашей конкретной ситуации.

Пожалуйста, обратите внимание, что ClickHouse не несет ответственности за настройку необходимых частных конечных точек Azure, DNS записей.

Для любых проблем, связанных с задачами конфигурации Azure, свяжитесь напрямую с поддержкой Azure.
:::

В этом разделе мы создадим частную конечную точку в Azure. Вы можете использовать либо портал Azure, либо Terraform.

### Вариант 1: Используя портал Azure для создания частной конечной точки в Azure {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

В портале Azure откройте **Центр частных ссылок → Частные конечные точки**.

<Image img={azure_private_link_center} size="lg" alt="Откройте Центр частных ссылок Azure" border />

Откройте диалог создания частной конечной точки, нажав на кнопку **Создать**.

<Image img={azure_private_link_center} size="lg" alt="Откройте Центр частных ссылок Azure" border />

---

На следующем экране укажите следующие параметры:

- **Подписка** / **Группа ресурсов**: Пожалуйста, выберите подписку Azure и группу ресурсов для частной конечной точки.
- **Имя**: Установите имя для **Частной конечной точки**.
- **Регион**: Выберите регион, где расположена развернутая VNet, которая будет подключена к ClickHouse Cloud через Private Link.

После завершения вышеуказанных шагов нажмите кнопку **Далее: Ресурс**.

<Image img={azure_pe_create_basic} size="md" alt="Создать Частную конечную точку Базовая" border />

---

Выберите опцию **Подключиться к ресурсу Azure по ID ресурса или псевдониму**.

Для **ID ресурса или псевдонима** используйте `endpointServiceId`, который вы получили на этапе [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

Нажмите кнопку **Далее: Виртуальная сеть**.

<Image img={azure_pe_resource} size="md" alt="Выбор Ресурса Частной конечной точки" border />

---

- **Виртуальная сеть**: Выберите VNet, к которому вы хотите подключить ClickHouse Cloud с помощью Private Link.
- **Подсеть**: Выберите подсеть, в которой будет создана частная конечная точка.

Дополнительно:

- **Группа безопасности приложений**: Вы можете прикрепить ASG к частной конечной точке и использовать ее в группах сетевой безопасности для фильтрации сетевого трафика к/из частной конечной точки.

Нажмите кнопку **Далее: DNS**.

<Image img={azure_pe_create_vnet} size="md" alt="Выбор Виртуальной сети Частной конечной точки" border />

Нажмите кнопку **Далее: Теги**.

---

<Image img={azure_pe_create_dns} size="md" alt="Настройка DNS Частной конечной точки" border />

При желании вы можете прикрепить теги к вашей частной конечной точке.

Нажмите кнопку **Далее: Обзор + создание**.

---

<Image img={azure_pe_create_tags} size="md" alt="Теги Частной конечной точки" border />

Наконец, нажмите кнопку **Создать**.

<Image img={azure_pe_create_review} size="md" alt="Обзор Частной конечной точки" border />

**Статус подключения** созданной частной конечной точки будет в состоянии **Ожидание**. Он изменится на состояние **Одобрено**, как только вы добавите эту частную конечную точку в список разрешенных сервисов.

Откройте сетевой интерфейс, связанный с частной конечной точкой, и скопируйте **Частный IPv4 адрес** (10.0.0.4 в этом примере), эта информация понадобится вам на следующих этапах.

<Image img={azure_pe_ip} size="lg" alt="IP адрес Частной конечной точки" border />

### Вариант 2: Используя Terraform для создания частной конечной точки в Azure {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Используйте приведенный ниже шаблон для создания частной конечной точки с помощью Terraform:

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<данные из шага 'Получите псевдоним подключения Azure для Private Link'>"
    is_manual_connection              = true
  }
}
```

### Получение `resourceGuid` частной конечной точки {#obtaining-private-endpoint-resourceguid}

Для использования Private Link необходимо добавить GUID подключения частной конечной точки в список разрешенных для вашего сервиса.

GUID ресурса частной конечной точки доступен только в портале Azure. Откройте частную конечную точку, созданную на предыдущем шаге, и нажмите **Просмотр JSON**:

<Image img={azure_pe_view} size="lg" alt="Просмотр Частной конечной точки" border />

В разделе свойств найдите поле `resourceGuid` и скопируйте это значение:

<Image img={azure_pe_resource_guid} size="lg" alt="GUID ресурса Частной конечной точки" border />

## Настройка DNS для Private Link {#setting-up-dns-for-private-link}

Вам необходимо создать частную DNS зону (`${location_code}.privatelink.azure.clickhouse.cloud`) и прикрепить ее к вашей VNet для доступа к ресурсам через Private Link.

### Создание частной DNS зоны {#create-private-dns-zone}

**Вариант 1: Используя портал Azure**

Пожалуйста, следуйте следующему руководству, чтобы [создать частную DNS зону Azure с использованием портала Azure](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Вариант 2: Используя Terraform**

Используйте следующий шаблон Terraform для создания частной DNS зоны:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Создайте wildcard DNS запись {#create-a-wildcard-dns-record}

Создайте wildcard запись и укажите ее на вашу частную конечную точку:

**Вариант 1: Используя портал Azure**

1. Откройте группу ресурсов `MyAzureResourceGroup` и выберите частную зону `${region_code}.privatelink.azure.clickhouse.cloud`.
2. Выберите + Набор записей.
3. Для имени введите `*`.
4. Для IP адреса введите IP адрес, который вы видите для частной конечной точки.
5. Выберите **ОК**.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Настройка DNS Wildcard для Частной ссылки" border />

**Вариант 2: Используя Terraform**

Используйте следующий шаблон Terraform для создания wildcard DNS записи:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### Создание связи виртуальной сети {#create-a-virtual-network-link}

Чтобы связать частную DNS зону с виртуальной сетью, вам нужно создать связь виртуальной сети.

**Вариант 1: Используя портал Azure**

Пожалуйста, следуйте следующему руководству, чтобы [связать виртуальную сеть с вашей частной DNS зоной](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Вариант 2: Используя Terraform**

:::note
Существует множество способов настройки DNS. Пожалуйста, настройте DNS в соответствии с вашей конкретной ситуацией.
:::

Вам нужно направить "DNS имя", полученное на этапе [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link), на IP адрес частной конечной точки. Это обеспечит правильное разрешение для сервисов/компонентов в вашей VPC/Сети.


### Проверка настройки DNS {#verify-dns-setup}

Домен `xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` должен быть направлен на IP адрес Частной конечной точки. (10.0.0.4 в этом примере).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## Добавьте GUID частной конечной точки в вашу организацию ClickHouse Cloud {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Добавьте GUID частной конечной точки в список разрешенных для вашего(их) сервиса(ов)](#add-private-endpoint-guid-to-services-allow-list). Добавление `GUID частной конечной точки` с использованием консоли ClickHouse Cloud в список разрешенных сервисов автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Детали организации -> Частные конечные точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Удалить Частную конечную точку" border />

### Вариант 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
ENDPOINT_ID=<resourceGuid Частной конечной точки>
REGION=<код региона, используйте формат Azure>
```

Установите переменную окружения `ENDPOINT_ID`, используя данные из этапа [Получение `resourceGuid` частной конечной точки](#obtaining-private-endpoint-resourceguid).

Запустите следующую команду, чтобы добавить частную конечную точку:

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

Вы также можете запустить следующую команду, чтобы удалить частную конечную точку:

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

После добавления или удаления частной конечной точки выполните следующую команду, чтобы применить это к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавьте GUID частной конечной точки в список разрешенных для вашего(их) сервиса(ов) {#add-private-endpoint-guid-to-services-allow-list}

По умолчанию, сервис ClickHouse Cloud недоступен через соединение Private Link, даже если соединение Private Link одобрено и установлено. Вам нужно явно добавить GUID частной конечной точки для каждого сервиса, который должен быть доступен с помощью Private Link.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в **Настройки**. Введите `ID конечной точки`, полученный на предыдущем шаге [Получение `resourceGuid` частной конечной точки](#obtaining-private-endpoint-resourceguid).

:::note
Если вы хотите разрешить доступ с существующего соединения PrivateLink, используйте выпадающее меню существующих конечных точек.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Фильтр Частных конечных точек" border />

### Вариант 2: API {#option-2-api-2}

Установите эти переменные окружения перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
ENDPOINT_ID=<resourceGuid Частной конечной точки>
INSTANCE_ID=<ID экземпляра>
```

Выполните это для каждого сервиса, который должен быть доступен с помощью Private Link.

Запустите следующую команду, чтобы добавить частную конечную точку в список разрешенных сервисов:

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

Вы также можете запустить следующую команду, чтобы удалить частную конечную точку из списка разрешенных сервисов:

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

После добавления или удаления частной конечной точки из списка разрешенных сервисов выполните следующую команду, чтобы применить это к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Доступ к вашему сервису ClickHouse Cloud с использованием Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Каждый сервис с включенным Private Link имеет публичную и частную конечные точки. Чтобы подключиться с помощью Private Link, вам нужно использовать частную конечную точку, которая будет `privateDnsHostname`<sup>API</sup> или `DNS имя`<sup>консоль</sup>, полученные на этапе [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).


### Получение Частного DNS Хостнейма {#obtaining-the-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. В открывшемся окне скопируйте **DNS имя**.

<Image img={azure_privatelink_pe_dns} size="lg" alt="Имя DNS Частной конечной точки" border />

#### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

Выполните следующую команду:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

Вы должны получить ответ, похожий на следующий:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<код региона>.privatelink.azure.clickhouse.cloud"
}
```

В этом примере соединение с хостнеймом `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` будет направлено на Private Link. Между тем, `xxxxxxx.region_code.azure.clickhouse.cloud` будет направлено через интернет.

Используйте `privateDnsHostname`, чтобы подключиться к вашему сервису ClickHouse Cloud через Private Link.

## Устранение неполадок {#troubleshooting}

### Тестирование настройки DNS {#test-dns-setup}

Выполните следующую команду:

```bash
nslookup <dns имя>
```
где "dns имя" это `privateDnsHostname`<sup>API</sup> или `DNS имя`<sup>консоль</sup> из [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link)

Вы должны получить следующий ответ:

```response
Non-authoritative answer:
Name: <dns имя>
Address: 10.0.0.4
```

### Обнуление соединения по приглашению {#connection-reset-by-peer}

Скорее всего, GUID частной конечной точки не был добавлен в список разрешенных сервисов. Вернитесь к шагу [_Добавьте GUID частной конечной точки в список разрешенных для вашего(их) сервиса(ов)_](#add-private-endpoint-guid-to-services-allow-list).

### Частная конечная точка в состоянии Ожидание {#private-endpoint-is-in-pending-state}

Скорее всего, GUID частной конечной точки не был добавлен в список разрешенных сервисов. Вернитесь к шагу [_Добавьте GUID частной конечной точки в список разрешенных для вашего(их) сервиса(ов)_](#add-private-endpoint-guid-to-services-allow-list).

### Тестирование подключения {#test-connectivity}

Если у вас возникли проблемы с подключением с использованием Private Link, проверьте ваше подключение с помощью `openssl`. Убедитесь, что статус конечной точки Private Link `Accepted`.

OpenSSL должен уметь подключаться (см. CONNECTED в выводе). `errno=104` ожидаем.

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud.cloud:9440
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

### Проверка фильтров частной конечной точки {#checking-private-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<пожалуйста, установите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

Запустите следующую команду, чтобы проверить фильтры частной конечной точки:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## Дополнительная информация {#more-information}

Для получения дополнительной информации о Azure Private Link, пожалуйста, посетите [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
