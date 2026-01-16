---
title: 'AWS PrivateLink'
description: 'В этом документе описывается, как подключиться к ClickHouse Cloud с использованием AWS PrivateLink.'
slug: /manage/security/aws-privatelink
keywords: ['PrivateLink']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import aws_private_link_pecreate from '@site/static/images/cloud/security/aws-privatelink-pe-create.png';
import aws_private_link_endpoint_settings from '@site/static/images/cloud/security/aws-privatelink-endpoint-settings.png';
import aws_private_link_select_vpc from '@site/static/images/cloud/security/aws-privatelink-select-vpc-and-subnets.png';
import aws_private_link_vpc_endpoint_id from '@site/static/images/cloud/security/aws-privatelink-vpc-endpoint-id.png';
import aws_private_link_endpoints_menu from '@site/static/images/cloud/security/aws-privatelink-endpoints-menu.png';
import aws_private_link_modify_dnsname from '@site/static/images/cloud/security/aws-privatelink-modify-dns-name.png';
import pe_remove_private_endpoint from '@site/static/images/cloud/security/pe-remove-private-endpoint.png';
import aws_private_link_pe_filters from '@site/static/images/cloud/security/aws-privatelink-pe-filters.png';
import aws_private_link_ped_nsname from '@site/static/images/cloud/security/aws-privatelink-pe-dns-name.png';

# AWS PrivateLink \\{#aws-privatelink\\}

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для организации защищённого подключения между VPC, сервисами AWS, локальными системами и ClickHouse Cloud, не выводя трафик в общедоступный интернет. В этом документе описаны шаги по подключению к ClickHouse Cloud с использованием AWS PrivateLink.

Чтобы ограничить доступ к вашим сервисам ClickHouse Cloud исключительно через адреса AWS PrivateLink, следуйте инструкциям из руководства ClickHouse Cloud [IP Access Lists](/cloud/security/setting-ip-filters).

:::note
ClickHouse Cloud поддерживает [межрегиональный PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) из следующих регионов:
- sa-east-1
- il-central-1
- me-central-1
- me-south-1
- eu-central-2
- eu-north-1
- eu-south-2
- eu-west-3
- eu-south-1
- eu-west-2
- eu-west-1
- eu-central-1
- ca-west-1
- ca-central-1
- ap-northeast-1
- ap-southeast-2
- ap-southeast-1
- ap-northeast-2
- ap-northeast-3
- ap-south-1
- ap-southeast-4
- ap-southeast-3
- ap-south-2
- ap-east-1
- af-south-1
- us-west-2
- us-west-1
- us-east-2
- us-east-1
Особенности тарификации: AWS будет взимать плату с пользователей за передачу данных между регионами, см. цены [здесь](https://aws.amazon.com/privatelink/pricing/).
:::

**Выполните следующие шаги, чтобы включить AWS PrivateLink**:
1. Получите «Service name» конечной точки (Endpoint).
1. Создайте AWS Endpoint.
1. Добавьте «Endpoint ID» в организацию ClickHouse Cloud.
1. Добавьте «Endpoint ID» в список разрешённых (allow list) для сервиса ClickHouse.

Примеры Terraform см. [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Важные замечания \\{#considerations\\}
ClickHouse пытается группировать ваши сервисы, чтобы повторно использовать одну и ту же опубликованную [конечную точку сервиса](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) в пределах региона AWS. Однако такая группировка не гарантируется, особенно если вы распределяете свои сервисы между несколькими организациями ClickHouse.
Если у вас уже настроен PrivateLink для других сервисов в вашей организации ClickHouse, во многих случаях вы можете пропустить большинство шагов благодаря такой группировке и перейти сразу к финальному шагу: добавьте «Endpoint ID» ClickHouse в список разрешённых для сервиса ClickHouse.

## Предварительные требования для этого процесса \\{#prerequisites\\}

Перед началом вам потребуется:

1. Ваша учётная запись AWS.
1. [API-ключ ClickHouse](/cloud/manage/openapi) с необходимыми правами для создания и управления частными конечными точками на стороне ClickHouse.

## Шаги \\{#steps\\}

Следуйте этим шагам, чтобы подключить сервисы ClickHouse Cloud через AWS PrivateLink.

### Получение значения параметра endpoint «Service name» \\{#obtain-endpoint-service-info\\}

#### Вариант 1: консоль ClickHouse Cloud \\{#option-1-clickhouse-cloud-console\\}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в меню **Settings**.

<Image img={aws_private_link_pecreate} size="md" alt="Приватные конечные точки" border />

Запишите значения `Service name` и `DNS name`, затем [перейдите к следующему шагу](#create-aws-endpoint).

#### Вариант 2: API \\{#option-2-api\\}

Сначала задайте следующие переменные окружения перед выполнением любых команд:

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Получите значение `INSTANCE_ID` для вашего ClickHouse, отфильтровав ресурсы по региону, провайдеру и имени сервиса:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите значения параметров `endpointServiceId` и `privateDnsHostname` для конфигурации PrivateLink:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

Эта команда должна вывести примерно следующее:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

Запишите значения `endpointServiceId` и `privateDnsHostname` и [перейдите к следующему шагу](#create-aws-endpoint).

### Создание AWS endpoint \\{#create-aws-endpoint\\}

:::important
В этом разделе описаны специфичные для ClickHouse детали настройки ClickHouse через AWS PrivateLink. Шаги, относящиеся к AWS, приведены как справочная информация, чтобы подсказать, где именно нужно проводить настройки, однако со временем они могут измениться без уведомления со стороны облачного провайдера AWS. Настраивайте конфигурацию AWS исходя из вашего конкретного сценария использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых AWS VPC endpoint, правил групп безопасности (security groups) или DNS-записей.

Если вы ранее включали «private DNS names» при настройке PrivateLink и сейчас испытываете сложности с конфигурацией новых сервисов через PrivateLink, обратитесь в службу поддержки ClickHouse. По всем остальным вопросам, связанным с задачами конфигурации AWS, обращайтесь напрямую в службу поддержки AWS.
:::

#### Вариант 1: консоль AWS \\{#option-1-aws-console\\}

Откройте консоль AWS и перейдите в **VPC** → **Endpoints** → **Create endpoints**.

Выберите **Endpoint services that use NLBs and GWLBs** и используйте `Service name`<sup>console</sup> или `endpointServiceId`<sup>API</sup>, полученный на шаге [Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info), в поле **Service Name**. Нажмите **Verify service**:

<Image img={aws_private_link_endpoint_settings} size="md" alt="Настройки AWS PrivateLink Endpoint" border />

Если вы хотите установить межрегиональное подключение через PrivateLink, установите флажок «Cross region endpoint» и укажите регион сервиса. Регион сервиса — это регион, в котором запущен экземпляр ClickHouse.

Если вы видите сообщение об ошибке «Service name could not be verified.», обратитесь в службу поддержки ClickHouse с запросом на добавление новых регионов в список поддерживаемых регионов.

Далее выберите ваш VPC и подсети:

<Image img={aws_private_link_select_vpc} size="md" alt="Выбор VPC и подсетей" border />

Дополнительно при необходимости назначьте Security groups/Tags:

:::note
Убедитесь, что порты `443`, `8443`, `9440`, `3306` разрешены в группе безопасности (security group).
:::

После создания VPC endpoint запишите значение `Endpoint ID`; оно понадобится вам на одном из следующих шагов.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border />

#### Вариант 2: AWS CloudFormation \\{#option-2-aws-cloudformation\\}

Далее необходимо создать VPC Endpoint, используя `Service name`<sup>console</sup> или `endpointServiceId`<sup>API</sup>, полученные на шаге [Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info).
Убедитесь, что вы используете соответствующие идентификаторы подсетей (subnet IDs), группы безопасности (security groups) и идентификатор VPC (VPC ID).

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId), pls see above>
      VpcId: vpc-vpc_id
      SubnetIds:
        - subnet-subnet_id1
        - subnet-subnet_id2
        - subnet-subnet_id3
      SecurityGroupIds:
        - sg-security_group_id1
        - sg-security_group_id2
        - sg-security_group_id3
```

После создания VPC Endpoint запишите значение `Endpoint ID` — оно понадобится на одном из следующих шагов.

#### Вариант 3: Terraform \\{#option-3-terraform\\}

`service_name` ниже — это `Service name`<sup>console</sup> или `endpointServiceId`<sup>API</sup>, полученное на шаге [Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info).

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<pls see comment above>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Optional) If specified, the VPC endpoint will connect to the service in the provided region. Define it for multi-regional PrivateLink connections."
}
```

После создания VPC Endpoint запишите значение `Endpoint ID` — оно понадобится на одном из следующих шагов.

#### Настройка приватного DNS-имени для endpoint \\{#set-private-dns-name-for-endpoint\\}

:::note
Существует несколько способов настройки DNS. Настройте DNS в соответствии с вашим конкретным вариантом использования.
:::

Вам нужно привязать «DNS name», полученное на шаге [Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info), к сетевым интерфейсам AWS Endpoint. Это обеспечит корректное разрешение имени сервисами и компонентами внутри вашей VPC/сети.

### Добавление «Endpoint ID» в список разрешённых для сервиса ClickHouse \\{#add-endpoint-id-to-services-allow-list\\}

#### Вариант 1: консоль ClickHouse Cloud \\{#option-1-clickhouse-cloud-console-2\\}

Чтобы добавить endpoint, перейдите в консоль ClickHouse Cloud, откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в раздел **Settings**. Нажмите **Set up private endpoint**, чтобы открыть настройки private endpoints. Введите `Endpoint ID`, полученный на шаге [Create AWS Endpoint](#create-aws-endpoint). Нажмите «Create endpoint».

:::note
Если вы хотите разрешить доступ из уже существующего соединения PrivateLink, используйте существующий endpoint в выпадающем меню.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Фильтр Private Endpoints" border />

Чтобы удалить endpoint, перейдите в консоль ClickHouse Cloud, найдите нужный сервис, затем перейдите в **Settings** этого сервиса, найдите endpoint, который вы хотите удалить, и удалите его из списка endpoints.

#### Вариант 2: API \\{#option-2-api-2\\}

Вам нужно добавить Endpoint ID в allow-list для каждого экземпляра, который должен быть доступен через PrivateLink.

Установите переменную окружения `ENDPOINT_ID`, используя данные с шага [Create AWS Endpoint](#create-aws-endpoint).

Перед выполнением любых команд установите следующие переменные окружения:

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Чтобы добавить идентификатор конечной точки в список разрешённых:

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

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

Чтобы удалить идентификатор конечной точки из списка разрешённых конечных точек:

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

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

### Доступ к экземпляру с использованием PrivateLink \\{#accessing-an-instance-using-privatelink\\}

Каждый сервис с включённым Private Link имеет публичную и приватную конечные точки. Для подключения через Private Link необходимо использовать приватную конечную точку — это будет `privateDnsHostname`<sup>API</sup> или `DNS Name`<sup>console</sup>, полученные из раздела [Obtain Endpoint &quot;Service name&quot;](#obtain-endpoint-service-info).

#### Получение приватного DNS-имени хоста \\{#getting-private-dns-hostname\\}

##### Вариант 1: консоль ClickHouse Cloud \\{#option-1-clickhouse-cloud-console-3\\}

В консоли ClickHouse Cloud перейдите в раздел **Settings**. Нажмите кнопку **Set up private endpoint**. В открывшейся панели скопируйте **DNS Name**.

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

##### Вариант 2: API \\{#option-2-api-3\\}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

Вы можете получить `INSTANCE_ID` на [этом шаге](#option-2-api).

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

В результате будет выведено примерно следующее:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

В этом примере соединение по имени хоста со значением `privateDnsHostname` будет маршрутизировано через PrivateLink, а соединение по имени хоста со значением `endpointServiceId` — через интернет.

## Устранение неполадок \\{#troubleshooting\\}

### Несколько PrivateLink в одном регионе \\{#multiple-privatelinks-in-one-region\\}

В большинстве случаев вам нужно создать только один endpoint service для каждого VPC. Этот endpoint может направлять запросы из VPC к нескольким сервисам ClickHouse Cloud.
См. [здесь](#considerations)

### Таймаут при подключении к приватному endpoint \\{#connection-to-private-endpoint-timed-out\\}

* Привяжите группу безопасности (security group) к VPC Endpoint.
* Проверьте правила `inbound` у группы безопасности, привязанной к Endpoint, и разрешите порты ClickHouse.
* Проверьте правила `outbound` у группы безопасности, привязанной к VM, которая используется для проверки подключения, и разрешите подключения к портам ClickHouse.

### Приватное имя хоста: адрес хоста не найден \\{#private-hostname-not-found-address-of-host\\}

* Проверьте конфигурацию DNS.

### Connection reset by peer \\{#connection-reset-by-peer\\}

* Скорее всего, Endpoint ID не был добавлен в список разрешённых (allow list) сервиса, перейдите к [шагу](#add-endpoint-id-to-services-allow-list)

### Проверка фильтров endpoint \\{#checking-endpoint-filters\\}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

`INSTANCE_ID` можно получить на [шаге](#option-2-api).

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### Подключение к удалённой базе данных \\{#connecting-to-a-remote-database\\}

Предположим, вы пытаетесь использовать табличные функции [MySQL](/sql-reference/table-functions/mysql) или [PostgreSQL](/sql-reference/table-functions/postgresql) в ClickHouse Cloud и подключиться к своей базе данных, размещённой в VPC Amazon Web Services (AWS). AWS PrivateLink нельзя использовать для безопасной организации такого подключения. PrivateLink — это одностороннее (unidirectional) соединение. Оно позволяет вашей внутренней сети или Amazon VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас есть клиент-серверная архитектура и вы хотите разрешить одному или нескольким VPC-потребителям односторонний доступ к определённому сервису или набору экземпляров в VPC-поставщика сервиса. Только клиенты в VPC-потребителе могут инициировать подключение к сервису в VPC-поставщика.

Для этого настройте AWS Security Groups так, чтобы они разрешали подключения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Ознакомьтесь с [IP-адресами исходящего трафика по умолчанию для регионов ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api), а также с [доступными статическими IP-адресами](https://api.clickhouse.cloud/static-ips.json).
