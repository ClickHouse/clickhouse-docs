---
title: 'AWS PrivateLink'
description: 'Этот документ описывает, как подключиться к ClickHouse Cloud с помощью AWS PrivateLink.'
slug: /manage/security/aws-privatelink
---

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


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/), чтобы обеспечить подключение между VPC, службами AWS, вашими локальными системами и ClickHouse Cloud, не позволяя вашему трафику проходить через интернет. Этот документ описывает, как подключиться к ClickHouse Cloud с помощью AWS PrivateLink. Чтобы отключить доступ к вашим услугам ClickHouse Cloud с адресов, отличных от адресов AWS PrivateLink, используйте [IP Access Lists](/cloud/security/setting-ip-filters) ClickHouse Cloud.

:::note
ClickHouse Cloud в настоящее время не поддерживает [cross-region PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/). Тем не менее, вы можете [подключиться к PrivateLink с помощью VPC peering](https://aws.amazon.com/about-aws/whats-new/2019/03/aws-privatelink-now-supports-access-over-vpc-peering/). Для получения дополнительной информации и рекомендаций по настройке обратитесь к документации AWS.
:::


Пожалуйста, выполните следующие шаги, чтобы включить AWS Private Link:
1. Получите имя сервиса конечной точки.
1. Создайте конечную точку сервиса.
1. Добавьте ID конечной точки в организацию ClickHouse Cloud.
1. Добавьте ID конечной точки в список разрешенных сервисов.


Полный пример Terraform для AWS Private Link можно найти [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/blob/main/examples/resources/clickhouse_private_endpoint_registration/resource.tf).

## Prerequisites {#prerequisites}

Перед тем как начать, вам потребуется:

1. Учетная запись AWS.
1. Ключ API с необходимыми правами для создания и управления приватными ссылками.

## Steps {#steps}

Следуйте этим шагам, чтобы подключить ваш ClickHouse Cloud к AWS PrivateLink.

### Obtain Endpoint Service name {#obtain-endpoint-service-name}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через PrivateLink, затем откройте меню **Настройки**. Нажмите кнопку **Настроить приватную конечную точку**. Скопируйте **Имя сервиса**, которое будет использоваться для настройки Private Link.

<img src={aws_private_link_pecreate} alt="Приватные конечные точки" />

#### Option 2: API {#option-2-api}

Сначала установите следующие переменные окружения перед выполнением любых команд:

```shell
REGION=<Ваш код региона в формате AWS>
PROVIDER=aws
KEY_ID=<Ваш ID ключа>
KEY_SECRET=<Ваш секретный ключ>
ORG_ID=<Ваш ID организации ClickHouse>
SERVICE_NAME=<Ваше имя сервиса ClickHouse>
```

Получите желаемый ID экземпляра, фильтруя по региону, провайдеру и имени сервиса:

```shell
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите AWS Service Name для вашей конфигурации Private Link:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

Эта команда должна вернуть что-то вроде:

```result
{
    ...
    "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
    ...
}
```

Запомните `endpointServiceId` и [перейдите к шагу 2](#create-a-service-endpoint).

### Create a service endpoint {#create-a-service-endpoint}

Далее вам нужно создать конечную точку сервиса, используя `endpointServiceId` из предыдущего шага.

#### Option 1: AWS console {#option-1-aws-console}

Откройте консоль AWS и перейдите в **VPC** → **Конечные точки** → **Создать конечные точки**.

Выберите **Другие конечные сервисы** и используйте `endpointServiceId`, который вы получили на предыдущем шаге. Когда закончите, нажмите **Проверить сервис**:

<img src={aws_private_link_endpoint_settings} alt="Настройки конечной точки AWS PrivateLink" />

Далее выберите ваш VPC и подсети:

<img src={aws_private_link_select_vpc} alt="Выбор VPC и подсетей" />

Как необязательный шаг, назначьте группы безопасности/теги:

:::note Порты
Убедитесь, что порты `8443` и `9440` разрешены в группе безопасности.
:::

После создания VPC Endpoint запомните значение `Endpoint ID`; оно понадобится вам в следующем шаге.

<img src={aws_private_link_vpc_endpoint_id} alt="ID конечной точки VPC" />

#### Option 2: AWS CloudFormation {#option-2-aws-cloudformation}

Убедитесь, что вы используете правильные ID подсетей, группы безопасности и ID VPC.

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <используйте endpointServiceId из шага 'Получить имя сервиса AWS для Private Link'>
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

#### Option 3: Terraform {#option-3-terraform}

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<используйте endpointServiceId из шага 'Получить имя сервиса AWS для Private Link'>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
}
```

#### Modify Private DNS Name for Endpoint {#modify-private-dns-name-for-endpoint}

Этот шаг добавляет конфигурацию частной DNS зоны `<код региона>.vpce.aws.clickhouse.cloud` в AWS VPC.

:::note DNS-резолвер
Если вы используете собственный DNS-резолвер, создайте DNS-зону `<код региона>.vpce.aws.clickhouse.cloud` и укажите запись `*.<код региона>.vpce.aws.clickhouse.cloud` на IP-адреса ID конечной точки.
:::

#### Option 1: AWS Console {#option-1-aws-console-1}

Перейдите в **VPC Endpoints**, щелкните правой кнопкой мыши на VPC Endpoint, затем выберите **Изменить частное DNS имя**:

<img src={aws_private_link_endpoints_menu} alt="Меню конечных точек AWS PrivateLink" />

На открывшейся странице выберите **Включить частные DNS имена**:

<img src={aws_private_link_modify_dnsname} alt="Изменить DNS имена" />

#### Option 2: AWS CloudFormation {#option-2-aws-cloudformation-1}

Обновите шаблон `CloudFormation` и установите `PrivateDnsEnabled` в `true`:

```json
PrivateDnsEnabled: true
```

Примените изменения.

#### Option 3: Terraform {#option-3-terraform-1}

- Измените ресурс `aws_vpc_endpoint` в коде Terraform и установите `private_dns_enabled` в `true`:

```json
private_dns_enabled = true
```

Примените изменения.

### Add Endpoint ID to ClickHouse Cloud organization {#add-endpoint-id-to-clickhouse-cloud-organization}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Добавить ID конечной точки в список разрешенных сервисов](#add-endpoint-id-to-services-allow-list). Добавление `ID конечной точки` с помощью консоли ClickHouse Cloud в список разрешенных сервисов автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Детали организации -> Приватные конечные точки** и нажмите кнопку удаления для удаления конечной точки.

<img src={pe_remove_private_endpoint} alt="Удалить приватную конечную точку" />

#### Option 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
PROVIDER=aws
KEY_ID=<ID ключа>
KEY_SECRET=<Секретный ключ>
ORG_ID=<пожалуйста, укажите ID организации ClickHouse>
ENDPOINT_ID=<ID конечной точки из предыдущего шага>
REGION=<код региона, пожалуйста, используйте формат AWS>
```

Установите переменную окружения `VPC_ENDPOINT`, используя данные из предыдущего шага.

Чтобы добавить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "description": "Приватная конечная точка AWS",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} \
-d @pl_config_org.json
```

Чтобы удалить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} \
-d @pl_config_org.json
```

### Add Endpoint ID to service(s) allow list {#add-endpoint-id-to-services-allow-list}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-2}

В консоли ClickHouse Cloud откройте сервис, к которому вы хотите подключиться через PrivateLink, затем перейдите в **Настройки**. Введите `ID конечной точки`, полученный на [предыдущем](#create-a-service-endpoint) шаге.

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню существующих конечных точек.
:::

<img src={aws_private_link_pe_filters} alt="Фильтр приватных конечных точек" />

### Option 2: API {#option-2-api-2}

Вам необходимо добавить ID конечной точки в разрешенный список для каждого экземпляра, который должен быть доступен с использованием PrivateLink.

Установите следующие переменные окружения перед выполнением любых команд:

```bash
PROVIDER=aws
KEY_ID=<ID ключа>
KEY_SECRET=<Секретный ключ>
ORG_ID=<пожалуйста, укажите ID организации ClickHouse>
ENDPOINT_ID=<ID конечной точки из предыдущего шага>
INSTANCE_ID=<ID экземпляра>
```

Чтобы добавить ID конечной точки в разрешенный список:

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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
-d @pl_config.json | jq
```

Чтобы удалить ID конечной точки из разрешенного списка:

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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
-d @pl_config.json | jq
```

### Accessing an instance using PrivateLink {#accessing-an-instance-using-privatelink}

Каждый экземпляр с настроенным фильтром Private Link имеет публичную и частную конечные точки. Для подключения к вашему сервису с использованием PrivateLink вы должны использовать частную конечную точку `privateDnsHostname`.

:::note
Частное DNS имя доступно только из вашего AWS VPC. Не пытайтесь разрешить DNS хост из локальной машины.
:::

#### Getting Private DNS Hostname {#getting-private-dns-hostname}

##### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите кнопку **Настроить приватную конечную точку**. В открывшемся окне скопируйте **DNS имя**.

<img src={aws_private_link_ped_nsname} alt="DNS имя приватной конечной точки" />

##### Option 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секретный ключ>
ORG_ID=<пожалуйста, укажите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

Это должно вывести что-то вроде:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud"
}
```

В этом примере подключение к хосту `xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud` будет направлено на PrivateLink, но `xxxxxxx.yy-xxxx-N.aws.clickhouse.cloud` будет направлено через интернет.

## Troubleshooting {#troubleshooting}

### Multiple PrivateLinks in one region {#multiple-privatelinks-in-one-region}

В большинстве случаев вам нужно создать только одну конечную точку сервиса для каждого VPC. Эта конечная точка может направлять запросы из VPC к нескольким услугам ClickHouse Cloud.

### Connection to private endpoint timed out {#connection-to-private-endpoint-timed-out}

- Пожалуйста, прикрепите группу безопасности к VPC Endpoint.
- Пожалуйста, проверьте `входящие` правила на группе безопасности, прикрепленной к конечной точке, и разрешите порты ClickHouse.
- Пожалуйста, проверьте `исходящие` правила на группе безопасности, прикрепленной к ВМ, которая используется для тестирования подключения, и разрешите соединения с портами ClickHouse.

### Private Hostname: Not found address of host {#private-hostname-not-found-address-of-host}

- Пожалуйста, проверьте, что опция "Частные DNS имена" включена, посетите [шаг](#modify-private-dns-name-for-endpoint) для получения подробностей

### Connection reset by peer {#connection-reset-by-peer}

- Скорее всего, ID конечной точки не был добавлен в список разрешенных сервисов, пожалуйста, посетите [шаг](#add-endpoint-id-to-services-allow-list)

### Checking Endpoint filters {#checking-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секретный ключ>
ORG_ID=<пожалуйста, укажите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

```shell
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X GET -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | \
jq .result.privateEndpointIds
```

### Connecting to a remote database {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать функции таблиц [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в VPC Amazon Web Services (AWS). AWS PrivateLink не может быть использован для безопасного включения этого соединения. PrivateLink — это однонаправленное соединение. Оно позволяет вашей внутренней сети или Amazon VPC подключаться безопасно к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас настроено клиентское/серверное соединение, где вы хотите предоставить одному или нескольким потребителям VPC однонаправленный доступ к определенному сервису или набору экземпляров в VPC провайдера услуги. Только клиенты в потребительском VPC могут инициировать соединение с сервисом в VPC провайдера услуги.

Для этого настройте ваши группы безопасности AWS, чтобы разрешить соединения от ClickHouse Cloud к вашей внутренней/приватной базе данных. Проверьте [стандартные IP-адреса выхода для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).
