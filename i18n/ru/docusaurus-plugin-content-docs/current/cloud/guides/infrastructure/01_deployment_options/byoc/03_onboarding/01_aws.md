---
title: 'Подключение BYOC для AWS'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: 'Разверните ClickHouse в собственной облачной инфраструктуре'
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

Имея этот аккаунт и email администратора организации, вы можете обратиться в службу поддержки ClickHouse.

### Инициализация настройки BYOC {#initialize-byoc-setup}

Начальная настройка BYOC может быть выполнена с помощью шаблона CloudFormation или модуля Terraform. Оба подхода создают одну и ту же роль IAM, позволяя контроллерам BYOC из ClickHouse Cloud управлять вашей инфраструктурой. Обратите внимание, что ресурсы S3, VPC и вычислительные ресурсы, необходимые для работы ClickHouse, не включены в эту начальную настройку.

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
- **Диапазон CIDR VPC для BYOC**: По умолчанию используется диапазон `10.0.0.0/16` для CIDR VPC BYOC. Если вы планируете использовать пиринг VPC с другим аккаунтом, убедитесь, что диапазоны CIDR не пересекаются. Выделите подходящий диапазон CIDR для BYOC с минимальным размером `/22` для размещения необходимых рабочих нагрузок.
- **Зоны доступности для VPC BYOC**: Если вы планируете использовать пиринг VPC, согласование зон доступности между исходным аккаунтом и аккаунтом BYOC может помочь снизить затраты на межзональный трафик. В AWS суффиксы зон доступности (`a, b, c`) могут соответствовать разным физическим идентификаторам зон в разных аккаунтах. Подробности см. в [руководстве AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html).

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
  alt='BYOC S3 Endpoint'
  background='black'
/>

<br />

**Свяжитесь со службой поддержки ClickHouse**  
Создайте запрос в службу поддержки со следующей информацией:

- Идентификатор вашей учетной записи AWS
- Регион AWS, в котором вы хотите развернуть сервис
- Идентификатор вашей VPC
- Идентификаторы приватных подсетей, которые вы выделили для ClickHouse
- Зоны доступности, в которых находятся эти подсети

### Необязательно: настройка пиринга VPC {#optional-setup-vpc-peering}

Чтобы создать или удалить пиринг VPC для ClickHouse BYOC, выполните следующие действия:

#### Шаг 1. Включите приватный балансировщик нагрузки для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}

Свяжитесь со службой поддержки ClickHouse, чтобы включить приватный балансировщик нагрузки.

#### Шаг 2. Создайте пиринговое подключение {#step-2-create-a-peering-connection}

1. Перейдите в раздел VPC Dashboard в учетной записи ClickHouse BYOC.
2. Выберите Peering Connections.
3. Нажмите Create Peering Connection.
4. В поле VPC Requester укажите идентификатор VPC ClickHouse.
5. В поле VPC Accepter укажите идентификатор целевой VPC (при необходимости выберите другую учетную запись).
6. Нажмите Create Peering Connection.

<br />

<Image
  img={byoc_vpcpeering}
  size='lg'
  alt='BYOC создание пирингового подключения'
  border
/>

<br />

#### Шаг 3. Примите запрос на пиринговое подключение {#step-3-accept-the-peering-connection-request}

Перейдите в учетную запись, с которой настраивается пиринг, и на странице (VPC -> Peering connections -> Actions -> Accept request) вы можете одобрить этот запрос на пиринг VPC.

<br />

<Image
  img={byoc_vpcpeering2}
  size='lg'
  alt='BYOC принятие пирингового подключения'
  border
/>

<br />

#### Шаг 4. Добавьте пункт назначения в таблицы маршрутизации VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}

В учетной записи ClickHouse BYOC:

1. В разделе VPC Dashboard выберите Route Tables.
2. Найдите идентификатор VPC ClickHouse. Отредактируйте каждую таблицу маршрутизации, связанную с приватными подсетями.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. В поле Destination укажите CIDR-диапазон целевой VPC.
6. В качестве Target выберите «Peering Connection» и укажите идентификатор пирингового подключения.

<br />

<Image img={byoc_vpcpeering3} size='lg' alt='BYOC добавление таблицы маршрутизации' border />

<br />

#### Шаг 5. Добавьте пункт назначения в таблицы маршрутизации целевой VPC {#step-5-add-destination-to-the-target-vpc-route-tables}

В учетной записи AWS, с которой настраивается пиринг:

1. Select Route Tables in the VPC Dashboard.
2. Найдите идентификатор целевой VPC.
3. Нажмите кнопку Edit на вкладке Routes.
4. Нажмите Add another route.
5. В поле Destination укажите CIDR-диапазон VPC ClickHouse.
6. В качестве Target выберите «Peering Connection» и укажите идентификатор пирингового подключения.

<br />

<Image img={byoc_vpcpeering4} size='lg' alt='BYOC добавление таблицы маршрутизации' border />

<br />

#### Шаг 6. Измените группу безопасности, чтобы разрешить доступ из пиринговой VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}

В учетной записи ClickHouse BYOC вам нужно обновить настройки Security Group, чтобы разрешить трафик из вашей пиринговой VPC. Свяжитесь со службой поддержки ClickHouse и попросите добавить входящие правила, включающие CIDR-диапазоны вашей пиринговой VPC.

---

Теперь сервис ClickHouse должен быть доступен из пиринговой VPC.

Для приватного доступа к ClickHouse подготавливаются приватный балансировщик нагрузки и конечная точка, обеспечивающие безопасное подключение из пиринговой VPC пользователя. Приватная конечная точка следует формату публичной конечной точки с суффиксом `-private`. Например:

- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Приватная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Необязательно: после проверки работоспособности пиринга вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.


## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая версии базы данных ClickHouse, ClickHouse Operator, EKS и другие компоненты.

Хотя мы стремимся к бесшовным обновлениям (например, последовательные обновления и перезапуски), некоторые из них, такие как изменения версии ClickHouse и обновления узлов EKS, могут повлиять на работу сервиса. Клиенты могут указать окно обслуживания (например, каждый вторник в 1:00 ночи по тихоокеанскому времени), что гарантирует выполнение таких обновлений только в запланированное время.

:::note
Окна обслуживания не применяются к исправлениям уязвимостей и проблем безопасности. Они выполняются как внеплановые обновления со своевременным уведомлением для согласования подходящего времени и минимизации влияния на работу системы.
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
  - Настраивает размер группы узлов по мере необходимости.

Роли **K8s-control-plane** и **k8s-worker** предназначены для использования сервисами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту ClickHouse Cloud Control Plane согласовывать необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и Istio Virtual Service/Gateway.


## Сетевые границы {#network-boundaries}

Этот раздел описывает различные виды сетевого трафика, поступающего в VPC BYOC клиента и исходящего из нее:

- **Входящий**: Трафик, поступающий в VPC BYOC клиента.
- **Исходящий**: Трафик, исходящий из VPC BYOC клиента и направляемый на внешний ресурс.
- **Публичный**: Сетевой конечный пункт, доступный из публичного интернета.
- **Приватный**: Сетевой конечный пункт, доступный только через приватные соединения, такие как VPC peering, VPC Private Link или Tailscale.

**Ingress Istio развернут за AWS NLB для приема трафика клиентов ClickHouse.**

_Входящий, Публичный (может быть Приватным)_

Шлюз ingress Istio завершает TLS-соединение. Сертификат, выданный Cert-Manager с использованием Let's Encrypt, хранится в виде секрета в кластере EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), поскольку они находятся в одной VPC.

По умолчанию ingress публично доступен с фильтрацией по списку разрешенных IP-адресов. Клиенты могут настроить VPC peering, чтобы сделать его приватным и отключить публичные соединения. Мы настоятельно рекомендуем настроить [фильтр IP](/cloud/security/setting-ip-filters) для ограничения доступа.

### Устранение неисправностей доступа {#troubleshooting-access}

_Входящий, Публичный (может быть Приватным)_

Инженерам ClickHouse Cloud требуется доступ для устранения неисправностей через Tailscale. Для развертываний BYOC они используют аутентификацию на основе сертификатов just-in-time.

### Сборщик биллинга {#billing-scraper}

_Исходящий, Приватный_

Сборщик биллинга собирает данные о биллинге из ClickHouse и отправляет их в бакет S3, принадлежащий ClickHouse Cloud.

Он запускается как сайдкар в контейнере сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы в пределах одного региона маршрутизируются через конечные точки сервисов VPC gateway.

### Оповещения {#alerts}

_Исходящий, Публичный_

AlertManager настроен на отправку оповещений в ClickHouse Cloud, когда кластер ClickHouse клиента находится в неисправном состоянии.

Метрики и логи хранятся в VPC BYOC клиента. Логи в настоящее время хранятся локально в EBS. В будущем обновлении они будут храниться в LogHouse — сервисе ClickHouse в VPC BYOC. Метрики используют стек Prometheus и Thanos, который хранится локально в VPC BYOC.

### Состояние сервиса {#service-state}

_Исходящий_

State Exporter отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащий ClickHouse Cloud.
