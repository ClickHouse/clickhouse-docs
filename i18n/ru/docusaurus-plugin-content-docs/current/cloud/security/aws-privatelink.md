---
title: 'AWS PrivateLink'
description: 'Этот документ описывает, как подключиться к ClickHouse Cloud с помощью AWS PrivateLink.'
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

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установки безопасного соединения между VPC, AWS-сервисами, вашими локальными системами и ClickHouse Cloud, не под exposing трафик в интернет. Этот документ описывает шаги для подключения к ClickHouse Cloud с помощью AWS PrivateLink.

Чтобы ограничить доступ к вашим ClickHouse Cloud сервисам исключительно через адреса AWS PrivateLink, следуйте инструкциям, предоставленным ClickHouse Cloud в [IP Access Lists](/cloud/security/setting-ip-filters).

:::note
ClickHouse Cloud в настоящее время поддерживает [кросс-региональный PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) в бета-версии.
:::


**Пожалуйста, выполните следующие шаги для включения AWS PrivateLink**:
1. Получите "Имя сервиса" конечной точки.
1. Создайте конечную точку AWS.
1. Добавьте "ID конечной точки" в организацию ClickHouse Cloud.
1. Добавьте "ID конечной точки" в список разрешённых услуг ClickHouse.


Найдите примеры Terraform [здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).


## Внимание {#attention}
ClickHouse пытается сгруппировать ваши сервисы для повторного использования одной опубликованной [конечной точки сервиса](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) в AWS регионе. Однако эта группировка не гарантируется, особенно если вы распределяете свои сервисы по нескольким организациям ClickHouse.
Если вы уже настроили PrivateLink для других сервисов в вашей организации ClickHouse, вы можете часто пропустить большинство шагов из-за этой группировки и перейти непосредственно к последнему шагу: [Добавьте "ID конечной точки" ClickHouse в список разрешённых услуг ClickHouse](#add-endpoint-id-to-services-allow-list).


## Необходимые условия {#prerequisites}

Перед тем как начать, вам потребуется:

1. Ваша учетная запись AWS.
1. [Ключ API ClickHouse](/cloud/manage/openapi) с необходимыми разрешениями для создания и управления частными конечными точками на стороне ClickHouse.

## Шаги {#steps}

Следуйте этим шагам, чтобы подключить ваши ClickHouse Cloud сервисы через AWS PrivateLink.

### Получите "Имя сервиса" конечной точки  {#obtain-endpoint-service-info}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console}

В консоли ClickHouse Cloud откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в меню **Настройки**.

<Image img={aws_private_link_pecreate} size="md" alt="Частные конечные точки" border />

Запомните `Имя сервиса` и `имя DNS`, затем [перейдите к следующему шагу](#create-aws-endpoint).

#### Вариант 2: API {#option-2-api}

Сначала установите следующие переменные окружения перед выполнением любых команд:

```shell
REGION=<Ваш код региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse секретный ключ>
ORG_ID=<Ваш ClickHouse ID организации>
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

Запомните `endpointServiceId` и `privateDnsHostname`, затем [перейдите к следующему шагу](#create-aws-endpoint).

### Создайте конечную точку AWS {#create-aws-endpoint}

:::important
Этот раздел охватывает специфические детали ClickHouse для настройки ClickHouse через AWS PrivateLink. Специфические шаги AWS предоставляются в качестве справки, чтобы направить вас, куда смотреть, но они могут измениться без предупреждения от поставщика облака AWS. Пожалуйста, рассмотрите конфигурацию AWS в зависимости от вашего конкретного случая использования.

Пожалуйста, обратите внимание, что ClickHouse не отвечает за настройку необходимых AWS VPC конечных точек, правил групп безопасности или DNS записей.

Если вы ранее включили "частные имена DNS" при настройке PrivateLink и испытываете трудности с настройкой новых сервисов через PrivateLink, пожалуйста, свяжитесь с поддержкой ClickHouse. По любым другим вопросам, связанным с задачами конфигурации AWS, обращайтесь непосредственно в поддержку AWS.
:::

#### Вариант 1: Консоль AWS {#option-1-aws-console}

Откройте консоль AWS и перейдите в **VPC** → **Конечные точки** → **Создать конечные точки**.

Выберите **Сервисы конечных точек, использующие NLB и GWLB** и используйте `Имя сервиса`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите "Имя сервиса" конечной точки](#obtain-endpoint-service-info) в поле **Имя сервиса**. Нажмите **Проверить сервис**:

<Image img={aws_private_link_endpoint_settings} size="md" alt="Настройки конечной точки AWS PrivateLink" border/>

Если вы хотите установить кросс-региональное соединение через PrivateLink, включите флажок "Конечная точка кросс-регионального типа" и укажите регион сервиса. Регион сервиса — это тот, в котором работает экземпляр ClickHouse.

Если вы получите ошибку "Имя сервиса не удалось проверить.", обратитесь в службу поддержки клиентов, чтобы запросить добавление новых регионов в список поддерживаемых регионов.

Далее выберите свой VPC и подсети:

<Image img={aws_private_link_select_vpc} size="md" alt="Выберите VPC и подсети" border />

В качестве необязательного шага назначьте Группы безопасности/Теги:

:::note
Убедитесь, что порты `443`, `8443`, `9440`, `3306` разрешены в группе безопасности.
:::

После создания VPC конечной точки запишите значение `ID конечной точки`; оно вам понадобится для следующего шага.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="ID ВPC конечной точки" border/>

#### Вариант 2: AWS CloudFormation {#option-2-aws-cloudformation}

Далее вам нужно создать VPC конечную точку, используя `Имя сервиса`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите "Имя сервиса" конечной точки](#obtain-endpoint-service-info).
Убедитесь, что вы используете правильные идентификаторы подсетей, группы безопасности и идентификатор VPC.

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

После создания VPC конечной точки запишите значение `ID конечной точки`; оно вам понадобится для следующего шага.

#### Вариант 3: Terraform {#option-3-terraform}

`service_name` ниже — это `Имя сервиса`<sup>консоль</sup> или `endpointServiceId`<sup>API</sup>, который вы получили на шаге [Получите "Имя сервиса" конечной точки](#obtain-endpoint-service-info).

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<пожалуйста, смотрите комментарий выше>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Необязательный) Если указан, VPC конечная точка будет подключаться к сервису в указанном регионе. Определите его для мультирегиональных соединений PrivateLink."
}
```

После создания VPC конечной точки запишите значение `ID конечной точки`; оно вам понадобится для следующего шага.

#### Установите частное имя DNS для конечной точки {#set-private-dns-name-for-endpoint}

:::note
Существует несколько способов настроить DNS. Пожалуйста, настройте DNS в соответствии с вашим конкретным случаем использования.
:::

Вам нужно указать "Имя DNS", взятое с шага [Получите "Имя сервиса" конечной точки](#obtain-endpoint-service-info), на сетевые интерфейсы конечной точки AWS. Это обеспечит правильное разрешение для сервисов/компонентов в вашем VPC/Сети.

### Добавьте "ID конечной точки" в список разрешённых услуг ClickHouse {#add-endpoint-id-to-services-allow-list}

#### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-2}

Чтобы добавить, перейдите в консоль ClickHouse Cloud, откройте сервис, который вы хотите подключить через PrivateLink, затем перейдите в **Настройки**. Нажмите **Настроить частную конечную точку**, чтобы открыть настройки частных конечных точек. Введите `ID конечной точки`, полученное на шаге [Создайте конечную точку AWS](#create-aws-endpoint). Нажмите "Создать конечную точку".

:::note
Если вы хотите разрешить доступ из существующего соединения PrivateLink, используйте выпадающее меню для существующей конечной точки.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Фильтр частных конечных точек" border/>

Чтобы удалить, перейдите в консоль ClickHouse Cloud, найдите сервис, затем перейдите в **Настройки** сервиса, найдите конечную точку, которую вы хотите удалить. Удалите её из списка конечных точек.

#### Вариант 2: API {#option-2-api-2}

Вам нужно добавить ID конечной точки в разрешённый список для каждого экземпляра, который должен быть доступен с использованием PrivateLink.

Установите переменную окружения `ENDPOINT_ID`, используя данные из шага [Создайте конечную точку AWS](#create-aws-endpoint).

Установите следующие переменные окружения перед выполнением любых команд:

```bash
REGION=<Ваш код региона в формате AWS, например: us-west-2>
PROVIDER=aws
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse секретный ключ>
ORG_ID=<Ваш ClickHouse ID организации>
SERVICE_NAME=<Ваше имя сервиса ClickHouse>
```

Для добавления ID конечной точки в разрешённый список:

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

Для удаления ID конечной точки из разрешённого списка:

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

Каждый сервис с включенной Private Link имеет публичную и частную конечные точки. Чтобы подключиться с помощью Private Link, вам нужно использовать частную конечную точку, которая будет `privateDnsHostname`<sup>API</sup> или `Имя DNS`<sup>консоль</sup>, взятая из шага [Получите "Имя сервиса" конечной точки](#obtain-endpoint-service-info).


#### Получение частного имени DNS {#getting-private-dns-hostname}

##### Вариант 1: Консоль ClickHouse Cloud {#option-1-clickhouse-cloud-console-3}

В консоли ClickHouse Cloud перейдите в **Настройки**. Нажмите кнопку **Настроить частную конечную точку**. В открывшемся окне скопируйте **Имя DNS**.

<Image img={aws_private_link_ped_nsname} size="md" alt="Имя DNS частной конечной точки" border />

##### Вариант 2: API {#option-2-api-3}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Ваш ClickHouse ключ ID>
KEY_SECRET=<Ваш ClickHouse секретный ключ>
ORG_ID=<Ваш ClickHouse ID организации>
INSTANCE_ID=<Ваше имя сервиса ClickHouse>
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

В этом примере подключение через значение частного имени `privateDnsHostname` будет направлено на PrivateLink, но подключение через имя конечной точки `endpointServiceId` будет направлено через интернет.

## Устранение неполадок {#troubleshooting}

### Несколько PrivateLink в одном регионе {#multiple-privatelinks-in-one-region}

В большинстве случаев вам нужно создать единую конечную точку сервиса для каждого VPC. Эта конечная точка может направлять запросы из VPC к нескольким ClickHouse Cloud сервисам.
Пожалуйста, смотрите [здесь](#attention)

### Истекло время ожидания подключения к частной конечной точке {#connection-to-private-endpoint-timed-out}

- Пожалуйста, прикрепите группу безопасности к VPC конечной точке.
- Пожалуйста, проверьте правила `inbound` в группе безопасности, прикрепленной к конечной точке, и разрешите порты ClickHouse.
- Пожалуйста, проверьте правила `outbound` в группе безопасности, прикрепленной к виртуальной машине, которая используется для тестирования соединяемости, и разрешите соединения с портами ClickHouse.

### Частное имя хоста: адрес хоста не найден {#private-hostname-not-found-address-of-host}

- Пожалуйста, проверьте вашу DNS конфигурацию

### Соединение сброслено пиком {#connection-reset-by-peer}

- Скорее всего, ID конечной точки не был добавлен в список разрешённых услуг, пожалуйста, посетите [шаг](#add-endpoint-id-to-services-allow-list)

### Проверка фильтров конечной точки {#checking-endpoint-filters}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
KEY_ID=<Ключ ID>
KEY_SECRET=<Секретный ключ>
ORG_ID=<пожалуйста, укажите ID вашей организации ClickHouse>
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

Допустим, вы пытаетесь использовать [MySQL](../../sql-reference/table-functions/mysql.md) или [PostgreSQL](../../sql-reference/table-functions/postgresql.md) табличные функции в ClickHouse Cloud и подключиться к вашей базе данных, размещенной в VPC Amazon Web Services (AWS). AWS PrivateLink не может быть использован для безопасного включения этого соединения. PrivateLink — это одностороннее, унидирекциональное соединение. Оно позволяет вашей внутренней сети или Amazon VPC безопасно подключаться к ClickHouse Cloud, но не позволяет ClickHouse Cloud подключаться к вашему внутреннему сетевому окружению.

Согласно документам [AWS PrivateLink](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Используйте AWS PrivateLink, когда у вас настроена клиентская/серверная установка, где вы хотите предоставить одному или нескольким клиентам региона VPC односторонний доступ к определенному сервису или набору экземпляров в VPC поставщика сервиса. Только клиенты в потребительском VPC могут инициировать соединение с сервисом в VPC поставщика сервиса.

Для этого настройте ваши группы безопасности AWS, чтобы разрешить соединения от ClickHouse Cloud к вашему внутреннему/частному сервису базы данных. Проверьте [IP-адреса по умолчанию для выходящего трафика регионов ClickHouse Cloud](/manage/security/cloud-endpoints-api), вместе с [доступными статическими IP-адресами](https://api.clickhouse.cloud/static-ips.json).
