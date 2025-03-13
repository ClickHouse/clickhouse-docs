---
sidebar_label: EMQX
sidebar_position: 1
slug: /integrations/emqx
description: Введение в EMQX с ClickHouse

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


# Интеграция EMQX с ClickHouse

## Подключение EMQX {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это open source MQTT брокер с высокопроизводительным движком обработки сообщений в реальном времени, который обеспечивает потоковое событие для IoT устройств в огромных масштабах. Как самый масштабируемый MQTT брокер, EMQX может помочь вам подключить любое устройство, в любом масштабе. Перемещайте и обрабатывайте свои IoT данные везде.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это промежуточное ПО для MQTT сообщений для области IoT, размещенное [EMQ](https://www.emqx.com/en). Будучи первым в мире полностью управляемым облачным сервисом сообщений MQTT 5.0, EMQX Cloud предоставляет единый центр O&M совместного размещения и уникальную изолированную среду для служб сообщений MQTT. В эпоху Интернета Всего, EMQX Cloud может помочь вам быстро создать отраслевые приложения для области IoT и легко собирать, передавать, вычислять и сохранять данные IoT.

С инфраструктурой, предоставленной облачными провайдерами, EMQX Cloud обслуживает десятки стран и регионов по всему миру, предлагая недорогие, безопасные и надежные облачные услуги для приложений 5G и Интернета Всего.

<img src={emqx_cloud_artitecture} alt="Архитектура EMQX Cloud" />

### Предпосылки {#assumptions}

* Вы знакомы с [MQTT протоколом](https://mqtt.org/), который разработан как исключительно легкий протокол транспортировки сообщений publish/subscribe.
* Вы используете EMQX или EMQX Cloud для обработки сообщений в реальном времени, которая обеспечивает потоковое событие для IoT устройств в огромных масштабах.
* Вы подготовили экземпляр Clickhouse Cloud для хранения данных устройства.
* Мы используем [MQTT X](https://mqttx.app/) в качестве инструмента тестирования клиента MQTT для подключения к развертыванию EMQX Cloud для публикации данных MQTT. Или другие методы подключения к MQTT брокеру также подойдут.


## Получите службу ClickHouse Cloud {#get-your-clickhouse-cloudservice}

Во время этой настройки мы развернули экземпляр ClickHouse на AWS в N. Virginia (us-east -1), в то время как экземпляр EMQX Cloud также был развернут в том же регионе.

<img src={clickhouse_cloud_1} alt="Развертывание службы ClickHouse Cloud" />

Во время процесса настройки вам также нужно будет обратить внимание на настройки подключения. В этом руководстве мы выбираем "Везде", но если вы подаете заявку на конкретное местоположение, вам нужно будет добавить IP-адрес [NAT-шлюза](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), который вы получили от развертывания EMQX Cloud в белый список.

<img src={clickhouse_cloud_2} alt="Настройки подключения ClickHouse Cloud" />

Затем вам нужно сохранить ваше имя пользователя и пароль для будущего использования.

<img src={clickhouse_cloud_3} alt="Учетные данные ClickHouse Cloud" />

После этого вы получите работающий экземпляр Click house. Нажмите "Подключиться", чтобы получить адрес подключения экземпляра Clickhouse Cloud.

<img src={clickhouse_cloud_4} alt="Запускаемый экземпляр ClickHouse Cloud" />

Нажмите "Подключиться к SQL Консоли", чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<img src={clickhouse_cloud_5} alt="SQL Консоль ClickHouse Cloud" />

Вы можете обратиться к следующему SQL запросу или изменить SQL в зависимости от актуальной ситуации.

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

<img src={clickhouse_cloud_6} alt="Создание базы данных и таблицы ClickHouse Cloud" />

## Создание MQTT службы на EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Создать специальный MQTT брокер на EMQX Cloud так же просто, как сделать несколько щелчков мышью.

### Получите учетную запись {#get-an-account}

EMQX Cloud предоставляет 14-дневную бесплатную пробную версию как для стандартного развертывания, так и для профессионального развертывания для каждой учетной записи.

Начните с страницы [регистрации EMQX Cloud](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите "Начать бесплатно", чтобы зарегистрировать учетную запись, если вы новичок в EMQX Cloud.

<img src={emqx_cloud_sign_up} alt="Страница регистрации EMQX Cloud" />

### Создание MQTT кластера {#create-an-mqtt-cluster}

После входа в систему нажмите на "Облачная консоль" в меню учетной записи, и вы сможете увидеть зеленую кнопку для создания нового развертывания.

<img src={emqx_cloud_create_1} alt="Создание развертывания EMQX Cloud Шаг 1" />

В этом руководстве мы будем использовать профессиональное развертывание, потому что только Pro версия предоставляет функциональность интеграции данных, которая может напрямую отправлять данные MQTT в ClickHouse без единой строки кода.

Выберите Pro версию и выберите регион `N.Virginia`, затем нажмите `Создать сейчас`. Всего через несколько минут вы получите полностью управляемый MQTT брокер:

<img src={emqx_cloud_create_2} alt="Создание развертывания EMQX Cloud Шаг 2" />

Теперь нажмите на панель, чтобы перейти к представлению кластера. На этой панели вы увидите обзор вашего MQTT брокера.

<img src={emqx_cloud_overview} alt="Обзорная панель EMQX Cloud" />

### Добавить клиентские учетные данные {#add-client-credential}

EMQX Cloud по умолчанию не позволяет анонимные соединения, поэтому вам нужно добавить клиентские учетные данные, чтобы вы могли использовать инструмент клиента MQTT для отправки данных в этот брокер.

Нажмите 'Аутентификация и ACL' в левом меню и нажмите 'Аутентификация' в подменю. Нажмите кнопку 'Добавить' справа и укажите имя пользователя и пароль для подключения MQTT позже. Здесь мы будем использовать `emqx` и `xxxxxx` в качестве имени пользователя и пароля.

<img src={emqx_cloud_auth} alt="Настройка аутентификации EMQX Cloud" />

Нажмите 'Подтвердить', и теперь у нас есть полностью управляемый MQTT брокер, готовый к работе.

### Включить NAT шлюз {#enable-nat-gateway}

Прежде чем мы сможем начать настраивать интеграцию ClickHouse, необходимо сначала включить NAT шлюз. По умолчанию MQTT брокер развернут в частной VPC, которая не может отправлять данные в сторонние системы через общую сеть.

Вернитесь на страницу обзора и прокрутите вниз до самого низа страницы, где вы увидите виджет NAT шлюза. Нажмите кнопку Подписаться и следуйте инструкциям. Обратите внимание, что NAT Gateway является дополнительной службой, но также предлагает 14-дневную бесплатную пробную версию.

<img src={emqx_cloud_nat_gateway} alt="Настройка NAT шлюза EMQX Cloud" />

После того, как он будет создан, вы найдете публичный IP-адрес в виджете. Пожалуйста, обратите внимание, что если вы выбрали "Подключаться из конкретного местоположения" во время настройки ClickHouse Cloud, вам нужно будет добавить этот IP-адрес в белый список.


## Интеграция EMQX Cloud с ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

[Интеграции данных EMQX Cloud](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используются для настройки правил обработки и реагирования на потоки сообщений EMQX и события устройств. Интеграции данных не только предоставляют четкое и гибкое решение "конфигурируемой" архитектуры, но также упрощают процесс разработки, улучшают удобство использования и уменьшают степень связывания между бизнес-системой и EMQX Cloud. Она также предоставляет превосходную инфраструктуру для настройки собственных возможностей EMQX Cloud.

<img src={emqx_cloud_data_integration} alt="Опции интеграции данных EMQX Cloud" />

EMQX Cloud предлагает более 30 нативных интеграций с популярными системами данных. ClickHouse является одной из них.

<img src={data_integration_clickhouse} alt="Интеграция данных EMQX Cloud ClickHouse" />

### Создать ресурс ClickHouse {#create-clickhouse-resource}

Нажмите "Интеграции данных" в левом меню и нажмите "Посмотреть все ресурсы". Вы найдете ClickHouse в разделе Устойчивость данных или можете поискать ClickHouse.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

- Примечание: добавьте примечание для этого ресурса.
- Адрес сервера: это адрес вашей службы ClickHouse Cloud, не забудьте порт.
- Имя базы данных: `emqx`, которую мы создали на предыдущих шагах.
- Пользователь: имя пользователя для подключения к вашей службе ClickHouse Cloud.
- Ключ: пароль для подключения.

<img src={data_integration_resource} alt="Настройка ресурса ClickHouse EMQX Cloud" />

### Создать новое правило {#create-a-new-rule}

Во время создания ресурса вы увидите всплывающее окно, и нажатие 'Новое' приведет вас на страницу создания правила.

EMQX предоставляет мощный [движок правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может преобразовывать и обогащать необработанное MQTT сообщение перед отправкой его в сторонние системы.

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

Это правило будет читать сообщения из темы `temp_hum/emqx` и обогащать JSON объект, добавляя информацию о client_id, topic и timestamp.

Таким образом, необработанный JSON, который вы отправляете в тему:

```bash
{"temp": 28.5, "hum": 0.68}
```

<img src={data_integration_rule_1} alt="Создание правила интеграции данных EMQX Cloud Шаг 1" />

Вы можете использовать SQL тест для проверки и просмотра результатов.

<img src={data_integration_rule_2} alt="Создание правила интеграции данных EMQX Cloud Шаг 2" />

Теперь нажмите кнопку "ДАЛЕЕ". Этот шаг предназначен для того, чтобы сообщить EMQX Cloud, как вставлять очищенные данные в вашу базу данных ClickHouse.

### Добавить действие отклика {#add-a-response-action}

Если у вас только один ресурс, вам не нужно модифицировать 'Ресурс' и 'Тип действия'.
Вам нужно только задать SQL шаблон. Вот пример, используемый в этом руководстве:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<img src={data_integration_rule_action} alt="Настройка действия интеграции данных EMQX Cloud" />

Это шаблон для вставки данных в Clickhouse, вы можете видеть, что здесь используются переменные.

### Просмотреть детали правил {#view-rules-details}

Нажмите "Подтвердить" и "Просмотреть детали". Теперь все должно быть установлено правильно. Вы можете увидеть работу интеграции данных на странице деталей правила.

<img src={data_integration_details} alt="Детали правила интеграции данных EMQX Cloud" />

Все MQTT сообщения, отправленные в тему `temp_hum/emqx`, будут сохранены в вашу базу данных ClickHouse Cloud.

## Сохранение данных в ClickHouse {#saving-data-into-clickhouse}

Мы будем имитировать данные о температуре и влажности и сообщать эти данные EMQX Cloud через MQTT X, а затем использовать интеграции данных EMQX Cloud, чтобы сохранить данные в ClickHouse Cloud.

<img src={work_flow} alt="Рабочий процесс EMQX Cloud к ClickHouse" />

### Публикация сообщений MQTT в EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

Вы можете использовать любой MQTT клиент или SDK для публикации сообщения. В этом руководстве мы будем использовать [MQTT X](https://mqttx.app/), приложение клиента MQTT, предоставляемое EMQ.

<img src={mqttx_overview} alt="Обзор MQTTX" />

Нажмите "Новое соединение" на MQTTX и заполните форму подключения:

- Имя: название соединения. Вы можете использовать любое имя, которое захотите.
- Хост: адрес подключения к MQTT брокеру. Вы можете получить его на странице обзора EMQX Cloud.
- Порт: порт подключения к MQTT брокеру. Вы можете получить его на странице обзора EMQX Cloud.
- Имя пользователя/Пароль: используйте учетные данные, созданные ранее, которые должны быть `emqx` и `xxxxxx` в этом руководстве.

<img src={mqttx_new} alt="Настройка нового соединения MQTTX" />

Нажмите кнопку "Подключиться" в правом верхнем углу, и соединение должно быть установлено.

Теперь вы можете отправлять сообщения в MQTT брокер, используя этот инструмент.
Входные данные:
1. Установите формат полезной нагрузки на "JSON".
2. Установите тему: `temp_hum/emqx` (тема, которую мы только что задали в правиле)
3. JSON тело:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить больше данных в MQTT брокер.

Данные, отправленные в EMQX Cloud, должны обрабатываться движком правил и автоматически вставляться в ClickHouse Cloud.

<img src={mqttx_publish} alt="Публикация сообщений MQTTX" />

### Просмотр мониторинга правил {#view-rules-monitoring}

Проверьте мониторинг правил и добавьте к количеству успехов.

<img src={rule_monitor} alt="Мониторинг правил EMQX Cloud" />

### Проверьте сохраненные данные {#check-the-data-persisted}

Теперь самое время взглянуть на данные в ClickHouse Cloud. В идеале данные, которые вы отправляете с помощью MQTTX, должны попасть в EMQX Cloud и сохраниться в базе данных ClickHouse Cloud с помощью нативной интеграции данных.

Вы можете подключиться к SQL консоли на панели ClickHouse Cloud или использовать любой клиентский инструмент, чтобы извлечь данные из вашего ClickHouse. В этом руководстве мы использовали SQL консоль.
Выполнив SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<img src={clickhouse_result} alt="Результаты запроса ClickHouse" />

### Резюме {#summary}

Вы не написали ни единой строки кода и теперь смогли переместить данные MQTT из EMQX Cloud в ClickHouse Cloud. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой, и вы можете сосредоточиться на написании ваших IoT приложений с данными, надежно хранящимися в ClickHouse Cloud.
