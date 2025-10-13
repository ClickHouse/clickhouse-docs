---
'title': 'Azure Private Link'
'sidebar_label': 'Azure Private Link'
'slug': '/cloud/security/azure-privatelink'
'description': 'Как настроить Azure Private Link'
'keywords':
- 'azure'
- 'private link'
- 'privatelink'
'doc_type': 'guide'
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

Этот гид показывает, как использовать Azure Private Link для обеспечения частного подключения через виртуальную сеть между Azure (включая услуги, принадлежащие заказчику, и услуги Microsoft Partner) и ClickHouse Cloud. Azure Private Link упрощает сетевую архитектуру и защищает соединение между конечными точками в Azure, устраняя возможность утечки данных в общественный интернет.

<Image img={azure_pe} size="lg" alt="Обзор PrivateLink" background='white' />

Azure поддерживает межрегиональное соединение через Private Link. Это позволяет установить соединения между VNet, расположенными в разных регионах, где развернуты ваши услуги ClickHouse.

:::note
Могут применяться дополнительные сборы за межрегиональный трафик. Пожалуйста, проверьте последнюю документацию Azure.
:::

**Пожалуйста, выполните следующие шаги для активации Azure Private Link:**

1. Получите псевдоним подключения Azure для Private Link
1. Создайте частную конечную точку в Azure
1. Добавьте идентификатор ресурса частной конечной точки в вашу организацию ClickHouse Cloud
1. Добавьте идентификатор ресурса частной конечной точки в белый список своих служб
1. Получите доступ к вашей службе ClickHouse Cloud с использованием Private Link

:::note
ClickHouse Cloud Azure PrivateLink перешел от использования resourceGUID к фильтрам Resource ID. Вы все еще можете использовать resourceGUID, так как это обратно совместимый режим, но мы рекомендуем переключиться на фильтры Resource ID. Чтобы мигрировать, просто создайте новую конечную точку, используя Resource ID, прикрепите её к службе и удалите старую основанную на resourceGUID.
:::

## Внимание {#attention}
ClickHouse пытается сгруппировать ваши услуги для повторного использования одной и той же опубликованной [службы Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) в рамках региона Azure. Однако такая группировка не гарантируется, особенно если вы распределяете свои услуги по нескольким организациям ClickHouse. Если у вас уже настроен Private Link для других служб в вашей организации ClickHouse, вы можете часто пропустить большинство шагов благодаря этой группировке и перейти прямо к последнему шагу: [Добавьте идентификатор ресурса частной конечной точки в белый список своей службы](#add-private-endpoint-id-to-services-allow-list).

Найдите примеры Terraform в репозитории ClickHouse [Terraform Provider](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Получите псевдоним подключения Azure для Private Link {#obtain-azure-connection-alias-for-private-link}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте службу, к которой вы хотите подключиться через PrivateLink, затем откройте меню **Настройки**. Нажмите кнопку **Настроить частную конечную точку**. Запишите `Имя службы` и `DNS имя`, которые будут использоваться для настройки Private Link.

<Image img={azure_privatelink_pe_create} size="lg" alt="Частные Конечные Точки" border />

Запишите `Имя службы` и `DNS имя`, они понадобятся на следующих этапах.

### Вариант 2: API {#option-2-api}

Прежде чем начать, вам нужен ключ API ClickHouse Cloud. Вы можете [создать новый ключ](/cloud/manage/openapi) или использовать существующий.

После получения ключа API, установите следующие переменные среды перед выполнением любых команд:

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Получите ваш ClickHouse `INSTANCE_ID`, отфильтровав по региону, поставщику и имени службы:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите ваш псевдоним подключения Azure и частое DNS имя для Private Link:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

Запишите `endpointServiceId`. Он будет нужен на следующем шаге.

## Создание частной конечной точки в Azure {#create-private-endpoint-in-azure}

:::important
Этот раздел охватывает специфические для ClickHouse детали конфигурации ClickHouse через Azure Private Link. Шаги, специфичные для Azure, предоставлены в качестве справки, чтобы направить вас, куда смотреть, но они могут изменяться со временем без уведомления от поставщика облака Azure. Пожалуйста, учитывайте конфигурацию Azure на основе вашего конкретного случая использования.  

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых частных конечных точек Azure и записей DNS.  

Для любых проблем, связанных с задачами конфигурации Azure, свяжитесь напрямую со службой поддержки Azure.
:::

В этом разделе мы создадим частную конечную точку в Azure. Вы можете использовать как портал Azure, так и Terraform.

### Вариант 1: Использование портала Azure для создания частной конечной точки в Azure {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

В портале Azure откройте **Центр Private Link → Частные Конечные Точки**.

<Image img={azure_private_link_center} size="lg" alt="Открыть Центр Частных Связей Azure" border />

Откройте диалог создания частной конечной точки, нажав кнопку **Создать**.

<Image img={azure_private_link_center} size="lg" alt="Открыть Центр Частных Связей Azure" border />

---

На следующем экране укажите следующие параметры:

- **Подписка** / **Группа ресурсов**: Пожалуйста, выберите подписку Azure и группу ресурсов для частной конечной точки.
- **Имя**: Установите имя для **Частной Конечной Точки**.
- **Регион**: Выберите регион, где развернут VNet, который будет подключен к ClickHouse Cloud через Private Link.

После завершения вышеуказанных шагов нажмите кнопку **Далее: Ресурс**.

<Image img={azure_pe_create_basic} size="md" alt="Создание Частной Конечной Точки Базовая" border />

---

Выберите опцию **Подключить к ресурсу Azure по идентификатору ресурса или псевдониму**.

Для **Идентификатор ресурса или псевдоним** используйте `endpointServiceId`, который вы получили на шаге [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

Нажмите кнопку **Далее: Виртуальная Сеть**.

<Image img={azure_pe_resource} size="md" alt="Выбор Ресурса Частной Конечной Точки" border />

---

- **Виртуальная сеть**: Выберите VNet, который вы хотите подключить к ClickHouse Cloud с помощью Private Link.
- **Подсеть**: Выберите подсеть, в которой будет создана частная конечная точка.

Дополнительно:

- **Группа безопасности приложения**: Вы можете прикрепить ASG к частной конечной точке и использовать её в Группах Сетевой Безопасности для фильтрации сетевого трафика к/от частной конечной точки.

Нажмите кнопку **Далее: DNS**.

<Image img={azure_pe_create_vnet} size="md" alt="Выбор Виртуальной Сети Частной Конечной Точки" border />

Нажмите кнопку **Далее: Теги**.

---

<Image img={azure_pe_create_dns} size="md" alt="Конфигурация DNS Частной Конечной Точки" border />

При желании вы можете прикрепить теги к вашей частной конечной точке.

Нажмите кнопку **Далее: Проверка + создание**.

---

<Image img={azure_pe_create_tags} size="md" alt="Теги Частной Конечной Точки" border />

Наконец, нажмите кнопку **Создать**.

<Image img={azure_pe_create_review} size="md" alt="Обзор Частной Конечной Точки" border />

**Статус соединения** созданной частной конечной точки будет в состоянии **Ожидание**. Он изменится на состояние **Одобрено** после добавления этой частной конечной точки в белый список служб.

Откройте сетевой интерфейс, связанный с частной конечной точкой, и скопируйте **Частный IPv4 адрес** (10.0.0.4 в этом примере), эта информация потребуется на следующих шагах.

<Image img={azure_pe_ip} size="lg" alt="Частный Адрес IP Конечной Точки" border />

### Вариант 2: Использование Terraform для создания частной конечной точки в Azure {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Используйте шаблон ниже, чтобы с помощью Terraform создать частную конечную точку:

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<data from 'Obtain Azure connection alias for Private Link' step>"
    is_manual_connection              = true
  }
}
```

### Получение идентификатора ресурса частной конечной точки {#obtaining-private-endpoint-resourceid}

Для использования Private Link необходимо добавить идентификатор соединения частной конечной точки в белый список ваших служб.

Идентификатор ресурса частной конечной точки доступен в портале Azure. Откройте частную конечную точку, созданную на предыдущем шаге, и нажмите **Просмотр JSON**:

<Image img={azure_pe_view} size="lg" alt="Просмотр Частной Конечной Точки" border />

В разделе свойств найдите поле `id` и скопируйте это значение:

**Предпочтительный метод: Использование Resource ID**
<Image img={azure_pe_resource_id} size="lg" alt="Идентификатор Ресурса Частной Конечной Точки" border />

**Устаревший метод: Использование resourceGUID**
Вы все еще можете использовать resourceGUID для обратной совместимости. Найдите поле `resourceGuid` и скопируйте это значение:

<Image img={azure_pe_resource_guid} size="lg" alt="Идентификатор Ресурса Частной Конечной Точки GUID" border />

## Настройка DNS для Private Link {#setting-up-dns-for-private-link}

Вам необходимо создать частную DNS зону (`${location_code}.privatelink.azure.clickhouse.cloud`) и прикрепить ее к вашей VNet для доступа к ресурсам через Private Link.

### Создание частной DNS зоны {#create-private-dns-zone}

**Вариант 1: Использование портала Azure**

Пожалуйста, следуйте этому гиду, чтобы [создать частную DNS зону Azure с использованием портала Azure](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Вариант 2: Использование Terraform**

Используйте следующий шаблон Terraform для создания частной DNS зоны:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Создание записи DNS с подстановочным знаком {#create-a-wildcard-dns-record}

Создайте запись с подстановочным знаком и направьте её на вашу частную конечную точку:

**Вариант 1: Использование портала Azure**

1. Откройте группу ресурсов `MyAzureResourceGroup` и выберите частную зону `${region_code}.privatelink.azure.clickhouse.cloud`.
2. Выберите + Набор записей.
3. Для Имени введите `*`.
4. Для IP адреса введите IP адрес, который вы видите у Частной Конечной Точки.
5. Выберите **ОК**.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Настройка Wildcard DNS для Частного Связи" border />

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

### Создание ссылки на виртуальную сеть {#create-a-virtual-network-link}

Чтобы связать частную DNS зону с виртуальной сетью, вам нужно создать ссылку на виртуальную сеть.

**Вариант 1: Использование портала Azure**

Пожалуйста, следуйте этому гиду, чтобы [связать виртуальную сеть с вашей частной DNS зоной](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Вариант 2: Использование Terraform**

:::note
Существует множество способов настроить DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вам нужно указать "DNS имя", взятое из шага [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link) на IP адрес частной конечной точки. Это гарантирует, что службы/компоненты в вашем VPC/Сети смогут правильно разрешать его.

### Проверка настройки DNS {#verify-dns-setup}

Домен `xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` должен указывать на IP адрес частной конечной точки. (10.0.0.4 в этом примере).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## Добавление идентификатора ресурса частной конечной точки в вашу организацию ClickHouse Cloud {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Добавить идентификатор ресурса частной конечной точки в белый список вашей службы](#add-private-endpoint-id-to-services-allow-list). Добавление идентификатора ресурса частной конечной точки с помощью консоли ClickHouse Cloud в белый список служб автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Детали организации -> Частные Конечные Точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Удалить Частную Конечную Точку" border />

### Вариант 2: API {#option-2-api-1}

Установите следующие переменные среды перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

Установите переменную среды `ENDPOINT_ID`, используя данные из шага [Получение идентификатора ресурса частной конечной точки](#obtaining-private-endpoint-resourceid).

Запустите следующую команду, чтобы добавить частную конечную точку:

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

После добавления или удаления частной конечной точки выполните следующую команду, чтобы применить её к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Добавление идентификатора ресурса частной конечной точки в белый список ваших служб {#add-private-endpoint-id-to-services-allow-list}

По умолчанию служба ClickHouse Cloud недоступна через соединение Private Link, даже если соединение Private Link одобрено и установлено. Вам необходимо явно добавить идентификатор ресурса частной конечной точки для каждой службы, которая должна быть доступна с использованием Private Link.

### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте службу, к которой вы хотите подключиться через PrivateLink, затем перейдите в **Настройки**. Введите `Resource ID`, полученный на [предыдущем шаге](#obtaining-private-endpoint-resourceid).

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню существующей конечной точки.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Фильтр Частных Конечных Точек" border />

### Вариант 2: API {#option-2-api-2}

Установите эти переменные среды перед выполнением любых команд:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

Выполните это для каждой службы, которая должна быть доступна с использованием Private Link.

Запустите следующую команду, чтобы добавить частную конечную точку в белый список служб:

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

Вы также можете запустить следующую команду, чтобы удалить частную конечную точку из белого списка служб:

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

После добавления или удаления частной конечной точки из белого списка служб выполните следующую команду, чтобы применить её к вашей организации:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Доступ к вашей службе ClickHouse Cloud с использованием Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Каждая служба с включенным Private Link имеет публичную и частную конечную точку. Для подключения с использованием Private Link вам нужно использовать частную конечную точку, которая будет `privateDnsHostname`<sup>API</sup> или `DNS имя`<sup>консоль</sup>, взятое из шага [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link).

### Получение частого DNS имени {#obtaining-the-private-dns-hostname}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите кнопку **Настроить частную конечную точку**. В открывшемся меню скопируйте **DNS имя**.

<Image img={azure_privatelink_pe_dns} size="lg" alt="Частное Имя DNS Конечной Точки" border />

#### Вариант 2: API {#option-2-api-3}

Установите следующие переменные среды перед выполнением любых команд:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Запустите следующую команду:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

Вы должны получить ответ, похожий на следующий:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

В этом примере соединение с хостом `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` будет перенаправлено на Private Link. В то же время, `xxxxxxx.region_code.azure.clickhouse.cloud` будет перенаправлено через интернет.

Используйте `privateDnsHostname`, чтобы подключиться к вашей службе ClickHouse Cloud с использованием Private Link.

## Устранение неполадок {#troubleshooting}

### Проверка настройки DNS {#test-dns-setup}

Запустите следующую команду:

```bash
nslookup <dns name>
```
где "dns name" является `privateDnsHostname`<sup>API</sup> или `DNS имя`<sup>консоль</sup> из [Получите псевдоним подключения Azure для Private Link](#obtain-azure-connection-alias-for-private-link)

Вы должны получить следующий ответ:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### Сброс соединения на стороне пересылки {#connection-reset-by-peer}

Скорее всего, идентификатор ресурса частной конечной точки не был добавлен в белый список служб. Вернитесь к шагу [_Добавить идентификатор ресурса частной конечной точки в белый список ваших служб_](#add-private-endpoint-id-to-services-allow-list).

### Частная конечная точка находится в состоянии ожидания {#private-endpoint-is-in-pending-state}

Скорее всего, идентификатор ресурса частной конечной точки не был добавлен в белый список служб. Вернитесь к шагу [_Добавить идентификатор ресурса частной конечной точки в белый список ваших служб_](#add-private-endpoint-id-to-services-allow-list).

### Проверка соединения {#test-connectivity}

Если у вас проблемы с подключением с использованием Private Link, проверьте ваше соединение с помощью `openssl`. Убедитесь, что статус конечной точки Private Link — `Accepted`.

OpenSSL должен быть в состоянии подключиться (смотрите CONNECTED в выводе). `errno=104` ожидаем.

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

### Проверка фильтров частной конечной точки {#checking-private-endpoint-filters}

Установите следующие переменные среды перед выполнением любых команд:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Запустите следующую команду, чтобы проверить фильтры частной конечной точки:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## Дополнительная информация {#more-information}

Для получения дополнительной информации о Azure Private Link посетите [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).