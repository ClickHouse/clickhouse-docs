---
title: 'Настройка BYOC в AWS'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'облако', 'bring your own cloud', 'AWS']
description: 'Развертывание ClickHouse в вашей собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## Процесс подключения {#onboarding-process}

Клиенты могут инициировать процесс подключения, связавшись с [нами](https://clickhouse.com/cloud/bring-your-own-cloud). Клиентам необходимо иметь отдельную учетную запись AWS и знать регион, который они будут использовать. В настоящее время пользователи могут запускать сервисы BYOC только в тех регионах, которые поддерживаются в ClickHouse Cloud.

### Подготовка учетной записи AWS {#prepare-an-aws-account}

Рекомендуется подготовить отдельную учетную запись AWS для размещения развертывания ClickHouse BYOC, чтобы обеспечить лучшую изоляцию. Однако возможно также использование общей учетной записи и существующего VPC. Подробности см. в разделе *Setup BYOC Infrastructure* ниже.

Имея эту учетную запись и первичный адрес электронной почты администратора организации, вы можете связаться со службой поддержки ClickHouse.

### Инициализация настройки BYOC {#initialize-byoc-setup}

Начальную настройку BYOC можно выполнить с помощью шаблона CloudFormation или модуля Terraform. Оба подхода создают одну и ту же роль IAM, которая позволяет контроллерам BYOC в ClickHouse Cloud управлять вашей инфраструктурой. Обратите внимание, что ресурсы S3, VPC и вычислительные ресурсы, необходимые для запуска ClickHouse, не включены в эту начальную настройку.

#### Шаблон CloudFormation {#cloudformation-template}

[Шаблон BYOC CloudFormation](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Модуль Terraform {#terraform-module}

[Модуль BYOC Terraform](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

{/* TODO: Добавить скриншот для оставшейся части онбординга, как только будет реализован онбординг в режиме самообслуживания. */ }

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, из облачной консоли. На этом этапе необходимо определить некоторые параметры, так как позже их изменить нельзя. В частности:

* **Регион, который вы хотите использовать**. Вы можете выбрать любой из [публичных регионов](/cloud/reference/supported-regions), доступных в ClickHouse Cloud.
* **Диапазон CIDR для VPC BYOC**: по умолчанию мы используем `10.0.0.0/16` для диапазона CIDR VPC BYOC. Если вы планируете использовать пиринг VPC с другой учетной записью, убедитесь, что диапазоны CIDR не пересекаются. Выделите подходящий диапазон CIDR для BYOC, с минимальным размером `/22`, чтобы разместить необходимые нагрузки.
* **Зоны доступности для VPC BYOC**: если вы планируете использовать пиринг VPC, согласование зон доступности между исходной учетной записью и учетной записью BYOC может помочь снизить стоимость межзонального трафика. В AWS суффиксы зон доступности (`a, b, c`) могут соответствовать разным физическим ID зон в разных учетных записях. Подробности см. в [руководстве AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html).

#### VPC, управляемая клиентом {#customer-managed-vpc}

По умолчанию ClickHouse Cloud создает выделенную VPC для лучшей изоляции в вашем развертывании BYOC. Однако вы также можете использовать существующую VPC в своей учетной записи. Это требует особой настройки и должно быть согласовано через службу поддержки ClickHouse.

**Настройка существующей VPC**

1. Выделите как минимум 3 приватные подсети в 3 разных зонах доступности для использования ClickHouse Cloud.
2. Убедитесь, что у каждой подсети минимальный диапазон CIDR `/23` (например, 10.0.0.0/23), чтобы обеспечить достаточное количество IP-адресов для развертывания ClickHouse.
3. Добавьте тег `kubernetes.io/role/internal-elb=1` к каждой подсети, чтобы обеспечить корректную конфигурацию балансировщика нагрузки.

<br />

<Image img={byoc_subnet_1} size="lg" alt="Подсеть BYOC VPC" background="black" />

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="Теги подсети BYOC VPC" background="black" />

<br />

4. Настройте S3 Gateway Endpoint\
   Если в вашей VPC еще не настроен S3 Gateway Endpoint, необходимо создать его, чтобы обеспечить защищенное, приватное взаимодействие между вашей VPC и Amazon S3. Этот endpoint позволяет сервисам ClickHouse получать доступ к S3 без выхода в публичный интернет. Пожалуйста, обратитесь к скриншоту ниже для примера конфигурации.

<br />


<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpint" background='black'/>

<br />

**Свяжитесь со службой поддержки ClickHouse**  
Создайте запрос в поддержку со следующей информацией:

* ID вашего AWS-аккаунта
* Регион AWS, в котором вы хотите развернуть сервис
* ID вашего VPC
* ID частных подсетей, которые вы выделили для ClickHouse
* Зоны доступности, в которых находятся эти подсети

### Необязательно: настройка VPC peering {#optional-setup-vpc-peering}

Чтобы создать или удалить VPC peering для ClickHouse BYOC, выполните следующие шаги:

#### Шаг 1: Включите частный балансировщик нагрузки для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Свяжитесь со службой поддержки ClickHouse, чтобы включить Private Load Balancer.

#### Шаг 2 Создайте peering-подключение {#step-2-create-a-peering-connection}
1. Перейдите в VPC Dashboard в аккаунте ClickHouse BYOC.
2. Выберите Peering Connections.
3. Нажмите Create Peering Connection.
4. Установите VPC Requester в ID VPC ClickHouse.
5. Установите VPC Accepter в целевой VPC ID. (При необходимости выберите другой аккаунт.)
6. Нажмите Create Peering Connection.

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

<br />

#### Шаг 3 Примите запрос на peering-подключение {#step-3-accept-the-peering-connection-request}
Перейдите в аккаунт, с которым настраивается peering, на странице (VPC -> Peering connections -> Actions -> Accept request) клиент может одобрить этот запрос на VPC peering.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

<br />

#### Шаг 4 Добавьте пункт назначения в таблицы маршрутизации VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}
В аккаунте ClickHouse BYOC:
1. Выберите Route Tables в VPC Dashboard.
2. Найдите ClickHouse VPC ID. Отредактируйте каждую таблицу маршрутизации, привязанную к частным подсетям.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. Введите CIDR-диапазон целевого VPC в поле Destination.
6. Выберите "Peering Connection" и ID peering-подключения в поле Target.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

<br />

#### Шаг 5 Добавьте пункт назначения в таблицы маршрутизации целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}
В AWS-аккаунте, с которым настроен peering:
1. Выберите Route Tables в VPC Dashboard.
2. Найдите целевой VPC ID.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. Введите CIDR-диапазон VPC ClickHouse в поле Destination.
6. Выберите "Peering Connection" и ID peering-подключения в поле Target.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

<br />

#### Шаг 6: Отредактируйте security group, чтобы разрешить доступ из peered VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}
В аккаунте ClickHouse BYOC вам нужно обновить настройки группы безопасности (Security Group), чтобы разрешить трафик из вашего peered VPC. Пожалуйста, свяжитесь со службой поддержки ClickHouse, чтобы запросить добавление правил входящего трафика (inbound rules), включающих CIDR-диапазоны вашего peered VPC.

---
Теперь сервис ClickHouse должен быть доступен из peered VPC.

Для приватного доступа к ClickHouse создаются частный балансировщик нагрузки и приватный endpoint для безопасного подключения из peered VPC пользователя. Приватный endpoint следует формату публичного endpoint с суффиксом `-private`. Например:
- **Публичный endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Приватный endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Необязательно: после проверки работоспособности peering вы можете запросить отключение публичного балансировщика нагрузки для ClickHouse BYOC.



## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая обновления версии базы данных ClickHouse, ClickHouse Operator, EKS и других компонентов.

Хотя мы стремимся к максимально незаметным обновлениям (например, поэтапным обновлениям и перезапускам), некоторые из них, такие как смена версии ClickHouse и обновление узлов EKS, могут влиять на работу сервиса. Клиенты могут указать окно обслуживания (например, каждый вторник в 01:00 по тихоокеанскому времени, PDT), чтобы такие обновления выполнялись только в запланированное время.

:::note
Окна обслуживания не распространяются на устранение уязвимостей и исправления, связанные с безопасностью. Они выполняются как внеплановые обновления; мы заблаговременно согласуем подходящее время, чтобы минимизировать влияние на эксплуатацию.
:::



## Роли IAM для CloudFormation {#cloudformation-iam-roles}

### Начальная (bootstrap) роль IAM {#bootstrap-iam-role}

Начальная роль IAM имеет следующие разрешения:

- **Операции EC2 и VPC**: Требуются для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`)**: Необходимы для создания бакетов для хранилища ClickHouse BYOC.
- **Разрешения `route53:*`**: Требуются для External DNS для настройки записей в Route 53.
- **Операции IAM (например, `iam:CreatePolicy`)**: Необходимы контроллерам для создания дополнительных ролей (подробности см. в следующем разделе).
- **Операции EKS**: Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные роли IAM, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

Помимо `ClickHouseManagementRole`, создаваемой через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли используются приложениями, работающими внутри кластера EKS заказчика:
- **State Exporter Role**
  - Компонент ClickHouse, который передаёт информацию о состоянии сервиса в ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Load-Balancer Controller**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер EBS CSI для управления томами для сервисов ClickHouse.
- **External-DNS**
  - Применяет (пропагирует) конфигурации DNS в Route 53.
- **Cert-Manager**
  - Выдаёт TLS-сертификаты для доменов сервиса BYOC.
- **Cluster Autoscaler**
  - При необходимости изменяет размер группы узлов.

Роли **K8s-control-plane** и **k8s-worker** предназначены для использования сервисами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту Control Plane ClickHouse Cloud синхронизировать необходимые пользовательские ресурсы (Custom Resources), такие как `ClickHouseCluster` и Istio Virtual Service/Gateway.



## Границы сети {#network-boundaries}

В этом разделе рассматриваются различные типы сетевого трафика в клиентский BYOC VPC и из него:

- **Входящий (Inbound)**: Трафик, входящий в клиентский BYOC VPC.
- **Исходящий (Outbound)**: Трафик, исходящий из клиентского BYOC VPC и отправляемый во внешние системы.
- **Публичный (Public)**: Сетевой endpoint, доступный из публичного интернета.
- **Приватный (Private)**: Сетевой endpoint, доступный только по приватным подключениям, таким как VPC peering, VPC Private Link или Tailscale.

**Входной шлюз Istio развернут за AWS NLB для приёма клиентского трафика ClickHouse.**

*Входящий, публичный (может быть приватным)*

Входной шлюз Istio завершает TLS‑соединение. Сертификат, выдаваемый CertManager с использованием Let's Encrypt, хранится как секрет внутри кластера EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), поскольку оба сервиса находятся в одном VPC.

По умолчанию входной шлюз публично доступен, доступ ограничивается фильтрацией по списку разрешённых IP‑адресов (allow list). Клиенты могут настроить VPC peering, чтобы сделать его приватным и отключить публичные подключения. Мы настоятельно рекомендуем настроить [IP‑фильтр](/cloud/security/setting-ip-filters) для ограничения доступа.

### Устранение проблем с доступом {#troubleshooting-access}

*Входящий, публичный (может быть приватным)*

Инженерам ClickHouse Cloud требуется доступ для устранения неполадок через Tailscale. Им предоставляется just-in-time аутентификация на основе сертификатов для развертываний BYOC.

### Сборщик биллинга {#billing-scraper}

*Исходящий, приватный*

Сборщик биллинга (Billing scraper) собирает биллинговые данные из ClickHouse и отправляет их в S3‑бакет, принадлежащий ClickHouse Cloud.

Он запускается как вспомогательный контейнер (sidecar) рядом с контейнером сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы внутри одного региона маршрутизируются через VPC gateway service endpoints.

### Оповещения {#alerts}

*Исходящий, публичный*

AlertManager настроен на отправку оповещений в ClickHouse Cloud, когда клиентский кластер ClickHouse находится в неисправном состоянии.

Метрики и логи хранятся внутри клиентского BYOC VPC. Логи в данный момент хранятся локально в EBS. В будущем они будут храниться в LogHouse — сервисе ClickHouse внутри BYOC VPC. Для метрик используется стек Prometheus и Thanos, данные метрик хранятся локально в BYOC VPC.

### Состояние сервиса {#service-state}

*Исходящий*

State Exporter отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащий ClickHouse Cloud.
