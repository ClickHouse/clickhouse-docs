---
title: 'AWS PrivateLink'
description: 'В этом документе описывается, как подключиться к ClickHouse Cloud с использованием AWS PrivateLink.'
slug: /manage/security/aws-privatelink
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


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установления безопасного соединения между VPC, службами AWS, вашими локальными системами и ClickHouse Cloud без экспонирования трафика в публичный Интернет. Этот документ описывает шаги для подключения к ClickHouse Cloud с использованием AWS PrivateLink.

Чтобы ограничить доступ к вашим услугам ClickHouse Cloud исключительно через адреса AWS PrivateLink, следуйте инструкциям, предоставленным ClickHouse Cloud [IP Access Lists](/cloud/security/setting-ip-filters).

:::note
ClickHouse Cloud в настоящее время поддерживает [кросс-региональный PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) в бета-версии.
:::


**Пожалуйста, выполните следующее, чтобы включить AWS PrivateLink**:
1. Получите имя службы "Endpoint".
1. Создайте AWS Endpoint.
1. Добавьте "Endpoint ID" в организацию ClickHouse Cloud.
1. Добавьте "Endpoint ID" в белый список служб ClickHouse.


Найдите примеры Terraform [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).


## Внимание {#attention}
ClickHouse пытается сгруппировать ваши службы для повторного использования одной и той же опубликованной [службы endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) в пределах региона AWS. Однако эта группировка не гарантируется, особенно если вы распределяете свои службы по нескольким организациям ClickHouse.
Если у вас уже настроен PrivateLink для других услуг в вашей организации ClickHouse, вы часто можете пропустить большинство шагов из-за этой группировки и перейти непосредственно к последнему шагу: [Добавьте "Endpoint ID" ClickHouse в белый список служб ClickHouse](#add-endpoint-id-to-services-allow-list).


## Предварительные условия {#prerequisites}

Перед тем как начать, вам понадобятся:

1. Ваша учетная запись AWS.
1. [API-ключ ClickHouse](/cloud/manage/openapi) с необходимыми правами для создания и управления частными эндпоинтами со стороны ClickHouse.

## Шаги {#steps}

Следуйте этим шагам, чтобы подключить ваши услуги ClickHouse Cloud через AWS PrivateLink.

### Получите имя "Endpoint" службы  {#obtain-endpoint-service-info}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте службу, к которой вы хотите подключиться через PrivateLink, затем перейдите в меню **Настройки**.

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

Запишите `Service name` и `DNS name`, затем [перейдите к следующему шагу](#create-aws-endpoint).

#### Вариант 2: API {#option-2-api}

Сначала установите следующие переменные окружения перед выполнением любых команд:

```shell
REGION=<Ваш код региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse ключ секрет>
ORG_ID=<Ваш ClickHouse ID организации>
SERVICE_NAME=<Ваш ClickHouse имя службы>
```

Получите ваш ClickHouse `INSTANCE_ID`, отфильтровав по региону, провайдеру и имени службы:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Получите `endpointServiceId` и `privateDnsHostname` для вашей конфигурации PrivateLink:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

Эта команда должна вернуть что-то вроде:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

Запишите `endpointServiceId` и `privateDnsHostname`, [перейдите к следующему шагу](#create-aws-endpoint).

### Создайте AWS Endpoint {#create-aws-endpoint}

:::important
Этот раздел охватывает специфические для ClickHouse детали настройки ClickHouse через AWS PrivateLink. Шаги, специфичные для AWS, предоставлены как справка, чтобы указать, где искать, но они могут изменяться со временем без предварительного уведомления со стороны поставщика облачных услуг AWS. Пожалуйста, настройте AWS в зависимости от вашего конкретного случая использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых AWS VPC конечных точек, правил групп безопасности или записей DNS.

Если вы ранее включили "частные DNS имена" при настройке PrivateLink и испытываете трудности с настройкой новых служб через PrivateLink, пожалуйста, свяжитесь с поддержкой ClickHouse. По любым другим вопросам, связанным с задачами конфигурации AWS, обращайтесь напрямую в поддержку AWS.
:::

#### Вариант 1: Консоль AWS {#option-1-aws-console}

Откройте консоль AWS и перейдите в **VPC** → **Endpoints** → **Создать конечные точки**.

Выберите **Услуги конечных точек, которые используют NLB и GWLB** и используйте `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получить имя "Endpoint" службы](#obtain-endpoint-service-info) в поле **Service Name**. Нажмите **Проверить службу**:

<Image img={aws_private_link_endpoint_settings} size="md" alt="Настройки AWS PrivateLink Endpoint" border/>

Если вы хотите установить кросс-региональное соединение через PrivateLink, включите флажок "Кросс-региональный endpoint" и укажите регион службы. Регион службы — это тот, в котором работает экземпляр ClickHouse.

Если вы получаете ошибку "Имя службы не может быть проверено", пожалуйста, свяжитесь со службой поддержки, чтобы запросить добавление новых регионов в список поддерживаемых регионов.

Далее выберите ваш VPC и подсети:

<Image img={aws_private_link_select_vpc} size="md" alt="Выбор VPC и подсетей" border />

В качестве дополнительного шага назначьте группы безопасности/теги:

:::note
Убедитесь, что порты `443`, `8443`, `9440`, `3306` разрешены в группе безопасности.
:::

После создания VPC Endpoint запишите значение `Endpoint ID`; оно потребуется вам для следующего шага.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### Вариант 2: AWS CloudFormation {#option-2-aws-cloudformation}

Затем вам необходимо создать VPC Endpoint, используя `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите имя "Endpoint" службы](#obtain-endpoint-service-info).
Убедитесь, что вы используете правильные ID подсетей, группы безопасности и ID VPC.

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

После создания VPC Endpoint запишите значение `Endpoint ID`; оно потребуется вам для следующего шага.

#### Вариант 3: Terraform {#option-3-terraform}

`service_name` ниже — это `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите имя "Endpoint" службы](#obtain-endpoint-service-info).

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
  service_region      = "(Необязательно) Если задано, VPC endpoint подключится к службе в указанном регионе. Определите это для многорегиональных соединений PrivateLink."
}
```

После создания VPC Endpoint запишите значение `Endpoint ID`; оно потребуется вам для следующего шага.

#### Установите частное DNS имя для Endpoint {#set-private-dns-name-for-endpoint}

:::note
Существуют различные способы настройки DNS. Пожалуйста, настройте DNS в зависимости от вашего конкретного случая использования.
:::

Вам необходимо указать "DNS name", взятое на шаге [Получите имя "Endpoint" службы](#obtain-endpoint-service-info), на сетевые интерфейсы AWS Endpoint. Это гарантирует, что службы/компоненты внутри вашего VPC/Сети смогут правильно его разобрать.

### Добавьте Endpoint ID в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Добавить Endpoint ID в белый список службы(ей)](#add-endpoint-id-to-services-allow-list). Добавление `Endpoint ID` с использованием консоли ClickHouse Cloud в белый список служб автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Подробности организации -> Частные конечные точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={pe_remove_private_endpoint} size="md" alt="Удалить частный эндпоинт" border/>

#### Вариант 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<Ваш код региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse ключ секрет>
ORG_ID=<Ваш ClickHouse ID организации>
SERVICE_NAME=<Ваш ClickHouse имя службы>
```

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создайте AWS Endpoint](#create-aws-endpoint).

Чтобы добавить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "description": "Частный эндпоинт AWS",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" \
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

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" \
-d @pl_config_org.json
```

### Добавьте "Endpoint ID" в белый список службы ClickHouse {#add-endpoint-id-to-services-allow-list}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

Чтобы добавить, пожалуйста, перейдите в консоль ClickHouse Cloud, откройте службу, к которой вы хотите подключиться через PrivateLink, затем перейдите в **Настройки**. Введите `Endpoint ID`, полученный на шаге [Создайте AWS Endpoint](#create-aws-endpoint). Нажмите "Создать конечную точку".

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню существующего эндпоинта.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Фильтр частных конечных точек" border/>

Чтобы удалить, пожалуйста, перейдите в консоль ClickHouse Cloud, найдите службу, затем перейдите в **Настройки** службы, найдите конечную точку, которую вы хотите удалить. Удалите ее из списка конечных точек.

#### Вариант 2: API {#option-2-api-2}

Вам необходимо добавить Endpoint ID в белый список для каждого экземпляра, который должен быть доступен с помощью PrivateLink.

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создайте AWS Endpoint](#create-aws-endpoint).

Установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<Ваш код региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse ключ секрет>
ORG_ID=<Ваш ClickHouse ID организации>
SERVICE_NAME=<Ваш ClickHouse имя службы>
```

Чтобы добавить идентификатор конечной точки в белый список:

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

Чтобы удалить идентификатор конечной точки из белого списка:

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

### Доступ к экземпляру с использованием PrivateLink {#accessing-an-instance-using-privatelink}

Каждая служба с включенным Private Link имеет публичный и частный endpoint. Для подключения с использованием Private Link вам необходимо использовать частный endpoint, который будет `privateDnsHostname`<sup>API</sup> или `DNS Name`<sup>консоль</sup>, взятый из [Получите имя "Endpoint" службы](#obtain-endpoint-service-info).


#### Получение частного DNS имени {#getting-private-dns-hostname}

##### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите на кнопку **Настроить частный конечный пункт**. В открывшемся меню скопируйте **DNS Name**.

<Image img={aws_private_link_ped_nsname} size="md" alt="Частное имя DNS конечной точки" border />

##### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse ключ секрет>
ORG_ID=<Ваш ClickHouse ID организации>
INSTANCE_ID=<Ваш ClickHouse имя службы>
```

Вы можете извлечь `INSTANCE_ID` из [шага](#option-2-api).

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

Это должно вывести что-то вроде:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

В этом примере подключение через значение имени хоста `privateDnsHostname` будет направлено на PrivateLink, но подключение через имя хоста `endpointServiceId` будет направлено через Интернет.

## Устранение неисправностей {#troubleshooting}

### Несколько PrivateLinks в одном регионе {#multiple-privatelinks-in-one-region}

В большинстве случаев вам нужно создать единую службу конечных точек для каждого VPC. Эта конечная точка может маршрутизировать запросы из VPC к нескольким службам ClickHouse Cloud.
Пожалуйста, обратитесь [сюда](#attention)

### Время ожидания соединения с частной конечной точкой истекло {#connection-to-private-endpoint-timed-out}

- Пожалуйста, прикрепите группу безопасности к VPC Endpoint.
- Пожалуйста, проверьте правила `inbound` в группе безопасности, прикрепленной к конечной точке, и разрешите порты ClickHouse.
- Пожалуйста, проверьте правила `outbound` в группе безопасности, прикрепленной к ВМ, которая используется для тестирования подключения, и разрешите подключения к портам ClickHouse.

### Частное имя хоста: адрес хоста не найден {#private-hostname-not-found-address-of-host}

- Пожалуйста, проверьте вашу конфигурацию DNS.

### Соединение сброшено соперником {#connection-reset-by-peer}

- Скорее всего, идентификатор конечной точки не был добавлен в белый список служб, пожалуйста, посетите [шаг](#add-endpoint-id-to-services-allow-list).

### Проверка фильтров конечной точки {#checking-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<пожалуйста, установите ID организации ClickHouse>
INSTANCE_ID=<Instance ID>
```

Вы можете извлечь `INSTANCE_ID` из [шага](#option-2-api).

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) табличные функции в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в VPC Amazon Web Services (AWS). AWS PrivateLink не может быть использован для безопасного подключения. PrivateLink является односторонним соединением. Он позволяет вашей внутренней сети или VPC Amazon подключаться безопасно к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас настроен клиент/сервер, где вы хотите разрешить одному или нескольким потребительским VPC односторонний доступ к определенной службе или набору экземпляров в VPC поставщика услуг. Только клиенты в потребительском VPC могут инициировать соединение со службой в VPC поставщика услуг.

Для этого настройте группы безопасности AWS, чтобы разрешить соединения от ClickHouse Cloud к вашей внутренней/частной сервису базы данных. Проверьте [IP-адреса по умолчанию для исходящих соединений для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), вместе с [доступными статическими IP-адресами](https://api.clickhouse.cloud/static-ips.json).
