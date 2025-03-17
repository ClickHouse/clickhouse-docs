---
title: BYOC (Принесите свой облако) для AWS
slug: /cloud/reference/byoc
sidebar_label: BYOC (Принесите свой облако)
keywords: [BYOC, облако, принесите свой облако]
description: Разверните ClickHouse на своей облачной инфраструктуре
---

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


## Обзор {#overview}

BYOC (Принесите свое облако) позволяет вам разворачивать ClickHouse Cloud на вашей собственной облачной инфраструктуре. Это полезно, если у вас есть конкретные требования или ограничения, которые не позволяют вам использовать управляемый сервис ClickHouse Cloud.

**Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Ознакомьтесь с нашими [Условиями использования](https://clickhouse.com/legal/agreements/terms-of-service) для получения дополнительной информации.

В настоящее время BYOC поддерживается только для AWS, разработка для GCP и Microsoft Azure на стадии завершения.

:::note 
BYOC предназначен специально для развертываний крупномасштабного характера и требует от клиентов подписания обязательного контракта.
:::

## Глоссарий {#glossary}

- **VPC ClickHouse:** VPC, принадлежащий ClickHouse Cloud.
- **VPC Customer BYOC:** VPC, принадлежащий облачному аккаунту клиента, развернутый и управляемый ClickHouse Cloud и посвященный развертыванию ClickHouse Cloud BYOC.
- **VPC Customer** Другие VPC, принадлежащие облачному аккаунту клиента, используемые для приложений, которым необходимо подключиться к VPC Customer BYOC.

## Архитектура {#architecture}

Метрики и логи хранятся в VPC клиента BYOC. Логи в настоящее время хранятся локально в EBS. В одном из будущих обновлений логи будут храниться в LogHouse, что является сервисом ClickHouse в VPC клиента BYOC. Метрики реализованы через стек Prometheus и Thanos, хранящийся локально в VPC клиента BYOC.

<br />

<img src={byoc1}
    alt='Архитектура BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

## Процесс адаптации {#onboarding-process}

Клиенты могутInitiate процесс адаптации, связавшись с [нами](https://clickhouse.com/cloud/bring-your-own-cloud). Клиенты должны иметь выделенный аккаунт AWS и знать регион, который они будут использовать. На данный момент мы разрешаем пользователям запускать службы BYOC только в тех регионах, которые мы поддерживаем для ClickHouse Cloud.

### Подготовка выделенного аккаунта AWS {#prepare-a-dedicated-aws-account}

Клиенты должны подготовить выделенный аккаунт AWS для размещения развертывания ClickHouse BYOC, чтобы обеспечить лучшую изоляцию. С этим и адресом электронной почты начального администратора организации вы можете обратиться в службу поддержки ClickHouse.

### Применение шаблона CloudFormation {#apply-cloudformation-template}

Настройка BYOC инициализируется через [стек CloudFormation](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), который создает только роль, позволяющую контроллерам BYOC из ClickHouse Cloud управлять инфраструктурой. Ресурсы S3, VPC и вычислений для запуска ClickHouse не включены в этот стек.

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, из облачной консоли. На этом этапе необходимо определить определенные настройки, так как их нельзя будет изменить позже. В частности:

- **Регион, который вы хотите использовать**: вы можете выбрать любой из [публичных регионов](/cloud/reference/supported-regions), которые мы имеем для ClickHouse Cloud.
- **CIDR диапазон VPC для BYOC**: По умолчанию мы используем `10.0.0.0/16` для CIDR диапазона VPC BYOC. Если вы планируете использовать VPC-peering с другой учетной записью, убедитесь, что диапазоны CIDR не пересекаются. Выделите подходящий CIDR диапазон для BYOC, минимальный размер `/22`, чтобы разместить необходимые рабочие нагрузки.
- **Зоны доступности для VPC BYOC**: Если вы планируете использовать VPC-peering, выравнивание зон доступности между исходным и BYOC аккаунтами может помочь уменьшить затраты на трафик между AZ. В AWS суффиксы зон доступности (`a, b, c`) могут представлять разные физические ID зон между аккаунтами. Подробнее смотрите в [руководстве AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html).

### Дополнительно: Настройка VPC-Peering {#optional-setup-vpc-peering}

Для создания или удаления VPC-peering для ClickHouse BYOC выполните следующие шаги:

#### Шаг 1 Включите Private Load Balancer для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Свяжитесь со службой поддержки ClickHouse для активации Private Load Balancer.

#### Шаг 2 Создайте соединение peering {#step-2-create-a-peering-connection}
1. Перейдите на панель VPC в аккаунте ClickHouse BYOC.
2. Выберите Peering Connections.
3. Нажмите Create Peering Connection.
4. Установите VPC Requester на ID VPC ClickHouse.
5. Установите VPC Acceptor на ID целевого VPC. (Выберите другую учетную запись, если применимо)
6. Нажмите Create Peering Connection.

<br />

<img src={byoc_vpcpeering}
    alt='Создание peering соединения BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Шаг 3 Примите запрос на соединение peering {#step-3-accept-the-peering-connection-request}
Перейдите в peering аккаунт, на странице (VPC -> Peering connections -> Actions -> Accept request) клиент может одобрить этот запрос на VPC peering.

<br />

<img src={byoc_vpcpeering2}
    alt='Принять соединение peering BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Шаг 4 Добавьте назначение в таблицы маршрутов VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}
В аккаунте ClickHouse BYOC,
1. Выберите Route Tables на панели VPC.
2. Найдите ID VPC ClickHouse. Отредактируйте каждую таблицу маршрутов, прикрепленную к приватным подсетям.
3. Нажмите кнопку Edit под вкладкой Routes.
4. Нажмите Add another route.
5. Введите CIDR диапазон целевого VPC для Destination.
6. Выберите “Peering Connection” и ID соединения peering для Target.

<br />

<img src={byoc_vpcpeering3}
    alt='Добавить маршрут в таблицу BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Шаг 5 Добавьте назначение в таблицы маршрутов целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}
В peering аккаунте AWS,
1. Выберите Route Tables на панели VPC.
2. Найдите ID целевого VPC.
3. Нажмите кнопку Edit под вкладкой Routes.
4. Нажмите Add another route.
5. Введите CIDR диапазон VPC ClickHouse для Destination.
6. Выберите “Peering Connection” и ID соединения peering для Target.

<br />

<img src={byoc_vpcpeering4}
    alt='Добавить маршрут в таблицу BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Шаг 6 Измените группу безопасности, чтобы разрешить доступ к VPC-peering {#step-6-edit-security-group-to-allow-peered-vpc-access}
В аккаунте ClickHouse BYOC,
1. В аккаунте ClickHouse BYOC перейдите в EC2 и найдите Private Load Balancer, называемый infra-xx-xxx-ingress-private.

<br />

<img src={byoc_plb}
    alt='Private Load Balancer BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

2. На вкладке Security на странице Details найдите связанную группу безопасности, которая следует шаблону именования, например `k8s-istioing-istioing-xxxxxxxxx`.

<br />

<img src={byoc_security}
    alt='Группа безопасности Private Load Balancer BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

3. Измените правила Inbound этой группы безопасности и добавьте CIDR диапазон VPC-партнера (или укажите необходимый CIDR диапазон по мере необходимости).

<br />

<img src={byoc_inbound}
    alt='Правило входящего трафика группы безопасности BYOC'
    class='image'
    style={{width: '800px'}}
/>

<br />

---
Сейчас сервис ClickHouse должен быть доступен из VPC-партнера.

Чтобы получить доступ к ClickHouse приватно, для безопасного подключения из VPC-партнера пользователя предусмотрены приватный балансировщик нагрузки и конечная точка. Приватная конечная точка следует формату публичной конечной точки с суффиксом `-private`. Например:
- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Приватная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Дополнительно, после проверки работы пиринга, вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая обновления версии базы данных ClickHouse, ClickHouse Operator, EKS и другие компоненты.

Хотя мы стремимся к бесшовным обновлениям (например, к последовательным обновлениям и перезапускам), некоторые из них, такие как изменения версии ClickHouse и обновления узлов EKS, могут повлиять на сервис. Клиенты могут задать временное окно обслуживания (например, каждую среду в 1:00 по PDT), гарантируя, что такие обновления происходят только в запланированное время.

:::note
Окна обслуживания не применяются к исправлениям безопасности и уязвимостей. Эти исправления обрабатываются как внецикловые обновления, с своевременным общением для координации подходящего времени и минимизации операционного воздействия.
:::

## IAM роли CloudFormation {#cloudformation-iam-roles}

### Роль bootstrap IAM {#bootstrap-iam-role}

Роль bootstrap IAM имеет следующие разрешения:

- **Операции EC2 и VPC**: Необходимы для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`)**: Необходимы для создания бакетов для хранения ClickHouse BYOC.
- **Разрешения `route53:*`**: Необходимы для внешнего DNS для настройки записей в Route 53.
- **Операции IAM (например, `iam:CreatePolicy`)**: Необходимы контроллерам для создания дополнительных ролей (см. следующий раздел для подробностей).
- **Операции EKS**: Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные IAM роли, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

В дополнение к роли `ClickHouseManagementRole`, созданной через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли принимаются приложениями, работающими в кластере клиента EKS:
- **Роль State Exporter**
  - Компонент ClickHouse, который сообщает о состоянии сервиса в ClickHouse Cloud.
  - Требуется разрешение на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Контроллер балансировщика нагрузки**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - EBS CSI Controller для управления объемами для служб ClickHouse.
- **External-DNS**
  - Пропагирует конфигурации DNS в Route 53.
- **Cert-Manager**
  - Выдает TLS сертификаты для доменов сервиса BYOC.
- **Cluster Autoscaler**
  - Регулирует размер группы узлов по мере необходимости.

**K8s-control-plane** и **k8s-worker** роли предназначены для получения доступа AWS EKS службами.

Наконец, **`data-plane-mgmt`** позволяет компоненту управления ClickHouse Cloud согласовывать необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и виртуальная служба/ворота Istio.

## Границы сети {#network-boundaries}

Этот раздел охватывает различные сетевые потоки к и от VPC клиента BYOC:

- **Входящий**: Трафик, входящий в VPC клиента BYOC.
- **Исходящий**: Трафик, исходящий из VPC клиента BYOC и отправляемый на внешний адрес.
- **Общественный**: Сетевая конечная точка, доступная из публичного интернета.
- **Приватный**: Сетевая конечная точка, доступная только через частные соединения, такие как VPC-peering, VPC Private Link или Tailscale.

**Ingress Istio развернут за AWS NLB для приема трафика клиентского ClickHouse.**

*Входящий, публичный (может быть частным)*

Шлюз входящего трафика Istio завершает TLS. Сертификат, выдаваемый CertManager с помощью Let's Encrypt, хранится в виде секрета в кластере EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), так как они находятся в одном VPC.

По умолчанию, входящий трафик является публично доступным с фильтрацией по списку разрешенных IP-адресов. Клиенты могут настроить VPC-peering, чтобы сделать его частным и отключить публичные соединения. Мы настоятельно рекомендуем настроить [IP фильтр](/cloud/security/setting-ip-filters) для ограничения доступа.

### Устранение проблем с доступом {#troubleshooting-access}

*Входящий, публичный (может быть частным)*

Инженеры ClickHouse Cloud требуют доступа для устранения проблем через Tailscale. Им предоставляются сертификаты на момент доступа для развертываний BYOC.

### Сбор информации о выставлении счетов {#billing-scraper}

*Исходящий, приватный*

Сбор информации о выставлении счетов собирает данные о выставлении счетов от ClickHouse и отправляет их в бакет S3, принадлежащий ClickHouse Cloud.

Он работает как сайдкар вместе с контейнером сервера ClickHouse, периодически собирая данные о CPU и памяти. Запросы в пределах одного региона маршрутизируются через конечные точки службы шлюза VPC.

### Оповещения {#alerts}

*Исходящий, публичный*

AlertManager настроен на отправку оповещений в ClickHouse Cloud, когда кластер ClickHouse клиента становится нездоровым.

Метрики и логи хранятся в VPC клиента BYOC. Логи в настоящее время хранятся локально в EBS. В одном из будущих обновлений они будут храниться в LogHouse, сервисе ClickHouse в VPC BYOC. Метрики используют стек Prometheus и Thanos, хранящийся локально в VPC BYOC.

### Состояние сервиса {#service-state}

*Исходящий*

Экспортёр состояния отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащий ClickHouse Cloud.

## Возможности {#features}

### Поддерживаемые функции {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud и BYOC используют одинаковый бинарный и конфигурацию. Поэтому все функции из ядра ClickHouse поддерживаются в BYOC, такие как SharedMergeTree.
- **Консольный доступ для управления состоянием сервиса**:
  - Поддерживает операции, такие как запуск, остановка и завершение.
  - Просмотр служб и статусов.
- **Резервное копирование и восстановление.**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Простой уровень ожидания.**
- **Складские помещения**: отделение вычислений.
- **Сеть нулевой доверенности через Tailscale.**
- **Мониторинг**:
  - Облачная консоль включает встроенные информационные панели для мониторинга состояния сервиса.
  - Сбор метрик Prometheus для централизованного мониторинга с Prometheus, Grafana и Datadog. Ознакомьтесь с [документацией Prometheus](/integrations/prometheus) для инструкций по настройке.
- **VPC-пиринг.**
- **Интеграции**: см. полный список на [этой странице](/integrations).
- **Безопасный S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Запланированные функции (в настоящее время не поддерживаются) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) или CMEK (шифрование с управляемыми заказчиком ключами)
- ClickPipes для загрузки данных
- Авто-масштабирование
- Интерфейс MySQL

## Часто задаваемые вопросы {#faq}

### Вычисления {#compute}

#### Могу ли я создать несколько служб в этом одном кластере EKS? {#can-i-create-multiple-services-in-this-single-eks-cluster}

Да. Инфраструктура должна быть развернута только один раз для каждого сочетания аккаунта AWS и региона.

### Какие регионы вы поддерживаете для BYOC? {#which-regions-do-you-support-for-byoc}

BYOC поддерживает тот же набор [регионов](/cloud/reference/supported-regions#aws-regions), что и ClickHouse Cloud.

#### Будет ли какой-то накладной ресурс? Каковы ресурсы, необходимые для запуска служб, кроме экземпляров ClickHouse? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

Кроме экземпляров Clickhouse (серверов ClickHouse и ClickHouse Keeper), мы запускаем такие службы, как `clickhouse-operator`, `aws-cluster-autoscaler`, Istio и т.д. и наш стек мониторинга.

В настоящее время у нас есть 3 узла m5.xlarge (по одному для каждой AZ) в выделенной группе узлов для выполнения этих рабочих нагрузок.

### Сеть и безопасность {#network-and-security}

#### Можем ли мы отменить разрешения, установленные во время установки, после завершения настройки? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

На данный момент это невозможно.

#### Учитывали ли вы какие-либо будущие меры безопасности для инженеров ClickHouse для доступа к инфраструктуре клиента для устранения неполадок? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

Да. Реализация механизма, контролируемого клиентом, где клиенты могут одобрять доступ инженеров к кластеру, есть в нашем плане. В данный момент инженеры должны проходить наш внутренний процесс эскалации, чтобы получить доступ в режиме "в нужное время" к кластеру. Это фиксируется и проверяется нашей службой безопасности.

#### Каков размер создаваемого диапазона IP VPC? {#what-is-the-size-of-the-vpc-ip-range-created}

По умолчанию мы используем `10.0.0.0/16` для VPC BYOC. Мы рекомендуем зарезервировать как минимум /22 для потенциального масштабирования в будущем, но если вы предпочитаете ограничить размер, возможно использование /23, если вероятно, что вы будете ограничены до 30 серверных подов.

#### Могу ли я определить частоту технического обслуживания {#can-i-decide-maintenance-frequency}

Свяжитесь с поддержкой для планирования окон технического обслуживания. Ожидайте минимум раз в неделю обновлений.

## Наблюдаемость {#observability}

### Встроенные инструменты мониторинга {#built-in-monitoring-tools}

#### Информационная панель наблюдаемости {#observability-dashboard}

ClickHouse Cloud включает в себя продвинутую информационную панель наблюдаемости, которая отображает метрики, такие как использование памяти, скорость запросов и I/O. Получить доступ к ней можно в разделе **Мониторинг** интерфейса веб-консоли ClickHouse Cloud.

<br />

<img src={byoc3}
    alt='Информационная панель наблюдаемости'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Расширенная панель {#advanced-dashboard}

Вы можете настроить панель, используя метрики из системных таблиц, таких как `system.metrics`, `system.events` и `system.asynchronous_metrics`, и т.д. для детального мониторинга производительности сервера и использования ресурсов.

<br />

<img src={byoc4}
    alt='Расширенная панель'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Интеграция с Prometheus {#prometheus-integration}

ClickHouse Cloud предоставляет конечную точку Prometheus, которую вы можете использовать для сбора метрик для мониторинга. Это позволяет интегрироваться с инструментами, такими как Grafana и Datadog, для визуализации.

**Пример запроса через https конечную точку /metrics_all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**Пример ответа**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes Количество байт, хранимых на диске `s3disk` в системной базе данных

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts Количество сломанных отсоединённых частей

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount Возраст самой старой мутации (в секундах)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings Количество предупреждений, выданных сервером. Обычно это указывает на возможные неправильные настройки

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors Общее количество ошибок на сервере с момента последнего перезапуска

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**Аутентификация**

Для аутентификации можно использовать пару логин-пароль ClickHouse. Мы рекомендуем создать выделенного пользователя с минимальными разрешениями для сбора метрик. По меньшей мере, разрешение `READ` требуется на таблицу `system.custom_metrics` на всех репликах. Например:

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Настройка Prometheus**

Пример конфигурации показан ниже. Конечная точка `targets` такая же, как для доступа к сервису ClickHouse.

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

Также смотрите [этот блог пост](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) и [документацию по настройке Prometheus для ClickHouse](/integrations/prometheus).
