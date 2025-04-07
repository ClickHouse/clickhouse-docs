---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'Введение в EMQX с ClickHouse'
title: 'Интеграция EMQX с ClickHouse'
---

import emqx_cloud_artitecture from '@site/static/images/integrations/data-ingestion/emqx/emqx-cloud-artitecture.png';
import clickhouse_cloud_1 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_1.png';
import clickhouse_cloud_2 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_2.png';
import clickhouse_cloud_3 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_3.png';
import clickhouse_cloud_4 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_4.png';
import clickhouse_cloud_5 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_5.png';
import clickhouse_cloud_6 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_6.png';
import emqx_cloud_sign_up from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_sign_up.png';
import emqx_cloud_create_1 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_1.png';
import emqx_cloud_create_2 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_2.png';
import emqx_cloud_overview from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_overview.png';
import emqx_cloud_auth from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_auth.png';
import emqx_cloud_nat_gateway from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_nat_gateway.png';
import emqx_cloud_data_integration from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_data_integration.png';
import data_integration_clickhouse from '@site/static/images/integrations/data-ingestion/emqx/data_integration_clickhouse.png';
import data_integration_resource from '@site/static/images/integrations/data-ingestion/emqx/data_integration_resource.png';
import data_integration_rule_1 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_1.png';
import data_integration_rule_2 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_2.png';
import data_integration_rule_action from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_action.png';
import data_integration_details from '@site/static/images/integrations/data-ingestion/emqx/data_integration_details.png';
import work_flow from '@site/static/images/integrations/data-ingestion/emqx/work-flow.png';
import mqttx_overview from '@site/static/images/integrations/data-ingestion/emqx/mqttx-overview.png';
import mqttx_new from '@site/static/images/integrations/data-ingestion/emqx/mqttx-new.png';
import mqttx_publish from '@site/static/images/integrations/data-ingestion/emqx/mqttx-publish.png';
import rule_monitor from '@site/static/images/integrations/data-ingestion/emqx/rule_monitor.png';
import clickhouse_result from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_result.png';
import Image from '@theme/IdealImage';


# Интеграция EMQX с ClickHouse

## Подключение EMQX {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это брокер MQTT с открытым исходным кодом и высокопроизводительным движком обработки сообщений в реальном времени, который управляет потоковой передачей событий для IoT-устройств в больших масштабах. Как самый масштабируемый MQTT брокер, EMQX может помочь вам подключить любое устройство, в любом масштабе. Перемещайте и обрабатывайте свои IoT данные в любом месте.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это промежуточное ПО для обмена сообщениями MQTT в области IoT, предоставляемое компанией [EMQ](https://www.emqx.com/en). Будучи первым в мире полностью управляемым облачным сервисом для обмена сообщениями MQTT 5.0, EMQX Cloud предлагает единое решение для колокации O&M и уникальную изолированную среду для служб обмена сообщениями MQTT. В эпоху Интернета всего EMQX Cloud может помочь вам быстро создать отраслевые приложения для области IoT и легко собирать, передавать, обрабатывать и сохранять IoT данные.

С инфраструктурой, предоставленной облачными провайдерами, EMQX Cloud обслуживает десятки стран и регионов по всему миру, предоставляя недорогие, безопасные и надежные облачные услуги для приложений 5G и Интернета всего.

<Image img={emqx_cloud_artitecture} size="lg" border alt="Схема архитектуры EMQX Cloud, показывающая компоненты облачной инфраструктуры" />

### Предположения {#assumptions}

* Вы знакомы с [протоколом MQTT](https://mqtt.org/), который спроектирован как чрезвычайно легковесный протокол передачи сообщений по принципу публикации/подписки.
* Вы используете EMQX или EMQX Cloud в качестве движка обработки сообщений в реальном времени, управляющего потоковой передачей событий для IoT-устройств в крупных масштабах.
* Вы подготовили экземпляр Clickhouse Cloud для хранения данных устройства.
* Мы используем [MQTT X](https://mqttx.app/) как инструмент для тестирования клиента MQTT для подключения развертывания EMQX Cloud для публикации данных MQTT. Или другие методы подключения к брокеру MQTT также вполне подойдут.

## Получите вашу ClickHouse Cloud Service {#get-your-clickhouse-cloudservice}

В ходе этой настройки мы развернули экземпляр ClickHouse на AWS в N. Virginia (us-east-1), в то время как экземпляр EMQX Cloud также был развернут в том же регионе.

<Image img={clickhouse_cloud_1} size="sm" border alt="Интерфейс развертывания ClickHouse Cloud Service, показывающий выбор региона AWS" />

Во время процесса настройки вам также будет необходимо обратить внимание на настройки подключения. В этом руководстве мы выбрали "Везде", но если вы запрашиваете конкретное местоположение, вам нужно будет добавить IP-адрес [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), который вы получили от вашего развертывания EMQX Cloud, в белый список.

<Image img={clickhouse_cloud_2} size="sm" border alt="Настройки подключения ClickHouse Cloud, показывающие конфигурацию доступа по IP" />

Затем вам нужно сохранить ваше имя пользователя и пароль для будущего использования.

<Image img={clickhouse_cloud_3} size="sm" border alt="Экран учетных данных ClickHouse Cloud, показывающий имя пользователя и пароль" />

После этого вы получите работающий экземпляр ClickHouse. Нажмите "Подключиться", чтобы получить адрес подключения экземпляра ClickHouse Cloud.

<Image img={clickhouse_cloud_4} size="lg" border alt="Панель управления работающим экземпляром ClickHouse Cloud с вариантами подключения" />

Нажмите "Подключиться к SQL консоли", чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<Image img={clickhouse_cloud_5} size="lg" border alt="Интерфейс SQL консоли ClickHouse Cloud" />

Вы можете воспользоваться следующим SQL-запросом или модифицировать SQL в соответствии с актуальной ситуацией.

```sql
CREATE TABLE emqx.temp_hum
(
   client_id String,
   timestamp DateTime,
   topic String,
   temp Float32,
   hum Float32
)
ENGINE = MergeTree()
PRIMARY KEY (client_id, timestamp)
```

<Image img={clickhouse_cloud_6} size="lg" border alt="Выполнение SQL-запроса для создания базы данных и таблицы в ClickHouse Cloud" />

## Создайте MQTT-сервис на EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Создание выделенного брокера MQTT на EMQX Cloud так же просто, как несколько кликов.

### Получите аккаунт {#get-an-account}

EMQX Cloud предоставляет 14-дневный бесплатный пробный период как для стандартного, так и для профессионального развертывания для каждой учетной записи.

Начните с страницы [регистрации EMQX Cloud](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите на "начать бесплатно", чтобы зарегистрировать аккаунт, если вы впервые пользуетесь EMQX Cloud.

<Image img={emqx_cloud_sign_up} size="lg" border alt="Страница регистрации EMQX Cloud с регистрационной формой" />

### Создайте кластер MQTT {#create-an-mqtt-cluster}

После входа в систему нажмите на "Cloud Console" в меню аккаунта, и вы сможете увидеть зеленую кнопку для создания нового развертывания.

<Image img={emqx_cloud_create_1} size="lg" border alt="Создание развертывания EMQX Cloud Шаг 1, показывающий варианты развертывания" />

В этом руководстве мы будем использовать профессиональное развертывание, потому что только версия Pro предоставляет функциональность интеграции данных, которая позволяет отправлять данные MQTT напрямую в ClickHouse без единой строки кода.

Выберите версию Pro и выберите регион `N.Virginia`, затем нажмите `Создать сейчас`. Всего за несколько минут вы получите полностью управляемый брокер MQTT:

<Image img={emqx_cloud_create_2} size="lg" border alt="Создание развертывания EMQX Cloud Шаг 2, показывающий выбор региона" />

Теперь нажмите на панель, чтобы перейти к представлению кластера. На этой панели вы увидите обзор вашего брокера MQTT.

<Image img={emqx_cloud_overview} size="lg" border alt="Панель обзор EMQX Cloud, показывающая метрики брокера" />

### Добавьте учетные данные клиента {#add-client-credential}

EMQX Cloud по умолчанию не позволяет анонимные подключения, поэтому вам нужно добавить учетные данные клиента, чтобы вы могли использовать инструмент клиента MQTT для отправки данных на этот брокер.

Нажмите «Аутентификация и ACL» в левом меню и нажмите «Аутентификация» в подменю. Нажмите кнопку «Добавить» справа и укажите имя пользователя и пароль для подключения MQTT позже. Здесь мы используем `emqx` и `xxxxxx` для имени пользователя и пароля.

<Image img={emqx_cloud_auth} size="lg" border alt="Интерфейс настройки аутентификации EMQX Cloud для добавления учетных данных" />

Нажмите 'Подтвердить', и теперь у нас есть полностью управляемый брокер MQTT, готовый к работе.

### Включите NAT gateway {#enable-nat-gateway}

Прежде чем мы сможем начать настройку интеграции ClickHouse, нам необходимо сначала включить NAT gateway. По умолчанию брокер MQTT развернут в частной VPC, которая не может отправлять данные в сторонние системы через публичную сеть.

Вернитесь на страницу обзора и прокрутите вниз до конца страницы, где вы увидите виджет NAT gateway. Нажмите кнопку Подписаться и следуйте инструкциям. Обратите внимание, что NAT Gateway является дополнительной услугой, но также предлагает 14-дневный бесплатный пробный период.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="Панель конфигурации NAT Gateway EMQX Cloud" />

Как только он будет создан, вы найдете публичный IP-адрес в виджете. Обратите внимание, что если вы выбрали "Подключение из конкретного местоположения" во время настройки ClickHouse Cloud, вам нужно будет добавить этот IP-адрес в белый список.

## Интеграция EMQX Cloud с ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

[Интеграции данных EMQX Cloud](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используются для настройки правил обработки и реакции на потоки сообщений EMQX и события устройств. Интеграции данных не только обеспечивают ясное и гибкое "настраиваемое" архитектурное решение, но и упрощают процесс разработки, улучшают удобство для пользователей и снижают уровень связывания между бизнес-системой и EMQX Cloud. Также они предлагают превосходную инфраструктуру для настройки уникальных возможностей EMQX Cloud.

<Image img={emqx_cloud_data_integration} size="lg" border alt="Опции интеграции данных EMQX Cloud, показывающие доступные соединители" />

EMQX Cloud предлагает более 30 встроенных интеграций с популярными системами данных. ClickHouse — одна из них.

<Image img={data_integration_clickhouse} size="lg" border alt="Данные интеграции EMQX Cloud ClickHouse, показывающие детали соединителя" />

### Создайте ресурс ClickHouse {#create-clickhouse-resource}

Нажмите "Интеграции данных" в левом меню и нажмите "Посмотреть все ресурсы". Вы найдете ClickHouse в разделе Сохранение данных или можете воспользоваться поиском по ClickHouse.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

- Примечание: добавьте примечание для этого ресурса.
- Адрес сервера: это адрес вашей службы ClickHouse Cloud, не забудьте про порт.
- Имя базы данных: `emqx`, которую мы создали на предыдущих этапах.
- Пользователь: имя пользователя для подключения к вашей службе ClickHouse Cloud.
- Ключ: пароль для подключения.

<Image img={data_integration_resource} size="lg" border alt="Форма настройки ресурса ClickHouse EMQX Cloud с деталями подключения" />

### Создайте новое правило {#create-a-new-rule}

Во время создания ресурса вы увидите всплывающее окно, и нажатие на 'Новое' приведет вас на страницу создания правила.

EMQX предоставляет мощный [движок правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может преобразовывать и дополнять сырое сообщение MQTT перед его отправкой в сторонние системы.

Вот правило, используемое в этом руководстве:

```sql
SELECT
   clientid as client_id,
   (timestamp div 1000) as timestamp,
   topic as topic,
   payload.temp as temp,
   payload.hum as hum
FROM
"temp_hum/emqx"
```

Оно будет читать сообщения из топика `temp_hum/emqx` и обогащать JSON-объект, добавляя информацию о client_id, topic и timestamp.

Таким образом, сырые JSON-данные, которые вы отправляете в топик:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="Создание правила интеграции данных EMQX Cloud Шаг 1, показывающее SQL-запрос" />

Вы можете использовать тест SQL, чтобы протестировать и увидеть результаты.

<Image img={data_integration_rule_2} size="md" border alt="Создание правила интеграции данных EMQX Cloud Шаг 2, показывающее результаты тестирования" />

Теперь нажмите кнопку "ДАЛЕЕ". Этот шаг предназначен для того, чтобы сообщить EMQX Cloud, как вставлять очищенные данные в вашу базу данных ClickHouse.

### Добавьте действие ответа {#add-a-response-action}

Если у вас только один ресурс, вам не нужно изменять «Ресурс» и «Тип действия». Вам нужно только установить шаблон SQL. Вот пример, использованный в этом руководстве:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="Настройка действия правила интеграции данных EMQX Cloud с шаблоном SQL" />

Это шаблон для вставки данных в ClickHouse, вы можете увидеть, что здесь используются переменные.

### Просмотр деталей правил {#view-rules-details}

Нажмите "Подтвердить" и "Просмотреть детали". Теперь все должно быть хорошо настроено. Вы можете увидеть, как работает интеграция данных на странице деталей правила.

<Image img={data_integration_details} size="md" border alt="Детали правила интеграции данных EMQX Cloud, показывающие краткое описание конфигурации" />

Все сообщения MQTT, отправленные в топик `temp_hum/emqx`, будут сохранены в вашей базе данных ClickHouse Cloud.

## Сохранение данных в ClickHouse {#saving-data-into-clickhouse}

Мы будем симулировать данные температуры и влажности и отправим эти данные в EMQX Cloud через MQTT X, а затем используем интеграцию данных EMQX Cloud, чтобы сохранить данные в ClickHouse Cloud.

<Image img={work_flow} size="lg" border alt="Схема рабочего процесса EMQX Cloud в ClickHouse, показывающая поток данных" />

### Публикация MQTT сообщений в EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

Вы можете использовать любой MQTT клиент или SDK для публикации сообщения. В этом руководстве мы будем использовать [MQTT X](https://mqttx.app/), удобное приложение клиента MQTT, предоставленное EMQ.

<Image img={mqttx_overview} size="lg" border alt="Обзор MQTTX, показывающий интерфейс клиента" />

Нажмите "Новое подключение" на MQTTX и заполните форму подключения:

- Имя: Имя подключения. Используйте любое имя, которое хотите.
- Хост: адрес подключения брокера MQTT. Вы можете получить его из страницы обзора EMQX Cloud.
- Порт: порт подключения брокера MQTT. Вы можете получить его из страницы обзора EMQX Cloud.
- Имя пользователя/Пароль: используйте учетные данные, созданные выше, которые должны быть `emqx` и `xxxxxx` в этом руководстве.

<Image img={mqttx_new} size="lg" border alt="Форма настройки нового подключения MQTTX с деталями подключения" />

Нажмите кнопку "Подключиться" в правом верхнем углу, и подключение должно быть установлено.

Теперь вы можете отправлять сообщения брокеру MQTT с помощью этого инструмента.
Вводы:
1. Установите формат полезной нагрузки на "JSON".
2. Установите топик: `temp_hum/emqx` (топик, который мы только что установили в правиле).
3. JSON-тело:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить больше данных на брокер MQTT.

Данные, отправленные в EMQX Cloud, должны обрабатываться движком правил и автоматически вставляться в ClickHouse Cloud.

<Image img={mqttx_publish} size="lg" border alt="Интерфейс публикации MQTTX, показывающий составление сообщения" />

### Просмотр мониторинга правил {#view-rules-monitoring}

Проверьте мониторинг правил и добавьте один к количеству успешных операций.

<Image img={rule_monitor} size="lg" border alt="Панель мониторинга правил EMQX Cloud, показывающая метрики обработки сообщений" />

### Проверьте сохраненные данные {#check-the-data-persisted}

Теперь пришло время взглянуть на данные в ClickHouse Cloud. В идеале, данные, которые вы отправили с помощью MQTTX, поступят в EMQX Cloud и сохранятся в базе данных ClickHouse Cloud с помощью встроенной интеграции данных.

Вы можете подключиться к SQL консоли на панели ClickHouse Cloud или использовать любой клиентский инструмент для получения данных из вашего ClickHouse. В этом руководстве мы использовали SQL консоль.
Выполнив SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="Результаты запроса ClickHouse, показывающие сохраненные IoT данные" />

### Резюме {#summary}

Вы не написали ни одной строки кода и теперь можете перемещать данные MQTT из EMQX Cloud в ClickHouse Cloud. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой, и вы можете сосредоточиться на написании приложений IoT с данными, безопасно хранимыми в ClickHouse Cloud.
