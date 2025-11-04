---
'title': 'AWS PrivateLink'
'description': 'Этот документ описывает, как подключиться к ClickHouse Cloud с помощью
  AWS PrivateLink.'
'slug': '/manage/security/aws-privatelink'
'doc_type': 'guide'
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

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установления безопасного соединения между VPC, AWS сервисами, вашими локальными системами и ClickHouse Cloud без раскрытия трафика в публичный Интернет. Этот документ описывает шаги для подключения к ClickHouse Cloud с использованием AWS PrivateLink.

Чтобы ограничить доступ к вашим услугам ClickHouse Cloud исключительно через адреса AWS PrivateLink, следуйте инструкциям, предоставленным ClickHouse Cloud [IP Access Lists](/cloud/security/setting-ip-filters).

:::note
ClickHouse Cloud поддерживает [cross-region PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) из следующих регионов:
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
Учитывайте, что AWS будет взимать плату с пользователей за трансфер данных между регионами, см. цены [здесь](https://aws.amazon.com/privatelink/pricing/).
:::

**Пожалуйста, выполните следующее, чтобы включить AWS PrivateLink**:
1. Получите "Service name" для конечной точки.
1. Создайте конечную точку AWS.
1. Добавьте "Endpoint ID" в организацию ClickHouse Cloud.
1. Добавьте "Endpoint ID" в список разрешённых сервисов ClickHouse.

Найдите примеры Terraform [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Важные соображения {#considerations}
ClickHouse пытается группировать ваши сервисы, чтобы повторно использовать одну и ту же опубликованную [конечную точку сервиса](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) в пределах региона AWS. Однако такая группировка не гарантируется, особенно если вы распределяете свои сервисы по нескольким организациям ClickHouse. Если у вас уже настроен PrivateLink для других сервисов в вашей организации ClickHouse, вы часто можете пропустить большинство шагов из-за этой группировки и перейти непосредственно к последнему шагу: добавить "Endpoint ID" ClickHouse в список разрешённых сервисов ClickHouse.

## Предварительные требования для этого процесса {#prerequisites}

Перед началом вам потребуется:

1. Ваша учетная запись AWS.
1. [API-ключ ClickHouse](/cloud/manage/openapi) с необходимыми разрешениями для создания и управления частными конечными точками на стороне ClickHouse.

## Шаги {#steps}

Следуйте этим шагам, чтобы подключить ваши сервисы ClickHouse Cloud через AWS PrivateLink.

### Получите "Service name" конечной точки  {#obtain-endpoint-service-info}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в меню **Настройки**.

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

Запишите `Service name` и `DNS name`, затем [перейдите к следующему шагу](#create-aws-endpoint).

#### Вариант 2: API {#option-2-api}

Сначала установите следующие переменные окружения перед выполнением любых команд:

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Получите `INSTANCE_ID` вашего ClickHouse, отфильтровав по региону, провайдеру и имени сервиса:

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

### Создайте конечную точку AWS {#create-aws-endpoint}

:::important
Этот раздел охватывает специфические для ClickHouse детали конфигурации ClickHouse через AWS PrivateLink. Шаги, специфичные для AWS, предоставляются как справка, чтобы направить вас, но они могут со временем измениться без предварительного уведомления от поставщика облачных услуг AWS. Пожалуйста, учитывайте конфигурацию AWS в зависимости от вашего конкретного случая использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых конечных точек VPC AWS, правил групп безопасности или DNS записей.

Если вы ранее включили "private DNS names" при настройке PrivateLink и испытываете трудности с настройкой новых сервисов через PrivateLink, пожалуйста, свяжитесь со службой поддержки ClickHouse. Для любых других проблем, связанных с задачами настройки AWS, свяжитесь непосредственно со службой поддержки AWS.
:::

#### Вариант 1: Консоль AWS {#option-1-aws-console}

Откройте консоль AWS и перейдите в **VPC** → **Конечные точки** → **Создать конечные точки**.

Выберите **Endpoint services that use NLBs and GWLBs** и используйте `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите "Service name" конечной точки](#obtain-endpoint-service-info), в поле **Service Name**. Нажмите **Проверить сервис**:

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>

Если вы хотите установить межрегиональное соединение через PrivateLink, включите флажок "Cross region endpoint" и укажите регион сервиса. Регион сервиса - это местонахождение экземпляра ClickHouse.

Если вы получите ошибку "Service name could not be verified.", пожалуйста, свяжитесь с поддержкой клиентов, чтобы запросить добавление новых регионов в список поддерживаемых регионов.

Далее выберите ваш VPC и подсети:

<Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />

В качестве необязательного шага назначьте группы безопасности/Теги:

:::note
Убедитесь, что порты `443`, `8443`, `9440`, `3306` разрешены в группе безопасности.
:::

После создания конечной точки VPC запишите значение `Endpoint ID`; оно вам понадобится для следующего шага.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### Вариант 2: AWS CloudFormation {#option-2-aws-cloudformation}

Далее вам нужно создать конечную точку VPC, используя `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите "Service name" конечной точки](#obtain-endpoint-service-info).
Убедитесь, что используются правильные идентификаторы подсетей, группы безопасности и идентификатор VPC.

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

После создания конечной точки VPC запишите значение `Endpoint ID`; оно вам понадобится для следующего шага.

#### Вариант 3: Terraform {#option-3-terraform}

`service_name` ниже это `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите "Service name" конечной точки](#obtain-endpoint-service-info)

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

После создания конечной точки VPC запишите значение `Endpoint ID`; оно вам понадобится для следующего шага.

#### Установите приватное DNS имя для конечной точки {#set-private-dns-name-for-endpoint}

:::note
Существует множество способов настроить DNS. Пожалуйста, настройте DNS в зависимости от вашего конкретного случая использования.
:::

Вам нужно указать "DNS name", полученное на шаге [Получите "Service name" конечной точки](#obtain-endpoint-service-info), на сетевые интерфейсы конечной точки AWS. Это гарантирует, что сервисы/компоненты внутри вашего VPC/Сети могут правильно его разрешать.

### Добавьте "Endpoint ID" в список разрешённых сервисов ClickHouse {#add-endpoint-id-to-services-allow-list}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

Чтобы добавить, пожалуйста, перейдите в консоль ClickHouse Cloud, откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в **Настройки**. Нажмите **Настроить частную конечную точку**, чтобы открыть настройки частных конечных точек. Введите `Endpoint ID`, полученный на шаге [Создайте конечную точку AWS](#create-aws-endpoint). Нажмите "Создать конечную точку".

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню существующей конечной точки.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

Чтобы удалить, пожалуйста, перейдите в консоль ClickHouse Cloud, найдите сервис, затем перейдите в **Настройки** сервиса, найдите конечную точку, которую вы хотите удалить. Удалите её из списка конечных точек.

#### Вариант 2: API {#option-2-api-2}

Вам нужно добавить идентификатор конечной точки в разрешённый список для каждого экземпляра, который должен быть доступен через PrivateLink.

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создайте конечную точку AWS](#create-aws-endpoint).

Установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Чтобы добавить идентификатор конечной точки в разрешённый список:

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

Чтобы удалить идентификатор конечной точки из разрешённого списка:

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

Каждая служба с включенным PrivateLink имеет общественную и частную конечные точки. Чтобы подключиться с использованием PrivateLink, вам нужно использовать частную конечную точку, которая будет `privateDnsHostname`<sup>API</sup> или `DNS Name`<sup>консоль</sup>, взятое из [Получите "Service name"](#obtain-endpoint-service-info).

#### Получение частого DNS имени {#getting-private-dns-hostname}

##### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. В открывшемся окне скопируйте **DNS Name**.

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

##### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

Вы можете получить `INSTANCE_ID` из [шага](#option-2-api).

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

В этом примере соединение через значение имени хоста `privateDnsHostname` будет направлено в PrivateLink, но соединение через имя хоста `endpointServiceId` будет направлено через Интернет.

## Устранение неполадок {#troubleshooting}

### Несколько PrivateLink в одном регионе {#multiple-privatelinks-in-one-region}

В большинстве случаев вам нужно создать только одну конечную точку сервиса для каждого VPC. Эта конечная точка может направлять запросы из VPC в несколько сервисов ClickHouse Cloud. Пожалуйста, обратитесь [здесь](#considerations)

### Тайм-аут соединения с частной конечной точкой {#connection-to-private-endpoint-timed-out}

- Пожалуйста, прикрепите группу безопасности к конечной точке VPC.
- Пожалуйста, проверьте правила `inbound` на группе безопасности, прикрепленной к конечной точке, и разрешите порты ClickHouse.
- Пожалуйста, проверьте правила `outbound` на группе безопасности, прикрепленной к виртуальной машине, используемой для проверки подключения, и разрешите подключения к портам ClickHouse.

### Частное имя хоста: адрес хоста не найден {#private-hostname-not-found-address-of-host}

- Пожалуйста, проверьте вашу конфигурацию DNS.

### Сброс соединения со стороны соперника {#connection-reset-by-peer}

- Скорее всего, идентификатор конечной точки не был добавлен в список разрешённых сервисов, пожалуйста, перейдите к [шагу](#add-endpoint-id-to-services-allow-list)

### Проверка фильтров конечной точки {#checking-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Вы можете получить `INSTANCE_ID` из [шага](#option-2-api).

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать [MySQL](/sql-reference/table-functions/mysql) или [PostgreSQL](/sql-reference/table-functions/postgresql) табличные функции в ClickHouse Cloud и подключиться к своей базе данных, размещённой в VPC Amazon Web Services (AWS). AWS PrivateLink не может быть использован для безопасного включения этого соединения. PrivateLink представляет собой одностороннее, унидирекционное соединение. Оно позволяет вашей внутренней сети или Amazon VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас настроена клиентская/серверная архитектура, где вы хотите разрешить один или несколько VPC потребителей односторонний доступ к конкретному сервису или набору экземпляров в VPC поставщика сервиса. Только клиенты в VPC потребителе могут инициировать соединение с сервисом в VPC поставщика сервиса.

Для этого настройте ваши группы безопасности AWS, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Проверьте [стандартные IP-адреса для выхода для регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).