---
title: 'BYOC (Принесите свой облачный сервис) для AWS'
slug: /cloud/reference/byoc
sidebar_label: 'BYOC (Принесите свой облачный сервис)'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Разверните ClickHouse на вашей собственной облачной инфраструктуре'
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

BYOC (Принесите свой облачный сервис) позволяет вам развернуть ClickHouse Cloud на вашей собственной облачной инфраструктуре. Это полезно, если у вас есть особые требования или ограничения, которые не позволяют вам использовать управляемый сервис ClickHouse Cloud.

**Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Ознакомьтесь с нашими [Условиями обслуживания](https://clickhouse.com/legal/agreements/terms-of-service) для получения дополнительной информации.

В настоящее время BYOC поддерживается только для AWS. Вы можете присоединиться к списку ожидания для GCP и Azure [здесь](https://clickhouse.com/cloud/bring-your-own-cloud).

:::note 
BYOC разработан специально для развертываний большого масштаба и требует от клиентов подписания обязательного контракта.
:::

## Глоссарий {#glossary}

- **VPC ClickHouse:** VPC, принадлежащий ClickHouse Cloud.
- **VPC клиента BYOC:** VPC, принадлежащий облачному аккаунту клиента, который предоставляется и управляется ClickHouse Cloud и предназначен для развертывания ClickHouse Cloud BYOC.
- **VPC клиента:** Другие VPC, принадлежащие облачному аккаунту клиента, используемые для приложений, которые должны подключаться к VPC клиента BYOC.

## Архитектура {#architecture}

Метрики и журналы хранятся в VPC клиента BYOC. Журналы в настоящее время хранятся локально в EBS. В будущем обновлении журналы будут храниться в LogHouse, который является сервисом ClickHouse в VPC клиента BYOC. Метрики реализованы с помощью стека Prometheus и Thanos, хранящегося локально в VPC клиента BYOC.

<br />

<Image img={byoc1} size="lg" alt="Архитектура BYOC" background='black'/>

<br />

## Процесс внедрения {#onboarding-process}

Клиенты могут инициировать процесс внедрения, обратившись к [нам](https://clickhouse.com/cloud/bring-your-own-cloud). Клиенты должны иметь выделенный AWS аккаунт и знать регион, который они будут использовать. В настоящее время мы разрешаем пользователям запускать сервисы BYOC только в тех регионах, которые мы поддерживаем для ClickHouse Cloud.

### Подготовка выделенного AWS аккаунта {#prepare-a-dedicated-aws-account}

Клиенты должны подготовить выделенный AWS аккаунт для размещения развертывания ClickHouse BYOC для обеспечения лучшей изоляции. С этим аккаунтом и начальным адресом электронной почты администратора организации можно обратиться в службу поддержки ClickHouse.

### Применение шаблона CloudFormation {#apply-cloudformation-template}

Настройка BYOC инициализируется через [стек CloudFormation](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), который создает только роль, позволяющую контроллерам BYOC из ClickHouse Cloud управлять инфраструктурой. Ресурсы S3, VPC и вычислительные ресурсы для запуска ClickHouse не включены в этот стек.

<!-- TODO: Добавить скриншот для остальной части внедрения, как только будет реализовано самообслуживание. -->

### Настройка инфраструктуры BYOC {#setup-byoc-infrastructure}

После создания стека CloudFormation вам будет предложено настроить инфраструктуру, включая S3, VPC и кластер EKS, из облачной консоли. На этом этапе необходимо определить некоторые параметры, так как их нельзя будет изменить позже. В частности:

- **Регион, который вы хотите использовать:** вы можете выбрать один из любых [публичных регионов](/cloud/reference/supported-regions), которые мы имеем для ClickHouse Cloud.
- **CIDR диапазон VPC для BYOC:** По умолчанию мы используем `10.0.0.0/16` для CIDR диапазона VPC BYOC. Если вы планируете использовать VPC пиринг с другой учетной записью, убедитесь, что диапазоны CIDR не перекрываются. Выделите соответствующий CIDR диапазон для BYOC, минимальный размер составляет `/22` для размещения необходимых нагрузок.
- **Зоны доступности для VPC BYOC:** Если вы планируете использовать VPC пиринг, соответствие зон доступности между исходной и BYOC учетными записями может помочь снизить затраты на трафик между AZ. В AWS суффиксы зон доступности (`a, b, c`) могут представлять различные физические идентификаторы зон в разных учетных записях. См. [Руководство AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) для получения дополнительных деталей.

### Назначительно: Настройка VPC Пиринга {#optional-setup-vpc-peering}

Чтобы создать или удалить VPC пиринг для ClickHouse BYOC, выполните следующие шаги:

#### Шаг 1 Включение Private Load Balancer для ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Свяжитесь со службой поддержки ClickHouse, чтобы включить Private Load Balancer.

#### Шаг 2 Создание пирингового соединения {#step-2-create-a-peering-connection}
1. Перейдите на панель VPC в учетной записи ClickHouse BYOC.
2. Выберите Пиринговые соединения.
3. Нажмите Создать пиринговое соединение.
4. Установите VPC Запросчика на идентификатор VPC ClickHouse.
5. Установите VPC Приемника на целевой идентификатор VPC. (Выберите другую учетную запись, если это применимо).
6. Нажмите Создать пиринговое соединение.

<br />

<Image img={byoc_vpcpeering} size="lg" alt="Создание пирингового соединения BYOC" border />

<br />

#### Шаг 3 Принять запрос пирингового соединения {#step-3-accept-the-peering-connection-request}
Перейдите в пиринговую учетную запись, на странице (VPC -> Пиринги -> Действия -> Принять запрос) клиент может одобрить этот запрос на пиринговое соединение VPC.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="Принять пиринговое соединение BYOC" border />

<br />

#### Шаг 4 Добавление назначения в таблицы маршрутов VPC ClickHouse {#step-4-add-destination-to-clickhouse-vpc-route-tables}
В учетной записи ClickHouse BYOC,
1. Выберите Таблицы маршрутов в панели VPC.
2. Найдите идентификатор VPC ClickHouse. Отредактируйте каждую таблицу маршрутов, прикрепленную к частным подсетям.
3. Нажмите кнопку Редактировать на вкладке Маршруты.
4. Нажмите Добавить другой маршрут.
5. Введите CIDR диапазон целевого VPC для назначения.
6. Выберите "Пиринговое соединение" и идентификатор пирингового соединения для цели.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="Добавление таблицы маршрутов BYOC" border />

<br />

#### Шаг 5 Добавление назначения в таблицы маршрутов целевого VPC {#step-5-add-destination-to-the-target-vpc-route-tables}
В пиринговой учетной записи AWS,
1. Выберите Таблицы маршрутов в панели VPC.
2. Найдите идентификатор целевого VPC.
3. Нажмите кнопку Редактировать на вкладке Маршруты.
4. Нажмите Добавить другой маршрут.
5. Введите CIDR диапазон VPC ClickHouse для назначения.
6. Выберите "Пиринговое соединение" и идентификатор пирингового соединения для цели.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="Добавление таблицы маршрутов BYOC" border />

<br />

#### Шаг 6 Редактирование группы безопасности, чтобы разрешить доступ к пиринговому VPC {#step-6-edit-security-group-to-allow-peered-vpc-access}
В учетной записи ClickHouse BYOC,
1. В учетной записи ClickHouse BYOC перейдите в EC2 и найдите Private Load Balancer, названный, как infra-xx-xxx-ingress-private.

<br />

<Image img={byoc_plb} size="lg" alt="Частный балансировщик нагрузки BYOC" border />

<br />

2. На вкладке Безопасность на странице Подробности найдите связанную группу безопасности, которая следует шаблону наименования, например `k8s-istioing-istioing-xxxxxxxxx`.

<br />

<Image img={byoc_security} size="lg" alt="Группа безопасности приватного балансировщика нагрузки BYOC" border />

<br />

3. Отредактируйте правила Inbound этой группы безопасности и добавьте диапазон CIDR пирингового VPC (или укажите необходимый диапазон CIDR по необходимости).

<br />

<Image img={byoc_inbound} size="lg" alt="Правило входящего потока группы безопасности BYOC" border />

<br />

---
Сервис ClickHouse теперь должен быть доступен из пирингового VPC.

Чтобы получить доступ к ClickHouse приватно, для безопасного подключения из пирингового VPC пользователяProvisioning private load balancer and endpoint are provisioned. Приватный конечный пункт следует формату публичного конечного пункта с суффиксом `-private`. Например:
- **Публичный конечный пункт:** `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Приватный конечный пункт:** `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Опционально, после проверки, что пиринг работает, вы можете запросить удаление публичного балансировщика нагрузки для ClickHouse BYOC.

## Процесс обновления {#upgrade-process}

Мы регулярно обновляем программное обеспечение, включая обновления версии базы данных ClickHouse, ClickHouse Operator, EKS и другие компоненты.

Хотя мы стремимся к бесшовным обновлениям (например, поэтапные обновления и перезагрузки), некоторые из них, такие как изменения версии ClickHouse и обновления узлов EKS, могут повлиять на сервис. Клиенты могут указать окно обслуживания (например, каждый вторник в 1:00 по тихоокеанскому времени), обеспечивая, чтобы такие обновления происходили только в назначенное время.

:::note
Окна обслуживания не применяются к исправлениям безопасности и уязвимостям. Они обрабатываются как внецикловые обновления, с быстрым уведомлением для координации подходящего времени и минимизации операционного влияния.
:::

## IAM роли CloudFormation {#cloudformation-iam-roles}

### Роль IAM начальной загрузки {#bootstrap-iam-role}

Роль IAM начальной загрузки имеет следующие разрешения:

- **Операции EC2 и VPC:** Необходимы для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`):** Необходимы для создания бакетов для хранения ClickHouse BYOC.
- **Разрешения `route53:*`:** Необходимы для внешнего DNS для настройки записей в Route 53.
- **Операции IAM (например, `iam:CreatePolicy`):** Необходимы для контроллеров, чтобы создать дополнительные роли (см. следующий раздел для подробностей).
- **Операции EKS:** Ограничены ресурсами с именами, начинающимися с префикса `clickhouse-cloud`.

### Дополнительные IAM роли, создаваемые контроллером {#additional-iam-roles-created-by-the-controller}

В дополнение к `ClickHouseManagementRole`, созданной через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли предполагаются приложениями, работающими в кластере EKS клиента:
- **Роль экспортера состояния**
  - Компонент ClickHouse, который сообщает информацию о состоянии сервиса ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Контроллер балансировщика нагрузки**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер EBS CSI для управления томами для сервисов ClickHouse.
- **Внешний DNS**
  - Пропагирует конфигурации DNS в Route 53.
- **Cert-Manager**
  - Предоставляет TLS сертификаты для доменов сервиса BYOC.
- **Автомасштабировщик кластера**
  - Регулирует размер группы узлов по мере необходимости.

**K8s-control-plane** и **k8s-worker** роли предназначены для использования службами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту Control Plane ClickHouse Cloud согласовывать необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и виртуальный сервис/шлюз Istio.

## Сетевые границы {#network-boundaries}

Этот раздел охватывает различные сетевые потоки трафика к и от VPC клиента BYOC:

- **Входящий:** Трафик, входящий в VPC клиента BYOC.
- **Исходящий:** Трафик, исходящий из VPC клиента BYOC и отправленный на внешнее назначение.
- **Публичный:** Сетевой конечный пункт, доступный из публичного интернета.
- **Приватный:** Сетевой конечный пункт, доступный только через частные соединения, такие как VPC пиринг, VPC Private Link или Tailscale.

**Вход в систему Istio разворачивается за AWS NLB для приема трафика клиентов ClickHouse.**

*Входящий, Публичный (может быть Приватным)*

Шлюз входа Istio завершает TLS. Сертификат, предоставленный CertManager с Let's Encrypt, хранится как секрет в кластере EKS. Трафик между Istio и ClickHouse [шифруется AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types), так как они находятся в одном и том же VPC.

По умолчанию вход доступен для публики с фильтрацией IP. Клиенты могут настраивать VPC пиринг, чтобы сделать его приватным и отключить публичные соединения. Мы настоятельно рекомендуем настроить [фильтр IP](/cloud/security/setting-ip-filters) для ограничения доступа.

### Устранение неполадок с доступом {#troubleshooting-access}

*Входящий, Публичный (может быть Приватным)*

Инженеры ClickHouse Cloud требуют доступа для устранения неполадок через Tailscale. Им предоставляется аутентификация на основе сертификатов при необходимости для развертываний BYOC.

### Собиратель выставления счетов {#billing-scraper}

*Исходящий, Приватный*

Собиратель выставления счетов собирает данные о выставлении счетов из ClickHouse и отправляет их в бакет S3, принадлежащий ClickHouse Cloud.

Он работает как сайдкар непосредственно с контейнером сервера ClickHouse, периодически собирая метрики CPU и памяти. Запросы в пределах одного региона маршрутизируются через конечные точки сервиса VPC gateway.

### Уведомления {#alerts}

*Исходящий, Публичный*

AlertManager настроен на отправку уведомлений в ClickHouse Cloud, когда кластер ClickHouse клиента находится в нерабочем состоянии.

Метрики и журналы хранятся в VPC клиента BYOC. Журналы в настоящее время хранятся локально в EBS. В будущем они будут храниться в LogHouse, сервисе ClickHouse в VPC BYOC. Метрики используют стек Prometheus и Thanos, хранящийся локально в VPC BYOC.

### Состояние сервиса {#service-state}

*Исходящий*

Exporter состояния отправляет информацию о состоянии сервиса ClickHouse в SQS, принадлежащую ClickHouse Cloud.

## Функции {#features}

### Поддерживаемые функции {#supported-features}

- **SharedMergeTree:** ClickHouse Cloud и BYOC используют один и тот же бинарный файл и конфигурацию. Поэтому все функции ядра ClickHouse поддерживаются в BYOC, такие как SharedMergeTree.
- **Доступ к консоли для управления состоянием сервиса:**
  - Поддерживает операции, такие как старт, остановка и завершение.
  - Просмотр сервисов и их статуса.
- **Резервное копирование и восстановление.**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Ожидание.**
- **Склады:** Разделение вычислений
- **Сеть с нулевым доверием через Tailscale.**
- **Мониторинг:**
  - Облачная консоль включает встроенные панели состояния для мониторинга здоровья сервиса.
  - Сбор данных Prometheus для централизации мониторинга с помощью Prometheus, Grafana и Datadog. См. [Документацию Prometheus](/integrations/prometheus) для инструкций по настройке.
- **VPC Пиринг.**
- **Интеграции:** Смотрите полный список на [этой странице](/integrations).
- **Безопасный S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Запланированные функции (в настоящее время неподдерживаемые) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) также известен как CMEK (управляемые клиентом ключи шифрования)
- ClickPipes для приема данных
- Автошкалирование
- Интерфейс MySQL

## Часто задаваемые вопросы {#faq}

### Вычисления {#compute}

#### Могу ли я создать несколько сервисов в этом одном кластере EKS? {#can-i-create-multiple-services-in-this-single-eks-cluster}

Да. Инфраструктура должна быть выделена только один раз для каждой комбинации учетной записи и региона AWS.

### Какие регионы вы поддерживаете для BYOC? {#which-regions-do-you-support-for-byoc}

BYOC поддерживает тот же набор [регионов](/cloud/reference/supported-regions#aws-regions), что и ClickHouse Cloud.

#### Будет ли какое-либо использование ресурсов? Каковы ресурсы, необходимые для работы сервисов кроме экземпляров ClickHouse? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

Кроме экземпляров ClickHouse (серверов ClickHouse и ClickHouse Keeper), мы запускаем такие сервисы, как `clickhouse-operator`, `aws-cluster-autoscaler`, Istio и наш стек мониторинга.

В настоящее время у нас есть 3 узла m5.xlarge (по одному для каждой AZ) в выделенной группе узлов для запуска этих нагрузок.

### Сеть и Безопасность {#network-and-security}

#### Можем ли мы отозвать разрешения, установленные во время установки, после завершения настройки? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

В настоящее время это невозможно.

#### Рассматривали ли вы какие-либо будущие меры безопасности для инженеров ClickHouse для доступа к инфраструктуре клиента для устранения неполадок? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

Да. Реализация механизма, контролируемого клиентом, где клиенты могут одобрять доступ инженеров к кластеру, находится на нашей дорожной карте. В данный момент инженеры должны проходить внутренний процесс эскалации, чтобы получить доступ к кластеру в режиме необходимости. Это фиксируется и аудитируется нашей службой безопасности.

#### Каков размер диапазона IP VPC, созданного? {#what-is-the-size-of-the-vpc-ip-range-created}

По умолчанию мы используем `10.0.0.0/16` для VPC BYOC. Мы рекомендуем зарезервировать как минимум /22 для потенциального масштабирования в будущем,
но если вы предпочитаете ограничить размер, возможно, использование /23, если вы, вероятно, ограничитесь
30 серверными подами.

#### Могу ли я решить частоту обслуживания {#can-i-decide-maintenance-frequency}

Свяжитесь с поддержкой, чтобы запланировать окна обслуживания. Пожалуйста, ожидайте минимум еженедельного графика обновлений.

## Наблюдаемость {#observability}

### Встроенные инструменты мониторинга {#built-in-monitoring-tools}

#### Панель наблюдаемости {#observability-dashboard}

ClickHouse Cloud включает в себя продвинутую панель наблюдаемости, которая отображает метрики, такие как использование памяти, частота запросов и ввод-вывод. Это можно получить в разделe **Мониторинг** веб-интерфейса ClickHouse Cloud.

<br />

<Image img={byoc3} size="lg" alt="Панель наблюдаемости" border />

<br />

#### Расширенная панель {#advanced-dashboard}

Вы можете настроить панель, используя метрики из системных таблиц, таких как `system.metrics`, `system.events` и `system.asynchronous_metrics` и другие для детального мониторинга производительности сервера и использования ресурсов.

<br />

<Image img={byoc4} size="lg" alt="Расширенная панель" border />

<br />

#### Интеграция Prometheus {#prometheus-integration}

ClickHouse Cloud предоставляет конечную точку Prometheus, которую вы можете использовать для сбора метрик для мониторинга. Это позволяет интеграцию с такими инструментами, как Grafana и Datadog для визуализации.

**Пример запроса через https конечную точку /metrics_all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**Пример ответа**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes Количество байтов, хранящихся на диске `s3disk` в системной базе данных

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts Количество поврежденных отсоединенных частей

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount Возраст самой старой мутации (в секундах)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings Количество предупреждений, выданных сервером. Обычно это указывает на возможную ошибочную конфигурацию

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors Общее количество ошибок на сервере с момента последней перезагрузки

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**Аутентификация**

Пары имени пользователя и пароля ClickHouse могут использоваться для аутентификации. Мы рекомендуем создать отдельного пользователя с минимальными правами для сбора метрик. Минимально требуется разрешение `READ` на таблице `system.custom_metrics` на всех репликах. Например:

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Настройка Prometheus**

Пример конфигурации показан ниже. Конечная точка `targets` - это та же, что и для доступа к сервису ClickHouse.

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

Пожалуйста, также ознакомьтесь с [этим блогом](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) и [документами по настройке Prometheus для ClickHouse](/integrations/prometheus).
