---
title: 'Настройка частной сети'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: 'Настройка частной сети'
keywords: ['BYOC', 'облако', 'bring your own cloud', 'vpc peering', 'privatelink']
description: 'Развертывание ClickHouse в вашей собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

ClickHouse BYOC поддерживает различные варианты частного сетевого взаимодействия для повышения безопасности и обеспечения прямого подключения ваших сервисов. В этом руководстве рассматриваются рекомендуемые подходы к безопасному подключению развертываний ClickHouse Cloud в вашей собственной учетной записи AWS или GCP к другим сетям или сервисам, таким как внутренние приложения или аналитические инструменты. Мы рассматриваем варианты, такие как VPC Peering, AWS PrivateLink и GCP Private Service Connect, и описываем основные шаги и ключевые особенности для каждого из них.

Если вам требуется частное сетевое подключение к вашему развертыванию ClickHouse BYOC, выполните шаги из этого руководства или обратитесь в службу поддержки ClickHouse за помощью в более сложных сценариях.


## Настройка VPC Peering (AWS) \{#aws-vpc-peering\}

Чтобы создать или удалить VPC peering для ClickHouse BYOC, выполните следующие шаги:

<VerticalStepper headerLevel="h3">

### Включите частный балансировщик нагрузки для ClickHouse BYOC \{#step-1-enable-private-load-balancer-for-clickhouse-byoc\}
Свяжитесь со службой поддержки ClickHouse, чтобы включить Private Load Balancer.

### Создайте peering-подключение \{#step-2-create-a-peering-connection\}
1. Перейдите в VPC Dashboard в аккаунте ClickHouse BYOC.
2. Выберите Peering Connections.
3. Нажмите Create Peering Connection.
4. Установите VPC Requester в значение ClickHouse VPC ID.
5. Установите VPC Accepter в значение целевого VPC ID (при необходимости выберите другой аккаунт).
6. Нажмите Create Peering Connection.

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Создание Peering Connection" border />

### Примите запрос на peering-подключение \{#step-3-accept-the-peering-connection-request\}
В аккаунте, с которым настраивается peering, на странице (VPC -> Peering connections -> Actions -> Accept request) клиент может одобрить этот запрос VPC peering.

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Принятие Peering Connection" border />

### Добавьте пункт назначения в таблицы маршрутизации ClickHouse VPC \{#step-4-add-destination-to-clickhouse-vpc-route-tables\}
В аккаунте ClickHouse BYOC:
1. Выберите Route Tables в VPC Dashboard.
2. Найдите ClickHouse VPC ID. Отредактируйте каждую таблицу маршрутизации, связанную с приватными подсетями.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. Введите CIDR-диапазон целевого VPC в поле Destination.
6. Выберите “Peering Connection” и ID peering-подключения в поле Target.

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Добавление таблицы маршрутизации" border />

### Добавьте пункт назначения в таблицы маршрутизации целевого VPC \{#step-5-add-destination-to-the-target-vpc-route-tables\}
В AWS-аккаунте, с которым настроен peering:
1. Выберите Route Tables в VPC Dashboard.
2. Найдите целевой VPC ID.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. Введите CIDR-диапазон ClickHouse VPC в поле Destination.
6. Выберите “Peering Connection” и ID peering-подключения в поле Target.

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Добавление таблицы маршрутизации" border />

### Измените security group, чтобы разрешить доступ из peered VPC \{#step-6-edit-security-group-to-allow-peered-vpc-access\}

В аккаунте ClickHouse BYOC необходимо обновить настройки Security Group, чтобы разрешить трафик из вашей peered VPC. Свяжитесь со службой поддержки ClickHouse, чтобы запросить добавление входящих правил (inbound rules), включающих CIDR-диапазоны вашей peered VPC.

---
Сервис ClickHouse теперь должен быть доступен из peered VPC.
</VerticalStepper>

Для приватного доступа к ClickHouse создаются частный балансировщик нагрузки и endpoint для безопасного подключения из peered VPC пользователя. Частный endpoint следует формату публичного endpoint с суффиксом `-private`. Например:

- **Публичный endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Частный endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Дополнительно, после проверки работоспособности peering вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Настройка PrivateLink (AWS) \{#setup-privatelink\}

AWS PrivateLink обеспечивает безопасное, частное подключение к вашим BYOC-сервисам ClickHouse без необходимости использования пиринга VPC или интернет-шлюзов. Трафик полностью проходит внутри сети AWS и никогда не выходит в публичный интернет.

<VerticalStepper headerLevel="h3">

### Запрос настройки PrivateLink \{#step-1-request-privatelink-setup\}

Свяжитесь с [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud), чтобы запросить настройку PrivateLink для вашего BYOC-развертывания. На этом этапе не требуется никакая специальная информация — просто укажите, что вы хотите настроить подключение через PrivateLink.

ClickHouse Support настроит необходимые инфраструктурные компоненты, включая **приватный балансировщик нагрузки** и **конечную точку сервиса PrivateLink**.

### Создание конечной точки в вашем VPC \{#step-2-create-endpoint\}

После того как ClickHouse Support включит PrivateLink со своей стороны, вам нужно создать VPC endpoint (конечную точку VPC) в VPC клиентского приложения для подключения к сервису ClickHouse PrivateLink.

1. **Получите имя Endpoint Service**:
   - ClickHouse Support предоставит вам имя Endpoint Service
   - Вы также можете найти его в консоли AWS VPC в разделе "Endpoint Services" (отфильтруйте по имени сервиса или найдите сервисы ClickHouse)

<Image img={byoc_privatelink_1} size="lg" alt="Конечная точка сервиса BYOC PrivateLink" border />

2. **Создайте VPC Endpoint**:
   - Перейдите в AWS VPC Console → Endpoints → Create Endpoint
   - Выберите "Find service by name" и введите имя Endpoint Service, предоставленное ClickHouse Support
   - Выберите ваш VPC и нужные подсети (рекомендуется по одной на зону доступности)
   - **Важно**: Включите "Private DNS names" для этой конечной точки — это необходимо для корректной работы DNS-разрешения
   - Выберите или создайте security group для конечной точки
   - Нажмите "Create Endpoint"

:::important
**Требования к DNS**: 
- Включите "Private DNS names" при создании VPC endpoint
- Убедитесь, что в вашем VPC включены "DNS Hostnames" (VPC Settings → DNS resolution and DNS hostnames)

Эти настройки необходимы для корректной работы DNS для PrivateLink.
:::

3. **Одобрите подключение конечной точки**:
   - После создания конечной точки вам нужно одобрить запрос на подключение
   - В консоли VPC перейдите в раздел "Endpoint Connections"
   - Найдите запрос на подключение от ClickHouse и нажмите "Accept", чтобы одобрить его

<Image img={byoc_privatelink_2} size="lg" alt="Одобрение BYOC PrivateLink" border />

### Добавьте Endpoint ID в allowlist сервиса \{#step-3-add-endpoint-id-allowlist\}

После того как конечная точка VPC создана и подключение одобрено, необходимо добавить Endpoint ID в allowlist для каждого сервиса ClickHouse, к которому вы хотите получать доступ через PrivateLink.

1. **Получите ваш Endpoint ID**:
   - В консоли AWS VPC перейдите в раздел Endpoints
   - Выберите только что созданную конечную точку
   - Скопируйте Endpoint ID (он будет выглядеть как `vpce-xxxxxxxxxxxxxxxxx`)

2. **Свяжитесь с ClickHouse Support**:
   - Передайте Endpoint ID(ы) в ClickHouse Support
   - Уточните, какие сервисы ClickHouse должны разрешать доступ с этой конечной точки
   - ClickHouse Support добавит Endpoint ID в allowlist сервиса

### Подключение к ClickHouse через PrivateLink \{#step-4-connect-via-privatelink\}

После добавления Endpoint ID в allowlist вы можете подключаться к вашему сервису ClickHouse, используя конечную точку PrivateLink.

Формат конечной точки PrivateLink похож на публичную конечную точку, но включает поддомен `vpce`. Например:

- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **Конечная точка PrivateLink**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

DNS-разрешение в вашем VPC будет автоматически направлять трафик через конечную точку PrivateLink, когда вы используете формат с поддоменом `vpce`.

</VerticalStepper>

### Контроль доступа PrivateLink \{#privatelink-access-control\}

Доступ к сервисам ClickHouse через PrivateLink контролируется на двух уровнях:

1. **Политика авторизации Istio**: политики авторизации ClickHouse Cloud на уровне сервиса
2. **Группа безопасности VPC endpoint**: группа безопасности, привязанная к вашему VPC endpoint, определяет, какие ресурсы в вашем VPC могут использовать этот endpoint

:::note
Функция приватного балансировщика нагрузки «Enforce inbound rules on PrivateLink traffic» отключена, поэтому доступ контролируется только политиками авторизации Istio и группой безопасности вашего VPC endpoint.
:::

### PrivateLink DNS \{#privatelink-dns\}

PrivateLink DNS для BYOC-эндпоинтов (использующих формат `*.vpce.{subdomain}`) использует встроенную в AWS PrivateLink функцию Private DNS names. Записи Route53 не требуются — разрешение DNS выполняется автоматически, когда:

- Private DNS names включена для вашего VPC endpoint
- В вашем VPC включена опция DNS Hostnames

Это гарантирует, что подключения, использующие поддомен `vpce`, автоматически направляются через PrivateLink endpoint без необходимости дополнительной конфигурации DNS.

## VPC Peering (GCP) и Private Service Connect (GCP) \{#setup-gcp\}

GCP VPC Peering и Private Service Connect обеспечивают аналогичное приватное сетевое подключение для развертываний BYOC в GCP. Эта функция находится в разработке. Если вам требуется VPC Peering или Private Service Connect для вашего развертывания BYOC в GCP, пожалуйста, [свяжитесь со службой поддержки ClickHouse](https://clickhouse.com/cloud/bring-your-own-cloud), чтобы обсудить доступность и требования к настройке.