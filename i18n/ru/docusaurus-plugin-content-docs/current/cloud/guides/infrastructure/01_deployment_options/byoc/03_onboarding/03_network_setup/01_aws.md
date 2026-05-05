---
title: 'Настройка частной сети BYOC в AWS'
slug: /cloud/reference/byoc/onboarding/network-aws
sidebar_label: 'Настройка частной сети AWS'
keywords: ['BYOC', 'облако', 'bring your own cloud', 'VPC-пиринг', 'AWS', 'PrivateLink']
description: 'Настройте VPC-пиринг или PrivateLink для BYOC в AWS'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

ClickHouse BYOC в AWS поддерживает два варианта частного подключения: VPC Peering и AWS PrivateLink.

## Предварительные требования \{#common-prerequisites\}

Общие шаги, необходимые как для VPC-пиринга, так и для PrivateLink.

### Чтобы включить частный балансировщик нагрузки для ClickHouse BYOC \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

Обратитесь в ClickHouse Support, чтобы включить частный балансировщик нагрузки.

## Настройка VPC-пиринга \{#aws-vpc-peering\}

Чтобы создать или удалить VPC-пиринг для ClickHouse BYOC, выполните следующие действия:

<VerticalStepper headerLevel="h3">
  ### Создание пирингового соединения \{#step-1-create-a-peering-connection\}

  1. Перейдите в VPC Dashboard в аккаунте ClickHouse BYOC.
  2. Выберите Peering Connections.
  3. Нажмите Create Peering Connection.
  4. В поле VPC Requester укажите идентификатор VPC ClickHouse.
  5. В поле VPC Accepter укажите идентификатор целевой VPC. (При необходимости выберите другой аккаунт)
  6. Нажмите Create Peering Connection.

  <Image img={byoc_vpcpeering} size="lg" alt="BYOC Создание пирингового соединения" border />

  ### Примите запрос на пиринговое соединение \{#step-2-accept-the-peering-connection-request\}

  Перейдите в аккаунт пиринга; на странице (VPC -&gt; Peering connections -&gt; Actions -&gt; Accept request) клиент может одобрить этот запрос на VPC-пиринг.

  <Image img={byoc_vpcpeering2} size="lg" alt="BYOC Принятие пирингового соединения" border />

  ### Добавьте маршрут назначения в таблицы маршрутизации VPC ClickHouse \{#step-3-add-destination-to-clickhouse-vpc-route-tables\}

  В аккаунте ClickHouse BYOC:

  1. Выберите Route Tables в VPC Dashboard.
  2. Найдите идентификатор VPC ClickHouse. Измените каждую таблицу маршрутизации, привязанную к частным подсетям.
  3. Нажмите кнопку Edit на вкладке Routes.
  4. Нажмите Add another route.
  5. Введите диапазон CIDR целевой VPC в поле Destination.
  6. Выберите “Peering Connection” и идентификатор пирингового соединения в поле Target.

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC Добавление таблицы маршрутизации" border />

  ### Добавьте маршрут назначения в таблицы маршрутизации целевой VPC \{#step-4-add-destination-to-the-target-vpc-route-tables\}

  В аккаунте AWS, участвующем в пиринге:

  1. Выберите Route Tables в VPC Dashboard.
  2. Найдите идентификатор целевой VPC.
  3. Нажмите кнопку Edit на вкладке Routes.
  4. Нажмите Add another route.
  5. Введите диапазон CIDR VPC ClickHouse в поле Destination.
  6. Выберите “Peering Connection” и идентификатор пирингового соединения в поле Target.

  <Image img={byoc_vpcpeering4} size="lg" alt="BYOC Добавление таблицы маршрутизации" border />

  ### Измените группу безопасности, чтобы разрешить доступ из пиринговой VPC \{#step-5-edit-security-group-to-allow-peered-vpc-access\}

  В аккаунте ClickHouse BYOC необходимо обновить настройки группы безопасности, чтобы разрешить трафик из вашей пиринговой VPC. Обратитесь в ClickHouse Support, чтобы запросить добавление Inbound rules, включающих диапазоны CIDR вашей пиринговой VPC.

  ***

  Теперь сервис ClickHouse должен быть доступен из пиринговой VPC.
</VerticalStepper>

Для частного доступа к ClickHouse подготавливаются частный балансировщик нагрузки и конечная точка для безопасного подключения из пиринговой VPC пользователя. Частная конечная точка соответствует формату публичной конечной точки, но с суффиксом `-private`. Например:

* **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
* **Частная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

При необходимости, после подтверждения, что пиринг работает, вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Настройте PrivateLink \{#setup-privatelink\}

AWS PrivateLink обеспечивает безопасное частное подключение к вашим сервисам ClickHouse BYOC без необходимости настраивать VPC-пиринг или интернет-шлюзы. Трафик полностью проходит внутри сети AWS и никогда не выходит в публичный интернет.

<VerticalStepper headerLevel="h3">
  ### Запросите настройку PrivateLink \{#step-1-request-privatelink-setup\}

  Свяжитесь с [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud), чтобы запросить настройку PrivateLink для вашего развертывания BYOC. На этом этапе никакая дополнительная информация не требуется — просто сообщите, что хотите настроить подключение через PrivateLink.

  ClickHouse Support включит необходимые компоненты инфраструктуры, включая **частный балансировщик нагрузки** и **сервисную конечную точку PrivateLink**.

  ### Создайте конечную точку в своей VPC \{#step-2-create-endpoint\}

  После того как ClickHouse Support включит PrivateLink со своей стороны, вам нужно создать конечную точку VPC в VPC клиентского приложения, чтобы подключиться к сервису ClickHouse PrivateLink.

  1. **Получите имя сервиса конечной точки**:
     * ClickHouse Support предоставит вам имя сервиса конечной точки
     * Вы также можете найти его в консоли AWS VPC в разделе &quot;Endpoint Services&quot; (отфильтруйте по имени сервиса или найдите сервисы ClickHouse)

  <Image img={byoc_privatelink_1} size="lg" alt="Сервисная конечная точка BYOC PrivateLink" border />

  2. **Создайте конечную точку VPC**:
     * Перейдите в консоль AWS VPC → Endpoints → Create Endpoint
     * Выберите &quot;Find service by name&quot; и введите имя сервиса конечной точки, предоставленное ClickHouse Support
     * Выберите свою VPC и укажите подсети (рекомендуется по одной на каждую зону доступности)
     * **Важно**: включите &quot;Private DNS names&quot; для конечной точки — это необходимо для корректной работы DNS-разрешения
     * Выберите или создайте группу безопасности для конечной точки
     * Нажмите &quot;Create Endpoint&quot;

  :::important
  **Требования к DNS**:

  * Включите &quot;Private DNS names&quot; при создании конечной точки VPC
  * Убедитесь, что в вашей VPC включены &quot;DNS Hostnames&quot; (VPC Settings → DNS resolution and DNS hostnames)

  Эти настройки необходимы для корректной работы DNS PrivateLink.
  :::

  3. **Подтвердите подключение конечной точки**:
     * После создания конечной точки вам нужно подтвердить запрос на подключение
     * В консоли VPC перейдите в раздел &quot;Endpoint Connections&quot;
     * Найдите запрос на подключение от ClickHouse и нажмите &quot;Accept&quot;, чтобы подтвердить его

  <Image img={byoc_privatelink_2} size="lg" alt="Подтверждение BYOC PrivateLink" border />

  ### Добавьте ID конечной точки в список разрешений сервиса \{#step-3-add-endpoint-id-allowlist\}

  После того как конечная точка VPC будет создана и подключение подтверждено, вам нужно добавить ID конечной точки в список разрешений для каждого сервиса ClickHouse, к которому вы хотите получать доступ через PrivateLink.

  1. **Получите ID своей конечной точки**:
     * В консоли AWS VPC перейдите в раздел Endpoints
     * Выберите только что созданную конечную точку
     * Скопируйте ID конечной точки (он будет выглядеть как `vpce-xxxxxxxxxxxxxxxxx`)

  2. **Свяжитесь с ClickHouse Support**:
     * Передайте ID конечных точек в ClickHouse Support
     * Укажите, какие сервисы ClickHouse должны разрешать доступ с этой конечной точки
     * ClickHouse Support добавит ID конечной точки в список разрешений сервиса

  ### Подключитесь к ClickHouse через PrivateLink \{#step-4-connect-via-privatelink\}

  После того как ID конечной точки будет добавлен в список разрешений, вы сможете подключиться к своему сервису ClickHouse через конечную точку PrivateLink.

  Формат конечной точки PrivateLink похож на формат публичной конечной точки, но включает поддомен `vpce`. Например:

  * **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
  * **Конечная точка PrivateLink**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

  DNS-разрешение в вашей VPC будет автоматически направлять трафик через конечную точку PrivateLink, если используется формат с поддоменом `vpce`.
</VerticalStepper>

### Управление доступом для PrivateLink \{#privatelink-access-control\}

Доступ к сервисам ClickHouse через PrivateLink регулируется на двух уровнях:

1. **Политика авторизации Istio**: политики авторизации ClickHouse Cloud на уровне сервиса
2. **Группа безопасности конечной точки VPC**: группа безопасности, привязанная к вашей конечной точке VPC, определяет, какие ресурсы в вашей VPC могут использовать эту конечную точку

:::note
У частного балансировщика нагрузки отключена функция &quot;Enforce inbound rules on PrivateLink traffic&quot;, поэтому доступ регулируется только политиками авторизации Istio и группой безопасности вашей конечной точки VPC.
:::

### DNS PrivateLink \{#privatelink-dns\}

DNS PrivateLink для конечных точек BYOC (в формате `*.vpce.{subdomain}`) использует встроенную функцию AWS PrivateLink &quot;Private DNS names&quot;. Записи Route53 не требуются — DNS-разрешение происходит автоматически, если:

* На вашей конечной точке VPC включён параметр &quot;Private DNS names&quot;
* В вашей VPC включён параметр &quot;DNS Hostnames&quot;

Это гарантирует, что подключения через поддомен `vpce` автоматически направляются через конечную точку PrivateLink без дополнительной настройки DNS.