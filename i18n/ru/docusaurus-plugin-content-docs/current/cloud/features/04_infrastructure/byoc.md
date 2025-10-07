---
'title': 'BYOC (Bring Your Own Cloud) для AWS'
'slug': '/cloud/reference/byoc'
'sidebar_label': 'BYOC (Bring Your Own Cloud)'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
'description': 'Развертывание ClickHouse на вашей собственной облачной инфраструктуре'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_plb from '@site/static/images/cloud/reference/byoc-plb.png';
import byoc_security from '@site/static/images/cloud/reference/byoc-securitygroup.png';
import byoc_inbound from '@site/static/images/cloud/reference/byoc-inbound-rule.png';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'

## Обзор {#overview}

BYOC (Bring Your Own Cloud) позволяет развернуть ClickHouse Cloud на вашей собственной облачной инфраструктуре. Это полезно, если у вас есть специфические требования или ограничения, которые не позволяют использовать управляемый сервис ClickHouse Cloud.

**Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Смотрите наши [Условия обслуживания](https://clickhouse.com/legal/agreements/terms-of-service) для получения дополнительной информации.

В настоящее время BYOC поддерживается только для AWS. Вы можете записаться в очередь на GCP и Azure [здесь](https://clickhouse.com/cloud/bring-your-own-cloud).

:::note 
BYOC предназначен специально для развертываний крупного масштаба и требует от клиентов подписания контракта.
:::

## Глоссарий {#glossary}

- **ClickHouse VPC:** VPC, принадлежащий ClickHouse Cloud.
- **Customer BYOC VPC:** VPC, принадлежащий облачному аккаунту клиента, предоставленный и управляемый ClickHouse Cloud, и выделенный для развертывания ClickHouse Cloud BYOC.
- **Customer VPC:** Другие VPC, принадлежащие облачному аккаунту клиента, используемые для приложений, которые необходимо подключить к Customer BYOC VPC.

## Архитектура {#architecture}

Метрики и логи хранятся внутри Customer BYOC VPC. Логи в настоящее время хранятся локально в EBS. В будущих обновлениях логи будут храниться в LogHouse, который является сервисом ClickHouse в Customer BYOC VPC. Метрики реализованы через стек Prometheus и Thanos, хранящийся локально в Customer BYOC VPC.

<br />

<Image img={byoc1} size="lg" alt="Архитектура BYOC" background='black'/>

<br />

## Процесс подключения {#onboarding-process}

Клиенты могут начать процесс подключения, связавшись с [нами](https://clickhouse.com/cloud/bring-your-own-cloud). Клиентам необходимо иметь выделенный аккаунт AWS и знать регион, который они собираются использовать. В настоящее время мы разрешаем пользователям разворачивать сервисы BYOC только в тех регионах, которые мы поддерживаем для ClickHouse Cloud.

### Подготовка аккаунта AWS {#prepare-an-aws-account}

Рекомендуется подготовить выделенный аккаунт AWS для размещения развертывания ClickHouse BYOC, чтобы обеспечить лучшую изоляцию. Однако также возможно использование общего аккаунта и существующего VPC. См. детали в разделе *Настройка инфраструктуры BYOC* ниже.

С данным аккаунтом и первоначальным адресом электронной почты администратора организации вы можете связаться с поддержкой ClickHouse.

### Инициализация настройки BYOC {#initialize-byoc-setup}

Первоначальная настройка BYOC может быть выполнена с помощью шаблона CloudFormation или модуля Terraform. Оба подхода создают одну и ту же IAM роль, позволяя контроллерам BYOC от ClickHouse Cloud управлять вашей инфраструктурой. Имейте в виду, что S3, VPC и вычислительные ресурсы, необходимые для работы ClickHouse, не включены в эту первоначальную настройку.

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

<!-- TODO: Добавить скриншот для остальной части подключения, как только будет реализовано самообслуживание. -->

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, через консоль облака. Определенные конфигурации должны быть установлены на этом этапе, так как их нельзя будет изменить позже. В частности:

- **Регион, который вы хотите использовать**: вы можете выбрать один из любых [публичных регионов](/cloud/reference/supported-regions), которые у нас есть для ClickHouse Cloud.
- **CIDR диапозон VPC для BYOC**: По умолчанию мы используем `10.0.0.0/16` для CIDR диапазона BYOC VPC. Если вы планируете использовать VPC-пиринг с другим аккаунтом, убедитесь, что диапазоны CIDR не пересекаются. Выделите соответствующий диапазон CIDR для BYOC, минимального размера `/22`, чтобы обеспечить необходимые рабочие нагрузки.
- **Зоны доступности для BYOC VPC**: Если вы планируете использовать VPC-пиринг, согласование зон доступности между исходным и BYOC аккаунтами может помочь снизить затраты на трафик между AZ. В AWS суффиксы зон доступности (`a, b, c`) могут представлять разные идентификаторы физических зон между аккаунтами. См. [руководство AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) для получения деталей.

#### VPC, управляемый клиентом {#customer-managed-vpc}
По умолчанию ClickHouse Cloud предоставит выделенный VPC для лучшей изоляции в вашем развертывании BYOC. Однако вы также можете использовать существующий VPC в вашем аккаунте. Это требует специфической конфигурации и должно быть согласовано через поддержку ClickHouse.

**Настройка вашего существующего VPC**
1. Выделите как минимум 3 частные подсети через 3 различные зоны доступности для использования ClickHouse Cloud.
2. Убедитесь, что каждая подсеть имеет минимальный CIDR диапазон `/23` (например, 10.0.0.0/23), чтобы предоставить достаточное количество IP-адресов для развертывания ClickHouse.
3. Добавьте тег `kubernetes.io/role/internal-elb=1` к каждой подсети, чтобы обеспечить правильную конфигурацию балансировщика нагрузки.

<br />

<Image img={byoc_subnet_1} size="lg" alt="Подсеть BYOC VPC" background='black'/>

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="Теги подсети BYOC VPC" background='black'/>

<br />

4. Настройка S3 Gateway Endpoint
Если в вашем VPC еще не настроен S3 Gateway Endpoint, вам нужно создать его, чтобы обеспечить безопасную, частную связь между вашим VPC и Amazon S3. Этот конечный узел позволяет вашим сервисам ClickHouse получать доступ к S3 без прохода через публичный интернет. Пожалуйста, смотрите скриншот ниже для примера конфигурации.

<br />

<Image img={byoc_s3_endpoint} size="lg" alt="Конечная точка S3 BYOC" background='black'/>

<br />

**Свяжитесь с поддержкой ClickHouse**  
Создайте запрос в службу поддержки с следующей информацией:

* Ваша идентификационная запись AWS
* Регион AWS, в котором вы хотите развернуть сервис
* Ваш ID VPC
* Идентификаторы частных подсетей, которые вы выделили для ClickHouse
* Зоны доступности этих подсетей

### Дополнительно: Настройка VPC-пиринга {#optional-setup-vpc-peering}

Чтобы создать или удалить VPC-пиринг для ClickHouse BYOC, выполните следующие шаги:

#### Шаг 1: Включите частный балансировщик нагрузки для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Свяжитесь с поддержкой ClickHouse, чтобы включить частный балансировщик нагрузки.

#### Шаг 2: Создание пирингового соединения {#step-2-create-a-peering-connection}
1. Перейдите в панель управления VPC в аккаунте ClickHouse BYOC.
2. Выберите Пиринговые соединения.
3. Нажмите Создать пиринговое соединение.
4. Установите VPC-запросчик на ID VPC ClickHouse.
5. Установите VPC-акцептор на ID целевого VPC. (Выберите другой аккаунт, если это применимо)
6. Нажмите Создать пиринговое соединение.

<br />

<Image img={byoc_vpcpeering} size="lg" alt="Создать пиринговое соединение BYOC" border />

<br />

#### Шаг 3: Принять запрос на пиринговое соединение {#step-3-accept-the-peering-connection-request}
Перейдите в пиринговый аккаунт на страницу (VPC -> Пиринговые соединения -> Действия -> Принять запрос), чтобы клиент мог одобрить этот запрос на пиринг VPC.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="Принять пиринговое соединение BYOC" border />

<br />

#### Шаг 4: Добавить назначения в таблицы маршрутов VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}
В аккаунте ClickHouse BYOC,
1. Выберите Таблицы маршрутов в панели управления VPC.
2. Найдите ID VPC ClickHouse. Отредактируйте каждую таблицу маршрутов, связанную с частными подсетями.
3. Нажмите кнопку Изменить под вкладкой Маршруты.
4. Нажмите Добавить другой маршрут.
5. Введите CIDR диапазон целевого VPC для назначения.
6. Выберите "Пиринговое соединение" и ID пирингового соединения для цели.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="Добавить таблицу маршрутов BYOC" border />

<br />

#### Шаг 5: Добавить назначения в таблицы маршрутов целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}
В пиринговом аккаунте AWS,
1. Выберите Таблицы маршрутов в панели управления VPC.
2. Найдите ID целевого VPC.
3. Нажмите кнопку Изменить под вкладкой Маршруты.
4. Нажмите Добавить другой маршрут.
5. Введите CIDR диапазон VPC ClickHouse для назначения.
6. Выберите "Пиринговое соединение" и ID пирингового соединения для цели.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="Добавить таблицу маршрутов BYOC" border />

<br />

#### Шаг 6: Измените настройки группы безопасности, чтобы разрешить доступ из пирингового VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}
В аккаунте ClickHouse BYOC вам необходимо обновить настройки группы безопасности, чтобы разрешить трафик из вашего пирингового VPC. Пожалуйста, свяжитесь с поддержкой ClickHouse, чтобы запросить добавление входящих правил, включающих диапазоны CIDR вашего пирингового VPC.

---
Сервис ClickHouse теперь должен быть доступен из пирингового VPC.

Чтобы получить доступ к ClickHouse приватно, был предоставлен частный балансировщик нагрузки и конечная точка для безопасной связи из вашего пирингового VPC. Частная конечная точка сохраняет формат публичной конечной точки с суффиксом `-private`. Например:
- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Частная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Дополнительно, после проверки работы пиринга вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая обновления версии базы данных ClickHouse, ClickHouse Operator, EKS и других компонентов.

Хотя мы нацелены на бесшовные обновления (например, обновления и перезагрузки), некоторые, такие как изменения версии ClickHouse и обновления узлов EKS, могут повлиять на сервис. Клиенты могут указать окно технического обслуживания (например, каждую вторник в 1:00 по PDT), чтобы такие обновления происходили только в запланированное время.

:::note
Окна технического обслуживания не применимы к исправлениям безопасности и уязвимостей. Эти вопросы обрабатываются как внеплановые обновления с своевременным уведомлением для координации подходящего времени и минимизации операционного влияния.
:::

## IAM роли CloudFormation {#cloudformation-iam-roles}

### IAM роль начальной загрузки {#bootstrap-iam-role}

IAM роль начальной загрузки имеет следующие разрешения:

- **Операции EC2 и VPC**: Необходимы для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`)**: Необходимы для создания бакетов для хранения ClickHouse BYOC.
- **Разрешения `route53:*`**: Необходимы для внешнего DNS для настройки записей в Route 53.
- **Операции IAM (например, `iam:CreatePolicy`)**: Необходимы для контроллеров при создании дополнительных ролей (см. следующий раздел для деталей).
- **Операции EKS**: Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные IAM роли, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

В дополнение к `ClickHouseManagementRole`, созданной через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли предполагаются приложениями, работающими внутри EKS кластера клиента:
- **Роль State Exporter**
  - Компонент ClickHouse, который сообщает информацию о состоянии сервиса ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Контроллер балансировщика нагрузки**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер EBS CSI для управления объемами для сервисов ClickHouse.
- **External-DNS**
  - Распространяет конфигурации DNS в Route 53.
- **Cert-Manager**
  - Обеспечивает TLS сертификаты для доменов сервисов BYOC.
- **Cluster Autoscaler**
  - Регулирует размер группы узлов по мере необходимости.

**K8s-control-plane** и **k8s-worker** роли предназначены для использования сервисами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту ClickHouse Cloud Control Plane согласовывать необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и виртуальные службы/шлюзы Istio.

## Сетевые границы {#network-boundaries}

В этом разделе рассматривается различный сетевой трафик к Customer BYOC VPC и из него:

- **Входящий**: Трафик, поступающий в Customer BYOC VPC.
- **Исходящий**: Трафик, исходящий из Customer BYOC VPC и отправляемый на внешнее назначение.
- **Публичный**: Сетевой конечный узел, доступный из публичного интернета.
- **Приватный**: Сетевой конечный узел, доступный только через частные соединения, такие как VPC-пиринг, VPC Private Link или Tailscale.

**Istio входной шлюз развёрнут за балансировщиком нагрузки AWS NLB для принятия трафика клиента ClickHouse.**

*Входящий, Публичный (может быть Приватным)*

Входной шлюз Istio завершает TLS. Сертификат, предоставленный CertManager с Let's Encrypt, хранится как секрет внутри кластера EKS. Трафик между Istio и ClickHouse шифруется [AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), поскольку они находятся в одном VPC.

По умолчанию входящий трафик является общедоступным с фильтрацией по списку разрешённых IP. Клиенты могут настроить VPC-пиринг, чтобы сделать его приватным и отключить публичные соединения. Мы настоятельно рекомендуем настроить [IP-фильтр](/cloud/security/setting-ip-filters) для ограничения доступа.

### Устранение доступа {#troubleshooting-access}

*Входящий, Публичный (может быть Приватным)*

Инженеры ClickHouse Cloud требуют доступа для устранения неполадок через Tailscale. Им предоставляется аутентификация на основе сертификатов по мере необходимости для развертываний BYOC.

### Сборщик выставления счетов {#billing-scraper}

*Исходящий, Приватный*

Сборщик выставления счетов собирает данные о выставлении счетов из ClickHouse и отправляет их в бакет S3, принадлежащий ClickHouse Cloud.

Он работает как побочный контейнер рядом с контейнером сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы в пределах одного региона маршрутизируются через конечные узлы сервиса VPC.

### Уведомления {#alerts}

*Исходящий, Публичный*

AlertManager настроен на отправку уведомлений в ClickHouse Cloud, когда кластер ClickHouse клиента нездоров.

Метрики и логи хранятся внутри Customer BYOC VPC. Логи в настоящее время хранятся локально в EBS. В будущем они будут храниться в LogHouse, сервисе ClickHouse в VPC BYOC. Метрики используют стек Prometheus и Thanos, хранящиеся локально в BYOC VPC.

### Состояние сервиса {#service-state}

*Исходящий*

State Exporter отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащий ClickHouse Cloud.

## Функции {#features}

### Поддерживаемые функции {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud и BYOC используют один и тот же бинарный файл и конфигурацию. Поэтому все функции из ядра ClickHouse поддерживаются в BYOC, такие как SharedMergeTree.
- **Доступ через консоль для управления состоянием сервиса**:
  - Поддерживает операции, такие как запуск, остановка и завершение.
  - Просмотр сервисов и статуса.
- **Резервное копирование и восстановление.**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Простое отключение.**
- **Склады**: Разделение вычислений
- **Сеть без доверия через Tailscale.**
- **Мониторинг**:
  - Облачная консоль включает встроенные панели состояния для мониторинга здоровья сервиса.
  - Сбор метрик Prometheus для централизованного мониторинга с Prometheus, Grafana и Datadog. См. [документацию по Prometheus](/integrations/prometheus) для инструкций по настройке.
- **VPC-пиринг.**
- **Интеграции**: См. полный список на [этой странице](/integrations).
- **Безопасный S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Запланированные функции (в настоящее время не поддерживаются) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) т.е. CMEK (ключи шифрования, управляемые клиентом)
- ClickPipes для загрузки
- Автомасштабирование
- Интерфейс MySQL

## Часто задаваемые вопросы {#faq}

### Вычисления {#compute}

#### Можно ли создать несколько сервисов в этом единственном EKS кластере? {#can-i-create-multiple-services-in-this-single-eks-cluster}

Да. Инфраструктура должна быть предоставлена только один раз для каждой комбинации аккаунта AWS и региона.

### Какие регионы вы поддерживаете для BYOC? {#which-regions-do-you-support-for-byoc}

BYOC поддерживает тот же набор [регионов](/cloud/reference/supported-regions#aws-regions), что и ClickHouse Cloud.

#### Будет ли какой-либо ресурсный накладной расход? Какие ресурсы нужны для запуска сервисов кроме экземпляров ClickHouse? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

Помимо экземпляров ClickHouse (сервера ClickHouse и ClickHouse Keeper), мы запускаем сервисы, такие как `clickhouse-operator`, `aws-cluster-autoscaler`, Istio и наш стек мониторинга.

В настоящее время у нас есть 3 узла m5.xlarge (по одному для каждой AZ) в выделенной группе узлов для запуска этих нагрузок.

### Сеть и безопасность {#network-and-security}

#### Можем ли мы отозвать разрешения, установленные во время установки, после завершения настройки? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

В настоящее время это невозможно.

#### Рассматривали ли вы некоторые будущие меры безопасности, чтобы инженеры ClickHouse могли получить доступ к инфраструктуре клиента для устранения неполадок? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

Да. Реализация механизма, контролируемого клиентом, где клиенты могут одобрять доступ инженеров к кластеру, есть в нашем дорожном плане. На данный момент инженеры должны использовать наш внутренний процесс эскалации для получения доступа по мере необходимости к кластеру. Это регистрируется и аудируется нашей командой безопасности.

#### Каков размер создаваемого диапазона IP VPC? {#what-is-the-size-of-the-vpc-ip-range-created}

По умолчанию мы используем `10.0.0.0/16` для BYOC VPC. Мы рекомендуем зарезервировать по крайней мере /22 для потенциального будущего масштабирования,
но если вы предпочитаете ограничить размер, можно использовать /23, если будет вероятно, что вы будете ограничены
до 30 серверных подов.

#### Могу ли я самостоятельно решать частоту технического обслуживания {#can-i-decide-maintenance-frequency}

Свяжитесь со службой поддержки, чтобы запланировать окна технического обслуживания. Ожидайте как минимум еженедельный график обновлений.

## Наблюдаемость {#observability}

### Встроенные инструменты мониторинга {#built-in-monitoring-tools}
ClickHouse BYOC предоставляет несколько подходов для различных случаев использования.

#### Панель наблюдаемости {#observability-dashboard}

ClickHouse Cloud включает в себя расширенную панель наблюдаемости, которая отображает метрики, такие как использование памяти, скорость запросов и ввод-вывод. К ней можно получить доступ в разделе **Мониторинг** веб-интерфейса ClickHouse Cloud.

<br />

<Image img={byoc3} size="lg" alt="Панель наблюдаемости" border />

<br />

#### Расширенная панель {#advanced-dashboard}

Вы можете настроить панель, используя метрики из системных таблиц, таких как `system.metrics`, `system.events` и `system.asynchronous_metrics` и др., для детального мониторинга производительности сервера и использования ресурсов.

<br />

<Image img={byoc4} size="lg" alt="Расширенная панель" border />

<br />

#### Доступ к стеку Prometheus для BYOC {#prometheus-access}
ClickHouse BYOC разворачивает стек Prometheus в вашем кластере Kubernetes. Вы можете получить доступ и собирать метрики оттуда и интегрировать их с вашим собственным стеком мониторинга.

Свяжитесь со службой поддержки ClickHouse, чтобы включить частный балансировщик нагрузки и запросить URL. Пожалуйста, обратите внимание, что этот URL доступен только через частную сеть и не поддерживает аутентификацию.

**Пример URL**
```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Интеграция Prometheus {#prometheus-integration}

**УСТАРЕЛО:** Пожалуйста, используйте интеграцию стека Prometheus в предыдущем разделе. Кроме метрик сервера ClickHouse, он предоставляет больше метрик, включая метрики K8S и метрики из других сервисов.

ClickHouse Cloud предоставляет конечную точку Prometheus, которую вы можете использовать для сбора метрик для мониторинга. Это позволяет интегрировать с такими инструментами, как Grafana и Datadog для визуализации.

**Пример запроса через https конечную точку /metrics_all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**Пример ответа**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount The age of the oldest mutation (in seconds)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings The number of warnings issued by the server. It usually indicates about possible misconfiguration

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**Аутентификация**

Для аутентификации можно использовать пару имени пользователя и пароля ClickHouse. Мы рекомендуем создать выделенного пользователя с минимальными правами для сбора метрик. Минимум, требуется разрешение `READ` на таблице `system.custom_metrics` на всех репликах. Например:

```sql
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```

**Настройка Prometheus**

Пример конфигурации показан ниже. Конечная точка `targets` та же, которая используется для доступа к сервису ClickHouse.

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

Пожалуйста, также смотрите [этот блог пост](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) и [документацию по настройке Prometheus для ClickHouse](/integrations/prometheus).

### SLA доступности {#uptime-sla}

#### Предлагает ли ClickHouse SLA доступности для BYOC? {#uptime-sla-for-byoc}

Нет, поскольку плоскость данных размещена в облачной среде клиента, доступность сервиса зависит от ресурсов, которые находятся вне контроля ClickHouse. Поэтому ClickHouse не предлагает формальную SLA доступности для развертываний BYOC. Если у вас есть дополнительные вопросы, пожалуйста, свяжитесь с support@clickhouse.com.
