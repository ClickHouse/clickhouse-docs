---
title: 'AWS PrivateLink'
description: 'В этом документе описывается, как подключиться к ClickHouse Cloud с помощью AWS PrivateLink.'
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


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установления защищённого соединения между VPC, сервисами AWS, вашими локальными системами и ClickHouse Cloud без вывода трафика в публичный интернет. В этом документе описаны шаги по подключению к ClickHouse Cloud с помощью AWS PrivateLink.

Чтобы ограничить доступ к вашим сервисам ClickHouse Cloud исключительно через адреса AWS PrivateLink, следуйте инструкциям ClickHouse Cloud по настройке [IP Access Lists](/cloud/security/setting-ip-filters).

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
Особенности тарификации: AWS взимает плату за межрегиональную передачу данных, см. цены [здесь](https://aws.amazon.com/privatelink/pricing/).
:::

**Выполните следующие действия, чтобы включить AWS PrivateLink**:
1. Получите Service name конечной точки.
1. Создайте AWS Endpoint.
1. Добавьте Endpoint ID в организацию ClickHouse Cloud.
1. Добавьте Endpoint ID в allow list сервиса ClickHouse.

Примеры Terraform можно найти [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).



## Важные замечания {#considerations}

ClickHouse пытается группировать ваши сервисы для повторного использования одной и той же опубликованной [конечной точки сервиса](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) в пределах региона AWS. Однако такая группировка не гарантируется, особенно если вы распределяете свои сервисы между несколькими организациями ClickHouse.
Если у вас уже настроен PrivateLink для других сервисов в вашей организации ClickHouse, вы часто можете пропустить большинство шагов благодаря этой группировке и перейти непосредственно к последнему шагу: добавить идентификатор конечной точки ClickHouse (Endpoint ID) в список разрешённых для сервиса ClickHouse.


## Предварительные требования {#prerequisites}

Перед началом работы вам потребуется:

1. Учетная запись AWS.
1. [API-ключ ClickHouse](/cloud/manage/openapi) с необходимыми разрешениями для создания и управления частными конечными точками на стороне ClickHouse.


## Шаги {#steps}

Выполните следующие шаги для подключения сервисов ClickHouse Cloud через AWS PrivateLink.

### Получение "Service name" конечной точки {#obtain-endpoint-service-info}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который необходимо подключить через PrivateLink, затем перейдите в меню **Settings**.

<Image
  img={aws_private_link_pecreate}
  size='md'
  alt='Приватные конечные точки'
  border
/>

Запишите значения `Service name` и `DNS name`, затем [переходите к следующему шагу](#create-aws-endpoint).

#### Вариант 2: API {#option-2-api}

Сначала установите следующие переменные окружения перед выполнением команд:

```shell
REGION=<Код вашего региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ClickHouse key ID>
KEY_SECRET=<Ваш ClickHouse key secret>
ORG_ID=<ID вашей организации ClickHouse>
SERVICE_NAME=<Имя вашего сервиса ClickHouse>
```

Получите ваш ClickHouse `INSTANCE_ID`, отфильтровав по региону, провайдеру и имени сервиса:

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

Эта команда должна вернуть примерно следующее:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

Запишите значения `endpointServiceId` и `privateDnsHostname` и [переходите к следующему шагу](#create-aws-endpoint).

### Создание конечной точки AWS {#create-aws-endpoint}

:::important
Этот раздел содержит специфичные для ClickHouse детали настройки ClickHouse через AWS PrivateLink. Шаги, специфичные для AWS, приведены в качестве справочной информации, но они могут измениться со временем без уведомления со стороны облачного провайдера AWS. Учитывайте конфигурацию AWS в соответствии с вашим конкретным сценарием использования.

Обратите внимание, что ClickHouse не несет ответственности за настройку необходимых конечных точек AWS VPC, правил групп безопасности или DNS-записей.

Если вы ранее включили "private DNS names" при настройке PrivateLink и испытываете трудности с настройкой новых сервисов через PrivateLink, обратитесь в службу поддержки ClickHouse. По любым другим вопросам, связанным с задачами конфигурации AWS, обращайтесь напрямую в службу поддержки AWS.
:::

#### Вариант 1: Консоль AWS {#option-1-aws-console}

Откройте консоль AWS и перейдите в **VPC** → **Endpoints** → **Create endpoints**.

Выберите **Endpoint services that use NLBs and GWLBs** и используйте `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, которые вы получили на шаге [Получение "Service name" конечной точки](#obtain-endpoint-service-info), в поле **Service Name**. Нажмите **Verify service**:

<Image
  img={aws_private_link_endpoint_settings}
  size='md'
  alt='Настройки конечной точки AWS PrivateLink'
  border
/>

Если вы хотите установить межрегиональное соединение через PrivateLink, включите флажок "Cross region endpoint" и укажите регион сервиса. Регион сервиса — это место, где работает инстанс ClickHouse.

Если вы получаете ошибку "Service name could not be verified.", обратитесь в службу поддержки клиентов с запросом на добавление новых регионов в список поддерживаемых регионов.

Далее выберите ваш VPC и подсети:

<Image
  img={aws_private_link_select_vpc}
  size='md'
  alt='Выбор VPC и подсетей'
  border
/>

В качестве опционального шага назначьте группы безопасности/теги:

:::note
Убедитесь, что порты `443`, `8443`, `9440`, `3306` разрешены в группе безопасности.
:::

После создания конечной точки VPC запишите значение `Endpoint ID`; оно понадобится вам на следующем шаге.

<Image
  img={aws_private_link_vpc_endpoint_id}
  size='md'
  alt='ID конечной точки VPC'
  border
/>

#### Вариант 2: AWS CloudFormation {#option-2-aws-cloudformation}


Далее необходимо создать VPC Endpoint, используя `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, полученные на шаге [Получение "Service name" конечной точки](#obtain-endpoint-service-info).
Убедитесь, что используете корректные идентификаторы подсетей, группы безопасности и идентификатор VPC.

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId), см. выше>
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

После создания VPC Endpoint запишите значение `Endpoint ID` — оно понадобится на следующем шаге.

#### Вариант 3: Terraform {#option-3-terraform}

Значение `service_name` ниже — это `Service name`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, полученные на шаге [Получение "Service name" конечной точки](#obtain-endpoint-service-info)

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<см. комментарий выше>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Необязательно) Если указано, VPC endpoint будет подключаться к сервису в указанном регионе. Определите это значение для мультирегиональных PrivateLink-соединений."
}
```

После создания VPC Endpoint запишите значение `Endpoint ID` — оно понадобится на следующем шаге.

#### Настройка приватного DNS-имени для конечной точки {#set-private-dns-name-for-endpoint}

:::note
Существуют различные способы настройки DNS. Настройте DNS в соответствии с вашим конкретным сценарием использования.
:::

Необходимо направить "DNS name", полученное на шаге [Получение "Service name" конечной точки](#obtain-endpoint-service-info), на сетевые интерфейсы AWS Endpoint. Это обеспечит корректное разрешение имени сервисами и компонентами внутри вашей VPC/сети.

### Добавление "Endpoint ID" в список разрешённых для сервиса ClickHouse {#add-endpoint-id-to-services-allow-list}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

Для добавления перейдите в консоль ClickHouse Cloud, откройте сервис, который хотите подключить через PrivateLink, затем перейдите в **Settings**. Нажмите **Set up private endpoint**, чтобы открыть настройки приватных конечных точек. Введите `Endpoint ID`, полученный на шаге [Создание AWS Endpoint](#create-aws-endpoint). Нажмите "Create endpoint".

:::note
Если вы хотите разрешить доступ из существующего PrivateLink-соединения, используйте выпадающее меню существующих конечных точек.
:::

<Image
  img={aws_private_link_pe_filters}
  size='md'
  alt='Фильтр приватных конечных точек'
  border
/>

Для удаления перейдите в консоль ClickHouse Cloud, найдите сервис, затем перейдите в **Settings** сервиса, найдите конечную точку, которую хотите удалить. Удалите её из списка конечных точек.

#### Вариант 2: API {#option-2-api-2}

Необходимо добавить Endpoint ID в список разрешённых для каждого экземпляра, который должен быть доступен через PrivateLink.

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создание AWS Endpoint](#create-aws-endpoint).

Установите следующие переменные окружения перед выполнением команд:

```bash
REGION=<Код вашего региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Идентификатор вашего ключа ClickHouse>
KEY_SECRET=<Секрет вашего ключа ClickHouse>
ORG_ID=<Идентификатор вашей организации ClickHouse>
SERVICE_NAME=<Имя вашего сервиса ClickHouse>
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


Чтобы удалить идентификатор конечной точки из списка разрешённых:

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

### Доступ к экземпляру через PrivateLink {#accessing-an-instance-using-privatelink}

Каждый сервис с включённым Private Link имеет публичную и приватную конечную точку. Для подключения через Private Link необходимо использовать приватную конечную точку, которая будет `privateDnsHostname`<sup>API</sup> или `DNS Name`<sup>консоль</sup>, полученная из раздела [Получение "Service name" конечной точки](#obtain-endpoint-service-info).

#### Получение приватного DNS-имени хоста {#getting-private-dns-hostname}

##### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в раздел **Settings**. Нажмите кнопку **Set up private endpoint**. В открывшейся панели скопируйте **DNS Name**.

<Image
  img={aws_private_link_ped_nsname}
  size='md'
  alt='DNS-имя приватной конечной точки'
  border
/>

##### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением команд:

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

Результат должен выглядеть примерно так:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

В этом примере подключение через имя хоста `privateDnsHostname` будет маршрутизироваться через PrivateLink, а подключение через имя хоста `endpointServiceId` будет маршрутизироваться через интернет.


## Устранение неполадок {#troubleshooting}

### Несколько PrivateLink в одном регионе {#multiple-privatelinks-in-one-region}

В большинстве случаев для каждого VPC достаточно создать одну конечную точку сервиса. Эта конечная точка может маршрутизировать запросы из VPC к нескольким сервисам ClickHouse Cloud.
См. [здесь](#considerations)

### Истекло время ожидания подключения к приватной конечной точке {#connection-to-private-endpoint-timed-out}

- Присоедините группу безопасности к конечной точке VPC.
- Проверьте правила `inbound` в группе безопасности, присоединенной к конечной точке, и разрешите порты ClickHouse.
- Проверьте правила `outbound` в группе безопасности, присоединенной к виртуальной машине, которая используется для проверки подключения, и разрешите соединения с портами ClickHouse.

### Приватное имя хоста: адрес хоста не найден {#private-hostname-not-found-address-of-host}

- Проверьте конфигурацию DNS

### Соединение сброшено удаленной стороной {#connection-reset-by-peer}

- Скорее всего, идентификатор конечной точки не был добавлен в список разрешенных сервисов, см. [шаг](#add-endpoint-id-to-services-allow-list)

### Проверка фильтров конечной точки {#checking-endpoint-filters}

Установите следующие переменные окружения перед выполнением команд:

```bash
KEY_ID=<идентификатор ключа>
KEY_SECRET=<секретный ключ>
ORG_ID=<укажите идентификатор организации ClickHouse>
INSTANCE_ID=<идентификатор экземпляра>
```

Вы можете получить `INSTANCE_ID` из [шага](#option-2-api).

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать табличные функции [MySQL](/sql-reference/table-functions/mysql) или [PostgreSQL](/sql-reference/table-functions/postgresql) в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в Amazon Web Services (AWS) VPC. AWS PrivateLink не может быть использован для безопасного установления этого соединения. PrivateLink — это односторонняя, однонаправленная связь. Она позволяет вашей внутренней сети или Amazon VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас есть конфигурация клиент/сервер, в которой вы хотите предоставить одному или нескольким потребительским VPC однонаправленный доступ к определенному сервису или набору экземпляров в VPC поставщика услуг. Только клиенты в потребительском VPC могут инициировать соединение с сервисом в VPC поставщика услуг.

Для этого настройте группы безопасности AWS, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/приватному сервису базы данных. Проверьте [исходящие IP-адреса по умолчанию для регионов ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).
