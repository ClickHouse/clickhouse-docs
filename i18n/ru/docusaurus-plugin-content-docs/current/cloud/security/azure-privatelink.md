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

Этот гид демонстрирует, как использовать Azure Private Link для обеспечения частной связи через виртуальную сеть между Azure (включая услуги, принадлежащие клиенту и партнерам Microsoft) и ClickHouse Cloud. Azure Private Link упрощает сетевую архитектуру и защищает соединение между конечными точками в Azure, устраняя воздействие данных на публичный интернет.

<Image img={azure_pe} size="lg" alt="Обзор PrivateLink" background='white' />

В отличие от AWS и GCP, Azure поддерживает межрегиональную связь через Private Link. Это позволяет устанавливать соединения между VNets, расположенными в разных регионах, где развернуты ваши службы ClickHouse.

:::note
Дополнительные сборы могут применяться к межрегиональному трафику. Пожалуйста, проверьте последнюю документацию Azure.
:::

**Пожалуйста, выполните следующие шаги для включения Azure Private Link:**

1. Получите псевдоним подключения Azure для Private Link
1. Создайте частный конечный пункт в Azure
1. Добавьте GUID частного конечного пункта в вашу организацию ClickHouse Cloud
1. Добавьте GUID частного конечного пункта в белый список ваших сервисов
1. Получите доступ к вашему сервису ClickHouse Cloud, используя Private Link


## Внимание {#attention}
ClickHouse пытается сгруппировать ваши службы для повторного использования одного и того же опубликованного [сервиса Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) в пределах региона Azure. Однако эта группировка не гарантируется, особенно если вы распределяете свои службы по нескольким организациям ClickHouse.
Если у вас уже настроен Private Link для других служб в вашей организации ClickHouse, вы часто можете пропустить большую часть шагов из-за этой группировки и перейти сразу к последнему шагу: [Добавьте GUID частного конечного пункта в белый список ваших сервисов](#add-private-endpoint-guid-to-services-allow-list).

Найдите примеры Terraform в [репозитории Terraform Provider ClickHouse](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Получите псевдоним подключения Azure для Private Link {#obtain-azure-connection-alias-for-private-link}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем откройте меню **Настройки**. Нажмите кнопку **Настроить частный конечный пункт**. Запишите `Имя сервиса` и `DNS имя`, которые будут использоваться для настройки Private Link.

<Image img={azure_privatelink_pe_create} size="lg" alt="Частные конечные пункты" border />

Запишите `Имя сервиса` и `DNS имя`, они понадобятся на следующих шагах.

### Вариант 2: API {#option-2-api}

Прежде чем начать, вам понадобится ключ API ClickHouse Cloud. Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.

Как только у вас есть ваш ключ API, установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<код региона, используйте формат Azure, например: westus3>
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
SERVICE_NAME=<Имя вашего сервиса ClickHouse>
```

Получите свой ClickHouse `INSTANCE_ID`, отфильтровав по региону, провайдеру и имени сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите ваш Azure псевдоним подключения и частый DNS хост для Private Link:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

Запишите `endpointServiceId`. Вы будете использовать его на следующем шаге.

## Создайте частный конечный пункт в Azure {#create-private-endpoint-in-azure}

:::important
Этот раздел охватывает специфические для ClickHouse детали настройки ClickHouse через Azure Private Link. Шаги, специфичные для Azure, предоставлены в качестве справки, чтобы направить вас, где искать, но они могут изменяться со временем без уведомления от поставщика облака Azure. Пожалуйста, рассмотрите конфигурацию Azure, основываясь на вашем конкретном случае использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых частных конечных пунктов Azure, DNS записей.

Для любых проблем, связанных с задачами конфигурации Azure, свяжитесь напрямую с поддержкой Azure.
:::

В этом разделе мы собираемся создать частный конечный пункт в Azure. Вы можете использовать как портал Azure, так и Terraform.

### Вариант 1: Используя портал Azure для создания частного конечного пункта в Azure {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

В портале Azure откройте **Центр частных ссылок → Частные конечные пункты**.

<Image img={azure_private_link_center} size="lg" alt="Откройте Центр частных ссылок Azure" border />

Откройте диалог создания частного конечного пункта, нажав кнопку **Создать**.

<Image img={azure_private_link_center} size="lg" alt="Откройте Центр частных ссылок Azure" border />

---

На следующем экране укажите следующие параметры:

- **Подписка** / **Группа ресурсов**: Пожалуйста, выберите подписку Azure и группу ресурсов для частного конечного пункта.
- **Имя**: Укажите имя для **Частного конечного пункта**.
- **Регион**: Выберите регион, где развернут VNet, который будет подключен к ClickHouse Cloud через Private Link.

После того, как вы завершите вышеуказанные шаги, нажмите кнопку **Далее: Ресурс**.

<Image img={azure_pe_create_basic} size="md" alt="Создать Частный конечный пункт Базовый" border />

---

Выберите опцию **Подключиться к ресурсам Azure по ID ресурса или псевдониму**.

Для **ID ресурса или псевдонима** используйте `endpointServiceId`, который вы получили на шаге [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

Нажмите кнопку **Далее: Виртуальная сеть**.

<Image img={azure_pe_resource} size="md" alt="Выбор ресурса частного конечного пункта" border />

---

- **Виртуальная сеть**: Выберите VNet, к которому вы хотите подключиться к ClickHouse Cloud с использованием Private Link
- **Подсеть**: Выберите подсеть, где будет создан частный конечный пункт

Дополнительно:

- **Группа безопасности приложений**: Вы можете прикрепить группу безопасности приложений к частному конечному пункту и использовать ее в группах безопасности сети для фильтрации сетевого трафика к/от частного конечного пункта.

Нажмите кнопку **Далее: DNS**.

<Image img={azure_pe_create_vnet} size="md" alt="Выбор виртуальной сети частного конечного пункта" border />

Нажмите кнопку **Далее: Теги**.

---

<Image img={azure_pe_create_dns} size="md" alt="Конфигурация DNS Частного конечного пункта" border />

При желании вы можете добавить теги к вашему частному конечному пункту.

Нажмите кнопку **Далее: Просмотр + создать**.

---

<Image img={azure_pe_create_tags} size="md" alt="Теги Частного конечного пункта" border />

Наконец, нажмите кнопку **Создать**.

<Image img={azure_pe_create_review} size="md" alt="Обзор Частного конечного пункта" border />

**Статус подключения** созданного частного конечного пункта будет находиться в состоянии **Ожидание**. Он изменится на состояние **Одобрено**, как только вы добавите этот частный конечный пункт в белый список сервисов.

Откройте сетевой интерфейс, связанный с частным конечным пунктом, и скопируйте **Частный IPv4 адрес** (10.0.0.4 в этом примере), эта информация понадобится вам на следующих шагах.

<Image img={azure_pe_ip} size="lg" alt="IP адрес Частного конечного пункта" border />

### Вариант 2: Используя Terraform для создания частного конечного пункта в Azure {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Используйте приведенный ниже шаблон для создания частного конечного пункта с помощью Terraform:

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

### Получение `resourceGuid` частного конечного пункта {#obtaining-private-endpoint-resourceguid}

Чтобы использовать Private Link, вам нужно добавить GUID подключения частного конечного пункта в белый список ваших сервисов.

GUID ресурса частного конечного пункта доступен только в Портале Azure. Откройте частный конечный пункт, созданный на предыдущем шаге, и нажмите **Просмотр JSON**:

<Image img={azure_pe_view} size="lg" alt="Просмотр Частного конечного пункта" border />

В разделе свойств найдите поле `resourceGuid` и скопируйте это значение:

<Image img={azure_pe_resource_guid} size="lg" alt="GUID ресурса Частного конечного пункта" border />

## Настройка DNS для Private Link {#setting-up-dns-for-private-link}

Вам нужно создать частную DNS зону (`${location_code}.privatelink.azure.clickhouse.cloud`) и присоединить ее к вашей VNet для доступа к ресурсам через Private Link.

### Создание частной DNS зоны {#create-private-dns-zone}

**Вариант 1: Используя портал Azure**

Пожалуйста, следуйте следующему руководству по [созданию частной DNS зоны Azure с использованием портала Azure](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Вариант 2: Используя Terraform**

Используйте следующий шаблон Terraform для создания частной DNS зоны:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Создайте DNS запись wildcard {#create-a-wildcard-dns-record}

Создайте запись wildcard и укажите ее на ваш частный конечный пункт:

**Вариант 1: Используя портал Azure**

1. Откройте группу ресурсов `MyAzureResourceGroup` и выберите частную зону `${region_code}.privatelink.azure.clickhouse.cloud`.
2. Выберите + Запись набора.
3. Для Имени введите `*`.
4. Для IP адреса введите IP адрес, который вы видите для частного конечного пункта.
5. Выберите **ОК**.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Настройка DNS Wildcard для Частного Link" border />

**Вариант 2: Используя Terraform**

Используйте следующий шаблон Terraform для создания DNS записи wildcard:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### Создайте ссылку на виртуальную сеть {#create-a-virtual-network-link}

Чтобы связать частную DNS зону с виртуальной сетью, вам нужно создать ссылку на виртуальную сеть.

**Вариант 1: Используя портал Azure**

Пожалуйста, следуйте следующему руководству по [сопряжению виртуальной сети с вашей частной DNS зоной](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Вариант 2: Используя Terraform**

:::note
Существует несколько способов настройки DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вам нужно указать "DNS имя", взятое из шага [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link), на IP адрес частного конечного пункта. Это гарантирует, что сервисы/компоненты внутри вашего VPC/Сети смогут правильно его разрешить.


### Проверьте настройку DNS {#verify-dns-setup}

Домен `xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` должен указывать на IP адрес частного конечного пункта. (10.0.0.4 в этом примере).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## Добавьте GUID частного конечного пункта в вашу организацию ClickHouse Cloud {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечный пункт в организацию, перейдите к шагу [Добавление GUID частного конечного пункта в белый список ваших сервисов](#add-private-endpoint-guid-to-services-allow-list). Добавление `GUID частного конечного пункта` с помощью консоли ClickHouse Cloud автоматически добавляет его в организацию.

Чтобы удалить конечный пункт, откройте **Детали организации -> Частные конечные пункты** и нажмите кнопку удаления, чтобы убрать конечный пункт.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Удалить Частный конечный пункт" border />

### Вариант 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
ENDPOINT_ID=<GUID ресурса Частного конечного пункта>
REGION=<код региона, используйте формат Azure>
```

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Получение `resourceGuid` частного конечного пункта](#obtaining-private-endpoint-resourceguid).

Запустите следующую команду, чтобы добавить частный конечный пункт:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Частный конечный пункт Azure",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Вы также можете выполнить следующую команду, чтобы удалить частный конечный пункт:

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

После добавления или удаления частного конечного пункта выполните следующую команду, чтобы применить это к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавьте GUID частного конечного пункта в белый список ваших сервисов {#add-private-endpoint-guid-to-services-allow-list}

По умолчанию сервис ClickHouse Cloud недоступен через соединение Private Link, даже если соединение Private Link одобрено и установлено. Вы должны явно добавить GUID частного конечного пункта для каждого сервиса, который должен быть доступен через Private Link.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в **Настройки**. Введите `ID конечного пункта`, полученный на [предыдущем](#obtaining-private-endpoint-resourceguid) шаге.

:::note
Если вы хотите разрешить доступ из существующего соединения Private Link, используйте выпадающее меню существующих конечных пунктов.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Фильтр Частных конечных пунктов" border />

### Вариант 2: API {#option-2-api-2}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
ENDPOINT_ID=<GUID ресурса Частного конечного пункта>
INSTANCE_ID=<ID экземпляра>
```

Выполните это для каждого сервиса, который должен быть доступен через Private Link.

Запустите следующую команду, чтобы добавить частный конечный пункт в белый список сервисов:

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

Вы также можете выполнить следующую команду, чтобы удалить частный конечный пункт из белого списка:

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

После добавления или удаления частного конечного пункта из белого списка выполните следующую команду, чтобы применить это к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Получите доступ к вашему сервису ClickHouse Cloud с помощью Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Каждый сервис с включенным Private Link имеет публичный и частный конечный пункт. Чтобы подключиться с помощью Private Link, вам нужно использовать частный конечный пункт, который будет `privateDnsHostname`<sup>API</sup> или `DNS name`<sup>консоль</sup>, полученный на шаге [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).


### Получение частного DNS имени {#obtaining-the-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите кнопку **Настроить частный конечный пункт**. В открывшемся окне скопируйте **DNS имя**.

<Image img={azure_privatelink_pe_dns} size="lg" alt="DNS имя Частного конечного пункта" border />

#### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<установите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

Запустите следующую команду:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

Вы должны получить ответ, подобный следующему:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

В этом примере соединение с хостом `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` будет маршрутизироваться через Private Link. В то время как `xxxxxxx.region_code.azure.clickhouse.cloud` будет маршрутизироваться через интернет.

Используйте `privateDnsHostname` для подключения к вашему сервису ClickHouse Cloud с использованием Private Link.

## Устранение неполадок {#troubleshooting}

### Проверка настройки DNS {#test-dns-setup}

Запустите следующую команду:

```bash
nslookup <dns name>
```
где "dns name" это `privateDnsHostname`<sup>API</sup> или `DNS name`<sup>консоль</sup> из шага [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link)

Вы должны получить следующий ответ:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### Сброс соединения со стороны соперника {#connection-reset-by-peer}

Скорее всего, GUID частного конечного пункта не был добавлен в белый список сервисов. Вернитесь к шагу [_Добавьте GUID частного конечного пункта в белый список ваших сервисов_](#add-private-endpoint-guid-to-services-allow-list).

### Частный конечный пункт находится в состоянии ожидания {#private-endpoint-is-in-pending-state}

Скорее всего, GUID частного конечного пункта не был добавлен в белый список сервисов. Вернитесь к шагу [_Добавьте GUID частного конечного пункта в белый список ваших сервисов_](#add-private-endpoint-guid-to-services-allow-list).

### Тестирование подключения {#test-connectivity}

Если у вас возникли проблемы с подключением с помощью Private Link, проверьте ваше соединение с помощью `openssl`. Убедитесь, что статус конечной точки Private Link равен `Accepted`.

OpenSSL должен иметь возможность подключиться (см. CONNECTED в выводе). `errno=104` ожидается.

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

### Проверка фильтров частного конечного пункта {#checking-private-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<пожалуйста, установите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

Запустите следующую команду, чтобы проверить фильтры частного конечного пункта:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## Дополнительная информация {#more-information}

Для получения дополнительной информации о Azure Private Link, пожалуйста, посетите [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
