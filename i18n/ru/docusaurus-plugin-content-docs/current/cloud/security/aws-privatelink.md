---
title: 'AWS PrivateLink'
description: 'Этот документ описывает, как подключиться к ClickHouse Cloud с использованием AWS PrivateLink.'
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

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установления безопасного соединения между VPC, сервисами AWS, вашими локальными системами и ClickHouse Cloud без выставления трафика в общественный Интернет. Этот документ описывает шаги для подключения к ClickHouse Cloud с использованием AWS PrivateLink.

Чтобы ограничить доступ к вашим сервисам ClickHouse Cloud исключительно через адреса AWS PrivateLink, следуйте инструкциям, предоставленным ClickHouse Cloud [IP Access Lists](/cloud/security/setting-ip-filters).

:::note
ClickHouse Cloud в настоящее время поддерживает [кросс-региональный PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) в бета-версии.
:::

**Пожалуйста, выполните следующее для включения AWS PrivateLink**:
1. Получите "Имя сервиса" для конечной точки.
1. Создайте конечную точку AWS.
1. Добавьте "Идентификатор конечной точки" в организацию ClickHouse Cloud.
1. Добавьте "Идентификатор конечной точки" в список разрешений сервиса ClickHouse.

Найдите примеры Terraform [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Внимание {#attention}
ClickHouse пытается сгруппировать ваши сервисы, чтобы повторно использовать одну и ту же опубликованную [конечную точку сервиса](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) в рамках региона AWS. Тем не менее, эта группировка не гарантируется, особенно если вы распределяете свои сервисы по нескольким организациям ClickHouse. Если у вас уже настроен PrivateLink для других сервисов в вашей организации ClickHouse, вы можете обычно пропустить большинство шагов из-за этой группировки и перейти прямо к последнему шагу: [Добавить "Идентификатор конечной точки" ClickHouse в список разрешенных сервисов](#add-endpoint-id-to-services-allow-list).

## Предварительные условия {#prerequisites}

Прежде чем начать, вам понадобится:

1. Ваш аккаунт AWS.
1. [Ключ API ClickHouse](/cloud/manage/openapi) с необходимыми разрешениями для создания и управления частными конечными точками на стороне ClickHouse.

## Шаги {#steps}

Следуйте этим шагам, чтобы подключить ваши сервисы ClickHouse Cloud через AWS PrivateLink.

### Получить "Имя сервиса" для конечной точки {#obtain-endpoint-service-info}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в меню **Настройки**.

<Image img={aws_private_link_pecreate} size="md" alt="Частные конечные точки" border />

Запомните `Имя сервиса` и `DNS имя`, затем [перейдите к следующему шагу](#create-aws-endpoint).

#### Вариант 2: API {#option-2-api}

Сначала установите следующие переменные окружения перед выполнением любых команд:

```shell
REGION=<Ваш код региона, использующий формат AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ID ключа ClickHouse>
KEY_SECRET=<Ваш секретный ключ ClickHouse>
ORG_ID=<Ваш ID организации ClickHouse>
SERVICE_NAME=<Ваше имя сервиса ClickHouse>
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

Запомните `endpointServiceId` и `privateDnsHostname`, [перейдите к следующему шагу](#create-aws-endpoint).

### Создайте конечную точку AWS {#create-aws-endpoint}

:::important
Этот раздел охватывает детали, специфичные для ClickHouse, для настройки ClickHouse через AWS PrivateLink. Шаги, специфические для AWS, предоставлены в качестве ссылки на то, где искать, но они могут изменяться с течением времени без уведомления со стороны облачного провайдера AWS. Пожалуйста, учитывайте конфигурацию AWS в зависимости от вашего конкретного случая использования.

Пожалуйста, обратите внимание, что ClickHouse не несет ответственности за конфигурацию необходимых конечных точек AWS VPC, правил групп безопасности или DNS записей.

Если вы ранее включили "частные DNS-имена" во время настройки PrivateLink и испытываете трудности с настройкой новых сервисов через PrivateLink, обратитесь в службу поддержки ClickHouse. Для любых других проблем, связанных с задачами конфигурации AWS, свяжитесь напрямую с поддержкой AWS.
:::

#### Вариант 1: Консоль AWS {#option-1-aws-console}

Откройте консоль AWS и перейдите в **VPC** → **Конечные точки** → **Создать конечные точки**.

Выберите **Службы конечных точек, использующие NLB и GWLB** и используйте `Имя сервиса`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получить "Имя сервиса" для конечной точки](#obtain-endpoint-service-info), в поле **Имя сервиса**. Нажмите **Проверить сервис**:

<Image img={aws_private_link_endpoint_settings} size="md" alt="Настройки конечной точки AWS PrivateLink" border/>

Если вы хотите установить кросс-региональное соединение через PrivateLink, включите чекбокс "Кросс-региональная конечная точка" и укажите регион сервиса. Регион сервиса — это место, где работает экземпляр ClickHouse.

Если вы получите ошибку "Имя сервиса не может быть проверено", пожалуйста, свяжитесь с поддержкой клиентов, чтобы запросить добавление новых регионов в список поддерживаемых регионов.

Затем выберите ваш VPC и подсети:

<Image img={aws_private_link_select_vpc} size="md" alt="Выбрать VPC и подсети" border />

В качестве необязательного шага назначьте группы безопасности/теги:

:::note
Убедитесь, что порты `443`, `8443`, `9440`, `3306` разрешены в группе безопасности.
:::

После создания VPC конечной точки запишите значение `Идентификатора конечной точки`; оно понадобится вам для следующего шага.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="ID конечной точки VPC" border/>

#### Вариант 2: AWS CloudFormation {#option-2-aws-cloudformation}

Затем вы должны создать VPC конечную точку, используя `Имя сервиса`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получить "Имя сервиса" для конечной точки](#obtain-endpoint-service-info). Убедитесь, что вы используете правильные ID подсетей, группы безопасности и ID VPC.

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Имя сервиса(endpointServiceId), см. выше>
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

После создания VPC конечной точки запишите значение `Идентификатора конечной точки`; оно понадобится вам для следующего шага.

#### Вариант 3: Terraform {#option-3-terraform}

`service_name` ниже это `Имя сервиса`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получить "Имя сервиса" для конечной точки](#obtain-endpoint-service-info).

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<а пожалуйста, смотрите комментарий выше>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Необязательно) Если указано, конечная точка VPC будет подключаться к сервису в указанном регионе. Определите его для много-региональных подключений PrivateLink."
}
```

После создания VPC конечной точки запишите значение `Идентификатора конечной точки`; оно понадобится вам для следующего шага.

#### Установите частное DNS имя для конечной точки {#set-private-dns-name-for-endpoint}

:::note
Существует несколько способов конфигурации DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вам нужно указывать "DNS имя", взятое на шаге [Получить "Имя сервиса" для конечной точки](#obtain-endpoint-service-info), на сетевые интерфейсы конечной точки AWS. Это обеспечит, что сервисы/компоненты в вашем VPC/Сети смогут разрешить его корректно.

### Добавьте Идентификатор конечной точки в организацию ClickHouse Cloud {#add-endpoint-id-to-clickhouse-cloud-organization}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-1}

Чтобы добавить конечную точку в организацию, перейдите к шагу [Добавить идентификатор конечной точки в список разрешенных сервисов](#add-endpoint-id-to-services-allow-list). Добавление `Идентификатора конечной точки` через консоль ClickHouse Cloud в список разрешенных сервисов автоматически добавляет его в организацию.

Чтобы удалить конечную точку, откройте **Детали организации -> Частные конечные точки** и нажмите кнопку удаления, чтобы удалить конечную точку.

<Image img={pe_remove_private_endpoint} size="md" alt="Удалить частную конечную точку" border/>

#### Вариант 2: API {#option-2-api-1}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<Ваш код региона, использующий формат AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ID ключа ClickHouse>
KEY_SECRET=<Ваш секретный ключ ClickHouse>
ORG_ID=<Ваш ID организации ClickHouse>
SERVICE_NAME=<Ваше имя сервиса ClickHouse>
```

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создать конечную точку AWS](#create-aws-endpoint).

Чтобы добавить конечную точку, выполните:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "description": "Частная конечная точка AWS",
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

### Добавьте "Идентификатор конечной точки" в список разрешенных сервисов ClickHouse {#add-endpoint-id-to-services-allow-list}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

Чтобы добавить, пожалуйста, перейдите к консоли ClickHouse Cloud, откройте сервис, который вы хотите подключить через PrivateLink, а затем перейдите в **Настройки**. Введите `Идентификатор конечной точки`, полученный на шаге [Создать конечную точку AWS](#create-aws-endpoint). Нажмите "Создать конечную точку".

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню существующей конечной точки.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Фильтр частных конечных точек" border/>

Чтобы удалить, пожалуйста, перейдите в консоль ClickHouse Cloud, найдите сервис, а затем перейдите в **Настройки** сервиса, найдите конечную точку, которую вы хотите удалить. Удалите её из списка конечных точек.

#### Вариант 2: API {#option-2-api-2}

Вам нужно добавить Идентификатор конечной точки в разрешенный список для каждого экземпляра, который должен быть доступен через PrivateLink.

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создать конечную точку AWS](#create-aws-endpoint).

Установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<Ваш код региона, использующий формат AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ID ключа ClickHouse>
KEY_SECRET=<Ваш секретный ключ ClickHouse>
ORG_ID=<Ваш ID организации ClickHouse>
SERVICE_NAME=<Ваше имя сервиса ClickHouse>
```

Чтобы добавить идентификатор конечной точки в разрешенный список:

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

Чтобы удалить идентификатор конечной точки из разрешенного списка:

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

Каждый сервис с включённым Private Link имеет публичную и частную конечную точку. Чтобы подключиться с помощью Private Link, вам нужно использовать частную конечную точку, которая будет `privateDnsHostname`<sup>API</sup> или `DNS имя`<sup>консоль</sup>, взятое из [Получить "Имя сервиса" для конечной точки](#obtain-endpoint-service-info).

#### Получение частного DNS имени {#getting-private-dns-hostname}

##### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите к **Настройки**. Нажмите на кнопку **Настроить частную конечную точку**. В открывшемся боковом меню скопируйте **DNS имя**.

<Image img={aws_private_link_ped_nsname} size="md" alt="DNS имя частной конечной точки" border />

##### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Ваш ID ключа ClickHouse>
KEY_SECRET=<Ваш секретный ключ ClickHouse>
ORG_ID=<Ваш ID организации ClickHouse>
INSTANCE_ID=<Ваше имя сервиса ClickHouse>
```

Вы можете получить `INSTANCE_ID` из [шага](#option-2-api).

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

Это должно выводить что-то вроде:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

В этом примере соединение через значение имени хоста `privateDnsHostname` будет маршрутизироваться в PrivateLink, но соединение через имя хоста `endpointServiceId` будет проходить через Интернет.

## Устранение неполадок {#troubleshooting}

### Несколько PrivateLink в одном регионе {#multiple-privatelinks-in-one-region}

В большинстве случаев вам нужно создать единую конечную точку сервиса для каждого VPC. Эта конечная точка может маршрутизировать запросы из VPC к нескольким сервисам ClickHouse Cloud. Пожалуйста, обратитесь [здесь](#attention).

### Таймаут подключения к частной конечной точке {#connection-to-private-endpoint-timed-out}

- Пожалуйста, прикрепите группу безопасности к VPC конечной точке.
- Пожалуйста, проверьте `inbound` правила на группе безопасности, прикрепленной к конечной точке, и разрешите порты ClickHouse.
- Пожалуйста, проверьте `outbound` правила на группе безопасности, прикрепленной к ВМ, которая используется для теста подключения, и разрешите соединения с портами ClickHouse.

### Частное имя хоста: Адрес хоста не найден {#private-hostname-not-found-address-of-host}

- Пожалуйста, проверьте вашу конфигурацию DNS.

### Сброс подключения со стороны собеседника {#connection-reset-by-peer}

- Скорее всего, Идентификатор конечной точки не был добавлен в список разрешенных сервисов, пожалуйста, посетите [шаг](#add-endpoint-id-to-services-allow-list).

### Проверка фильтров конечной точки {#checking-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<ID ключа>
KEY_SECRET=<Секретный ключ>
ORG_ID=<пожалуйста, укажите ID организации ClickHouse>
INSTANCE_ID=<ID экземпляра>
```

Вы можете получить `INSTANCE_ID` из [шага](#option-2-api).

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### Подключение к удаленной базе данных {#connecting-to-a-remote-database}

Предположим, вы пытаетесь использовать [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) табличные функции в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в VPC Amazon Web Services (AWS). AWS PrivateLink не может быть использован для безопасного включения этого соединения. PrivateLink — это одностороннее, унидициональное соединение. Оно позволяет вашей внутренней сети или Amazon VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашей внутренней сети.

Согласно [документации AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас настроен клиент/сервер, в котором вы хотите разрешить одному или нескольким VPC потребителей односторонний доступ к конкретному сервису или набору экземпляров в VPC провайдера сервиса. Только клиенты в потребительском VPC могут инициировать соединение с сервисом в VPC провайдера сервиса.

Для этого настройте ваши группы безопасности AWS, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Проверьте [IP-адреса по умолчанию для региона ClickHouse Cloud](/manage/security/cloud-endpoints-api), а также [доступные статические IP-адреса](https://api.clickhouse.cloud/static-ips.json).
