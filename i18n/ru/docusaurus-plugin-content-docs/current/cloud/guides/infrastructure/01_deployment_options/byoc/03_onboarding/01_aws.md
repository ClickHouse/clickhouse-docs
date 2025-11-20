---
title: 'Онбординг BYOC в AWS'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
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

Клиенты могут начать процесс подключения, обратившись к [нам](https://clickhouse.com/cloud/bring-your-own-cloud). Для этого необходимо иметь выделенный аккаунт AWS и знать регион, который будет использоваться. В настоящее время мы разрешаем запускать сервисы BYOC только в регионах, поддерживаемых для ClickHouse Cloud.

### Подготовка аккаунта AWS {#prepare-an-aws-account}

Рекомендуется подготовить выделенный аккаунт AWS для размещения развертывания ClickHouse BYOC, чтобы обеспечить лучшую изоляцию. Однако также возможно использование общего аккаунта и существующего VPC. Подробности см. в разделе _Настройка инфраструктуры BYOC_ ниже.

Имея этот аккаунт и адрес электронной почты первоначального администратора организации, вы можете обратиться в службу поддержки ClickHouse.

### Инициализация настройки BYOC {#initialize-byoc-setup}

Первоначальная настройка BYOC может быть выполнена с использованием шаблона CloudFormation или модуля Terraform. Оба подхода создают одну и ту же роль IAM, позволяя контроллерам BYOC из ClickHouse Cloud управлять вашей инфраструктурой. Обратите внимание, что ресурсы S3, VPC и вычислительные ресурсы, необходимые для работы ClickHouse, не включены в эту первоначальную настройку.

#### Шаблон CloudFormation {#cloudformation-template}

[Шаблон CloudFormation для BYOC](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Модуль Terraform {#terraform-module}

[Модуль Terraform для BYOC](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, из облачной консоли. Некоторые параметры конфигурации должны быть определены на этом этапе, так как их нельзя будет изменить позже. В частности:

- **Регион, который вы хотите использовать** — вы можете выбрать любой из [публичных регионов](/cloud/reference/supported-regions), доступных для ClickHouse Cloud.
- **Диапазон CIDR VPC для BYOC**: по умолчанию мы используем `10.0.0.0/16` для диапазона CIDR VPC BYOC. Если вы планируете использовать пиринг VPC с другим аккаунтом, убедитесь, что диапазоны CIDR не пересекаются. Выделите подходящий диапазон CIDR для BYOC с минимальным размером `/22` для размещения необходимых рабочих нагрузок.
- **Зоны доступности для VPC BYOC**: если вы планируете использовать пиринг VPC, согласование зон доступности между исходным аккаунтом и аккаунтом BYOC может помочь снизить затраты на межзональный трафик. В AWS суффиксы зон доступности (`a, b, c`) могут соответствовать разным физическим идентификаторам зон в разных аккаунтах. Подробности см. в [руководстве AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html).

#### VPC, управляемый клиентом {#customer-managed-vpc}

По умолчанию ClickHouse Cloud создаст выделенный VPC для лучшей изоляции в вашем развертывании BYOC. Однако вы также можете использовать существующий VPC в вашем аккаунте. Это требует специальной конфигурации и должно быть согласовано через службу поддержки ClickHouse.

**Настройка существующего VPC**

1. Выделите как минимум 3 частные подсети в 3 разных зонах доступности для использования ClickHouse Cloud.
2. Убедитесь, что каждая подсеть имеет минимальный диапазон CIDR `/23` (например, 10.0.0.0/23), чтобы обеспечить достаточное количество IP-адресов для развертывания ClickHouse.
3. Добавьте тег `kubernetes.io/role/internal-elb=1` к каждой подсети для обеспечения правильной конфигурации балансировщика нагрузки.

<br />

<Image img={byoc_subnet_1} size='lg' alt='Подсеть VPC BYOC' background='black' />

<br />

<br />

<Image
  img={byoc_subnet_2}
  size='lg'
  alt='Теги подсети VPC BYOC'
  background='black'
/>

<br />

4. Настройка конечной точки шлюза S3
   Если в вашем VPC еще не настроена конечная точка шлюза S3, вам необходимо создать её для обеспечения безопасной частной связи между вашим VPC и Amazon S3. Эта конечная точка позволяет вашим сервисам ClickHouse получать доступ к S3 без использования публичного интернета. Пример конфигурации см. на скриншоте ниже.

<br />


<Image
  img={byoc_s3_endpoint}
  size='lg'
  alt='Конечная точка S3 BYOC'
  background='black'
/>

<br />

**Обратитесь в службу поддержки ClickHouse**  
Создайте заявку в службу поддержки со следующей информацией:

- Идентификатор вашей учетной записи AWS
- Регион AWS, в котором вы хотите развернуть сервис
- Идентификатор вашего VPC
- Идентификаторы приватных подсетей, выделенных для ClickHouse
- Зоны доступности, в которых находятся эти подсети

### Опционально: Настройка пиринга VPC {#optional-setup-vpc-peering}

Чтобы создать или удалить пиринг VPC для ClickHouse BYOC, выполните следующие шаги:

#### Шаг 1: Включите приватный балансировщик нагрузки для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}

Обратитесь в службу поддержки ClickHouse для включения приватного балансировщика нагрузки.

#### Шаг 2: Создайте пиринговое соединение {#step-2-create-a-peering-connection}

1. Перейдите в панель управления VPC в учетной записи ClickHouse BYOC.
2. Выберите Peering Connections.
3. Нажмите Create Peering Connection.
4. Установите VPC Requester на идентификатор VPC ClickHouse.
5. Установите VPC Accepter на идентификатор целевого VPC. (Выберите другую учетную запись, если применимо.)
6. Нажмите Create Peering Connection.

<br />

<Image
  img={byoc_vpcpeering}
  size='lg'
  alt='BYOC Создание пирингового соединения'
  border
/>

<br />

#### Шаг 3: Примите запрос на пиринговое соединение {#step-3-accept-the-peering-connection-request}

Перейдите в учетную запись пиринга, на странице (VPC -> Peering connections -> Actions -> Accept request) вы можете одобрить этот запрос на пиринг VPC.

<br />

<Image
  img={byoc_vpcpeering2}
  size='lg'
  alt='BYOC Принятие пирингового соединения'
  border
/>

<br />

#### Шаг 4: Добавьте назначение в таблицы маршрутизации VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}

В учетной записи ClickHouse BYOC:

1. Выберите Route Tables в панели управления VPC.
2. Найдите идентификатор VPC ClickHouse. Отредактируйте каждую таблицу маршрутизации, привязанную к приватным подсетям.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. Введите диапазон CIDR целевого VPC в поле Destination.
6. Выберите "Peering Connection" и идентификатор пирингового соединения в поле Target.

<br />

<Image img={byoc_vpcpeering3} size='lg' alt='BYOC Добавление таблицы маршрутизации' border />

<br />

#### Шаг 5: Добавьте назначение в таблицы маршрутизации целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}

В учетной записи AWS для пиринга:

1. Выберите Route Tables в панели управления VPC.
2. Найдите идентификатор целевого VPC.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. Введите диапазон CIDR VPC ClickHouse в поле Destination.
6. Выберите "Peering Connection" и идентификатор пирингового соединения в поле Target.

<br />

<Image img={byoc_vpcpeering4} size='lg' alt='BYOC Добавление таблицы маршрутизации' border />

<br />

#### Шаг 6: Отредактируйте группу безопасности для разрешения доступа из пирингового VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}

В учетной записи ClickHouse BYOC необходимо обновить настройки группы безопасности, чтобы разрешить трафик из вашего пирингового VPC. Обратитесь в службу поддержки ClickHouse с запросом на добавление входящих правил, включающих диапазоны CIDR вашего пирингового VPC.

---

Сервис ClickHouse теперь должен быть доступен из пирингового VPC.

Для приватного доступа к ClickHouse предоставляются приватный балансировщик нагрузки и конечная точка для безопасного подключения из пирингового VPC пользователя. Приватная конечная точка следует формату публичной конечной точки с суффиксом `-private`. Например:

- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Приватная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Опционально, после проверки работоспособности пиринга вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.


## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая версии базы данных ClickHouse, ClickHouse Operator, EKS и другие компоненты.

Хотя мы стремимся к бесшовным обновлениям (например, последовательным обновлениям и перезапускам), некоторые из них, такие как изменения версии ClickHouse и обновления узлов EKS, могут повлиять на работу сервиса. Клиенты могут указать окно обслуживания (например, каждый вторник в 1:00 ночи по тихоокеанскому времени), что гарантирует выполнение таких обновлений только в запланированное время.

:::note
Окна обслуживания не применяются к исправлениям безопасности и уязвимостей. Они обрабатываются как внеплановые обновления с своевременным уведомлением для согласования подходящего времени и минимизации влияния на работу системы.
:::


## IAM-роли CloudFormation {#cloudformation-iam-roles}

### Bootstrap IAM-роль {#bootstrap-iam-role}

Bootstrap IAM-роль имеет следующие разрешения:

- **Операции EC2 и VPC**: Необходимы для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`)**: Необходимы для создания бакетов для хранилища ClickHouse BYOC.
- **Разрешения `route53:*`**: Необходимы для внешнего DNS для настройки записей в Route 53.
- **Операции IAM (например, `iam:CreatePolicy`)**: Необходимы контроллерам для создания дополнительных ролей (подробности см. в следующем разделе).
- **Операции EKS**: Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные IAM-роли, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

Помимо `ClickHouseManagementRole`, создаваемой через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли используются приложениями, работающими в EKS-кластере клиента:

- **Роль State Exporter**
  - Компонент ClickHouse, который передает информацию о состоянии сервиса в ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Контроллер Load-Balancer**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер EBS CSI для управления томами сервисов ClickHouse.
- **External-DNS**
  - Распространяет конфигурации DNS в Route 53.
- **Cert-Manager**
  - Предоставляет TLS-сертификаты для доменов сервисов BYOC.
- **Cluster Autoscaler**
  - Регулирует размер группы узлов по мере необходимости.

Роли **K8s-control-plane** и **k8s-worker** предназначены для использования сервисами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту ClickHouse Cloud Control Plane согласовывать необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и Istio Virtual Service/Gateway.


## Сетевые границы {#network-boundaries}

В этом разделе рассматриваются различные типы сетевого трафика к и от клиентского BYOC VPC:

- **Входящий**: Трафик, поступающий в клиентский BYOC VPC.
- **Исходящий**: Трафик, исходящий из клиентского BYOC VPC и отправляемый к внешнему получателю.
- **Публичный**: Сетевая конечная точка, доступная из публичного интернета.
- **Приватный**: Сетевая конечная точка, доступная только через приватные соединения, такие как VPC peering, VPC Private Link или Tailscale.

**Istio ingress развернут за AWS NLB для приема клиентского трафика ClickHouse.**

_Входящий, Публичный (может быть Приватным)_

Шлюз Istio ingress завершает TLS-соединение. Сертификат, предоставленный CertManager с помощью Let's Encrypt, хранится как секрет внутри кластера EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), поскольку они находятся в одном VPC.

По умолчанию ingress публично доступен с фильтрацией по списку разрешенных IP-адресов. Клиенты могут настроить VPC peering, чтобы сделать его приватным и отключить публичные соединения. Мы настоятельно рекомендуем настроить [IP-фильтр](/cloud/security/setting-ip-filters) для ограничения доступа.

### Доступ для устранения неполадок {#troubleshooting-access}

_Входящий, Публичный (может быть Приватным)_

Инженерам ClickHouse Cloud требуется доступ для устранения неполадок через Tailscale. Им предоставляется аутентификация на основе сертификатов just-in-time для развертываний BYOC.

### Сборщик данных биллинга {#billing-scraper}

_Исходящий, Приватный_

Сборщик данных биллинга собирает данные о потреблении из ClickHouse и отправляет их в S3-бакет, принадлежащий ClickHouse Cloud.

Он работает как sidecar-контейнер вместе с контейнером сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы внутри одного региона маршрутизируются через конечные точки сервиса VPC gateway.

### Оповещения {#alerts}

_Исходящий, Публичный_

AlertManager настроен на отправку оповещений в ClickHouse Cloud при возникновении проблем с кластером ClickHouse клиента.

Метрики и журналы хранятся внутри клиентского BYOC VPC. В настоящее время журналы хранятся локально в EBS. В будущем обновлении они будут храниться в LogHouse — сервисе ClickHouse внутри BYOC VPC. Метрики используют стек Prometheus и Thanos, хранящийся локально в BYOC VPC.

### Состояние сервиса {#service-state}

_Исходящий_

State Exporter отправляет информацию о состоянии сервиса ClickHouse в очередь SQS, принадлежащую ClickHouse Cloud.
