---
title: 'BYOC (Bring Your Own Cloud) для AWS'
slug: /cloud/reference/byoc
sidebar_label: 'BYOC (Bring Your Own Cloud)'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Развертывание ClickHouse на вашей собственной облачной инфраструктуре'
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

BYOC (Bring Your Own Cloud) позволяет вам развернуть ClickHouse Cloud на вашей собственной облачной инфраструктуре. Это полезно, если у вас есть специфические требования или ограничения, которые мешают вам использовать управляемый сервис ClickHouse Cloud.

**Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Смотрите наши [Условия обслуживания](https://clickhouse.com/legal/agreements/terms-of-service) для получения дополнительной информации.

На данный момент BYOC поддерживается только для AWS, разработки для GCP и Microsoft Azure находятся в процессе.

:::note 
BYOC предназначен специально для масштабных развертываний и требует от клиентов подписания обязательного договора.
:::

## Глоссарий {#glossary}

- **VPC ClickHouse:**  VPC, принадлежащий ClickHouse Cloud.
- **VPC клиента BYOC:** VPC, принадлежащая облачному аккаунту клиента, развернутая и управляемая ClickHouse Cloud и выделенная для развертывания ClickHouse Cloud BYOC.
- **VPC клиента:** Другие VPC, принадлежащие облачному аккаунту клиента, используемые для приложений, которые должны подключаться к VPC клиента BYOC.

## Архитектура {#architecture}

Метрики и логи хранятся в VPC клиента BYOC. Логи в настоящее время хранятся локально в EBS. В будущих обновлениях логи будут храниться в LogHouse, который является сервисом ClickHouse в VPC клиента BYOC. Метрики реализованы через стек Prometheus и Thanos, хранящиеся локально в VPC клиента BYOC.

<br />

<Image img={byoc1} size="lg" alt="Архитектура BYOC" background='black'/>

<br />

## Процесс подключения {#onboarding-process}

Клиенты могут инициировать процесс подключения, связавшись с [нами](https://clickhouse.com/cloud/bring-your-own-cloud). Клиенты должны иметь выделенный аккаунт AWS и знать регион, который они будут использовать. В настоящее время мы разрешаем пользователям запускать сервисы BYOC только в тех регионах, которые мы поддерживаем для ClickHouse Cloud.

### Подготовьте выделенный аккаунт AWS {#prepare-a-dedicated-aws-account}

Клиенты должны подготовить выделенный аккаунт AWS для хостинга развертывания ClickHouse BYOC, чтобы обеспечить лучшее изоляцию. С этим и начальным электронным адресом администратора вашей организации вы можете связаться с поддержкой ClickHouse.

### Примените шаблон CloudFormation {#apply-cloudformation-template}

Настройка BYOC запускается через [стек CloudFormation](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), который создает только роль, позволяющую контроллерам BYOC из ClickHouse Cloud управлять инфраструктурой. Ресурсы S3, VPC и вычислительные ресурсы для запуска ClickHouse не включены в этот стек.

<!-- TODO: Добавить скриншот для оставшейся части подключения, как только будет реализовано самообслуживание подключения. -->

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, из облачной консоли. Определенные конфигурации должны быть установлены на этом этапе, так как их нельзя будет изменить позже. В частности:

- **Регион, который вы хотите использовать**: вы можете выбрать любой из [общедоступных регионов](/cloud/reference/supported-regions), которые у нас есть для ClickHouse Cloud.
- **CIDR диапазон VPC для BYOC**: По умолчанию мы используем `10.0.0.0/16` для CIDR диапазона VPC BYOC. Если вы планируете использовать VPC-пиринг с другим аккаунтом, убедитесь, что диапазоны CIDR не пересекаются. Выделите подходящий CIDR диапазон для BYOC, минимальный размер которого составляет `/22`, чтобы разместить необходимые рабочие нагрузки.
- **Зоны доступности для VPC BYOC**: Если вы планируете использовать VPC-пиринг, согласование зон доступности между исходным и BYOC аккаунтами может помочь снизить затраты на трафик между AZ. В AWS суффиксы зон доступности (`a, b, c`) могут представлять разные физические идентификаторы зон между аккаунтами. Смотрите [руководство AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) для получения деталей.

### Дополнительно: Настройка VPC-пиринга {#optional-setup-vpc-peering}

Чтобы создать или удалить VPC-пиринг для ClickHouse BYOC, выполните следующие шаги:

#### Шаг 1 Включите частный балансировщик нагрузки для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Свяжитесь со службой поддержки ClickHouse для включения частного балансировщика нагрузки.

#### Шаг 2 Создайте соединение пиринга {#step-2-create-a-peering-connection}
1. Перейдите к панели VPC в аккаунте ClickHouse BYOC.
2. Выберите Пиринговые соединения.
3. Нажмите Создать соединение пиринга.
4. Установите запрашивающий VPC на ID VPC ClickHouse.
5. Установите принимающий VPC на ID целевого VPC. (При необходимости выберите другой аккаунт.)
6. Нажмите Создать соединение пиринга.

<br />

<Image img={byoc_vpcpeering} size="lg" alt="Создание соединения пиринга BYOC" border />

<br />

#### Шаг 3 Примите запрос на соединение пиринга {#step-3-accept-the-peering-connection-request}
Перейдите в аккаунт пиринга, на странице (VPC -> Пиринговые соединения -> Действия -> Принять запрос) клиент может одобрить этот запрос на VPC пиринг.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="Принять соединение пиринга BYOC" border />

<br />

#### Шаг 4 Добавьте пункт назначения в таблицы маршрутов VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}
В аккаунте ClickHouse BYOC:
1. Выберите Таблицы маршрутов в панели VPC.
2. Найдите ID VPC ClickHouse. Отредактируйте каждую таблицу маршрутов, прикрепленную к частным подсетям.
3. Нажмите кнопку Редактировать на вкладке Маршруты.
4. Нажмите Добавить другой маршрут.
5. Введите CIDR диапазон целевого VPC для назначения.
6. Выберите "Соединение пиринга" и ID соединения пиринга для цели.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="Добавить таблицу маршрутов BYOC" border />

<br />

#### Шаг 5 Добавьте пункт назначения в таблицы маршрутов целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}
В аккаунте AWS пиринга:
1. Выберите Таблицы маршрутов в панели VPC.
2. Найдите ID целевого VPC.
3. Нажмите кнопку Редактировать на вкладке Маршруты.
4. Нажмите Добавить другой маршрут.
5. Введите CIDR диапазон VPC ClickHouse для назначения.
6. Выберите "Соединение пиринга" и ID соединения пиринга для цели.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="Добавить таблицу маршрутов BYOC" border />

<br />

#### Шаг 6 Отредактируйте группу безопасности, чтобы разрешить доступ к пиринговому VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}
В аккаунте ClickHouse BYOC:
1. В аккаунте ClickHouse BYOC перейдите в EC2 и найдите Частный балансировщик нагрузки с именем, как infra-xx-xxx-ingress-private.

<br />

<Image img={byoc_plb} size="lg" alt="Частный балансировщик нагрузки BYOC" border />

<br />

2. На вкладке Безопасность на странице сведений найдите связанную группу безопасности, которая следует шаблону именования, как `k8s-istioing-istioing-xxxxxxxxx`.

<br />

<Image img={byoc_security} size="lg" alt="Группа безопасности частного балансировщика нагрузки BYOC" border />

<br />

3. Отредактируйте входящие правила этой группы безопасности и добавьте диапазон CIDR пирингового VPC (или укажите требуемый диапазон CIDR по мере необходимости).

<br />

<Image img={byoc_inbound} size="lg" alt="Входное правило группы безопасности BYOC" border />

<br />

---
Сервис ClickHouse теперь должен быть доступен из пирингового VPC.

Чтобы получить доступ к ClickHouse приватно, создан частный балансировщик нагрузки и конечная точка для безопасного подключения из пирингового VPC пользователя. Приватная конечная точка имеет тот же формат, что и публичная конечная точка, с суффиксом `-private`. Например:
- **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Приватная конечная точка**: `h5ju65kv87-private.mhp0y65dmph.us-west-2.aws.byoc.clickhouse.cloud`

Дополнительно, после проверки работы пиринга вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая обновления версии базы данных ClickHouse, ClickHouse Operator, EKS и других компонентов.

Хотя мы стремимся к бесшовным обновлениям (например, поэтапным обновлениям и перезапускам), некоторые, такие как изменения версии ClickHouse и обновления узлов EKS, могут повлиять на сервис. Клиенты могут указать окно обслуживания (например, каждый вторник в 1:00 по PDT), чтобы гарантировать, что такие обновления происходят только в установленное время.

:::note
Окна обслуживания не применяются к исправлениям безопасности и уязвимостей. Эти вопросы рассматриваются как внеплановые обновления с своевременным информированием для координации удобного времени и минимизации операционного воздействия.
:::

## IAM роли CloudFormation {#cloudformation-iam-roles}

### Роль IAM начальной загрузки {#bootstrap-iam-role}

Роль начальной загрузки IAM имеет следующие разрешения:

- **Операции EC2 и VPC**: Необходимы для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`)**: Необходимы для создания корзин для хранения ClickHouse BYOC.
- **Разрешения `route53:*`**: Необходимы для внешнего DNS, чтобы настраивать записи в Route 53.
- **Операции IAM (например, `iam:CreatePolicy`)**: Необходимы для контроллеров для создания дополнительных ролей (см. следующий раздел для деталей).
- **Операции EKS**: Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные IAM роли, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

В дополнение к роли `ClickHouseManagementRole`, созданной через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли предполагаются приложениями, работающими в кластере EKS клиента:
- **Роль экспорта состояния**
  - Компонент ClickHouse, который сообщает информацию о состоянии сервиса в ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Контроллер балансировщика нагрузки**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер CSI EBS для управления томами для сервисов ClickHouse.
- **Внешний DNS**
  - Пропагирует конфигурации DNS в Route 53.
- **Cert-Manager**
  - Предоставляет TLS-сертификаты для доменов сервисов BYOC.
- **Автооткалибровщик кластера**
  - Корректирует размер группы узлов по мере необходимости.

**K8s-control-plane** и **k8s-worker** роли предназначены для предположения сервисами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту ClickHouse Cloud Control Plane согласовывать необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и Istio Virtual Service/Gateway.

## Сетевые границы {#network-boundaries}

В этом разделе рассматриваются различные сетевые трафики к и от VPC клиента BYOC:

- **Входящие**: Трафик, поступающий во VPC клиента BYOC.
- **Исходящие**: Трафик, исходящий из VPC клиента BYOC и отправляемый на внешние назначения.
- **Публичный**: Сетевой конечная точка, доступная из публичного интернета.
- **Частный**: Сетевой конечная точка, доступная только через частные подключения, такие как VPC-пиринг, VPC Private Link или Tailscale.

**Ingress Istio развертывается за AWS NLB для принятия трафика клиентов ClickHouse.**

*Входящие, Публичные (могут быть Частными)*

Шлюз входа Istio завершает TLS. Сертификат, предоставленный CertManager с Let's Encrypt, хранится как секрет в кластере EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), так как они находятся в одном VPC.

По умолчанию входящие соединения общедоступны с фильтрацией по списку IP. Клиенты могут настроить VPC-пиринг, чтобы сделать его частным и отключить публичные соединения. Мы настоятельно рекомендуем установить [фильтр IP](/cloud/security/setting-ip-filters), чтобы ограничить доступ.

### Устранение неполадок доступа {#troubleshooting-access}

*Входящие, Публичные (могут быть Частными)*

Инженеры ClickHouse Cloud требуют доступа для устранения неполадок через Tailscale. Им предоставляются временно действующие сертификаты для аутентификации для развертываний BYOC.

### Скрепер выставления счетов {#billing-scraper}

*Исходящие, Частные*

Скрепер выставления счетов собирает данные о выставлении счетов из ClickHouse и отправляет их в корзину S3, принадлежащую ClickHouse Cloud.

Он работает как сайдкар вместе с контейнером сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы в пределах одного региона маршрутизируются через конечные точки сервиса шлюза VPC.

### Уведомления {#alerts}

*Исходящие, Публичные*

AlertManager настроен на отправку уведомлений в ClickHouse Cloud, когда кластер ClickHouse клиента находится в нездоровом состоянии.

Метрики и логи хранятся в VPC клиента BYOC. Логи в настоящее время хранятся локально в EBS. В будущем они будут храниться в LogHouse, сервисе ClickHouse в VPC BYOC. Метрики используют стек Prometheus и Thanos, хранящиеся локально в VPC BYOC.

### Состояние сервиса {#service-state}

*Исходящие*

Экспортер состояния отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащий ClickHouse Cloud.

## Функции {#features}

### Поддерживаемые функции {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud и BYOC используют один и тот же бинарный файл и конфигурацию. Поэтому все функции ядра ClickHouse поддерживаются в BYOC, такие как SharedMergeTree.
- **Доступ к консоли для управления состоянием сервиса**:
  - Поддерживает операции, такие как запуск, остановка и завершение.
  - Просмотр сервисов и их статусов.
- **Резервное копирование и восстановление.**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Простой режим.**
- **Склады**: Разделение вычислений.
- **Сеть нулевого доверия через Tailscale.**
- **Мониторинг**:
  - Облачная консоль включает встроенные панели состояния для мониторинга здоровья сервиса.
  - Сбор метрик Prometheus для централизованного мониторинга с Prometheus, Grafana и Datadog. Смотрите [документацию Prometheus](/integrations/prometheus) для получения инструкций по настройке.
- **VPC Пиринг.**
- **Интеграции**: Смотрите полный список на [этой странице](/integrations).
- **Безопасный S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Запланированные функции (в настоящее время неподдерживаемые) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) также известный как CMEK (управляемые клиентом ключи шифрования)
- ClickPipes для инжеста
- Автошкалирование
- Интерфейс MySQL

## Часто задаваемые вопросы {#faq}

### Вычисления {#compute}

#### Могу ли я создать несколько сервисов в одном кластере EKS? {#can-i-create-multiple-services-in-this-single-eks-cluster}

Да. Инфраструктура должна быть развернута только один раз для каждой комбинации аккаунта AWS и региона.

### Какие регионы вы поддерживаете для BYOC? {#which-regions-do-you-support-for-byoc}

BYOC поддерживает тот же набор [регионов](/cloud/reference/supported-regions#aws-regions), что и ClickHouse Cloud.

#### Будет ли какой-либо перерасход ресурсов? Какие ресурсы необходимы для запуска сервисов помимо экземпляров ClickHouse? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

Кроме экземпляров ClickHouse (серверов ClickHouse и ClickHouse Keeper), мы запускаем такие сервисы, как `clickhouse-operator`, `aws-cluster-autoscaler`, Istio и наш стек мониторинга.

В настоящее время у нас есть 3 узла типа m5.xlarge (по одному для каждой AZ) в выделенной группе узлов для запуска этих рабочих нагрузок.

### Сеть и безопасность {#network-and-security}

#### Можем ли мы отозвать разрешения, установленные во время установки, после завершения настройки? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

В настоящее время это невозможно.

#### Рассматривали ли вы какие-либо будущие меры безопасности для инженеров ClickHouse для доступа к инфраструктуре клиента для устранения неполадок? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

Да. Реализация механизма, контролируемого клиентом, где клиенты могут одобрять доступ инженеров к кластеру, находится в нашей дорожной карте. В данный момент инженеры должны проходить наш внутренний процесс эскалации, чтобы получить временный доступ к кластеру. Это регистрируется и проверяется нашей командой безопасности.

#### Какой размер диапазона IP VPC создан? {#what-is-the-size-of-the-vpc-ip-range-created}

По умолчанию мы используем `10.0.0.0/16` для VPC BYOC. Мы рекомендуем зарезервировать по крайней мере /22 для потенциального будущего масштабирования, но если вы предпочитаете ограничить размер, можно использовать /23, если ожидается, что вы ограничитесь 30 серверами в подах.

#### Могу ли я определить частоту обслуживания {#can-i-decide-maintenance-frequency}

Свяжитесь с поддержкой, чтобы запланировать окна обслуживания. Пожалуйста, ожидайте, что обновления будут проводиться не реже одного раза в неделю.

## Наблюдаемость {#observability}

### Встроенные инструменты мониторинга {#built-in-monitoring-tools}

#### Панель наблюдаемости {#observability-dashboard}

ClickHouse Cloud включает в себя продвинутую панель наблюдаемости, которая отображает такие метрики, как использование памяти, скорость запросов и I/O. Доступ к ней можно получить в разделе **Мониторинг** веб-консоли ClickHouse Cloud.

<br />

<Image img={byoc3} size="lg" alt="Панель наблюдаемости" border />

<br />

#### Расширенная панель {#advanced-dashboard}

Вы можете настроить панель с использованием метрик из системных таблиц, таких как `system.metrics`, `system.events` и `system.asynchronous_metrics` и других, чтобы подробно отслеживать производительность сервера и использование ресурсов.

<br />

<Image img={byoc4} size="lg" alt="Расширенная панель" border />

<br />

#### Интеграция с Prometheus {#prometheus-integration}

ClickHouse Cloud предоставляет конечную точку Prometheus, которую вы можете использовать для сбора метрик для мониторинга. Это позволяет интегрировать с такими инструментами, как Grafana и Datadog для визуализации.

**Пример запроса через https конечную точку /metrics_all**

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

# HELP ClickHouse_CustomMetric_NumberOfWarnings Количество предупреждений, выданных сервером. Обычно указывает на возможную неправильную настройку

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

Для аутентификации можно использовать имя пользователя и пароль ClickHouse. Мы рекомендуем создать выделенного пользователя с минимальными правами для сбора метрик. В минимуме требуется разрешение `READ` на таблицу `system.custom_metrics` на всех репликах. Например:

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Настройка Prometheus**

Пример конфигурации показан ниже. Конечная точка `targets` такая же, как и та, что используется для доступа к сервису ClickHouse.

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

Пожалуйста, также смотрите [этот блог-пост](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) и [документацию по настройке Prometheus для ClickHouse](/integrations/prometheus).

