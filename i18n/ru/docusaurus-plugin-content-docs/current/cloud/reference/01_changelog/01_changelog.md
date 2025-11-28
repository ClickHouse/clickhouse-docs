---
slug: /whats-new/cloud
sidebar_label: 'Журнал изменений ClickHouse Cloud'
title: 'Журнал изменений ClickHouse Cloud'
description: 'Журнал изменений ClickHouse Cloud с описаниями новых возможностей в каждом релизе ClickHouse Cloud'
doc_type: 'changelog'
keywords: ['журнал изменений', 'примечания к релизу', 'обновления', 'новые функции', 'изменения в ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import add_marketplace from '@site/static/images/cloud/reference/add_marketplace.png';
import beta_dashboards from '@site/static/images/cloud/reference/beta_dashboards.png';
import api_endpoints from '@site/static/images/cloud/reference/api_endpoints.png';
import cross_vpc from '@site/static/images/cloud/reference/cross-vpc-clickpipes.png';
import nov_22 from '@site/static/images/cloud/reference/nov-22-dashboard.png';
import private_endpoint from '@site/static/images/cloud/reference/may-30-private-endpoints.png';
import notifications from '@site/static/images/cloud/reference/nov-8-notifications.png';
import kenesis from '@site/static/images/cloud/reference/may-17-kinesis.png';
import s3_gcs from '@site/static/images/cloud/reference/clickpipes-s3-gcs.png';
import tokyo from '@site/static/images/cloud/reference/create-tokyo-service.png';
import cloud_console from '@site/static/images/cloud/reference/new-cloud-console.gif';
import copilot from '@site/static/images/cloud/reference/nov-22-copilot.gif';
import latency_insights from '@site/static/images/cloud/reference/oct-4-latency-insights.png';
import cloud_console_2 from '@site/static/images/cloud/reference/aug-15-compute-compute.png';
import compute_compute from '@site/static/images/cloud/reference/july-18-table-inspector.png';
import query_insights from '@site/static/images/cloud/reference/june-28-query-insights.png';
import prometheus from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';
import dashboards from '@site/static/images/cloud/reference/may-30-dashboards.png';

В дополнение к этому списку изменений ClickHouse Cloud ознакомьтесь со страницей [Cloud Compatibility](/whats-new/cloud-compatibility).

:::tip[Автоматически получайте обновления!]

<a href="/docs/cloud/changelog-rss.xml">
  Подпишитесь на RSS-ленту журнала изменений Cloud
</a>

:::


## 21 ноября 2025 г. {#november-21-2025}

- ClickHouse Cloud теперь доступен в **AWS Israel (Tel Aviv) — il-central-1**
- Улучшен процесс онбординга в маркетплейсе для настройки организаций ClickHouse с выставлением счетов по подпискам marketplace с оплатой по мере использования или по индивидуальным предложениям.



## 14 ноября 2025 г. {#november-14-2025}
- Мы рады сообщить, что **ClickHouse Cloud** теперь доступен **в двух дополнительных публичных регионах**:
  - **GCP Japan (asia-northeast1)**
  - **AWS Seoul (Asia Pacific, ap-northeast-2)** — теперь также поддерживается в **ClickPipes**

  Эти регионы ранее были доступны как **частные регионы**, а теперь **открыты для всех пользователей**.
- Terraform и API теперь поддерживают добавление тегов к сервисам и фильтрацию сервисов по тегам.



## 7 ноября 2025 г. {#november-7-2025}

- Консоль ClickHouse Cloud теперь поддерживает настройку размеров реплик с шагом 1 vCPU и 4 GiB прямо из облачной консоли.
  Эти параметры доступны как при создании нового сервиса, так и при указании минимального и максимального размера реплик на странице настроек.
- Пользовательские аппаратные профили (доступны в тарифе Enterprise) теперь поддерживают переход в режим простоя (idling).
- ClickHouse Cloud теперь предлагает упрощённый процесс покупки через AWS Marketplace с отдельными вариантами для [оплаты по мере использования](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa) и [контрактов с обязательствами по расходам](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa).
- Для пользователей ClickStack в ClickHouse Cloud теперь доступна система оповещений (alerting).
  Пользователи могут создавать и управлять оповещениями напрямую в интерфейсе HyperDX по логам, метрикам и трассировкам — без дополнительной настройки, дополнительной инфраструктуры или сервисов и без конфигурационных файлов. Оповещения интегрируются со Slack, PagerDuty и другими системами.
  Для получения дополнительной информации см. [документацию по оповещениям](/use-cases/observability/clickstack/alerts).



## 17 октября 2025 г. {#october-17-2025}

- **Service Monitoring — панель использования ресурсов**  
  Отображение метрик использования CPU и памяти изменится: вместо среднего значения будет показываться максимальное значение использования за выбранный период времени, чтобы лучше выявлять случаи недостаточного выделения ресурсов.
  Кроме того, метрика использования CPU будет отображать показатель на уровне Kubernetes, который ближе соответствует метрике, используемой автоскейлером ClickHouse Cloud. 
- **Внешние бакеты**  
  ClickHouse Cloud теперь позволяет экспортировать резервные копии напрямую в вашу учетную запись облачного провайдера.
  Подключите внешний бакет облачного хранилища — AWS S3, Google Cloud Storage или Azure Blob Storage — и возьмите управление резервными копиями под свой контроль.



## 29 августа 2025 г. {#august-29-2025}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink) перешёл от использования фильтров по Resource GUID к фильтрам по Resource ID для идентификации ресурсов. Вы по-прежнему можете использовать устаревший Resource GUID, который сохраняет обратную совместимость, но мы рекомендуем перейти на фильтры по Resource ID. Подробности миграции см. в [документации](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid) по Azure Private Link.



## 22 августа 2025 г. {#august-22-2025}

- **ClickHouse Connector for AWS Glue**  
  Теперь вы можете использовать официальный [ClickHouse Connector for AWS Glue](/integrations/glue), доступный в [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s). Коннектор использует бессерверный движок AWS Glue на базе Apache
  Spark для извлечения, преобразования и загрузки данных при интеграции между ClickHouse и другими источниками данных. Начните работу, следуя инструкциям в [посте в блоге](http://clickhouse.com/blog/clickhouse-connector-aws-glue) о том, как создавать таблицы, записывать и считывать данные между ClickHouse и Spark.
- **Изменение минимального количества реплик в сервисе**  
  Сервисы, которые были масштабированы до большего числа реплик, теперь могут быть [масштабированы обратно](/manage/scaling) до одной реплики (ранее минимум составлял 2 реплики). Примечание: сервисы с одной репликой имеют пониженную доступность и не рекомендуются для использования в продуктивной среде.
- ClickHouse Cloud по умолчанию начнет отправлять уведомления, связанные с масштабированием сервисов и обновлениями версий сервисов, пользователям с административными ролями. Пользователи могут настроить параметры уведомлений в своих настройках уведомлений.



## 13 августа 2025 г. {#august-13-2025}

- **ClickPipes для MongoDB CDC теперь в режиме закрытого предварительного просмотра**
  Теперь вы можете использовать ClickPipes для репликации данных из MongoDB в ClickHouse Cloud всего за несколько кликов, что позволяет
  выполнять аналитику в режиме реального времени без необходимости во внешних ETL-инструментах. Коннектор поддерживает непрерывную
  репликацию, а также одноразовые миграции и совместим с MongoDB Atlas и самостоятельно развернутыми инсталляциями MongoDB.
  Ознакомьтесь с [публикацией в блоге](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview) с обзором коннектора MongoDB CDC и [запишитесь на ранний доступ здесь](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)! 
 


## 8 августа 2025 г. {#august-08-2025}

- **Уведомления**: Теперь пользователи будут получать уведомление в интерфейсе при запуске обновления их сервиса до новой версии ClickHouse. Дополнительные уведомления по email и в Slack можно настроить через центр уведомлений. 
- **ClickPipes**: Поддержка Azure Blob Storage (ABS) ClickPipes была добавлена в провайдер Terraform для ClickHouse. См. документацию провайдера для примера программного создания ABS ClickPipe.
  - [Исправление ошибки] ClickPipes для объектного хранилища, записывающие данные в целевую таблицу с использованием движка Null, теперь отображают метрики «Total records» и «Data ingested» в интерфейсе.
  - [Исправление ошибки] Селектор «Time period» для метрик в интерфейсе по умолчанию устанавливался в значение «24 hours» независимо от выбранного периода времени. Сейчас это исправлено, и интерфейс корректно обновляет графики для выбранного периода.
- **Межрегиональный приватный канал (AWS)** теперь доступен в статусе General Availability (GA). См. [документацию](/manage/security/aws-privatelink) для списка поддерживаемых регионов.



## 31 июля 2025 г. {#july-31-2025}

**Вертикальное масштабирование для ClickPipes теперь доступно**

[Вертикальное масштабирование теперь доступно для потоковых ClickPipes](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring). 
Эта функция позволяет управлять размером ресурсов каждой реплики, помимо 
количества реплик (горизонтальное масштабирование). Страница с подробной информацией о каждом ClickPipe теперь
также включает данные об использовании CPU и памяти по каждой реплике, что помогает лучше 
понимать нагрузки и с уверенностью планировать операции по изменению размеров ресурсов.



## 24 июля 2025 г. {#july-24-2025}

**ClickPipes для MySQL CDC теперь в публичной бета-версии**

Коннектор MySQL CDC в ClickPipes теперь общедоступен в рамках публичной бета-версии. Всего за несколько кликов 
вы можете начать репликацию данных из MySQL (или MariaDB) непосредственно в ClickHouse Cloud в режиме реального времени,
без внешних зависимостей. Прочитайте [пост в блоге](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)
с обзором коннектора и следуйте [руководству по быстрому старту](https://clickhouse.com/docs/integrations/clickpipes/mysql),
чтобы быстро начать работу.



## 11 июля 2025 г. {#june-11-2025}

- Новые сервисы теперь хранят метаданные баз данных и таблиц в централизованном **SharedCatalog** —
  новой модели координации и жизненного цикла объектов, которая обеспечивает:
  - **DDL облачного масштаба**, даже при высокой параллельности
  - **Надежное удаление и новые DDL‑операции**
  - **Быстрый запуск и пробуждение**, поскольку узлы без сохранения состояния теперь стартуют без зависимостей от диска
  - **Вычисления без сохранения состояния как для собственных, так и для открытых форматов**, включая Iceberg и Delta Lake
  
  Подробнее о SharedCatalog читайте в нашем [блоге](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute)

- Теперь мы поддерживаем возможность запуска сервисов, соответствующих требованиям HIPAA, в GCP `europe-west4`



## 27 июня 2025 г. {#june-27-2025}

- Теперь мы официально поддерживаем провайдера Terraform для управления привилегиями баз данных,
  который также совместим с самостоятельными (self-managed) развертываниями. Дополнительную информацию см. в
  [блоге](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)
  и нашей [документации](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs).
- Сервисы уровня Enterprise теперь могут подписываться на [канал медленных релизов](/manage/updates/#slow-release-channel-deferred-upgrades), чтобы
  откладывать обновления на две недели после обычного релиза, обеспечивая дополнительное время для
  тестирования.



## 13 июня 2025 г. {#june-13-2025}

- Мы рады сообщить, что ClickHouse Cloud Dashboards теперь доступны в режиме общей доступности. Dashboards позволяют пользователям визуализировать результаты запросов на панелях, взаимодействовать с данными с помощью фильтров и параметров запросов, а также управлять совместным доступом.
- Фильтры IP-адресов для API-ключей: мы внедряем дополнительный уровень защиты для ваших взаимодействий с ClickHouse Cloud. При создании API-ключа вы можете настроить список разрешённых IP-адресов, чтобы ограничить места, откуда может использоваться этот API-ключ. Подробности см. в [документации](https://clickhouse.com/docs/cloud/security/setting-ip-filters). 



## 30 мая 2025 г. {#may-30-2025}

- Мы рады объявить о переходе в статус General Availability (GA) **ClickPipes для Postgres CDC**
  в ClickHouse Cloud. Всего за несколько кликов вы можете реплицировать свои базы данных Postgres
  и получить сверхбыструю аналитическую обработку данных практически в реальном времени. Коннектор обеспечивает
  более быструю синхронизацию данных, задержку всего в несколько секунд, автоматическое применение изменений схемы,
  полностью безопасное подключение и многое другое. Подробности см. в 
  [блоге](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga). Чтобы начать работу, следуйте инструкциям [здесь](https://clickhouse.com/docs/integrations/clickpipes/postgres).

- Мы добавили новые возможности для дашбордов SQL-консоли:
  - Совместный доступ: теперь вы можете делиться своим дашбордом с членами команды. Поддерживаются четыре уровня доступа, которые можно настраивать как глобально, так и для отдельных пользователей:
    - _Write access_: добавление/редактирование визуализаций, настроек обновления, взаимодействие с дашбордами через фильтры.
    - _Owner_: предоставление доступа к дашборду другим пользователям, удаление дашборда и все остальные права пользователя с уровнем доступа «write access».
    - _Read-only access_: просмотр и взаимодействие с дашбордом через фильтры.
    - _No access_: отсутствие доступа к просмотру дашборда.
  - Для уже созданных дашбордов администраторы организации могут назначать себя их владельцами.
  - Теперь вы можете добавлять таблицу или график из SQL-консоли на дашборд прямо из окна запроса.

<Image img={dashboards} size="md" alt="Улучшения дашбордов" border />

- Мы набираем участников программы предварительного доступа (preview) для [Distributed cache](https://clickhouse.com/cloud/distributed-cache-waitlist) 
  в AWS и GCP. Подробнее читайте в [блоге](https://clickhouse.com/blog/building-a-distributed-cache-for-s3).



## 16 мая 2025 г. {#may-16-2025}

- Представлена панель мониторинга использования ресурсов (Resource Utilization Dashboard), которая предоставляет обзор
  ресурсов, потребляемых сервисом в ClickHouse Cloud. Следующие метрики
  собираются из системных таблиц и отображаются на этой панели:
  * Память и CPU: графики для `CGroupMemoryTotal` (выделенная память), `CGroupMaxCPU` (выделенный CPU),
    `MemoryResident` (используемая память) и `ProfileEvent_OSCPUVirtualTimeMicroseconds` (используемый CPU)
  * Передача данных: графики, показывающие входящий и исходящий трафик данных для ClickHouse Cloud. Подробнее см. [здесь](/cloud/manage/network-data-transfer).
- Мы рады объявить о запуске нового миксина ClickHouse Cloud Prometheus/Grafana,
  созданного для упрощения мониторинга ваших сервисов ClickHouse Cloud.
  Этот миксин использует наш совместимый с Prometheus конечный API-адрес для бесшовной интеграции
  метрик ClickHouse в вашу существующую инсталляцию Prometheus и Grafana. В его состав
  входит преднастроенная панель мониторинга, которая обеспечивает Обзервабилити в режиме реального времени
  за состоянием и производительностью ваших сервисов. Дополнительную информацию см. в [блоге о запуске](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in).



## 18 апреля 2025 г. {#april-18-2025}

- Представлена новая роль уровня организации **Member** и две новые роли уровня сервиса: **Service Admin** и **Service Read Only**.
  **Member** — это роль уровня организации, которая по умолчанию назначается пользователям SAML SSO и предоставляет только возможности входа в систему и обновления профиля. Роли **Service Admin** и **Service Read Only** для одного или нескольких сервисов могут быть назначены пользователям с ролями **Member**, **Developer** или **Billing Admin**. Для получения дополнительной информации см. ["Access control in ClickHouse Cloud"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)
- В ClickHouse Cloud теперь доступны сервисы с поддержкой **HIPAA** и **PCI** в следующих регионах для клиентов уровня **Enterprise**: AWS eu-central-1, AWS eu-west-2, AWS us-east-2.
- Представлены **уведомления для пользователей о состоянии ClickPipes**. Эта функция отправляет автоматические оповещения о сбоях ClickPipes по электронной почте, через интерфейс ClickHouse Cloud и в Slack. Уведомления по электронной почте и через интерфейс включены по умолчанию и могут настраиваться отдельно для каждой ClickPipe. Для **Postgres CDC ClickPipes** оповещения также включают предупреждения о превышении порога replication slot (настраивается на вкладке **Settings**), определённые типы ошибок и шаги для самостоятельного устранения сбоев.
- Теперь открыта **закрытая предварительная версия MySQL CDC**. Это позволяет клиентам реплицировать базы данных MySQL в ClickHouse Cloud за несколько кликов, обеспечивая быструю аналитику и устраняя необходимость во внешних ETL-инструментах. Коннектор поддерживает как непрерывную репликацию, так и одноразовые миграции, независимо от того, развернут ли MySQL в облаке (RDS, Aurora, Cloud SQL, Azure и т. д.) или локально, в собственном дата-центре. Вы можете записаться на участие в закрытой предварительной версии, [перейдя по этой ссылке](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector).
- Представлен **AWS PrivateLink для ClickPipes**. Вы можете использовать AWS PrivateLink для установления защищённого соединения между VPC, сервисами AWS, вашими локальными системами и ClickHouse Cloud. Это можно сделать, не выводя трафик в публичный интернет при перемещении данных из источников, таких как Postgres, MySQL и MSK в AWS. Также поддерживается кросс-региональный доступ через конечные точки сервиса VPC (VPC service endpoints). Настройка подключения через PrivateLink теперь [полностью доступна для самостоятельной настройки](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink) с помощью ClickPipes.



## 4 апреля 2025 года {#april-4-2025}

- Уведомления в Slack для ClickHouse Cloud: ClickHouse Cloud теперь поддерживает уведомления в Slack о событиях биллинга, масштабирования и ClickPipes в дополнение к уведомлениям в консоли и по электронной почте. Эти уведомления отправляются через Slack-приложение ClickHouse Cloud. Администраторы организации могут настроить эти уведомления в центре уведомлений, указав каналы Slack, в которые должны отправляться уведомления.
- Пользователи, использующие сервисы Production и Development, теперь будут видеть стоимость использования ClickPipes и передачи данных в своих счетах на оплату.
  


## 21 марта 2025 г. {#march-21-2025}

- Межрегиональное подключение через Private Link в AWS теперь доступно в бета-версии. Подробности по настройке и список поддерживаемых регионов см. в [документации](/manage/security/aws-privatelink) по ClickHouse Cloud Private Link.
- Максимальный размер реплики, доступный для сервисов в AWS, теперь составляет 236 ГиБ ОЗУ. Это позволяет эффективно использовать ресурсы, при этом гарантируя, что часть из них остается выделенной для фоновых процессов.



## 7 марта 2025 г. {#march-7-2025}

- Новый API-эндпоинт `UsageCost`: спецификация API теперь поддерживает новый эндпоинт
  для получения информации об использовании. Это эндпоинт на уровне организации, и
  данные о стоимости использования можно запрашивать максимум за 31 день. Метрики, которые
  можно получить, включают Storage, Compute, Data Transfer и ClickPipes. Подробности
  см. в [документации](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference).
- Релиз Terraform-провайдера [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) поддерживает возможность включения MySQL-эндпоинта.



## 21 февраля 2025 г. {#february-21-2025}

### ClickHouse Bring Your Own Cloud (BYOC) для AWS теперь общедоступен {#clickhouse-byoc-for-aws-ga}

В этой модели развертывания компоненты плоскости данных (вычисления, хранилище, резервные копии, логи, метрики)
запускаются в VPC клиента, в то время как плоскость управления (веб-доступ, API и выставление счетов)
остаётся в VPC ClickHouse. Такая конфигурация идеально подходит для крупных нагрузок, которым
необходимо соответствовать строгим требованиям к локализации данных, гарантируя, что все данные остаются
внутри защищённой среды клиента.

- Для получения более подробной информации обратитесь к [документации](/cloud/reference/byoc/overview) по BYOC
  или прочитайте наш [анонс в блоге](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws).
- [Свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud), чтобы запросить доступ.

### Коннектор Postgres CDC для ClickPipes {#postgres-cdc-connector-for-clickpipes}

Коннектор Postgres CDC для ClickPipes позволяет пользователям бесшовно реплицировать свои базы данных Postgres в ClickHouse Cloud.

- Чтобы начать работу, обратитесь к [документации](https://clickhouse.com/docs/integrations/clickpipes/postgres) по коннектору ClickPipes Postgres CDC.
- Для получения дополнительной информации о сценариях использования и возможностях ознакомьтесь с [целевой страницей](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector) и [анонсной записью в блоге](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta).

### Соответствие требованиям PCI для ClickHouse Cloud на AWS {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud теперь поддерживает **сервисы, соответствующие требованиям PCI**, для клиентов
уровня **Enterprise** в регионах **us-east-1** и **us-west-2**. Пользователи, которые хотят запустить
сервис в среде, соответствующей требованиям PCI, могут обратиться в [службу поддержки](https://clickhouse.com/support/program)
за помощью.

### Прозрачное шифрование данных и управляемые клиентом ключи шифрования на Google Cloud Platform {#tde-and-cmek-on-gcp}

Поддержка **Transparent Data Encryption (TDE)** и **Customer Managed
Encryption Keys (CMEK)** теперь доступна для ClickHouse Cloud на **Google Cloud Platform (GCP)**.

- Пожалуйста, обратитесь к [документации](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde) по этим возможностям для получения дополнительной информации.

### Доступность региона AWS Middle East (UAE) {#aws-middle-east-uae-availability}

Добавлена поддержка нового региона для ClickHouse Cloud, который теперь доступен в регионе
**AWS Middle East (UAE) me-central-1**.

### Ограничения (guardrails) ClickHouse Cloud {#clickhouse-cloud-guardrails}

Чтобы способствовать лучшим практикам и обеспечить стабильное использование ClickHouse Cloud, мы
вводим ограничения на количество таблиц, баз данных, партиций и частей
в использовании.

- См. раздел [ограничения использования](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)
  документации для получения подробной информации.
- Если ваш сервис уже превышает эти лимиты, мы допустим увеличение ещё на 10%.
  Пожалуйста, свяжитесь со [службой поддержки](https://clickhouse.com/support/program), если у вас есть вопросы.



## 27 января 2025 г. {#january-27-2025}

### Изменения в уровнях ClickHouse Cloud {#changes-to-clickhouse-cloud-tiers}

Мы стремимся адаптировать наши продукты к постоянно меняющимся требованиям наших клиентов. С момента выхода в GA за последние два года ClickHouse Cloud существенно эволюционировал, и мы получили бесценные знания о том, как наши клиенты используют наши облачные сервисы.

Мы внедряем новые возможности для оптимизации конфигурации и экономической эффективности сервисов ClickHouse Cloud для ваших нагрузок. Среди них — **разделение вычислительных ресурсов (compute-compute separation)**, высокопроизводительные типы машин и **сервисы с единственной репликой (single-replica services)**. Мы также развиваем автоматическое масштабирование и управляемые обновления, чтобы они выполнялись более плавно и оперативно.

Мы добавляем **новый уровень Enterprise**, чтобы удовлетворить потребности самых требовательных клиентов и нагрузок, с акцентом на отраслевые требования к безопасности и соответствию, ещё более детальным контролем над базовым оборудованием и обновлениями, а также расширенными возможностями аварийного восстановления.

В поддержку этих изменений мы перерабатываем текущие уровни **Development** и **Production**, чтобы они более точно соответствовали тому, как наша расширяющаяся клиентская база использует наши предложения. Мы вводим уровень **Basic**, ориентированный на пользователей, тестирующих новые идеи и проекты, и уровень **Scale**, рассчитанный на пользователей, работающих с продуктивными нагрузками и данными в крупном масштабе.

Вы можете прочитать об этих и других функциональных изменениях в этом [блоге](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings). Существующим клиентам необходимо выбрать [новый план](https://clickhouse.com/pricing). Информация для клиентов была отправлена по электронной почте администраторам организаций.

### Warehouses: разделение вычислительных ресурсов (compute-compute separation) (GA) {#warehouses-compute-compute-separation-ga}

Разделение вычислительных ресурсов (compute-compute separation) (также известное как Warehouses) теперь доступно в режиме General Availability; подробности см. в [блоге](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) и в [документации](/cloud/reference/warehouses).

### Сервисы с единственной репликой {#single-replica-services}

Мы вводим концепцию сервиса с единственной репликой (single-replica service) как в виде отдельного предложения, так и внутри warehouses. В виде отдельного сервиса single-replica сервисы ограничены по размеру и предназначены для небольших тестовых нагрузок. В составе warehouses single-replica сервисы могут развертываться в более крупных конфигурациях и использоваться для нагрузок, не требующих высокой доступности в масштабе, например для перезапускаемых ETL‑заданий.

### Улучшения вертикального авто‑масштабирования {#vertical-auto-scaling-improvements}

Мы внедряем новый механизм вертикального масштабирования для вычислительных реплик, который мы называем Make Before Break (MBB). Этот подход добавляет одну или несколько реплик нового размера до удаления старых реплик, предотвращая потерю производительности во время операций масштабирования. Исключая разрыв между удалением существующих реплик и добавлением новых, MBB обеспечивает более плавный и менее разрушительный процесс масштабирования. Это особенно полезно при масштабировании вверх, когда высокая утилизация ресурсов приводит к необходимости дополнительной мощности, поскольку преждевременное удаление реплик только усугубило бы дефицит ресурсов.

### Горизонтальное масштабирование (GA) {#horizontal-scaling-ga}

Горизонтальное масштабирование теперь доступно в режиме General Availability. Пользователи могут добавлять дополнительные реплики для масштабирования сервиса «вширь» через API и облачную консоль. Информацию см. в [документации](/manage/scaling#manual-horizontal-scaling).

### Настраиваемые резервные копии {#configurable-backups}

Теперь мы поддерживаем возможность экспорта резервных копий в собственный облачный аккаунт клиента; дополнительную информацию см. в [документации](/cloud/manage/backups/configurable-backups).

### Улучшения управляемых обновлений {#managed-upgrade-improvements}

Безопасные управляемые обновления обеспечивают значимую ценность для наших пользователей, позволяя им оставаться на актуальной версии базы данных по мере появления новых функций. В рамках этого релиза мы применили подход Make Before Break (MBB) к обновлениям, ещё больше снижая влияние на выполняющиеся рабочие нагрузки.

### Поддержка HIPAA {#hipaa-support}

Теперь мы поддерживаем HIPAA в совместимых регионах, включая AWS `us-east-1`, `us-west-2` и GCP `us-central1`, `us-east1`. Клиенты, желающие подключиться к этой опции, должны подписать Business Associate Agreement (BAA) и развернуть сервис в совместимой версии региона. Дополнительную информацию о HIPAA см. в [документации](/cloud/security/compliance-overview).

### Планируемые обновления {#scheduled-upgrades}

Пользователи могут планировать обновления для своих сервисов. Эта функция поддерживается только для сервисов уровня Enterprise. Дополнительную информацию о планируемых обновлениях см. в [документации](/manage/updates).

### Поддержка сложных типов в языковых клиентах {#language-client-support-for-complex-types}



[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1), [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11) и [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) клиенты получили поддержку типов Dynamic, Variant и JSON.

### Поддержка DBT для обновляемых материализованных представлений {#dbt-support-for-refreshable-materialized-views}

DBT теперь [поддерживает Refreshable Materialized Views](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7) в релизе `1.8.7`.

### Поддержка JWT-токенов {#jwt-token-support}

Добавлена поддержка аутентификации на основе JWT в JDBC-драйвере v2, clickhouse-java, [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12) и [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) клиентах.

Поддержка для JDBC/Java будет доступна в [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) после выхода этого релиза — ожидаемая дата пока не определена.

### Улучшения интеграции с Prometheus {#prometheus-integration-improvements}

Мы добавили несколько улучшений для интеграции с Prometheus:

- **Endpoint на уровне организации**. Мы добавили улучшение в нашу интеграцию Prometheus для ClickHouse Cloud. В дополнение к метрикам на уровне сервиса API теперь включает endpoint для **метрик на уровне организации**. Этот новый endpoint автоматически собирает метрики для всех сервисов в вашей организации, упрощая экспорт метрик в ваш коллектор Prometheus. Эти метрики можно интегрировать с инструментами визуализации, такими как Grafana и Datadog, для более всеобъемлющего представления производительности вашей организации.

  Эта возможность уже доступна всем пользователям. Дополнительные сведения можно найти [здесь](/integrations/prometheus).

- **Фильтрация метрик**. Мы добавили поддержку возврата отфильтрованного списка метрик в нашей интеграции Prometheus для ClickHouse Cloud. Эта функция помогает уменьшить размер ответа, позволяя сосредоточиться на метриках, которые критически важны для мониторинга работоспособности вашего сервиса.

  Эта функциональность доступна через необязательный параметр запроса в API, упрощая оптимизацию сбора данных и интеграцию с такими инструментами, как Grafana и Datadog.

  Функция фильтрации метрик уже доступна всем пользователям. Дополнительные сведения можно найти [здесь](/integrations/prometheus).



## 20 декабря 2024 г. {#december-20-2024}

### Привязка подписки маркетплейса к организации {#marketplace-subscription-organization-attachment}

Теперь вы можете привязать новую подписку из маркетплейса к существующей организации в ClickHouse Cloud. После завершения оформления подписки в маркетплейсе и перехода в ClickHouse Cloud вы можете подключить ранее созданную организацию к новой подписке маркетплейса. С этого момента ресурсы в вашей организации будут оплачиваться через маркетплейс. 

<Image img={add_marketplace} size="md" alt="Интерфейс ClickHouse Cloud, показывающий, как добавить подписку из маркетплейса к существующей организации" border />

### Принудительное истечение срока действия ключей OpenAPI {#force-openapi-key-expiration}

Теперь можно ограничить варианты срока действия API-ключей, чтобы вы не создавали бессрочные ключи OpenAPI. Свяжитесь с командой поддержки ClickHouse Cloud, чтобы включить эти ограничения для вашей организации.

### Дополнительные адреса электронной почты для уведомлений {#custom-emails-for-notifications}

Администраторы организации (Org Admins) теперь могут добавлять дополнительные адреса электронной почты к конкретному уведомлению в качестве дополнительных получателей. Это полезно, если вы хотите отправлять уведомления на алиас или другим пользователям вашей организации, которые сами могут не быть пользователями ClickHouse Cloud. Чтобы настроить это, перейдите в раздел Notification Settings в облачной консоли и отредактируйте адреса электронной почты, которые должны получать уведомления. 



## 6 декабря 2024 г. {#december-6-2024}

### BYOC (бета) {#byoc-beta}

Bring Your Own Cloud для AWS теперь доступен в бета-версии. Эта модель развертывания позволяет вам разворачивать и запускать ClickHouse Cloud в вашем собственном AWS-аккаунте. Мы поддерживаем развертывания в более чем 11 регионах AWS, и в ближайшее время список будет расширяться. Пожалуйста, [свяжитесь со службой поддержки](https://clickhouse.com/support/program) для получения доступа. Обратите внимание, что этот вариант предназначен для крупномасштабных развертываний.

### Коннектор Postgres Change Data Capture (CDC) в ClickPipes {#postgres-change-data-capture-cdc-connector-in-clickpipes}

Эта готовая интеграция позволяет клиентам реплицировать свои базы данных Postgres в ClickHouse Cloud всего за несколько кликов и использовать ClickHouse для сверхбыстрой аналитики. Вы можете использовать этот коннектор как для непрерывной репликации, так и для единовременных миграций из Postgres.

### Dashboards (бета) {#dashboards-beta}

На этой неделе мы с радостью объявляем о запуске бета-версии Dashboards в ClickHouse Cloud. С помощью Dashboards пользователи могут превращать сохраненные запросы в визуализации, организовывать визуализации на дашбордах и взаимодействовать с дашбордами с помощью параметров запросов. Чтобы начать, следуйте [документации по дашбордам](/cloud/manage/dashboards).

<Image img={beta_dashboards} size="lg" alt="Интерфейс ClickHouse Cloud с новой бета-функцией Dashboards с визуализациями" border />

### Конечные точки Query API (GA) {#query-api-endpoints-ga}

Мы рады объявить о GA-релизе конечных точек Query API в ClickHouse Cloud. Конечные точки Query API позволяют всего за пару кликов развернуть RESTful API-эндпоинты для сохраненных запросов и начать потреблять данные в вашем приложении без необходимости разбираться с языковыми клиентами или сложной аутентификацией. С момента первоначального запуска мы выпустили ряд улучшений, включая:

* Снижение задержки эндпоинтов, особенно при холодном старте
* Расширенные RBAC-контролы для эндпоинтов
* Настраиваемые домены, разрешенные CORS
* Стриминг результатов
* Поддержку всех ClickHouse-совместимых форматов вывода

В дополнение к этим улучшениям мы рады анонсировать универсальные конечные точки Query API, которые, используя уже существующий фреймворк, позволяют выполнять произвольные SQL-запросы к вашим сервисам ClickHouse Cloud. Универсальные эндпоинты можно включить и настроить на странице настроек сервиса.

Чтобы начать, следуйте [документации по Query API Endpoints](/cloud/get-started/query-endpoints).

<Image img={api_endpoints} size="lg" alt="Интерфейс ClickHouse Cloud, показывающий конфигурацию API Endpoints с различными настройками" border />

### Нативная поддержка JSON (бета) {#native-json-support-beta}

Мы запускаем бета-версию нативной поддержки JSON в ClickHouse Cloud. Чтобы начать, пожалуйста, [свяжитесь со службой поддержки для включения вашего облачного сервиса](/cloud/support).

### Векторный поиск с использованием индексов векторного сходства (ранний доступ) {#vector-search-using-vector-similarity-indexes-early-access}

Мы анонсируем индексы векторного сходства для приблизительного векторного поиска в режиме раннего доступа.

ClickHouse уже предлагает надежную поддержку векторных сценариев использования с широким набором [функций расстояния](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access) и возможностью выполнять линейное сканирование. Кроме того, недавно мы добавили экспериментальный подход [approximate vector search](/engines/table-engines/mergetree-family/annindexes), основанный на библиотеке [usearch](https://github.com/unum-cloud/usearch) и алгоритме поиска приблизительных ближайших соседей Hierarchical Navigable Small Worlds (HNSW).

Чтобы начать, [пожалуйста, зарегистрируйтесь в списке ожидания на ранний доступ](https://clickhouse.com/cloud/vector-search-index-waitlist).

### Пользователи ClickHouse-Connect (Python) и ClickHouse Kafka Connect {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

Были отправлены уведомления по электронной почте клиентам, у которых возникали проблемы, при которых клиенты могли получать исключение `MEMORY_LIMIT_EXCEEDED`.

Пожалуйста, обновитесь до:
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6

### ClickPipes теперь поддерживает доступ к ресурсам между VPC в AWS {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

Теперь вы можете предоставить однонаправленный доступ к конкретному источнику данных, например AWS MSK. С доступом к ресурсам между VPC с использованием AWS PrivateLink и VPC Lattice вы можете делиться отдельными ресурсами между границами VPC и аккаунтов или даже из локальных сетей, не жертвуя конфиденциальностью и безопасностью при выходе в публичную сеть. Чтобы начать и настроить общий доступ к ресурсу, вы можете прочитать [анонсирующую запись](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog).



<Image img={cross_vpc} size="lg" alt="Диаграмма, показывающая архитектуру доступа к ресурсам Cross-VPC для ClickPipes, подключающихся к AWS MSK" border />

### ClickPipes теперь поддерживает IAM для AWS MSK {#clickpipes-now-supports-iam-for-aws-msk}

Теперь вы можете использовать аутентификацию IAM для подключения к брокеру MSK с помощью ClickPipes для AWS MSK. Чтобы начать, ознакомьтесь с нашей [документацией](/integrations/clickpipes/kafka/best-practices/#iam).

### Максимальный размер реплики для новых сервисов в AWS {#maximum-replica-size-for-new-services-on-aws}

Теперь все новые сервисы, создаваемые в AWS, поддерживают максимальный размер реплики 236 GiB.



## 22 ноября 2024 г. {#november-22-2024}

### Встроенная расширенная панель наблюдаемости для ClickHouse Cloud {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

Ранее расширенная панель наблюдаемости, которая позволяет отслеживать метрики сервера ClickHouse и использование аппаратных ресурсов, была доступна только в open-source версии ClickHouse. Теперь эта функция доступна и в консоли ClickHouse Cloud.

Эта панель позволяет просматривать запросы на основе таблицы [system.dashboards](/operations/system-tables/dashboards) в едином интерфейсе. Перейдите на страницу **Monitoring > Service Health**, чтобы уже сегодня начать использовать расширенную панель наблюдаемости.

<Image img={nov_22} size="lg" alt="Расширенная панель наблюдаемости ClickHouse Cloud, показывающая метрики сервера и использование ресурсов" border />

### Автодополнение SQL на базе ИИ {#ai-powered-sql-autocomplete}

Мы значительно улучшили автодополнение, позволяя получать инлайновые варианты завершения SQL по мере того, как вы пишете свои запросы, с помощью нового AI Copilot. Эту функцию можно включить, переключив настройку **"Enable Inline Code Completion"** для любого сервиса ClickHouse Cloud.

<Image img={copilot} size="lg" alt="Анимация, показывающая, как AI Copilot предлагает варианты автодополнения SQL по мере ввода пользователем" border />

### Новая роль «billing» {#new-billing-role}

Теперь вы можете назначать пользователям вашей организации новую роль **Billing**, которая позволяет им просматривать и управлять платежной информацией без возможности настраивать или администрировать сервисы. Просто пригласите нового пользователя или отредактируйте роль существующего пользователя, чтобы назначить роль **Billing**.



## 8 ноября 2024 г. {#november-8-2024}

### Уведомления для клиентов в ClickHouse Cloud {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud теперь предоставляет уведомления в консоли и по электронной почте для ряда событий, связанных с выставлением счетов и масштабированием. Клиенты могут настроить эти уведомления через центр уведомлений в облачной консоли так, чтобы они отображались только в пользовательском интерфейсе, приходили по электронной почте или обоими способами. Вы можете на уровне сервиса настраивать категории и уровень критичности получаемых уведомлений.

В будущем мы добавим уведомления и для других событий, а также дополнительные способы их получения.

Подробности о том, как включить уведомления для вашего сервиса, см. в [документации ClickHouse](/cloud/notifications).

<Image img={notifications} size="lg" alt="Интерфейс центра уведомлений ClickHouse Cloud с параметрами конфигурации для разных типов уведомлений" border />

<br />



## 4 октября 2024 г. {#october-4-2024}

### В ClickHouse Cloud теперь доступны HIPAA-совместимые сервисы в бета-версии для GCP {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

Клиенты, которым требуется повышенный уровень безопасности для защищаемой медицинской информации (PHI), теперь могут подключиться к ClickHouse Cloud в [Google Cloud Platform (GCP)](https://cloud.google.com/). ClickHouse реализовал административные, физические и технические меры защиты, предписанные [Правилами безопасности HIPAA](https://www.hhs.gov/hipaa/for-professionals/security/index.html), а также предоставляет настраиваемые параметры безопасности, которые можно включать в зависимости от вашего конкретного варианта использования и нагрузки. Дополнительную информацию о доступных настройках безопасности смотрите на странице [Security features](/cloud/security).

Сервисы доступны в GCP `us-central-1` для клиентов с типом сервиса **Dedicated** и требуют заключения соглашения о деловом партнёрстве (BAA, Business Associate Agreement). Свяжитесь с [sales](mailto:sales@clickhouse.com) или [support](https://clickhouse.com/support/program), чтобы запросить доступ к этой функции или присоединиться к списку ожидания для дополнительных регионов GCP, AWS и Azure.

### Разделение вычислительных ресурсов (Compute-Compute Separation) теперь доступно в режиме частного предварительного просмотра для GCP и Azure {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

Мы недавно объявили о частном предварительном просмотре (Private Preview) для Compute-Compute Separation в AWS. Теперь оно доступно и для GCP, и для Azure.

Разделение вычислительных ресурсов позволяет назначать отдельные сервисы как сервисы с доступом на чтение-запись или только на чтение, что даёт возможность спроектировать оптимальную конфигурацию вычислительных ресурсов для вашего приложения с учётом стоимости и производительности. Подробности см. в [документации](/cloud/reference/warehouses).

### Самостоятельное восстановление MFA с использованием кодов восстановления {#self-service-mfa-recovery-codes}

Клиенты, использующие многофакторную аутентификацию, теперь могут получать коды восстановления, которые можно использовать в случае утери телефона или случайного удаления токена. Клиентам, впервые настраивающим MFA, код будет предоставлен в процессе настройки. Клиенты с уже настроенной MFA могут получить код восстановления, удалив существующий MFA‑токен и добавив новый.

### Обновление ClickPipes: пользовательские сертификаты, показатели задержки и многое другое {#clickpipes-update-custom-certificates-latency-insights-and-more}

Мы рады поделиться последними обновлениями ClickPipes — самого простого способа выполнять приём данных в ваш сервис ClickHouse. Эти новые функции призваны расширить ваш контроль над ингестией данных и обеспечить большую прозрачность показателей производительности.

*Пользовательские сертификаты для аутентификации в Kafka*

ClickPipes для Kafka теперь поддерживает пользовательские сертификаты для аутентификации брокеров Kafka, использующих SASL и публичный SSL/TLS. Вы можете легко загрузить собственный сертификат в разделе SSL Certificate при настройке ClickPipe, обеспечивая более безопасное подключение к Kafka.

*Новые метрики задержки для Kafka и Kinesis*

Прозрачность производительности имеет ключевое значение. В ClickPipes теперь доступен график задержки, позволяющий оценить время между публикацией сообщения (как из Kafka Topic, так и из Kinesis Stream) и его ингестией в ClickHouse Cloud. С помощью этой новой метрики вы можете более внимательно отслеживать производительность своих конвейеров данных и соответствующим образом их оптимизировать.

<Image img={latency_insights} size="lg" alt="Интерфейс ClickPipes с графиком метрик задержки для оценки производительности ингестии данных" border />

<br />

*Управление масштабированием для Kafka и Kinesis (частная бета-версия)*

Высокая пропускная способность может требовать дополнительных ресурсов для удовлетворения требований к объёму данных и задержке. Мы внедряем горизонтальное масштабирование для ClickPipes, доступное напрямую через нашу облачную консоль. Эта функция сейчас находится в частной бета-версии и позволяет более эффективно масштабировать ресурсы в соответствии с вашими требованиями. Свяжитесь с [support](https://clickhouse.com/support/program), чтобы присоединиться к бете.

*Ингестия необработанных сообщений для Kafka и Kinesis*

Теперь появилась возможность выполнять приём всего сообщения Kafka или Kinesis без его разбора. ClickPipes теперь поддерживает виртуальный столбец `_raw_message` ([virtual column](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns)), позволяющий пользователям сопоставлять полное сообщение с одним столбцом типа String. Это даёт вам гибкость при работе с сырыми данными по мере необходимости.



## 29 августа 2024 г. {#august-29-2024}

### Новый релиз Terraform provider — v1.0.0 {#new-terraform-provider-version---v100}

Terraform позволяет программно управлять сервисами ClickHouse Cloud и хранить их конфигурацию как код. Наш Terraform provider был загружен почти 200 000 раз и теперь официально выпущен в версии v1.0.0. Эта версия включает улучшения, такие как более надежная логика повторных запросов, а также новый ресурс для подключения private endpoints к вашему сервису ClickHouse Cloud. Вы можете скачать [Terraform provider здесь](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) и просмотреть [полный журнал изменений здесь](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0).

### Отчет 2024 SOC 2 Type II и обновленный сертификат ISO 27001 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

Мы рады сообщить о доступности нашего отчета 2024 SOC 2 Type II и обновленного сертификата ISO 27001, в которые включены недавно запущенные сервисы в Azure, а также сохранено покрытие сервисов в AWS и GCP.

Наш SOC 2 Type II демонстрирует нашу постоянную приверженность обеспечению безопасности, доступности, целостности обработки и конфиденциальности услуг, которые мы предоставляем пользователям ClickHouse. Для получения дополнительной информации ознакомьтесь с документом [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services), опубликованным American Institute of Certified Public Accountants (AICPA), и документом [What is ISO/IEC 27001](https://www.iso.org/standard/27001) от International Standards Organization (ISO).

Также посетите наш [Trust Center](https://trust.clickhouse.com/) для получения документов и отчетов по безопасности и соответствию требованиям.



## 15 августа 2024 г. {#august-15-2024}

### Разделение вычислительных ресурсов теперь в режиме Private Preview для AWS {#compute-compute-separation-is-now-in-private-preview-for-aws}

В существующих сервисах ClickHouse Cloud реплики обрабатывают и чтение, и запись, и нет способа настроить определённую реплику так, чтобы она обрабатывала только один тип операций. В ближайшее время появится новая функция под названием разделение вычислительных ресурсов (Compute-compute separation), которая позволяет назначать отдельные сервисы как read-write или read-only, что даёт возможность спроектировать оптимальную вычислительную конфигурацию для вашего приложения с учётом стоимости и производительности.

Новая функция разделения вычислительных ресурсов позволяет создавать несколько групп вычислительных узлов, каждая со своей конечной точкой (endpoint), использующих одну и ту же папку объектного хранилища, а значит — одни и те же таблицы, представления и т. д. Подробнее о [разделении вычислительных ресурсов см. здесь](/cloud/reference/warehouses). Пожалуйста, [свяжитесь со службой поддержки](https://clickhouse.com/support/program), если вы хотите получить доступ к этой функции в режиме Private Preview.

<Image img={cloud_console_2} size="lg" alt="Диаграмма, показывающая пример архитектуры для разделения вычислительных ресурсов с группами сервисов для чтения-записи и только для чтения" border />

### ClickPipes для S3 и GCS теперь в GA, поддержка непрерывного режима {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes — самый простой способ приёма данных в ClickHouse Cloud. Мы рады сообщить, что [ClickPipes](https://clickhouse.com/cloud/clickpipes) для S3 и GCS теперь **Generally Available**. ClickPipes поддерживает как однократный пакетный приём, так и «непрерывный режим» (continuous mode). Задача приёма загружает все файлы, соответствующие шаблону, из указанного удалённого бакета в целевую таблицу ClickHouse. В «непрерывном режиме» задача ClickPipes будет выполняться постоянно, осуществляя приём подходящих файлов, которые по мере появления добавляются в удалённый бакет объектного хранилища. Это позволит пользователям превратить любой бакет объектного хранилища в полноценную зону промежуточной обработки для приёма данных в ClickHouse Cloud. Подробнее о ClickPipes читайте в [нашей документации](/integrations/clickpipes).



## 18 июля 2024 г. {#july-18-2024}

### Endpoint метрик Prometheus теперь общедоступен {#prometheus-endpoint-for-metrics-is-now-generally-available}

В нашем последнем журнале изменений ClickHouse Cloud мы анонсировали закрытое предварительное тестирование (Private Preview) экспорта метрик [Prometheus](https://prometheus.io/) из ClickHouse Cloud. Эта функция позволяет использовать [ClickHouse Cloud API](/cloud/manage/api/api-overview), чтобы передавать ваши метрики в инструменты визуализации, такие как [Grafana](https://grafana.com/) и [Datadog](https://www.datadoghq.com/). Теперь эта функция стала **общедоступной**. Дополнительную информацию вы можете найти в [нашей документации](/integrations/prometheus).

### Инспектор таблиц в консоли ClickHouse Cloud {#table-inspector-in-cloud-console}

В ClickHouse есть команды, такие как [`DESCRIBE`](/sql-reference/statements/describe-table), которые позволяют исследовать таблицу и анализировать её схему. Эти команды выводят результат в консоль, но часто пользоваться ими неудобно, поскольку вам приходится комбинировать несколько запросов, чтобы получить все необходимые данные о ваших таблицах и столбцах.

Недавно мы запустили **Table Inspector** в облачной консоли, который позволяет получать важную информацию о таблицах и столбцах в пользовательском интерфейсе, без необходимости писать SQL. Вы можете опробовать Table Inspector для своих сервисов в облачной консоли. Он предоставляет информацию о вашей схеме, хранилище, сжатии и многом другом в одном унифицированном интерфейсе.

<Image img={compute_compute} size="lg" alt="Интерфейс ClickHouse Cloud Table Inspector с подробной информацией о схеме и хранилище" border />

### Новый Java Client API {#new-java-client-api}

Наш [Java Client](https://github.com/ClickHouse/clickhouse-java) — один из самых популярных клиентов, используемых для подключения к ClickHouse. Мы хотели сделать его ещё проще и интуитивно понятнее, в том числе за счёт переработанного API и различных оптимизаций производительности. Эти изменения значительно упростят подключение к ClickHouse из ваших Java‑приложений. Подробнее о том, как использовать обновлённый Java Client, вы можете прочитать в этой [публикации в блоге](https://clickhouse.com/blog/java-client-sequel).

### Новый анализатор включён по умолчанию {#new-analyzer-is-enabled-by-default}

Последние несколько лет мы работаем над новым анализатором для анализа и оптимизации запросов. Этот анализатор улучшает производительность запросов и позволит нам внедрять дальнейшие оптимизации, включая более быстрые и эффективные операции `JOIN`. Ранее новым пользователям требовалось включать эту функцию с помощью настройки `allow_experimental_analyzer`. Теперь этот улучшенный анализатор по умолчанию доступен во всех новых сервисах ClickHouse Cloud.

Следите за обновлениями — мы планируем ещё множество оптимизаций для анализатора.



## 28 июня 2024 г. {#june-28-2024}

### ClickHouse Cloud для Microsoft Azure теперь общедоступен (General Availability) {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

Впервые мы объявили о поддержке Microsoft Azure в статусе Beta [в мае этого года](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta). В этом последнем облачном релизе мы рады сообщить, что наша поддержка Azure переходит из Beta в режим General Availability. ClickHouse Cloud теперь доступен на всех трех основных облачных платформах: AWS, Google Cloud Platform и Microsoft Azure.

Этот релиз также включает поддержку подписок через [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud). На начальном этапе сервис будет доступен в следующих регионах:
- Соединенные Штаты: West US 3 (Аризона)
- Соединенные Штаты: East US 2 (Вирджиния)
- Европа: Germany West Central (Франкфурт)

Если вы хотите, чтобы был поддержан какой-либо конкретный регион, пожалуйста, [свяжитесь с нами](https://clickhouse.com/support/program).

### Аналитика журнала запросов (Query log insights) {#query-log-insights}

Наш новый интерфейс Query Insights в облачной консоли значительно упрощает работу со встроенным журналом запросов ClickHouse. Таблица ClickHouse `system.query_log` является ключевым источником информации для оптимизации запросов, отладки и мониторинга общего состояния и производительности кластера. Есть лишь одна оговорка: с более чем 70 полями и несколькими записями для одного запроса интерпретация журнала запросов связана с довольно высоким порогом вхождения. Эта начальная версия Query Insights служит основой для дальнейшей работы по упрощению типовых сценариев отладки и оптимизации запросов. Нам очень важно ваше мнение по мере развития этой функциональности, поэтому, пожалуйста, делитесь обратной связью — ваш вклад будет чрезвычайно ценен.

<Image img={query_insights} size="lg" alt="Интерфейс ClickHouse Cloud Query Insights, показывающий метрики производительности запросов и анализ" border />

### Prometheus endpoint для метрик (закрытая предварительная версия) {#prometheus-endpoint-for-metrics-private-preview}

Это, пожалуй, одна из самых востребованных функций: теперь вы можете экспортировать метрики [Prometheus](https://prometheus.io/) из ClickHouse Cloud в [Grafana](https://grafana.com/) и [Datadog](https://www.datadoghq.com/) для визуализации. Prometheus предоставляет open-source решение для мониторинга ClickHouse и настройки пользовательских оповещений. Доступ к метрикам Prometheus для вашего сервиса ClickHouse Cloud осуществляется через [ClickHouse Cloud API](/integrations/prometheus). В данный момент эта функция находится в статусе Private Preview. Пожалуйста, свяжитесь с [командой поддержки](https://clickhouse.com/support/program), чтобы включить эту функцию для вашей организации.

<Image img={prometheus} size="lg" alt="Дашборд Grafana, показывающий метрики Prometheus из ClickHouse Cloud" border />

### Прочие функции {#other-features}
- [Настраиваемые резервные копии](/cloud/manage/backups/configurable-backups) для настройки пользовательских политик резервного копирования, таких как частота, срок хранения и расписание, теперь доступны в режиме General Availability.



## 13 июня 2024 г. {#june-13-2024}

### Настраиваемые смещения для Kafka ClickPipes Connector (бета-версия) {#configurable-offsets-for-kafka-clickpipes-connector-beta}

До недавнего времени при настройке нового [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) он всегда начинал читать данные с самого начала топика Kafka. В таких случаях коннектор может быть недостаточно гибким для конкретных сценариев, когда требуется повторно обработать исторические данные, отслеживать только новые входящие данные или возобновить обработку с точной позиции.

ClickPipes for Kafka получил новую функцию, которая повышает гибкость и контроль над чтением данных из топиков Kafka. Теперь вы можете настраивать смещение, с которого будут считываться данные.

Доступны следующие варианты:
- From the beginning: начать чтение данных с самого начала топика Kafka. Этот вариант оптимален для пользователей, которым необходимо повторно обработать все исторические данные.
- From latest: начать чтение данных с самого последнего смещения. Полезно для пользователей, которых интересуют только новые сообщения.
- From a timestamp: начать чтение данных из сообщений, которые были сгенерированы в момент или после указанной метки времени. Эта возможность обеспечивает более точный контроль и позволяет возобновить обработку с конкретного момента времени.

<Image img={kafka_config} size="lg" alt="Интерфейс конфигурации коннектора ClickPipes Kafka с вариантами выбора смещения" border />

### Подключение сервисов к каналу быстрого выпуска обновлений (Fast) {#enroll-services-to-the-fast-release-channel}

Канал быстрого выпуска обновлений (Fast release channel) позволяет вашим сервисам получать обновления раньше официального графика релизов. Ранее для включения этой функции требовалась помощь команды поддержки. Теперь вы можете включить эту функцию для своих сервисов напрямую в консоли ClickHouse Cloud. Просто перейдите в раздел **Settings** и нажмите **Enroll in fast releases**. После этого ваш сервис будет получать обновления сразу после их выхода.

<Image img={fast_releases} size="lg" alt="Страница настроек ClickHouse Cloud с опцией подключения к fast releases" border />

### Поддержка горизонтального масштабирования в Terraform {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud поддерживает [горизонтальное масштабирование](/manage/scaling#how-scaling-works-in-clickhouse-cloud), то есть возможность добавлять к вашим сервисам дополнительные реплики того же размера. Горизонтальное масштабирование повышает производительность и степень параллелизма при выполнении одновременных запросов. Ранее для добавления большего числа реплик требовалось использовать консоль ClickHouse Cloud или API. Теперь вы можете использовать Terraform для добавления или удаления реплик вашего сервиса, что позволяет программно масштабировать сервисы ClickHouse по мере необходимости.

Подробности см. в [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).



## 30 мая 2024 г. {#may-30-2024}

### Делитесь запросами с коллегами {#share-queries-with-your-teammates}

Когда вы пишете SQL‑запрос, велика вероятность, что он будет полезен и другим людям в вашей команде. Раньше вам пришлось бы отправлять запрос через Slack или по электронной почте, и у коллег не было способа автоматически получать обновления этого запроса, если вы его измените.

Мы рады сообщить, что теперь вы можете легко делиться запросами через консоль ClickHouse Cloud. Из редактора запросов вы можете поделиться запросом со всей командой или с конкретным членом команды. Вы также можете указать, будет ли у них доступ только на чтение или также на запись. Нажмите кнопку **Share** в редакторе запросов, чтобы опробовать новую возможность совместного использования запросов.

<Image img={share_queries} size="lg" alt="Редактор запросов ClickHouse Cloud с показом функции совместного доступа и вариантов прав" border />

### ClickHouse Cloud для Microsoft Azure теперь в бета-версии {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

Мы наконец запустили возможность создавать службы ClickHouse Cloud в Microsoft Azure. Уже многие наши клиенты используют ClickHouse Cloud в Azure в продакшене в рамках программы Private Preview. Теперь любой может создать собственную службу в Azure. Все ваши любимые функции ClickHouse, поддерживаемые в AWS и GCP, будут работать и в Azure.

Мы ожидаем, что ClickHouse Cloud для Azure будет готов к общедоступному релизу (General Availability) в ближайшие несколько недель. [Прочитайте эту публикацию в блоге](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta), чтобы узнать больше, или создайте новую службу в Azure через консоль ClickHouse Cloud.

Примечание: службы уровня **Development** для Azure в настоящее время не поддерживаются.

### Настройка Private Link через консоль ClickHouse Cloud {#set-up-private-link-via-the-cloud-console}

Функция Private Link позволяет подключать ваши службы ClickHouse Cloud к внутренним сервисам в аккаунте вашего облачного провайдера без вывода трафика в публичный интернет, что снижает затраты и повышает безопасность. Ранее это было сложно настроить и требовало использования ClickHouse Cloud API.

Теперь вы можете настроить частные конечные точки всего за несколько кликов прямо из консоли ClickHouse Cloud. Просто перейдите в **Settings** вашей службы, затем в раздел **Security** и нажмите **Set up private endpoint**.

<Image img={private_endpoint} size="lg" alt="Консоль ClickHouse Cloud с интерфейсом настройки частной конечной точки в разделе настроек безопасности" border />



## 17 мая 2024 г. {#may-17-2024}

### Ингестия данных из Amazon Kinesis с помощью ClickPipes (бета) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes — это эксклюзивный сервис, предоставляемый ClickHouse Cloud для ингестии данных без написания кода. Amazon Kinesis — полностью управляемый потоковый сервис AWS для приёма и хранения потоковых данных с целью последующей обработки. Мы рады запустить бета-версию ClickPipes для Amazon Kinesis — одной из наиболее востребованных интеграций. Мы планируем добавлять новые интеграции в ClickPipes, поэтому дайте нам знать, поддержку какого источника данных вы хотели бы видеть. Подробнее об этой возможности можно прочитать [здесь](https://clickhouse.com/blog/clickpipes-amazon-kinesis).

Вы можете попробовать новую интеграцию Amazon Kinesis для ClickPipes в облачной консоли:

<Image img={kenesis} size="lg" alt="Интерфейс ClickPipes с параметрами настройки интеграции с Amazon Kinesis" border />

### Настраиваемые резервные копии (закрытый предпросмотр) {#configurable-backups-private-preview}

Резервные копии важны для любой базы данных (независимо от её надёжности), и с самого первого дня ClickHouse Cloud мы относимся к ним максимально серьёзно. На этой неделе мы запустили функцию Configurable Backups, которая обеспечивает гораздо большую гибкость резервного копирования вашего сервиса. Теперь вы можете управлять временем запуска, периодом хранения и частотой. Эта функция доступна для сервисов **Production** и **Dedicated** и недоступна для сервисов **Development**. Поскольку эта функция находится в закрытом предпросмотре, обратитесь по адресу support@clickhouse.com, чтобы включить её для вашего сервиса. Подробнее о настраиваемых резервных копиях можно прочитать [здесь](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud).

### Создание API из ваших SQL-запросов (бета) {#create-apis-from-your-sql-queries-beta}

Когда вы пишете SQL-запрос для ClickHouse, вам по-прежнему нужно подключаться к ClickHouse через драйвер, чтобы передать результат запроса в ваше приложение. Теперь с нашей новой функцией **Query Endpoints** вы можете выполнять SQL-запросы напрямую из API без какой-либо конфигурации. Вы можете настроить Query Endpoints так, чтобы они возвращали JSON, CSV или TSV. Нажмите кнопку "Share" в облачной консоли, чтобы опробовать эту новую возможность с вашими запросами. Подробнее о Query Endpoints можно прочитать [здесь](https://clickhouse.com/blog/automatic-query-endpoints).

<Image img={query_endpoints} size="lg" alt="Интерфейс ClickHouse Cloud с настройкой Query Endpoints и вариантами формата вывода" border />

### Официальная сертификация ClickHouse стала доступна {#official-clickhouse-certification-is-now-available}

В обучающем курсе ClickHouse Develop доступно 12 бесплатных модулей. До этой недели не существовало официального способа подтвердить свою экспертизу в ClickHouse. Мы недавно запустили официальный экзамен для получения статуса **ClickHouse Certified Developer**. Успешная сдача этого экзамена позволяет продемонстрировать текущим и потенциальным работодателям вашу компетентность в ClickHouse по таким темам, как ингестия данных, моделирование, анализ, оптимизация производительности и другим. Вы можете пройти экзамен [здесь](https://clickhouse.com/learn/certification) или прочитать подробнее о сертификации ClickHouse в этой [публикации в блоге](https://clickhouse.com/blog/first-official-clickhouse-certification).



## 25 апреля 2024 г. {#april-25-2024}

### Загрузка данных из S3 и GCS с помощью ClickPipes {#load-data-from-s3-and-gcs-using-clickpipes}

Вы могли заметить, что в недавно обновлённой облачной консоли появился новый раздел Data sources. Страница Data sources основана на ClickPipes — встроенной функции ClickHouse Cloud, которая позволяет легко загружать данные из различных источников в ClickHouse Cloud.

В последнем обновлении ClickPipes появилась возможность напрямую загружать данные из Amazon S3 и Google Cloud Storage. Хотя вы по‑прежнему можете использовать встроенные табличные функции, ClickPipes — это полностью управляемый сервис через наш интерфейс, который позволяет выполнять приём данных из S3 и GCS всего в несколько кликов. Эта функция пока находится в статусе Private Preview, но вы уже можете опробовать её в облачной консоли.

<Image img={s3_gcs} size="lg" alt="Интерфейс ClickPipes с параметрами конфигурации для загрузки данных из бакетов S3 и GCS" border />

### Использование Fivetran для загрузки данных из более чем 500 источников в ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse может очень быстро выполнять запросы ко всем вашим крупным наборам данных, но сначала данные должны быть загружены в ClickHouse. Благодаря широкому набору коннекторов Fivetran пользователи теперь могут быстро загружать данные из более чем 500 источников. Независимо от того, нужно ли вам загружать данные из Zendesk, Slack или любых других привычных приложений, новый пункт назначения ClickHouse в Fivetran позволяет использовать ClickHouse в качестве целевой базы данных для данных ваших приложений.

Это интеграция с открытым исходным кодом, созданная за многие месяцы напряжённой работы нашей команды по интеграциям. Вы можете ознакомиться с нашим [постом о релизе в блоге](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) и [репозиторием на GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination).

### Другие изменения {#other-changes}

**Изменения в консоли**
- Поддержка форматов вывода в SQL-консоли

**Изменения в интеграциях**
- Коннектор ClickPipes Kafka поддерживает многоброкерную конфигурацию
- Коннектор PowerBI поддерживает указание параметров конфигурации ODBC-драйвера



## 18 апреля 2024 г. {#april-18-2024}

### Регион AWS Tokyo теперь доступен для ClickHouse Cloud {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

В этом релизе добавлен новый регион AWS Tokyo (`ap-northeast-1`) для ClickHouse Cloud. Поскольку мы хотим, чтобы ClickHouse была самой быстрой базой данных, мы постоянно добавляем новые регионы во всех облаках, чтобы максимально снизить задержку. Вы можете создать новый сервис в регионе Tokyo в обновленной облачной консоли.

<Image img={tokyo} size="lg" alt="Интерфейс создания сервиса ClickHouse Cloud с выбором региона Tokyo" border />

Другие изменения:

### Изменения в консоли {#console-changes}
- Поддержка формата Avro для ClickPipes для Kafka теперь доступна в статусе General Availability
- Реализована полная поддержка импорта ресурсов (сервисов и приватных конечных точек) для Terraform-провайдера

### Изменения в интеграциях {#integrations-changes}
- Крупный стабильный релиз клиента Node.js: расширенная поддержка TypeScript для query и ResultSet, конфигурация через URL
- Kafka Connector: исправлена ошибка с игнорированием исключений при записи в DLQ, добавлена поддержка типа Avro Enum, опубликованы руководства по использованию коннектора на [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) и [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)
- Grafana: исправлена поддержка типа Nullable в UI, исправлена поддержка динамического имени таблицы для трассировок OTel
- DBT: исправлены настройки моделей для пользовательской материализации.
- Java client: исправлена ошибка с некорректным разбором кода ошибки
- Python client: исправлена привязка параметров для числовых типов, исправлены ошибки с привязкой списков чисел в запросах, добавлена поддержка SQLAlchemy Point.



## 4 апреля 2024 г. {#april-4-2024}

### Представляем новую консоль ClickHouse Cloud {#introducing-the-new-clickhouse-cloud-console}

В этом релизе мы запускаем закрытый предварительный просмотр новой облачной консоли.

В ClickHouse мы постоянно думаем о том, как улучшить опыт разработчиков. Мы понимаем, что недостаточно предоставить самое быстрое в мире хранилище данных для работы в реальном времени — им также должно быть легко пользоваться и просто управлять.

Тысячи пользователей ClickHouse Cloud выполняют миллиарды запросов в нашей SQL-консоли каждый месяц, поэтому мы решили инвестировать в создание консоли мирового класса, чтобы упростить взаимодействие с вашими сервисами ClickHouse Cloud как никогда прежде. Наша новая облачная консоль объединяет отдельный SQL-редактор и консоль управления в одном интуитивно понятном интерфейсе.

Отдельные клиенты получат предварительный доступ к нашему новому интерфейсу облачной консоли — единому и удобному способу исследования и управления вашими данными в ClickHouse. Пожалуйста, свяжитесь с нами по адресу support@clickhouse.com, если вы хотите получить приоритетный доступ.

<Image img={cloud_console} size="lg" alt="Анимация, показывающая новый интерфейс консоли ClickHouse Cloud с интегрированным SQL-редактором и функциями управления" border />



## 28 марта 2024 г. {#march-28-2024}

В этом релизе добавлена поддержка Microsoft Azure, горизонтальное масштабирование через API и каналы релизов в режиме закрытого предварительного просмотра.

### Общие обновления {#general-updates}
- Добавлена поддержка Microsoft Azure в режиме закрытого предварительного просмотра. Чтобы получить доступ, обратитесь к менеджеру по работе с клиентами или в службу поддержки либо присоединитесь к [листу ожидания](https://clickhouse.com/cloud/azure-waitlist).
- Введены каналы релизов – возможность задавать время обновлений в зависимости от типа окружения. В этом релизе мы добавили канал релизов "fast", который позволяет обновлять тестовые и другие непроизводственные окружения раньше, чем производственные (для включения обратитесь в службу поддержки).

### Изменения в администрировании {#administration-changes}
- Добавлена поддержка настройки горизонтального масштабирования через API (закрытый предварительный просмотр, для включения обратитесь в службу поддержки)
- Улучшено автоматическое масштабирование для увеличения ресурсов сервисов, сталкивающихся с ошибками «out of memory» при запуске
- Добавлена поддержка CMEK для AWS через Terraform-провайдер

### Изменения в Console {#console-changes-1}
- Добавлена поддержка входа через учетную запись Microsoft (social login)
- Добавлены возможности совместного использования параметризованных запросов в SQL Console
- Существенно улучшена производительность редактора запросов (задержка снижена с 5 до 1,5 секунды в некоторых регионах ЕС)

### Изменения в интеграциях {#integrations-changes-1}
- ClickHouse OpenTelemetry exporter: [добавлена поддержка](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) движка реплицируемых таблиц ClickHouse и [добавлены интеграционные тесты](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT adapter: добавлена поддержка [макроса материализации для словарей](https://github.com/ClickHouse/dbt-clickhouse/pull/255), [тестов поддержки выражений TTL](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink: [добавлена совместимость](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) с механизмом обнаружения плагинов Kafka (вклад сообщества)
- ClickHouse Java Client: представлен [новый пакет](https://github.com/ClickHouse/clickhouse-java/pull/1574) для нового клиентского API и [добавлено покрытие тестами](https://github.com/ClickHouse/clickhouse-java/pull/1575) для Cloud-тестов
- ClickHouse NodeJS Client: расширены тесты и документация для нового поведения HTTP keep-alive. Доступно, начиная с релиза v0.3.0
- ClickHouse Golang Client: [исправлена ошибка](https://github.com/ClickHouse/clickhouse-go/pull/1236) для Enum в качестве ключа в Map; [исправлена ошибка](https://github.com/ClickHouse/clickhouse-go/pull/1237), при которой соединение с ошибкой оставалось в пуле соединений (вклад сообщества)
- ClickHouse Python Client: [добавлена поддержка](https://github.com/ClickHouse/clickhouse-connect/issues/155) потоковой передачи результатов запросов через PyArrow (вклад сообщества)

### Обновления безопасности {#security-updates}
- В ClickHouse Cloud внесены изменения, предотвращающие уязвимость ["Role-based Access Control is bypassed when query caching is enabled"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) (CVE-2024-22412)



## 14 марта 2024 г. {#march-14-2024}

В этом релизе в режиме раннего доступа становится доступен новый интерфейс облачной консоли, ClickPipes для пакетной загрузки из S3 и GCS, а также поддержка формата Avro в ClickPipes для Kafka. Также версия базы данных ClickHouse обновлена до 24.1, что добавляет поддержку новых функций, а также оптимизации производительности и использования ресурсов.

### Изменения в консоли {#console-changes-2}
- Новый интерфейс облачной консоли доступен в режиме раннего доступа (пожалуйста, свяжитесь со службой поддержки, если вы заинтересованы в участии).
- ClickPipes для пакетной загрузки из S3 и GCS доступны в режиме раннего доступа (пожалуйста, свяжитесь со службой поддержки, если вы заинтересованы в участии).
- Поддержка формата Avro в ClickPipes для Kafka доступна в режиме раннего доступа (пожалуйста, свяжитесь со службой поддержки, если вы заинтересованы в участии).

### Обновление версии ClickHouse {#clickhouse-version-upgrade}
- Оптимизации для FINAL, улучшения векторизации, более быстрые агрегации — подробности см. в [блоге о релизе 23.12](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final).
- Новые функции для обработки punycode, вычисления схожести строк, обнаружения выбросов, а также оптимизации использования памяти при слияниях и в Keeper — подробности см. в [блоге о релизе 24.1](https://clickhouse.com/blog/clickhouse-release-24-01) и [презентации](https://presentations.clickhouse.com/release_24.1/).
- Эта версия ClickHouse Cloud основана на 24.1; вы можете найти десятки новых возможностей, улучшений производительности и исправлений ошибок. Подробности см. в [журналах изменений](/whats-new/changelog/2023#2312) основной базы данных.

### Изменения в интеграциях {#integrations-changes-2}
- Grafana: Исправлена миграция дашбордов для v4, логика ad-hoc‑фильтрации
- Tableau Connector: Исправлена функция DATENAME и округление для аргументов типа «real»
- Kafka Connector: Исправлена NPE при инициализации соединения, добавлена возможность указывать параметры JDBC-драйвера
- Golang client: Уменьшен объем потребляемой памяти при обработке ответов, исправлены экстремальные значения для Date32, исправлено сообщение об ошибках при включенном сжатии
- Python client: Улучшена поддержка часовых поясов в параметрах datetime, повышена производительность для Pandas DataFrame



## 29 февраля 2024 г. {#february-29-2024}

В этом релизе улучшено время загрузки приложения SQL-консоли, добавлена поддержка аутентификации SCRAM-SHA-256 в ClickPipes и расширена поддержка вложенных структур в Kafka Connect.

### Изменения в консоли {#console-changes-3}
- Оптимизировано время начальной загрузки приложения SQL-консоли
- Исправлено состояние гонки в SQL-консоли, приводившее к ошибке «authentication failed»
- Исправлено поведение на странице мониторинга, где последнее значение выделения памяти иногда отображалось некорректно
- Исправлено поведение, при котором SQL-консоль иногда отправляла дублирующиеся команды KILL QUERY
- В ClickPipes добавлена поддержка метода аутентификации SCRAM-SHA-256 для источников данных на базе Kafka

### Изменения в интеграциях {#integrations-changes-3}
- Kafka Connector: расширена поддержка сложных вложенных структур (Array, Map); добавлена поддержка типа FixedString; добавлена поддержка ингестии в несколько баз данных
- Metabase: исправлена несовместимость с ClickHouse версии ниже 23.8
- DBT: добавлена возможность передавать настройки при создании моделей
- Node.js client: добавлена поддержка длительных запросов (>1 часа) и более корректная обработка пустых значений



## 15 февраля 2024 г. {#february-15-2024}

В этом релизе обновлена версия ядра базы данных, добавлена возможность настройки приватных подключений через Terraform и добавлена поддержка семантики «ровно один раз» для асинхронных вставок через Kafka Connect.

### Обновление версии ClickHouse {#clickhouse-version-upgrade-1}
- Движок таблиц S3Queue для непрерывной, плановой загрузки данных из S3 готов к промышленной эксплуатации — подробности см. в [блоге о релизе 23.11](https://clickhouse.com/blog/clickhouse-release-23-11).
- Существенно повышена производительность для `FINAL`, улучшена векторизация SIMD-инструкций, что приводит к более быстрым запросам — подробности см. в [блоге о релизе 23.12](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final).
- Эта версия ClickHouse Cloud основана на 23.12, в ней десятки новых возможностей, улучшений производительности и исправлений ошибок. Подробности см. в [changelog ядра базы данных](/whats-new/changelog/2023#2312).

### Изменения в Console {#console-changes-4}
- Добавлена возможность настройки AWS Private Link и GCP Private Service Connect через провайдер Terraform
- Повышена отказоустойчивость при импорте данных из удалённых файлов
- Добавлена панель с подробной информацией о статусе импорта для всех операций импорта данных
- Добавлена поддержка учётных данных key/secret key для импорта данных из S3

### Изменения в интеграциях {#integrations-changes-4}
* Kafka Connect
  * Поддержка `async_insert` с семантикой «ровно один раз» (по умолчанию отключено)
* Клиент на Go
  * Исправлена привязка `DateTime`
  * Улучшена производительность пакетных вставок
* Клиент на Java
  * Исправлена проблема с сжатием запросов

### Изменения настроек {#settings-changes}
* `use_mysql_types_in_show_columns` больше не требуется. Он будет автоматически включён при подключении через интерфейс MySQL.
* `async_insert_max_data_size` теперь имеет значение по умолчанию `10 MiB`



## 2 февраля 2024 г. {#february-2-2024}

В этом релизе стали доступны ClickPipes для Azure Event Hub, значительно улучшен процесс навигации по логам и трейсам с использованием коннектора ClickHouse для Grafana версии v4, а также появилась поддержка инструментов управления схемой баз данных Flyway и Atlas.

### Изменения в консоли {#console-changes-5}
* Добавлена поддержка ClickPipes для Azure Event Hub
* Новые сервисы запускаются с тайм-аутом простоя по умолчанию 15 минут

### Изменения в интеграциях {#integrations-changes-5}
* [Источник данных ClickHouse для Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) релиз v4
  * Полностью переработан конструктор запросов, теперь есть специализированные редакторы для Table, Logs, Time Series и Traces
  * Полностью переработан генератор SQL для поддержки более сложных и динамических запросов
  * Добавлена полноценная поддержка OpenTelemetry в представлениях Logs и Traces
  * Расширена конфигурация, чтобы можно было указывать таблицы и столбцы по умолчанию для Logs и Traces
  * Добавлена возможность указывать произвольные HTTP-заголовки
  * И множество других улучшений — смотрите полный [changelog](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)
* Инструменты управления схемой баз данных
  * [Flyway добавил поддержку ClickHouse](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas добавил поддержку ClickHouse](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * Оптимизирована ингестия в таблицу со значениями по умолчанию
  * Добавлена поддержка строковых дат в DateTime64
* Metabase
  * Добавлена поддержка подключения к нескольким базам данных



## 18 января 2024 г. {#january-18-2024}

В этом релизе добавлен новый регион в AWS (Лондон / eu-west-2), добавлена поддержка ClickPipes для Redpanda, Upstash и Warpstream, а также улучшена надёжность основной функциональности базы данных [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted).

### Общие изменения {#general-changes}
- Новый регион AWS: Лондон (eu-west-2)

### Изменения в консоли {#console-changes-6}
- Добавлена поддержка ClickPipes для Redpanda, Upstash и Warpstream
- Механизм аутентификации ClickPipes сделан настраиваемым в UI

### Изменения в интеграциях {#integrations-changes-6}
- Java-клиент:
  - Изменения, нарушающие обратную совместимость: удалена возможность указывать произвольные URL-адреса в вызове. Эта функциональность была удалена из ClickHouse
  - Помечены как устаревшие: Java CLI-клиент и пакеты gRPC
  - Добавлена поддержка формата RowBinaryWithDefaults для уменьшения размера пакета и нагрузки на экземпляр ClickHouse (по запросу Exabeam)
  - Диапазоны значений Date32 и DateTime64 приведены в соответствие с ClickHouse, обеспечена совместимость с типом Spark Array string, улучшен механизм выбора узлов
- Kafka Connector: Добавлен JMX-дашборд для мониторинга в Grafana
- PowerBI: Настройки ODBC-драйвера сделаны настраиваемыми в UI
- JavaScript-клиент: Сделана доступной информация об итоговой статистике запроса, добавлена возможность указывать подмножество конкретных столбцов для вставки, параметр keep_alive сделан настраиваемым для веб-клиента
- Python-клиент: Добавлена поддержка типа Nothing для SQLAlchemy

### Изменения, связанные с надёжностью {#reliability-changes}
- Изменение, нарушающее обратную совместимость и затрагивающее пользователей: ранее две функции ([is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) и ``OPTIMIZE CLEANUP``) при определённых условиях могли приводить к повреждению данных в ClickHouse. Чтобы защитить целостность данных наших пользователей, сохранив при этом основную функциональность, мы изменили принцип работы этой функциональности. В частности, настройка MergeTree ``clean_deleted_rows`` теперь помечена как устаревшая и больше не оказывает эффекта. Ключевое слово ``CLEANUP`` по умолчанию не разрешено (для его использования необходимо включить ``allow_experimental_replacing_merge_with_cleanup``). Если вы решите использовать ``CLEANUP``, необходимо убедиться, что оно всегда используется совместно с ``FINAL``, и вы должны гарантировать, что строки со старыми версиями больше не будут вставляться после выполнения ``OPTIMIZE FINAL CLEANUP``.



## 18 декабря 2023 г. {#december-18-2023}

В этом релизе добавлен новый регион в GCP (us-east1), возможность самостоятельной настройки защищённых подключений к конечным точкам (endpoint), поддержка дополнительных интеграций, включая DBT 1.7, а также многочисленные исправления ошибок и улучшения безопасности.

### Общие изменения {#general-changes-1}
- ClickHouse Cloud теперь доступен в регионе GCP us-east1 (South Carolina)
- Добавлена возможность настраивать AWS Private Link и GCP Private Service Connect через OpenAPI

### Изменения в Console {#console-changes-7}
- Включён бесшовный вход в SQL-консоль для пользователей с ролью Developer
- Упрощён процесс настройки параметров простоя (idling controls) во время первоначальной настройки (onboarding)

### Изменения в интеграциях {#integrations-changes-7}
- Коннектор DBT: добавлена поддержка DBT до v1.7
- Metabase: добавлена поддержка Metabase v0.48
- PowerBI Connector: добавлена возможность работы в PowerBI Cloud
- Права для внутреннего пользователя ClickPipes сделаны настраиваемыми
- Kafka Connect
  - Улучшена логика дедупликации и ингестия типов Nullable
  - Добавлена поддержка текстовых форматов (CSV, TSV)
- Apache Beam: добавлена поддержка типов Boolean и LowCardinality
- Клиент Node.js: добавлена поддержка формата Parquet

### Объявления по безопасности {#security-announcements}
- Исправлены 3 уязвимости безопасности — подробности см. в [журнале изменений по безопасности](/whats-new/security-changelog):
  - CVE 2023-47118 (CVSS 7.0) — уязвимость переполнения буфера в куче, затрагивающая нативный интерфейс, по умолчанию работающий на порту 9000/tcp
  - CVE-2023-48704 (CVSS 7.0) — уязвимость переполнения буфера в куче, затрагивающая нативный интерфейс, по умолчанию работающий на порту 9000/tcp
  - CVE 2023-48298 (CVSS 5.9) — уязвимость целочисленного переполнения вниз (integer underflow) в кодеке сжатия FPC



## 22 ноября 2023 г. {#november-22-2023}

В этом релизе обновлена основная версия базы данных, улучшен процесс входа и аутентификации, а также добавлена поддержка прокси в Kafka Connect Sink.

### Обновление версии ClickHouse {#clickhouse-version-upgrade-2}

- Радикально улучшена производительность чтения файлов Parquet. Подробности см. в [блоге о релизе 23.8](https://clickhouse.com/blog/clickhouse-release-23-08).
- Добавлена поддержка вывода типов для JSON. Подробности см. в [блоге о релизе 23.9](https://clickhouse.com/blog/clickhouse-release-23-09).
- Представлены мощные функции для аналитиков, такие как `ArrayFold`. Подробности см. в [блоге о релизе 23.10](https://clickhouse.com/blog/clickhouse-release-23-10).
- **Обратное несовместимое изменение, заметное пользователям**: по умолчанию отключена настройка `input_format_json_try_infer_numbers_from_strings`, чтобы избежать вывода чисел из строк в формате JSON. Это помогает предотвратить возможные ошибки парсинга, когда в выборке данных есть строки, похожие на числа.
- Десятки новых возможностей, улучшений производительности и исправлений ошибок. Подробности см. в [журналах изменений основной базы данных](/whats-new/changelog).

### Изменения в Console {#console-changes-8}

- Улучшен процесс входа и аутентификации.
- Улучшены AI-подсказки запросов для лучшей поддержки больших схем.

### Изменения в интеграциях {#integrations-changes-8}

- Kafka Connect Sink: добавлена поддержка прокси, сопоставление `topic-tablename` и возможность настройки свойств доставки Keeper _exactly-once_.
- Клиент для Node.js: добавлена поддержка формата Parquet.
- Metabase: добавлена поддержка функции `datetimeDiff`.
- Клиент для Python: добавлена поддержка специальных символов в именах столбцов. Исправлена привязка параметра часового пояса.



## 2 ноября 2023 г. {#november-2-2023}

В этом релизе расширена региональная поддержка сервисов разработки в Азии, добавлена функциональность ротации ключей для ключей шифрования, управляемых клиентом, улучшена детализация настроек налогов в биллинговой консоли и исправлен ряд ошибок в поддерживаемых клиентских библиотеках.

### Общие обновления {#general-updates-1}
- Сервисы разработки теперь доступны в AWS в регионах `ap-south-1` (Мумбаи) и `ap-southeast-1` (Сингапур)
- Добавлена поддержка ротации ключей для ключей шифрования, управляемых клиентом (CMEK)

### Изменения в консоли {#console-changes-9}
- Добавлена возможность настраивать более детальные налоговые параметры при добавлении кредитной карты

### Изменения интеграций {#integrations-changes-9}
- MySQL
  - Улучшена поддержка Tableau Online и QuickSight через MySQL
- Kafka Connector
  - Добавлен новый StringConverter для поддержки текстовых форматов (CSV, TSV)
  - Добавлена поддержка типов данных Bytes и Decimal
  - Поведение Retryable Exceptions изменено так, что они теперь всегда повторно выполняются (даже при errors.tolerance=all)
- Клиент Node.js
  - Исправлена проблема, из-за которой при потоковой передаче больших наборов данных возвращались повреждённые результаты
- Клиент Python
  - Исправлены тайм-ауты при массовых вставках данных
  - Исправлена проблема NumPy/Pandas с Date32
- Клиент Go
  - Исправлена вставка пустой map в JSON-колонку, очистка буфера компрессии, экранирование запросов, panic при нуле/nil для IPv4 и IPv6
  - Добавлен сторожевой механизм (watchdog) для отменённых вставок
- DBT
  - Улучшена поддержка распределённых таблиц вместе с тестами



## 19 октября 2023 г. {#october-19-2023}

В этом релизе представлены улучшения удобства работы и производительности SQL-консоли, более корректная обработка типов данных IP в коннекторе Metabase, а также новая функциональность в клиентах Java и Node.js.

### Изменения в консоли {#console-changes-10}
- Улучшено удобство работы с SQL-консолью (например, сохраняется ширина столбцов между выполнениями запросов)
- Улучшена производительность SQL-консоли

### Изменения в интеграциях {#integrations-changes-10}
- Клиент Java:
  - Изменена используемая по умолчанию сетевая библиотека для повышения производительности и повторного использования открытых соединений
  - Добавлена поддержка прокси
  - Добавлена поддержка защищённых соединений с использованием TrustStore
- Клиент Node.js: Исправлено поведение keep-alive для insert-запросов
- Metabase: Исправлена сериализация столбцов IPv4/IPv6



## 28 сентября 2023 г. {#september-28-2023}

В этом релизе объявлена общая доступность ClickPipes для Kafka, Confluent Cloud и Amazon MSK и коннектора Kafka Connect ClickHouse Sink, добавлен самообслуживаемый рабочий процесс для безопасного доступа к Amazon S3 с использованием ролей IAM, а также рекомендации по запросам с помощью ИИ (закрытый предварительный просмотр).

### Изменения в консоли {#console-changes-11}
- Добавлен самообслуживаемый рабочий процесс для безопасного [доступа к Amazon S3 с использованием ролей IAM](/cloud/data-sources/secure-s3)
- Представлены рекомендации по запросам с помощью ИИ в режиме закрытого предварительного просмотра (для доступа [свяжитесь со службой поддержки ClickHouse Cloud](https://console.clickhouse.cloud/support))

### Изменения в интеграциях {#integrations-changes-11}
- Объявлена общая доступность ClickPipes — готового сервиса ингестии данных — для Kafka, Confluent Cloud и Amazon MSK (см. [блог о релизе](https://clickhouse.com/blog/clickpipes-is-generally-available))
- Объявлена общая доступность Kafka Connect ClickHouse Sink
  - Расширена поддержка пользовательских настроек ClickHouse с использованием свойства `clickhouse.settings`
  - Улучшено поведение дедупликации с учётом динамических полей
  - Добавлена поддержка `tableRefreshInterval` для повторного получения изменений таблицы из ClickHouse
- Исправлена проблема SSL-подключения и сопоставления типов между [Power BI](/integrations/powerbi) и типами данных ClickHouse



## 7 сентября 2023 г. {#september-7-2023}

В этот релиз вошла бета‑версия официального коннектора PowerBI Desktop, улучшена обработка платежей по банковским картам для Индии, а также реализовано множество улучшений в поддерживаемых клиентских библиотеках.

### Изменения в Console {#console-changes-12}
- Добавлены отображение оставшихся кредитов и повторные попытки списания для поддержки платежей из Индии

### Изменения в Integrations {#integrations-changes-12}
- Kafka Connector: добавлена поддержка настройки параметров ClickHouse, добавлен параметр конфигурации error.tolerance
- PowerBI Desktop: выпущена бета‑версия официального коннектора
- Grafana: добавлена поддержка геотипа Point, исправлены панели на дашборде Data Analyst, исправлен макрос timeInterval
- Python client: совместим с Pandas 2.1.0, прекращена поддержка Python 3.7, добавлена поддержка nullable JSON‑типа
- Node.js client: добавлена поддержка параметра default_format
- Golang client: исправлена обработка типа bool, сняты ограничения на строки



## 24 авг 2023 г. {#aug-24-2023}

В этом релизе добавлена поддержка интерфейса MySQL к базе данных ClickHouse, представлен новый официальный коннектор Power BI, добавлен новый вид «Running Queries» в облачной консоли, а также обновлена версия ClickHouse до 23.7.

### Общие обновления {#general-updates-2}
- Добавлена поддержка [протокола MySQL wire](/interfaces/mysql), который (помимо других сценариев использования) обеспечивает совместимость со многими существующими BI‑инструментами. Пожалуйста, свяжитесь со службой поддержки, чтобы включить эту функцию для вашей организации.
- Представлен новый официальный коннектор Power BI

### Изменения в консоли {#console-changes-13}
- Добавлена поддержка вида «Running Queries» в SQL Console

### Обновление версии ClickHouse 23.7 {#clickhouse-237-version-upgrade}
- Добавлена поддержка табличной функции Azure, геотипы данных переведены в статус готовых к промышленной эксплуатации, улучшена производительность `JOIN`-ов — подробности см. в [блоге](https://clickhouse.com/blog/clickhouse-release-23-05) о релизе 23.5
- Расширена поддержка интеграции с MongoDB до версии 6.0 — подробности см. в [блоге](https://clickhouse.com/blog/clickhouse-release-23-06) о релизе 23.6
- Улучшена производительность записи в формат Parquet в 6 раз, добавлена поддержка языка запросов PRQL и улучшена совместимость с SQL — подробности см. в [презентации](https://presentations.clickhouse.com/release_23.7/) о релизе 23.7
- Десятки новых функций, улучшений производительности и исправлений ошибок — см. подробные [журналы изменений](/whats-new/changelog) для 23.5, 23.6, 23.7

### Изменения в интеграциях {#integrations-changes-13}
- Kafka Connector: добавлена поддержка типов Avro Date и Time
- JavaScript client: выпущена стабильная версия для веб‑среды
- Grafana: улучшена логика фильтров, обработка имени базы данных и добавлена поддержка TimeInteval с субсекундной точностью
- Golang Client: исправлено несколько проблем с пакетной и асинхронной загрузкой данных
- Metabase: добавлена поддержка v0.47, реализована имперсонация подключений, исправлены сопоставления типов данных



## 27 июля 2023 г. {#july-27-2023}

В этом релизе представлена закрытая предварительная версия ClickPipes для Kafka, новый интерфейс загрузки данных и возможность загружать файл по URL через облачную консоль.

### Изменения в интеграциях {#integrations-changes-14}
- Представлена закрытая предварительная версия [ClickPipes](https://clickhouse.com/cloud/clickpipes) для Kafka — облачного движка интеграции, который делает приём огромных объёмов данных из Kafka и Confluent Cloud таким же простым, как нажатие нескольких кнопок. Записаться в лист ожидания можно [здесь](https://clickhouse.com/cloud/clickpipes#joinwaitlist).
- Клиент JavaScript: добавлена поддержка веб-сред (браузер, Cloudflare Workers). Код был переработан, чтобы сообщество могло создавать коннекторы для пользовательских сред.
- Kafka Connector: добавлена поддержка встроенной схемы (inline schema) с типами Kafka Timestamp и Time
- Клиент Python: исправлены проблемы с сжатием при вставке и чтением LowCardinality

### Изменения в консоли {#console-changes-14}
- Добавлен новый интерфейс загрузки данных с расширенными параметрами конфигурации при создании таблицы
- Добавлена возможность загружать файл по URL с использованием облачной консоли
- Улучшен процесс приглашения с дополнительными возможностями для присоединения к другой организации и просмотра всех ваших активных приглашений



## 14 июля 2023 г. {#july-14-2023}

В этом выпуске добавлена возможность запускать Dedicated Services, появился новый регион AWS в Австралии и возможность использовать собственный ключ для шифрования данных на диске.

### Общие обновления {#general-updates-3}
- Новый регион AWS в Австралии: Сидней (ap-southeast-2)
- Сервисы уровня Dedicated для требовательных, чувствительных к задержкам рабочих нагрузок (пожалуйста, свяжитесь со [службой поддержки](https://console.clickhouse.cloud/support) для настройки)
- Возможность использовать собственный ключ (BYOK) для шифрования данных на диске (пожалуйста, свяжитесь со [службой поддержки](https://console.clickhouse.cloud/support) для настройки)

### Изменения в консоли {#console-changes-15}
- Улучшения панели метрик наблюдаемости для асинхронных вставок
- Улучшено поведение чат-бота при интеграции со службой поддержки

### Изменения в интеграциях {#integrations-changes-15}
- Клиент NodeJS: исправлена ошибка сбоя подключения из-за тайм-аута сокета
- Клиент Python: добавлен `QuerySummary` для запросов вставки, добавлена поддержка специальных символов в имени базы данных
- Metabase: обновлена версия JDBC-драйвера, добавлена поддержка `DateTime64`, улучшена производительность.

### Изменения в ядре базы данных {#core-database-changes}
- [Кэш запросов](/operations/query-cache) может быть включён в ClickHouse Cloud. При его включении успешные запросы по умолчанию кэшируются на одну минуту, и последующие запросы будут использовать кэшированный результат.



## 20 июня 2023 г. {#june-20-2023}

В этом релизе ClickHouse Cloud на GCP становится общедоступным, добавлен Terraform-провайдер для Cloud API и обновлена версия ClickHouse до 23.4.

### Общие обновления {#general-updates-4}
- ClickHouse Cloud на GCP теперь в статусе GA, добавлена интеграция с GCP Marketplace, поддержка Private Service Connect и автоматическое создание резервных копий (подробности см. в [блоге](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) и [пресс-релизе](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform))
- [Terraform-провайдер](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) для Cloud API теперь доступен

### Изменения в консоли {#console-changes-16}
- Добавлена новая объединённая страница настроек для сервисов
- Скорректирована точность учёта потребления для хранилища и вычислительных ресурсов

### Изменения в интеграциях {#integrations-changes-16}
- Python-клиент: повышена производительность операций вставки (INSERT), переработаны внутренние зависимости для поддержки multiprocessing
- Kafka Connector: теперь его можно загрузить и установить в Confluent Cloud, добавлены повторные попытки при временных проблемах соединения, некорректное состояние коннектора автоматически сбрасывается

### Обновление версии ClickHouse 23.4 {#clickhouse-234-version-upgrade}
- Добавлена поддержка JOIN для параллельных реплик (для настройки обратитесь в [поддержку](https://console.clickhouse.cloud/support))
- Улучшена производительность лёгких удалений (lightweight deletes)
- Улучшено кэширование при обработке крупных вставок

### Изменения в администрировании {#administration-changes-1}
- Расширены возможности локального создания словарей для пользователей, не являющихся пользователем "default"



## 30 мая 2023 г. {#may-30-2023}

В этот релиз вошел публичный релиз программного API ClickHouse Cloud для операций плоскости управления (подробности см. в [блоге](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)), доступ к S3 с использованием IAM‑ролей и дополнительные параметры масштабирования.

### Общие изменения {#general-changes-2}
- Поддержка API для ClickHouse Cloud. С новым Cloud API вы можете бесшовно интегрировать управление сервисами в существующий конвейер CI/CD и управлять сервисами программно
- Доступ к S3 с использованием IAM‑ролей. Теперь вы можете использовать IAM‑роли для безопасного доступа к приватным Amazon Simple Storage Service (S3) бакетам (для настройки обратитесь в службу поддержки)

### Изменения масштабирования {#scaling-changes}
- [Горизонтальное масштабирование](/manage/scaling#manual-horizontal-scaling). Нагрузки, требующие большей параллелизации, теперь можно настраивать до 10 реплик (для настройки обратитесь в службу поддержки)
- [Автомасштабирование на основе CPU](/manage/scaling). Нагрузки, ограниченные CPU, теперь могут использовать дополнительные триггеры для политик автомасштабирования

### Изменения в консоли {#console-changes-17}
- Миграция сервиса Dev в Production‑сервис (для включения обратитесь в службу поддержки)
- Добавлены элементы управления конфигурацией масштабирования при создании экземпляра
- Исправлена строка подключения, когда пароль по умолчанию отсутствует в памяти

### Изменения интеграций {#integrations-changes-17}
- Клиент Golang: исправлена проблема, приводившая к несбалансированным соединениям в нативном протоколе, добавлена поддержка пользовательских настроек в нативном протоколе
- Клиент Node.js: прекращена поддержка Node.js v14, добавлена поддержка v20
- Коннектор Kafka: добавлена поддержка типа LowCardinality
- Metabase: исправлена группировка по диапазону времени, исправлена поддержка целых чисел во встроенных вопросах Metabase

### Производительность и надежность {#performance-and-reliability}
- Повышена эффективность и производительность нагрузок с интенсивной записью
- Развернута стратегия инкрементальных резервных копий для увеличения скорости и эффективности резервного копирования



## 11 мая 2023 г. {#may-11-2023}

В этот релиз включена публичная бета ClickHouse Cloud на GCP
(см. [блог](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta) 
для подробностей), расширяются права администраторов на выдачу разрешений на завершение запросов
и добавляются дополнительные возможности по отслеживанию статуса пользователей с MFA в консоли Cloud.

:::note Update
ClickHouse Cloud на GCP теперь доступен в GA, см. запись за 20 июня выше. 
:::

### ClickHouse Cloud на GCP теперь доступен в публичной бете {#clickhouse-cloud-on-gcp-is-now-available-in-public-beta-now-ga-see-june-20th-entry-above}

:::note
ClickHouse Cloud на GCP теперь доступен в GA, см. запись за [20 июня](#june-20-2023) выше.
:::

- Полностью управляемый сервис ClickHouse с разделёнными слоями хранения и вычислений, работающий поверх Google Compute и Google Cloud Storage
- Доступен в регионах Iowa (us-central1), Netherlands (europe-west4) и Singapore (asia-southeast1)
- Поддерживает как сервисы разработки (Development), так и промышленные сервисы (Production) во всех трёх начальных регионах
- Обеспечивает высокий уровень безопасности по умолчанию: сквозное шифрование при передаче, шифрование данных в состоянии покоя, списки разрешённых IP-адресов (IP Allow Lists)

### Изменения в интеграциях {#integrations-changes-18}
- Клиент на Go: добавлена поддержка переменных окружения для прокси
- Grafana: добавлена возможность указывать пользовательские настройки ClickHouse и переменные окружения для прокси при настройке источника данных в Grafana
- Kafka Connector: улучшена обработка пустых записей

### Изменения в консоли {#console-changes-18}
- Добавлен индикатор использования многофакторной аутентификации (MFA) в списке пользователей

### Производительность и надёжность {#performance-and-reliability-1}
- Добавлено более детальное управление правами на завершение запросов для администраторов



## 4 мая 2023 г. {#may-4-2023}

В этом релизе добавлен новый тип диаграммы «тепловая карта», улучшена страница использования биллинга и ускорен запуск сервиса.

### Изменения в консоли {#console-changes-19}
- В SQL‑консоль добавлен тип диаграммы «тепловая карта»
- Улучшена страница использования биллинга: теперь отображаются кредиты, потребленные в каждом измерении биллинга

### Изменения в интеграциях {#integrations-changes-19}
- Коннектор Kafka: добавлен механизм повторных попыток при временных ошибках соединения
- Клиент Python: добавлена настройка max_connection_age, чтобы HTTP‑соединения не переиспользовались бесконечно. Это может помочь при определенных проблемах балансировки нагрузки
- Клиент Node.js: добавлена поддержка Node.js v20
- Клиент Java: улучшена поддержка аутентификации с клиентскими сертификатами и добавлена поддержка вложенных типов Tuple/Map/Nested

### Производительность и надежность {#performance-and-reliability-2}
- Улучшено время запуска сервиса при наличии большого числа частей данных
- Оптимизирована логика отмены долго выполняющихся запросов в SQL‑консоли

### Исправления ошибок {#bug-fixes}
- Исправлена ошибка, из-за которой импорт демонстрационного набора данных «Cell Towers» завершался сбоем



## 20 апреля 2023 г. {#april-20-2023}

В этом релизе обновлена версия ClickHouse до 23.3, значительно улучшена скорость холодных чтений и добавлен чат с поддержкой в режиме реального времени.

### Изменения в консоли {#console-changes-20}
- Добавлена возможность чата с поддержкой в режиме реального времени

### Изменения в интеграциях {#integrations-changes-20}
- Коннектор Kafka: добавлена поддержка типов Nullable
- Клиент Golang: добавлена поддержка внешних таблиц, поддержка привязки параметров логического типа (boolean) и указателей (pointer)

### Изменения конфигурации {#configuration-changes}
- Добавлена возможность удалять большие таблицы — путём переопределения настроек `max_table_size_to_drop` и `max_partition_size_to_drop`

### Производительность и надёжность {#performance-and-reliability-3}
- Улучшена скорость холодных чтений за счёт предварительной выборки из S3 через настройку `allow_prefetched_read_pool_for_remote_filesystem`

### Обновление версии ClickHouse 23.3 {#clickhouse-233-version-upgrade}
- Облегчённые удаления готовы для использования в продакшене — подробности см. в записи [блога](https://clickhouse.com/blog/clickhouse-release-23-03) о выпуске 23.3
- Добавлена поддержка многоступенчатого PREWHERE — подробности см. в записи [блога](https://clickhouse.com/blog/clickhouse-release-23-03) о выпуске 23.2
- Десятки новых возможностей, улучшений производительности и исправлений ошибок — подробные [журналы изменений](/whats-new/changelog/index.md) для версий 23.3 и 23.2



## 6 апреля 2023 г. {#april-6-2023}

В этом релизе появились интерфейс API для получения облачных эндпоинтов, расширенный параметр управления масштабированием для минимального таймаута простоя и поддержка внешних данных в методах выполнения запросов Python‑клиента.

### Изменения в API {#api-changes}
* Добавлена возможность программно запрашивать эндпоинты ClickHouse Cloud через [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)

### Изменения в консоли {#console-changes-21}
- В расширенные настройки масштабирования добавлен параметр «minimum idle timeout»
- В модальное окно загрузки данных добавлено эвристическое (best-effort) определение типа datetime при автоматическом определении схемы

### Изменения в интеграциях {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): добавлена поддержка нескольких схем
- [Go client](/integrations/language-clients/go/index.md): исправлена проверка активности простаивающих соединений для TLS‑соединений
- [Python client](/integrations/language-clients/python/index.md)
  - добавлена поддержка внешних данных в методах выполнения запросов
  - добавлена поддержка часовых поясов для результатов запросов
  - добавлена поддержка переменной окружения `no_proxy`/`NO_PROXY`
  - исправлена привязка параметров со значением NULL на стороне сервера для типов Nullable

### Исправления ошибок {#bug-fixes-1}
* Исправлено поведение, при котором выполнение `INSERT INTO ... SELECT ...` из SQL‑консоли некорректно применяло то же ограничение по числу строк, что и к запросам SELECT



## 23 марта 2023 г. {#march-23-2023}

В этом релизе добавлены правила сложности паролей для базы данных, значительно ускорено восстановление крупных резервных копий и добавлена поддержка отображения трейсов в Grafana Trace View.

### Безопасность и надежность {#security-and-reliability}
- Основные конечные точки базы данных теперь применяют правила сложности паролей
- Сокращено время восстановления крупных резервных копий

### Изменения в Console {#console-changes-22}
- Упрощен процесс первоначальной настройки, добавлены новые значения по умолчанию и более компактные представления
- Снижены задержки при регистрации и входе в систему

### Изменения в интеграциях {#integrations-changes-22}
- Grafana:
  - Добавлена поддержка отображения данных трейсов, хранящихся в ClickHouse, в Trace View
  - Улучшены фильтры временных диапазонов и добавлена поддержка специальных символов в именах таблиц
- Superset: Добавлена нативная поддержка ClickHouse
- Kafka Connect Sink: Добавлена автоматическая конвертация дат и обработка столбцов с Null
- Metabase: Реализована совместимость с v0.46
- Python client: Исправлены вставки во временные таблицы и добавлена поддержка Pandas Null
- Golang client: Нормализованы типы Date с учетом часового пояса
- Java client
  - В SQL parser добавлена поддержка ключевых слов compression, infile и outfile
  - Добавлена перегрузка с учетными данными (credentials)
  - Исправлена пакетная обработка с `ON CLUSTER`
- Node.js client
  - Добавлена поддержка форматов JSONStrings, JSONCompact, JSONCompactStrings, JSONColumnsWithMetadata
  - `query_id` теперь может быть передан для всех основных методов клиента

### Исправления ошибок {#bug-fixes-2}
- Исправлена ошибка, приводившая к медленному первоначальному развертыванию и запуску новых сервисов
- Исправлена ошибка, приводившая к снижению производительности запросов из-за некорректной конфигурации кэша



## 9 марта 2023 г. {#march-9-2023}

В этом релизе улучшены панели наблюдаемости, оптимизировано время создания больших резервных копий и добавлена конфигурация, необходимая для удаления крупных таблиц и партиций.

### Изменения в Console {#console-changes-23}
- Добавлены расширенные панели наблюдаемости (предварительная версия)
- В панели наблюдаемости добавлен график распределения использования памяти
- Улучшена обработка отступов и переводов строк в табличном представлении SQL Console

### Надёжность и производительность {#reliability-and-performance}
- Оптимизировано расписание резервного копирования — резервные копии создаются только при изменении данных
- Сокращено время создания больших резервных копий

### Изменения конфигурации {#configuration-changes-1}
- Добавлена возможность увеличить лимит на удаление таблиц и партиций путём переопределения настроек `max_table_size_to_drop` и `max_partition_size_to_drop` на уровне запроса или соединения
- В журнал запросов добавлен исходный IP-адрес, чтобы обеспечить применение квот и управление доступом на основе исходного IP

### Интеграции {#integrations}
- [Python client](/integrations/language-clients/python/index.md): улучшена поддержка Pandas и исправлены проблемы, связанные с часовыми поясами
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): совместимость с Metabase 0.46.x и поддержка SimpleAggregateFunction
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): неявное преобразование дат и улучшенная обработка столбцов со значением null
- [Java Client](https://github.com/ClickHouse/clickhouse-java): вложенное преобразование в Java Map



## 23 февраля 2023 г. {#february-23-2023}

Этот релиз включает подмножество возможностей из основного релиза ClickHouse 23.1, добавляет совместимость с Amazon Managed Streaming for Apache Kafka (MSK) и предоставляет расширенные настройки масштабирования и простоя в журнале активности.

### Обновление версии ClickHouse 23.1 {#clickhouse-231-version-upgrade}

Добавлена поддержка подмножества возможностей ClickHouse 23.1, например:
- ARRAY JOIN с типом Map
- стандартные для SQL шестнадцатеричные и двоичные литералы
- новые функции, включая `age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()`
- возможность использовать структуру из таблицы, в которую выполняется вставка, в `generateRandom` без аргументов
- улучшена логика создания и переименования баз данных, позволяющая повторно использовать предыдущие имена
- подробности см. в [слайдах вебинара релиза 23.1](https://presentations.clickhouse.com/release_23.1/#cover) и [журнале изменений релиза 23.1](/whats-new/cloud#clickhouse-231-version-upgrade)

### Изменения в интеграциях {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): добавлена поддержка Amazon MSK
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): первый стабильный релиз 1.0.0
  - коннектор стал доступен в [Metabase Cloud](https://www.metabase.com/start/)
  - добавлена возможность просматривать все доступные базы данных
  - исправлена синхронизация базы данных с типом AggregationFunction
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): добавлена поддержка последней версии DBT v1.4.1
- [Клиент Python](/integrations/language-clients/python/index.md): улучшена поддержка прокси и SSH-туннелирования; добавлен ряд исправлений и оптимизаций производительности для Pandas DataFrames
- [Клиент Node.js](/integrations/language-clients/js.md): реализована возможность прикреплять `query_id` к результату запроса, который можно использовать для получения метрик запроса из `system.query_log`
- [Клиент Go](/integrations/language-clients/go/index.md): оптимизировано сетевое подключение с ClickHouse Cloud

### Изменения в Console {#console-changes-24}
- Добавлены расширенные настройки масштабирования и простоя в журнале активности
- Добавлены сведения о User-Agent и IP в письма для сброса пароля
- Улучшена логика процесса регистрации через Google OAuth

### Надёжность и производительность {#reliability-and-performance-1}
- Ускорено возобновление работы из состояния простоя для крупных сервисов
- Уменьшена задержка чтения для сервисов с большим количеством таблиц и партиций

### Исправления ошибок {#bug-fixes-3}
- Исправлено поведение, при котором сброс пароля сервиса не соответствовал политике паролей
- Проверка адреса электронной почты для приглашений в организацию сделана регистронезависимой



## 2 февраля 2023 г. {#february-2-2023}

В этот релиз вошли официально поддерживаемая интеграция с Metabase, крупный релиз Java‑клиента / JDBC‑драйвера и поддержка представлений и материализованных представлений в SQL‑консоли.

### Изменения в интеграциях {#integrations-changes-24}
- Плагин [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): стал официальным решением, поддерживаемым ClickHouse
- Плагин [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md): добавлена поддержка [нескольких потоков](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)
- Плагин [Grafana](/integrations/data-visualization/grafana/index.md): улучшена обработка ошибок подключения
- Клиент [Python](/integrations/language-clients/python/index.md): [поддержка потоковой передачи](/integrations/language-clients/python/advanced-querying.md#streaming-queries) для операций вставки
- Клиент [Go](/integrations/language-clients/go/index.md): [исправления ошибок](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): закрытие отменённых подключений, улучшенная обработка ошибок подключения
- Клиент [JS](/integrations/language-clients/js.md): [несовместимые изменения в exec/insert](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); `query_id` стал доступен в возвращаемых типах
- Крупный релиз клиента [Java](https://github.com/ClickHouse/clickhouse-java#readme) / JDBC‑драйвера
  - [Несовместимые изменения](https://github.com/ClickHouse/clickhouse-java/releases): устаревшие методы, классы и пакеты были удалены
  - Добавлены драйвер R2DBC и поддержка вставки из файлов

### Изменения в консоли {#console-changes-25}
- Добавлена поддержка представлений и материализованных представлений в SQL‑консоли

### Производительность и надёжность {#performance-and-reliability-4}
- Более быстрый сброс пароля для остановленных/бездействующих экземпляров
- Улучшено поведение при уменьшении масштаба за счёт более точного отслеживания активности
- Исправлена ошибка, из-за которой экспорт CSV из SQL‑консоли обрезался
- Исправлена ошибка, приводившая к периодическим сбоям загрузки примерных данных



## 12 января 2023 г. {#january-12-2023}

В этом релизе версия ClickHouse обновлена до 22.12, включены словари для многих новых источников и улучшена производительность запросов.

### Общие изменения {#general-changes-3}
- Включены словари для дополнительных источников, включая внешний ClickHouse, Cassandra, MongoDB, MySQL, PostgreSQL и Redis

### Обновление версии ClickHouse 22.12 {#clickhouse-2212-version-upgrade}
- Расширена поддержка JOIN за счет добавления Grace Hash Join
- Добавлена поддержка Binary JSON (BSON) для чтения файлов
- Добавлена поддержка стандартного синтаксиса SQL GROUP BY ALL
- Добавлены новые математические функции для операций с десятичными числами фиксированной точности
- Полный список изменений см. в [блоге о релизе 22.12](https://clickhouse.com/blog/clickhouse-release-22-12) и [подробном списке изменений 22.12](/whats-new/cloud#clickhouse-2212-version-upgrade)

### Изменения в Console {#console-changes-26}
- Улучшены возможности автодополнения в SQL Console
- Регион по умолчанию теперь учитывает географическое расположение континента
- Улучшена страница Billing Usage для отображения как биллинговых единиц, так и единиц, отображаемых на сайте

### Изменения в интеграциях {#integrations-changes-25}
- Релиз DBT [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - Добавлена экспериментальная поддержка инкрементальной стратегии delete+insert
  - Новый макрос s3source
- Python‑клиент [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - Поддержка вставки из файла
  - [Привязка параметров](/interfaces/cli.md/#cli-queries-with-parameters) в запросах на стороне сервера
- Go‑клиент [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - Снижено потребление памяти при сжатии
  - [Привязка параметров](/interfaces/cli.md/#cli-queries-with-parameters) в запросах на стороне сервера

### Надежность и производительность {#reliability-and-performance-2}
- Улучшена производительность чтения для запросов, которые выбирают большое количество небольших файлов в объектном хранилище
- Для недавно запущенных сервисов параметр [compatibility](/operations/settings/settings#compatibility) устанавливается на версию, с которой сервис был изначально запущен

### Исправления ошибок {#bug-fixes-4}
Использование ползунка Advanced Scaling для резервирования ресурсов теперь вступает в силу немедленно.



## 20 декабря 2022 г. {#december-20-2022}

В этом релизе представлены прозрачный вход администраторов в SQL-консоль, улучшенная производительность при «холодном» чтении и улучшенный коннектор Metabase для ClickHouse Cloud.

### Изменения в консоли {#console-changes-27}
- Включён прозрачный доступ к SQL-консоли для пользователей с правами администратора
- Изменена роль по умолчанию для новых приглашённых на «Administrator»
- Добавлен опрос при первоначальной настройке

### Надёжность и производительность {#reliability-and-performance-3}
- Добавлена логика повторных попыток для длительно выполняющихся `INSERT`-запросов для восстановления в случае сетевых сбоев
- Улучшена производительность при «холодном» чтении

### Изменения в интеграциях {#integrations-changes-26}
- [Плагин Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) получил долгожданное крупное обновление v0.9.1. Теперь он совместим с последней версией Metabase и был тщательно протестирован на ClickHouse Cloud.



## 6 декабря 2022 г. — Общая доступность {#december-6-2022---general-availability}

ClickHouse Cloud теперь готов к использованию в продакшене, соответствует требованиям SOC 2 Type II, обеспечивает SLA по доступности для производственных нагрузок и предоставляет публичную страницу статуса. Этот релиз включает ключевые новые возможности, такие как интеграция с AWS Marketplace, SQL console — рабочая среда для исследования данных для пользователей ClickHouse, и ClickHouse Academy — обучение в собственном темпе в ClickHouse Cloud. Подробнее в этом [блоге](https://clickhouse.com/blog/clickhouse-cloud-generally-available).

### Готовность к продакшену {#production-ready}
- Соответствие SOC 2 Type II (подробности в [блоге](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) и [Trust Center](https://trust.clickhouse.com/))
- Публичная [страница статуса](https://status.clickhouse.com/) для ClickHouse Cloud
- SLA по доступности для продакшен-сценариев использования
- Доступность в [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)

### Ключевые новые возможности {#major-new-capabilities}
- Представлена SQL console, рабочая среда для исследования данных для пользователей ClickHouse
- Запущена [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog) — обучение в собственном темпе в ClickHouse Cloud

### Изменения в ценообразовании и учёте потребления {#pricing-and-metering-changes}
- Пробный период продлён до 30 дней
- Представлены Development Services с фиксированной мощностью и низкой ежемесячной стоимостью, хорошо подходящие для стартовых проектов и сред разработки/стейджинга
- Введено новое сниженное ценообразование для Production Services по мере того, как мы продолжаем улучшать работу и масштабирование ClickHouse Cloud
- Улучшена детализация и точность учёта потребления вычислительных ресурсов

### Изменения в интеграциях {#integrations-changes-27}
- Включена поддержка интеграционных движков ClickHouse для Postgres / MySQL
- Добавлена поддержка пользовательских SQL-функций (UDF)
- Статус sink-коннектора Kafka Connect повышен до Beta
- Улучшен интерфейс раздела Integrations за счёт добавления расширенных метаданных о версиях, статусе обновлений и многом другом

### Изменения в консоли {#console-changes-28}

- Поддержка многофакторной аутентификации в облачной консоли
- Улучшена навигация в облачной консоли на мобильных устройствах

### Изменения в документации {#documentation-changes}

- Добавлен выделенный раздел [документации](/cloud/overview) для ClickHouse Cloud

### Исправления ошибок {#bug-fixes-5}
- Устранена известная проблема, при которой восстановление из резервной копии не всегда работало из-за разрешения зависимостей



## 29 ноября 2022 г. {#november-29-2022}

В этом релизе достигнуто соответствие требованиям SOC 2 Type II, обновлена версия ClickHouse до 22.11 и улучшен ряд клиентов и интеграций ClickHouse.

### Общие изменения {#general-changes-4}

- Достигнуто соответствие требованиям SOC 2 Type II (подробности в [блоге](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) и [Trust Center](https://trust.clickhouse.com))

### Изменения в Console {#console-changes-29}

- Добавлен индикатор статуса «Idle», показывающий, что сервис был автоматически приостановлен

### Обновление версии ClickHouse 22.11 {#clickhouse-2211-version-upgrade}

- Добавлена поддержка движков таблиц и табличных функций Hudi и DeltaLake
- Улучшен рекурсивный обход каталогов для S3
- Добавлена поддержка составного синтаксиса временных интервалов
- Повышена надежность вставки за счет повторных попыток
- Полный список изменений см. в [подробном списке изменений 22.11](/whats-new/cloud#clickhouse-2211-version-upgrade)

### Интеграции {#integrations-1}

- Клиент для Python: поддержка v3.11, улучшена производительность операций вставки
- Клиент для Go: исправлена поддержка DateTime и Int64
- Клиент для JS: поддержка взаимной SSL-аутентификации
- dbt-clickhouse: поддержка DBT v1.3

### Исправления ошибок {#bug-fixes-6}

- Исправлена ошибка, из-за которой после обновления отображалась устаревшая версия ClickHouse
- Изменение прав для учетной записи "default" больше не прерывает сессии
- Вновь создаваемые учетные записи, не являющиеся администраторами, больше не имеют доступа к системным таблицам по умолчанию

### Известные проблемы в этом релизе {#known-issues-in-this-release}

- Восстановление из резервной копии может не работать из-за проблем с разрешением зависимостей



## 17 ноября 2022 г. {#november-17-2022}

В этом релизе добавлена поддержка словарей на основе локальных таблиц ClickHouse и HTTP-источников, введена поддержка региона Мумбаи и улучшено удобство работы пользователей в облачной консоли.

### Общие изменения {#general-changes-5}

- Добавлена поддержка [словарей](/sql-reference/dictionaries/index.md) на основе локальных таблиц ClickHouse и HTTP-источников
- Введена поддержка региона [Мумбаи](/cloud/reference/supported-regions)

### Изменения в консоли {#console-changes-30}

- Улучшено форматирование счетов на оплату
- Оптимизирован пользовательский интерфейс для ввода способа оплаты
- Добавлено более детализированное журналирование активности для резервных копий
- Улучшена обработка ошибок при загрузке файлов

### Исправления ошибок {#bug-fixes-7}
- Исправлена ошибка, которая могла приводить к сбоям резервного копирования при наличии отдельных крупных файлов в отдельных частях
- Исправлена ошибка, из-за которой восстановление из резервной копии не выполнялось, если изменения списка доступа применялись одновременно

### Известные проблемы {#known-issues}
- Восстановление из резервной копии может не работать из-за проблем с разрешением зависимостей



## 3 ноября 2022 г. {#november-3-2022}

В этом релизе из модели ценообразования убраны единицы чтения и записи (подробности см. на [странице цен](https://clickhouse.com/pricing)), версия ClickHouse обновлена до 22.10, добавлена поддержка более высокой вертикальной масштабируемости для клиентов, использующих режим самообслуживания, а также повышена надежность за счет улучшенных настроек по умолчанию.

### Общие изменения {#general-changes-6}

- Удалены единицы чтения/записи из модели ценообразования

### Изменения конфигурации {#configuration-changes-2}

- Настройки `allow_suspicious_low_cardinality_types`, `allow_suspicious_fixed_string_types` и `allow_suspicious_codecs` (по умолчанию — false) больше не могут изменяться пользователями по соображениям стабильности.

### Изменения в Console {#console-changes-31}

- Увеличен максимальный предел вертикального масштабирования для самообслуживаемых конфигураций до 720 ГБ памяти для платных клиентов
- Улучшен процесс восстановления из резервной копии для задания правил списка доступа по IP (IP Access List) и пароля
- Добавлены списки ожидания для GCP и Azure в диалоге создания сервиса
- Улучшена обработка ошибок при загрузке файлов
- Улучшены процессы администрирования биллинга

### Обновление версии ClickHouse 22.10 {#clickhouse-2210-version-upgrade}

- Улучшены операции слияния для объектных хранилищ за счет ослабления порогового значения «слишком много частей» при наличии большого количества крупных частей (не менее 10 GiB). Это позволяет хранить до петабайт данных в одном разделе одной таблицы.
- Улучшен контроль над слиянием с помощью настройки `min_age_to_force_merge_seconds` для выполнения слияния по прошествии заданного временного порога.
- Добавлен совместимый с MySQL синтаксис для сброса настроек `SET setting_name = DEFAULT`.
- Добавлены функции для кодирования кривой Мортона, хеширования целых чисел в стиле Java и генерации случайных чисел.
- Полный список изменений см. в [подробном журнале изменений 22.10](/whats-new/cloud#clickhouse-2210-version-upgrade).



## 25 октября 2022 г. {#october-25-2022}

В этом релизе значительно снижено потребление вычислительных ресурсов для небольших нагрузок, снижены тарифы на вычисления (подробности см. на [странице с тарифами](https://clickhouse.com/pricing)), улучшена стабильность за счет более удачных значений по умолчанию, а также расширены разделы Billing и Usage в консоли ClickHouse Cloud.

### Общие изменения {#general-changes-7}

- Минимальный объем выделяемой сервису памяти снижен до 24 ГБ
- Таймаут простоя сервиса уменьшен с 30 минут до 5 минут

### Изменения конфигурации {#configuration-changes-3}

- Значение `max_parts_in_total` уменьшено со 100k до 10k. Значение по умолчанию настройки `max_parts_in_total` для таблиц MergeTree снижено со 100 000 до 10 000. Причина изменения в том, что мы заметили: большое количество частей данных, как правило, приводит к медленному запуску сервисов в облаке. Большое число частей обычно указывает на слишком детальный выбор ключа партиционирования, что чаще всего делается случайно и чего следует избегать. Изменение значения по умолчанию позволит раньше обнаруживать такие случаи.

### Изменения в консоли {#console-changes-32}

- Расширена детализация использования кредитов в разделе Billing для пользователей пробной версии
- Улучшены всплывающие подсказки и справочный текст, а также добавлена ссылка на страницу с тарифами в разделе Usage
- Улучшено поведение при переключении опций фильтрации по IP
- В облачную консоль добавлена кнопка повторной отправки письма с подтверждением



## 4 октября 2022 г. - бета {#october-4-2022---beta}

4 октября 2022 года ClickHouse Cloud перешёл в стадию публичной бета-версии. Подробнее см. в этой [записи в блоге](https://clickhouse.com/blog/clickhouse-cloud-public-beta).

Версия ClickHouse Cloud основана на ClickHouse Core v22.10. Перечень совместимых функций приведён в руководстве [Cloud Compatibility](/whats-new/cloud-compatibility).
