---
title: Azure Private Link
sidebar_label: Azure Private Link
slug: /cloud/security/azure-privatelink
description: Как настроить Azure Private Link
keywords: [azure, private link, privatelink]
---

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

:::note
Azure Private Link можно настроить только на **Production** сервисах ClickHouse Cloud. **Development** сервисы не поддерживаются.
:::

Этот руководствo показывает, как использовать Azure Private Link для обеспечения частного подключения через виртуальную сеть между Azure (включая услуги, принадлежащие клиентам и партнерам Microsoft) и ClickHouse Cloud. Azure Private Link упрощает сетевую архитектуру и обеспечивает безопасность соединения между конечными точками Azure, устраняя риск утечки данных в публичный интернет.

<img src={azure_pe} alt="Обзор PrivateLink" />

В отличие от AWS и GCP, Azure поддерживает межрегиональное подключение через Private Link. Это позволяет вам устанавливать соединения между VNets, расположенными в разных регионах, где развернуты ваши сервисы ClickHouse.

:::note
Могут применяться дополнительные сборы за межрегиональный трафик. Пожалуйста, проверьте последнюю документацию Azure.
:::

Пожалуйста, выполните следующие шаги, чтобы включить Azure Private Link:

1. Получите псевдоним подключения Azure для Private Link
1. Создайте частный конечный пункт в Azure
1. Добавьте GUID частного конечного пункта в вашу организацию ClickHouse Cloud
1. Добавьте GUID частного конечного пункта в список разрешенных сервисов
1. Получите доступ к вашему сервису ClickHouse Cloud, используя Private Link


Полный пример Terraform для Azure Private Link [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/PrivateLinkAzure).

## Получите псевдоним подключения Azure для Private Link {#obtain-azure-connection-alias-for-private-link}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем откройте меню **Настройки**. Нажмите кнопку **Настроить частный конечный пункт**. Скопируйте **Имя сервиса**, которое будет использоваться для настройки Private Link.

<img src={azure_privatelink_pe_create} alt="Частные конечные пункты" />

### Вариант 2: API {#option-2-api}

Перед тем как начать, вам нужен ключ API ClickHouse Cloud. Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий. Обратите внимание, что вам потребуется ключ **Admin**, чтобы управлять конфигурацией Private Link.

Когда у вас будет ваш ключ API, задайте следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<код региона, используйте формат Azure>
PROVIDER=azure
KEY_ID=<Идентификатор ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<задать идентификатор организации ClickHouse>
```

Получите идентификатор экземпляра из вашего региона:

Вам потребуется как минимум один сервис ClickHouse Cloud, развернутый в указанном регионе, чтобы выполнить этот шаг.

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1 | tee instance_id
```

Создайте переменную окружения `INSTANCE_ID`, используя идентификатор, который вы получили на предыдущем шаге:

```bash
INSTANCE_ID=$(cat instance_id)
```

Получите свой псевдоним подключения Azure и Private DNS имя хоста для Private Link:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.63c890a9-4d32-48cc-a08c-8cd92dfb1ad3.westus3.azure.privatelinkservice",
  ...
}
```

Запомните `endpointServiceId`. Вы будете использовать это значение на следующем шаге.

## Создайте частный конечный пункт в Azure {#create-private-endpoint-in-azure}

В этом разделе мы создадим частный конечный пункт в Azure. Вы можете использовать либо Azure Portal, либо Terraform.

### Вариант 1: Использование Azure Portal для создания частного конечного пункта в Azure {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

В Azure Portal откройте **Центр частных ссылок → Частные конечные пункты**.

<img src={azure_private_link_center} alt="Откройте Azure Private Center" />

Откройте диалоговое окно создания частного конечного пункта, нажав кнопку **Создать**.

<img src={azure_private_link_center} alt="Откройте Azure Private Center" />

---

На следующем экране укажите следующие параметры:

- **Подписка** / **Группа ресурсов**: Пожалуйста, выберите подписку Azure и группу ресурсов для частного конечного пункта.
- **Имя**: Установите имя для **Частного конечного пункта**.
- **Регион**: Выберите регион, в котором развернута VNet, которая будет подключаться к ClickHouse Cloud через Private Link.

После завершения вышеуказанных шагов нажмите кнопку **Далее: Ресурс**.

<img src={azure_pe_create_basic} alt="Создание основного частного конечного пункта" />

---

Выберите вариант **Подключиться к ресурсу Azure по идентификатору ресурса или псевдониму**.

В поле **Идентификатор ресурса или псевдоним** используйте `endpointServiceId`, который вы получили на шаге [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

Нажмите кнопку **Далее: Виртуальная сеть**.

<img src={azure_pe_resource} alt="Выбор ресурса частного конечного пункта" />

---

- **Виртуальная сеть**: Выберите VNet, к которой вы хотите подключить ClickHouse Cloud, используя Private Link.
- **Подсеть**: Выберите подсеть, в которой будет создан частный конечный пункт.

Дополнительно:

- **Группа безопасности приложений**: Вы можете прикрепить ASG к частному конечному пункту и использовать его в группах безопасности сети для фильтрации сетевого трафика к/от частного конечного пункта.

Нажмите кнопку **Далее: DNS**.

<img src={azure_pe_create_vnet} alt="Выбор виртуальной сети частного конечного пункта" />

Нажмите кнопку **Далее: Теги**.

---

<img src={azure_pe_create_dns} alt="Конфигурация DNS частного конечного пункта" />

При желании вы можете прикрепить теги к вашему частному конечному пункту.

Нажмите кнопку **Далее: Обзор + Создать**.

---

<img src={azure_pe_create_tags} alt="Теги частного конечного пункта" />

Наконец, нажмите кнопку **Создать**.

<img src={azure_pe_create_review} alt="Обзор частного конечного пункта" />

Статус **Подключения** созданного частного конечного пункта будет находиться в состоянии **Ожидание**. Он изменится на состояние **Одобрено**, как только вы добавите этот частный конечный пункт в список разрешенных сервисов.

Откройте сетевой интерфейс, связанный с частным конечным пунктом, и скопируйте **Частный IPv4 адрес** (10.0.0.4 в этом примере), эта информация потребуется на следующих шагах.

<img src={azure_pe_ip} alt="IP адрес частного конечного пункта" />

### Вариант 2: Использование Terraform для создания частного конечного пункта в Azure {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Используйте шаблон ниже для создания частного конечного пункта с помощью Terraform:

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

Чтобы использовать Private Link, вам нужно добавить GUID соединения частного конечного пункта в список разрешенных сервисов.

GUID ресурса частного конечного пункта доступен только в Azure Portal. Откройте частный конечный пункт, созданный на предыдущем шаге, и нажмите **JSON View**:

<img src={azure_pe_view} alt="Просмотр частного конечного пункта" />

В свойствах найдите поле `resourceGuid` и скопируйте это значение:

<img src={azure_pe_resource_guid} alt="GUID ресурса частного конечного пункта" />

## Настройка DNS для Private Link {#setting-up-dns-for-private-link}

Вам необходимо создать частную DNS зону (`${location_code}.privatelink.azure.clickhouse.cloud`) и прикрепить ее к вашей VNet, чтобы получить доступ к ресурсам через Private Link.

### Создайте частную DNS зону {#create-private-dns-zone}

**Вариант 1: Использование Azure Portal**

Пожалуйста, следуйте данному руководству, чтобы [создать частную DNS зону Azure, используя Azure Portal](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Вариант 2: Использование Terraform**

Используйте следующий шаблон Terraform для создания частной DNS зоны:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Создайте запись DNS с подстановочным знаком {#create-a-wildcard-dns-record}

Создайте запись с подстановочным знаком и укажите ваш частный конечный пункт:

**Вариант 1: Использование Azure Portal**

1. Откройте группу ресурсов `MyAzureResourceGroup` и выберите частную зону `${region_code}.privatelink.azure.clickhouse.cloud`.
2. Выберите + Запись.
3. Для Имени введите `*`.
4. Для IP адреса введите IP адрес, который вы видите для частного конечного пункта.
5. Выберите **OK**.

<img src={azure_pl_dns_wildcard} alt="Настройка DNS Wildcard для Private Link" />

**Вариант 2: Использование Terraform**

Используйте следующий шаблон Terraform для создания записи DNS с подстановочным знаком:

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

Чтобы связать частную DNS зону с виртуальной сетью, вам необходимо создать ссылку на виртуальную сеть.

**Вариант 1: Использование Azure Portal**

Пожалуйста, следуйте данному руководству, чтобы [связать виртуальную сеть с вашей частной DNS зоной](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Вариант 2: Использование Terraform**

Используйте следующий шаблон Terraform для связывания виртуальной сети с вашей частной DNS зоной:

```json
resource "azurerm_private_dns_zone_virtual_network_link" "example" {
  name                  = "test"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = var.zone_name
  virtual_network_id    = var.virtual_network_id
}
```

### Проверьте настройку DNS {#verify-dns-setup}

Любая запись в домене `westus3.privatelink.azure.clickhouse.cloud` должна указывать на IP-адрес частного конечного пункта. (10.0.0.4 в этом примере).

```bash
nslookup instance-id.westus3.privatelink.azure.clickhouse.cloud.
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	instance-id.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## Добавьте GUID частного конечного пункта в вашу организацию ClickHouse Cloud {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечный пункт в организацию, перейдите к шагу [Добавьте GUID частного конечного пункта в список разрешенных сервисов](#add-private-endpoint-guid-to-services-allow-list). Добавление `GUID частного конечного пункта` с помощью консоли ClickHouse Cloud в список разрешенных сервисов автоматически добавит его в организацию.

Чтобы удалить конечный пункт, откройте **Детали организации -> Частные конечные пункты** и нажмите кнопку удаления, чтобы убрать конечный пункт.

<img src={azure_pe_remove_private_endpoint} alt="Удалить частный конечный пункт" />

### Вариант 2: API {#option-2-api-1}

Задайте следующие переменные окружения перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<Идентификатор ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<задать идентификатор организации ClickHouse>
ENDPOINT_ID=<GUID ресурса частного конечного пункта>
REGION=<код региона, используйте формат Azure>
```

Задайте переменную окружения `VPC_ENDPOINT`, используя данные из шага [Получение `resourceGuid` частного конечного пункта](#obtaining-private-endpoint-resourceguid).

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

После добавления или удаления частного конечного пункта выполните следующую команду, чтобы применить изменения к вашей организации:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## Добавьте GUID частного конечного пункта в список разрешенных сервисов {#add-private-endpoint-guid-to-services-allow-list}

По умолчанию сервис ClickHouse Cloud недоступен через соединение Private Link, даже если соединение Private Link одобрено и установлено. Вам нужно явно добавить GUID частного конечного пункта для каждого сервиса, который должен быть доступен с использованием Private Link.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в **Настройки**. Введите `Идентификатор конечного пункта`, полученный на шаге [Получение `resourceGuid` частного конечного пункта](#obtaining-private-endpoint-resourceguid).

:::note
Если вы хотите разрешить доступ с существующего соединения PrivateLink, используйте меню выбора существующего конечного пункта.
:::

<img src={azure_privatelink_pe_filter} alt="Фильтр частных конечных пунктов" />

### Вариант 2: API {#option-2-api-2}

Задайте эти переменные окружения перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<Идентификатор ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<задать идентификатор организации ClickHouse>
ENDPOINT_ID=<GUID ресурса частного конечного пункта>
INSTANCE_ID=<Идентификатор экземпляра>
```

Выполните команды для каждого сервиса, который должен быть доступен с использованием Private Link.

Запустите следующую команду для добавления частного конечного пункта в список разрешенных сервисов:

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

Вы также можете выполнить следующую команду, чтобы удалить частный конечный пункт из списка разрешенных сервисов:

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

После добавления или удаления частного конечного пункта из списка разрешенных сервисов выполните следующую команду для применения изменений к вашей организации:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID?} -d @pl_config.json | jq
```

## Получите доступ к вашему сервису ClickHouse Cloud, используя Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Каждый сервис с включенным Private Link имеет публичный и частный конечный пункт. Для подключения с использованием Private Link вам необходимо использовать частный конечный пункт, который будет `privateDnsHostname`.

:::note
Частное DNS имя хоста доступно только из вашей Azure VNet. Не пытайтесь разрешить DNS хост с машины, находящейся вне Azure VNet.
:::

### Получение частного DNS имени хоста {#obtaining-the-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите кнопку **Настроить частный конечный пункт**. В открывшемся поле скопируйте **DNS Имя**.

<img src={azure_privatelink_pe_dns} alt="Имя DNS частного конечного пункта" />

#### Вариант 2: API {#option-2-api-3}

Задайте следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Идентификатор ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<задать идентификатор организации ClickHouse>
INSTANCE_ID=<Идентификатор экземпляра>
```

Запустите следующую команду:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result
```

Вы должны получить ответ, аналогичный следующему:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

В этом примере соединение с хостом `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` будет направлено через Private Link. Тем временем, `xxxxxxx.region_code.azure.clickhouse.cloud` будет направлено через интернет.

Используйте `privateDnsHostname`, чтобы подключиться к вашему сервису ClickHouse Cloud с использованием Private Link.

## Устранение неполадок {#troubleshooting}

### Проверьте настройку DNS {#test-dns-setup}

Все DNS записи из зоны `${region_code}.privatelink.azure.clickhouse.cloud.` должны указывать на внутренний IP адрес из шага [*Создание частного конечного пункта в Azure*](#create-private-endpoint-in-azure). В этом примере регион - `westus3`.

Запустите следующую команду:

```bash
nslookup abcd.westus3.privatelink.azure.clickhouse.cloud.
```

Вы должны получить следующий ответ:

```response
Non-authoritative answer:
Name:	abcd.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

### Соединение сброшено соперником {#connection-reset-by-peer}

Скорее всего, GUID частного конечного пункта не был добавлен в список разрешенных сервисов. Вернитесь к шагу [_Добавьте GUID частного конечного пункта в список разрешенных сервисов_](#add-private-endpoint-guid-to-services-allow-list).

### Частный конечный пункт в состоянии ожидания {#private-endpoint-is-in-pending-state}

Скорее всего, GUID частного конечного пункта не был добавлен в список разрешенных сервисов. Вернитесь к шагу [_Добавьте GUID частного конечного пункта в список разрешенных сервисов_](#add-private-endpoint-guid-to-services-allow-list).

### Проверьте подключение {#test-connectivity}

Если у вас есть проблемы с подключением через Private Link, проверьте ваше подключение с помощью `openssl`. Убедитесь, что статус конечного пункта Private Link равен `Accepted`.

OpenSSL должен быть способен подключиться (смотрите CONNECTED в выводе). `errno=104` ожидаем.

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

Задайте следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Идентификатор ключа>
KEY_SECRET=<Секрет ключа>
ORG_ID=<пожалуйста, задайте идентификатор организации ClickHouse>
INSTANCE_ID=<Идентификатор экземпляра>
```

Запустите следующую команду, чтобы проверить фильтры частного конечного пункта:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | jq .result.privateEndpointIds
[]
```

## Дополнительная информация {#more-information}

Для получения дополнительной информации о Azure Private Link, пожалуйста, посетите [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
