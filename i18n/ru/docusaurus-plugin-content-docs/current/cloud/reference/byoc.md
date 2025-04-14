---
title: 'BYOC (Bring Your Own Cloud) для AWS'
slug: /cloud/reference/byoc
sidebar_label: 'BYOC (Bring Your Own Cloud)'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Развертывание ClickHouse в вашей собственной облачной инфраструктуре'
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

## Обзор {#overview}

BYOC (Bring Your Own Cloud) позволяет вам развернуть ClickHouse Cloud на вашей собственной облачной инфраструктуре. Это полезно, если у вас есть специфические требования или ограничения, которые не позволяют вам использовать управляемый сервис ClickHouse Cloud.

**Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Ознакомьтесь с нашими [Условиями обслуживания](https://clickhouse.com/legal/agreements/terms-of-service) для получения дополнительной информации.

В настоящее время BYOC поддерживается только для AWS, разработки для GCP и Microsoft Azure находятся в процессе.

:::note 
BYOC предназначен специально для развертываний в крупном масштабе и требует от клиентов подписать обязательный контракт.
:::

## Глоссарий {#glossary}

- **VPC ClickHouse:** VPC, принадлежащий ClickHouse Cloud.
- **VPC клиента BYOC:** VPC, принадлежащий облачному аккаунту клиента, создаваемый и управляемый ClickHouse Cloud и выделенный для развертывания BYOC ClickHouse Cloud.
- **VPC клиента:** Другие VPC, принадлежащие облачному аккаунту клиента, используемые для приложений, которым необходимо подключаться к VPC клиента BYOC.

## Архитектура {#architecture}

Метрики и логи хранятся в VPC клиента BYOC. В данный момент логи хранятся локально в EBS. В будущих обновлениях логи будут храниться в LogHouse, который является сервисом ClickHouse в VPC клиента BYOC. Метрики реализованы с помощью стека Prometheus и Thanos, хранится локально в VPC клиента BYOC.

<br />

<Image img={byoc1} size="lg" alt="Архитектура BYOC" background='black'/>

<br />

## Процесс регистрации {#onboarding-process}

Клиенты могут инициировать процесс регистрации, обратившись к [нам](https://clickhouse.com/cloud/bring-your-own-cloud). Клиенты должны иметь выделенный аккаунт AWS и знать регион, который они будут использовать. В настоящее время мы разрешаем пользователям запускать услуги BYOC только в тех регионах, которые поддерживаются для ClickHouse Cloud.

### Подготовка выделенного аккаунта AWS {#prepare-a-dedicated-aws-account}

Клиенты должны подготовить выделенный аккаунт AWS для размещения развертывания ClickHouse BYOC, чтобы обеспечить лучшую изоляцию. С этим и начальными организационными данными админу вы можете обратиться в техническую поддержку ClickHouse.

### Применение шаблона CloudFormation {#apply-cloudformation-template}

Настройка BYOC инициализируется с помощью [стека CloudFormation](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), который создает только роль, позволяющую контроллерам BYOC от ClickHouse Cloud управлять инфраструктурой. Ресурсы S3, VPC и вычислительные ресурсы для запуска ClickHouse не включены в этот стек.

<!-- TODO: Добавить скриншот для оставшейся части регистрации, как только будет реализована самостоятелная регистрация. -->

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, из облачной консоли. Некоторые конфигурации должны быть определены на этом этапе, так как их нельзя будет изменить позже. В частности:

- **Регион, который вы хотите использовать**: вы можете выбрать один из любых [публичных регионов](/cloud/reference/supported-regions), которые мы имеем для ClickHouse Cloud.
- **CIDR диапазон VPC для BYOC**: По умолчанию мы используем `10.0.0.0/16` для CIDR диапазона VPC BYOC. Если вы планируете использовать VPC-пиринг с другим аккаунтом, убедитесь, что CIDR диапазоны не перекрываются. Выделите соответствующий CIDR диапазон для BYOC, минимальный размер которого должен составлять `/22`, чтобы учесть необходимые рабочие нагрузки.
- **Зоны доступности для VPC BYOC**: Если вы планируете использовать VPC-пиринг, согласование зон доступности между исходным и BYOC аккаунтами может помочь снизить расходы на межзоновой трафик. В AWS суффиксы зон доступности (`a, b, c`) могут представлять разные физические идентификаторы зон в разных аккаунтах. См. [руководство AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) для получения дополнительной информации.

### Необязательно: Настройка VPC-пиринга {#optional-setup-vpc-peering}

Чтобы создать или удалить VPC-пиринг для ClickHouse BYOC, выполните следующие шаги:

#### Шаг 1 Включение частного балансировщика нагрузки для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Свяжитесь с поддержкой ClickHouse для включения частного балансировщика нагрузки.

#### Шаг 2 Создание соединения пиринга {#step-2-create-a-peering-connection}
1. Перейдите на панель управления VPC в аккаунте ClickHouse BYOC.
2. Выберите "Соединения пиринга".
3. Нажмите "Создать соединение пиринга".
4. Установите VPC-запрос для ID VPC ClickHouse.
5. Установите VPC-акцептор для целевого ID VPC. (Выберите другой аккаунт, если применимо)
6. Нажмите "Создать соединение пиринга".

<br />

<Image img={byoc_vpcpeering} size="lg" alt="Создание соединения пиринга BYOC" border />

<br />

#### Шаг 3 Принять запрос на соединение пиринга {#step-3-accept-the-peering-connection-request}
Перейдите в пиринговый аккаунт, на странице (VPC -> Соединения пиринга -> Действия -> Принять запрос) клиент может утвердить этот запрос о пиринге VPC.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="Принятие соединения пиринга BYOC" border />

<br />

#### Шаг 4 Добавить назначение в таблицы маршрутов VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}
В аккаунте ClickHouse BYOC,
1. Выберите "Таблицы маршрутов" в панели управления VPC.
2. Найдите ID VPC ClickHouse. Отредактируйте каждую таблицу маршрутов, прикрепленную к частным подсетям.
3. Нажмите кнопку "Редактировать" на вкладке маршрутов.
4. Нажмите "Добавить другой маршрут".
5. Введите CIDR диапазон целевого VPC в поле Назначения.
6. Выберите "Соединение пиринга" и ID соединения пиринга для Цели.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="Добавить таблицу маршрутов BYOC" border />

<br />

#### Шаг 5 Добавить назначение в таблицы маршрутов целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}
В пиринговом аккаунте AWS,
1. Выберите "Таблицы маршрутов" в панели управления VPC.
2. Найдите ID целевого VPC.
3. Нажмите кнопку "Редактировать" на вкладке маршрутов.
4. Нажмите "Добавить другой маршрут".
5. Введите CIDR диапазон VPC ClickHouse в поле Назначения.
6. Выберите "Соединение пиринга" и ID соединения пиринга для Цели.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="Добавить таблицу маршрутов BYOC" border />

<br />

#### Шаг 6 Редактировать группу безопасности, чтобы разрешить доступ к пиринговой VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}
В аккаунте ClickHouse BYOC,
1. В аккаунте ClickHouse BYOC перейдите в EC2 и найдите Частный балансировщик нагрузки с именем вроде infra-xx-xxx-ingress-private.

<br />

<Image img={byoc_plb} size="lg" alt="Частный балансировщик нагрузки BYOC" border />

<br />

2. На вкладке Безопасность на странице деталей найдите соответствующую группу безопасности, которая следует шаблону именования, как `k8s-istioing-istioing-xxxxxxxxx`.

<br />

<Image img={byoc_security} size="lg" alt="Группа безопасности частного балансировщика нагрузки BYOC" border />

<br />

3. Отредактируйте входящие правила этой группы безопасности и добавьте CIDR диапазон пиринговой VPC (или укажите необходимый CIDR диапазон по мере необходимости).

<br />

<Image img={byoc_inbound} size="lg" alt="Правило входа группы безопасности BYOC" border />

<br />

---
Сервис ClickHouse теперь должен быть доступен из пиринговой VPC.

Для частного доступа к ClickHouse в пиринговой VPC выделяется частный балансировщик нагрузки и конечная точка для безопасного подключения. Частная конечная точка следует формату публичной конечной точки с суффиксом `-private`. Например:
- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Частная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Необязательно, после проверки работы пиринга вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая обновления версий баз данных ClickHouse, ClickHouse Operator, EKS и других компонентов.

Хотя мы стремимся к бесшовным обновлениям (например, кrolling upgrades и перезагрузкам), некоторые из них, такие как изменения версий ClickHouse и обновления узлов EKS, могут повлиять на сервис. Клиенты могут указать окно обслуживания (например, каждую вторник в 1:00 по PDT), чтобы гарантировать, что такие обновления происходят только в запланированное время.

:::note
Окна обслуживания не применяются для исправлений безопасности и уязвимостей. Они обрабатываются как внецикловые обновления с своевременным уведомлением для координации подходящего времени и минимизации операционного воздействия.
:::

## IAM роли CloudFormation {#cloudformation-iam-roles}

### Роль IAM начальной загрузки {#bootstrap-iam-role}

Роль IAM начальной загрузки имеет следующие разрешения:

- **Действия EC2 и VPC**: Необходимы для настройки VPC и кластеров EKS.
- **Действия с S3 (например, `s3:CreateBucket`)**: Необходимы для создания бакетов для хранения ClickHouse BYOC.
- **Разрешения `route53:*`**: Необходимы для внешнего DNS для настройки записей в Route 53.
- **Действия IAM (например, `iam:CreatePolicy`)**: Необходимы для контроллеров для создания дополнительных ролей (см. следующий раздел для подробностей).
- **Действия EKS**: Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные IAM роли, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

В дополнение к `ClickHouseManagementRole`, созданной через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли предполагаются приложениями, запущенными в кластере EKS клиента:
- **Роль экспорта состояния**
  - Компонент ClickHouse, который сообщает информацию о состоянии сервиса ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Контроллер балансировщика нагрузки**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер EBS CSI для управления томами для услуг ClickHouse.
- **Внешний DNS**
  - Распространяет конфигурации DNS в Route 53.
- **Cert-Manager**
  - Предоставляет TLS сертификаты для доменов BYOC.
- **Автоскейлер кластера**
  - Регулирует размер группы узлов по мере необходимости.

**K8s-control-plane** и **k8s-worker** роли предназначены для использования службами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту управления ClickHouse Cloud синхронизировать необходимые настраиваемые ресурсы, такие как `ClickHouseCluster` и виртуальные сервисы/шлюзы Istio.

## Сетевые границы {#network-boundaries}

В этом разделе рассматривается разный сетевой трафик из и в VPC клиента BYOC:

- **Входящий**: Трафик, входящий в VPC клиента BYOC.
- **Исходящий**: Трафик, исходящий из VPC клиента BYOC и отправляемый на внешние назначения.
- **Публичный**: Сетевой конечный пункт, доступный из публичного интернета.
- **Частный**: Сетевой конечный пункт, доступный только через частные соединения, такие как пиринг VPC, Частный линк VPC или Tailscale.

**Ingess Istio развертывается за NLB AWS для приема трафика клиентов ClickHouse.**

*Входящий, Публичный (может быть Частным)*

Шлюз входа Istio завершает TLS. Сертификат, предоставленный CertManager с Let's Encrypt, хранится как секрет в классе EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types) так как они находятся в одном и том же VPC.

По умолчанию входящий трафик является публично доступным с фильтрацией по списку разрешений IP. Клиенты могут настроить пиринг VPC, чтобы сделать его частным и отключить публичные соединения. Мы настоятельно рекомендуем настроить [фильтр IP](/cloud/security/setting-ip-filters), чтобы ограничить доступ.

### Устранение проблем с доступом {#troubleshooting-access}

*Входящий, Публичный (может быть Частным)*

Инженеры ClickHouse Cloud требуют доступа для устранения проблем через Tailscale. Им предоставляется аутентификация на основе сертификатов с ограниченным временем действия для развертываний BYOC.

### Сборщик данных {#billing-scraper}

*Исходящий, Частный*

Сборщик данных собирает данные о выставлении счетов из ClickHouse и отправляет их в бакет S3, принадлежащий ClickHouse Cloud.

Он работает как сайдкар рядом с контейнером сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы в рамках одного региона маршрутизируются через конечные точки сервисов шлюза VPC.

### Уведомления {#alerts}

*Исходящий, Публичный*

AlertManager настроен на отправку уведомлений ClickHouse Cloud, когда кластер ClickHouse клиента работает неправильно.

Метрики и логи хранятся в VPC клиента BYOC. Логи в настоящее время хранятся локально в EBS. В будущем они будут храниться в LogHouse, сервисе ClickHouse в VPC BYOC. Метрики используют стек Prometheus и Thanos, хранится локально в VPC BYOC.

### Состояние сервиса {#service-state}

*Исходящий*

Экспортер состояния отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащую ClickHouse Cloud.

## Функции {#features}

### Поддерживаемые функции {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud и BYOC используют один и тот же бинарный файл и конфигурацию. Поэтому все функции из ядра ClickHouse поддерживаются в BYOC, такие как SharedMergeTree.
- **Доступ через консоль для управления состоянием сервиса**:
  - Поддерживает операции, такие как запуск, остановка и завершение.
  - Просмотр сервисов и статуса.
- **Резервное копирование и восстановление.**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Идлинг.**
- **Склады**: Разделение вычислений
- **Сеть с нулевым доверием через Tailscale.**
- **Мониторинг**:
  - Облачная консоль включает встроенные панели мониторинга для отслеживания состояния сервиса.
  - Сбор метрик Prometheus для централизованного мониторинга с Prometheus, Grafana и Datadog. См. [документацию по Prometheus](/integrations/prometheus) для инструкций по настройке.
- **VPC пиринг.**
- **Интеграции**: См. полный список на [этой странице](/integrations).
- **Безопасный S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Планируемые функции (текущая неподдержка) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) также известный как CMEK (ключи шифрования, управляемые клиентом)
- ClickPipes для приема
- Автомасштабирование
- Интерфейс MySQL

## Часто задаваемые вопросы {#faq}

### Вычисления {#compute}

#### Могу ли я создать несколько сервисов в одном кластере EKS? {#can-i-create-multiple-services-in-this-single-eks-cluster}

Да. Инфраструктура должна быть подготовлена только один раз для каждой комбинации аккаунта AWS и региона.

### Какие регионы вы поддерживаете для BYOC? {#which-regions-do-you-support-for-byoc}

BYOC поддерживает такой же набор [регионов](/cloud/reference/supported-regions#aws-regions), как и ClickHouse Cloud.

#### Будет ли какая-либо накладная нагрузка? Какие ресурсы нужны для работы сервисов, кроме экземпляров ClickHouse? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

Кроме экземпляров Clickhouse (серверы ClickHouse и ClickHouse Keeper), мы запускаем такие службы, как `clickhouse-operator`, `aws-cluster-autoscaler`, Istio и нашу стек мониторинга.

В настоящее время у нас есть 3 узла m5.xlarge (по одному для каждой AZ) в выделенной группе узлов для выполнения этих рабочих нагрузок.

### Сеть и безопасность {#network-and-security}

#### Можем ли мы отозвать разрешения, установленные во время установки, после завершения настройки? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

В настоящее время это невозможно.

#### Рассматривали ли вы некоторые будущие меры безопасности, чтобы инженеры ClickHouse могли получить доступ к инфраструктуре клиента для устранения проблем? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

Да. Реализация механизма, контролируемого клиентом, где клиенты могут одобрять доступ инженеров к кластеру, стоит у нас на повестке дня. В данный момент инженерам необходимо пройти наш внутренний процесс эскалации, чтобы получить доступ ко времени действия кластера. Это фиксируется и проверяется нашей командой безопасности.

#### Каков размер диапазона IP VPC? {#what-is-the-size-of-the-vpc-ip-range-created}

По умолчанию мы используем `10.0.0.0/16` для VPC BYOC. Мы рекомендуем зарезервировать минимум /22 для потенциального будущего масштабирования, но если вы предпочитаете ограничить размер, возможно использование /23, если вам, вероятно, будет достаточно развёртывания 30 серверных подов.

#### Могу ли я решить частоту обслуживания {#can-i-decide-maintenance-frequency}

Свяжитесь с поддержкой, чтобы запланировать окна обслуживания. Ожидайте минимум еженедельного графика обновления.

## Наблюдаемость {#observability}

### Встроенные инструменты мониторинга {#built-in-monitoring-tools}

#### Панель наблюдаемости {#observability-dashboard}

ClickHouse Cloud включает усовершенствованную панель наблюдаемости, которая отображает метрики, такие как использование памяти, скорость запросов и I/O. Это можно получить в разделе **Мониторинг** интерфейса веб-консоли ClickHouse Cloud.

<br />

<Image img={byoc3} size="lg" alt="Панель наблюдаемости" border />

<br />

#### Расширенная панель {#advanced-dashboard}

Вы можете настроить панель, используя метрики из системных таблиц, такие как `system.metrics`, `system.events` и `system.asynchronous_metrics`, чтобы детально отслеживать производительность сервера и использование ресурсов.

<br />

<Image img={byoc4} size="lg" alt="Расширенная панель" border />

<br />

#### Интеграция с Prometheus {#prometheus-integration}

ClickHouse Cloud предоставляет конечную точку Prometheus, которую вы можете использовать для сбора метрик для мониторинга. Это позволяет интегрироваться с такими инструментами, как Grafana и Datadog для визуализации.

**Пример запроса через HTTPS конечную точку /metrics_all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**Пример ответа**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes Количество байт, хранящихся на диске `s3disk` в системной базе данных

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts Количество поврежденных отсоединенных частей

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount Возраст самой старой мутации (в секундах)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings Количество предупреждений, выданных сервером. Обычно указывает на возможные ошибки конфигурации

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors Общее количество ошибок на сервере с последнего перезапуска

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**Аутентификация**

Для аутентификации можно использовать пару имени пользователя и пароля ClickHouse. Мы рекомендуем создавать выделенного пользователя с минимальными разрешениями для сбора метрик. Минимум, требуется разрешение `READ` на таблице `system.custom_metrics` на всех репликах. Например:

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Настройка Prometheus**

Пример конфигурации показан ниже. Эндпоинт `targets` - это тот же, который используется для доступа к сервису ClickHouse.

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

Пожалуйста, также смотрите [этот блог-пост](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) и [документы по настройке Prometheus для ClickHouse](/integrations/prometheus).
