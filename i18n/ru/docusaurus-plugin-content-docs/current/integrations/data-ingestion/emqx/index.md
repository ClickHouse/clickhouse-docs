---
slug: '/integrations/emqx'
sidebar_label: EMQX
sidebar_position: 1
description: 'Введение в EMQX с ClickHouse'
title: 'Интеграция EMQX с ClickHouse'
doc_type: guide
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

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это брокер MQTT с открытым исходным кодом и высокопроизводительным движком обработки сообщений в реальном времени, который обеспечивает стриминг событий для IoT-устройств в масштабах. Как самый масштабируемый брокер MQTT, EMQX может помочь вам подключить любое устройство в любом масштабе. Перемещайте и обрабатывайте свои IoT-данные где угодно.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это промежуточное ПО для обмена сообщениями MQTT в области IoT, размещенное компанией [EMQ](https://www.emqx.com/en). Будучи первым в мире полностью управляемым облачным сервисом обмена сообщениями MQTT 5.0, EMQX Cloud предоставляет единое решение для совместного размещения операций и уникальную изолированную среду для сервисов обмена сообщениями MQTT. В эпоху Интернета всего EMQX Cloud может помочь вам быстро создавать промышленные приложения для IoT и легко собирать, передавать, обрабатывать и сохранять IoT-данные.

С инфраструктурой, предоставленной облачными провайдерами, EMQX Cloud обслуживает десятки стран и регионов мира, обеспечивая недорогие, безопасные и надежные облачные услуги для приложений 5G и Интернета всего.

<Image img={emqx_cloud_artitecture} size="lg" border alt="Схема архитектуры EMQX Cloud, показывающая компоненты облачной инфраструктуры" />

### Предпосылки {#assumptions}

* Вы знакомы с [протоколом MQTT](https://mqtt.org/), который разработан как крайне легковесный протокол передачи сообщений с публикацией/подпиской.
* Вы используете EMQX или EMQX Cloud как движок для обработки сообщений в реальном времени, обеспечивая стриминг событий для IoT-устройств в масштабах.
* Вы подготовили экземпляр Clickhouse Cloud для сохранения данных устройства.
* Мы используем [MQTT X](https://mqttx.app/) как инструмент тестирования MQTT-клиента для подключения к развертыванию EMQX Cloud для публикации данных MQTT. Либо другие методы подключения к брокеру MQTT также подойдут.

## Получите свою службу ClickHouse Cloud {#get-your-clickhouse-cloudservice}

В процессе этой настройки мы развернули экземпляр ClickHouse в AWS в N. Virginia (us-east -1), в то время как экземпляр EMQX Cloud был также развернут в том же регионе.

<Image img={clickhouse_cloud_1} size="sm" border alt="Интерфейс развертывания службы ClickHouse Cloud, показывающий выбор региона AWS" />

В процессе настройки вам также нужно будет обратить внимание на настройки подключения. В этом учебном пособии мы выбираем "Везде", но если вы подаете заявку на конкретное место, вам нужно будет добавить IP-адрес [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), который вы получили из развертывания EMQX Cloud, в черный список.

<Image img={clickhouse_cloud_2} size="sm" border alt="Настройки подключения ClickHouse Cloud, показывающие конфигурацию доступа по IP" />

Затем вам нужно сохранить ваше имя пользователя и пароль для дальнейшего использования.

<Image img={clickhouse_cloud_3} size="sm" border alt="Экран учетных данных ClickHouse Cloud, показывающий имя пользователя и пароль" />

После этого вы получите работающий экземпляр Clickhouse. Нажмите "Подключиться", чтобы получить адрес подключения экземпляра Clickhouse Cloud.

<Image img={clickhouse_cloud_4} size="lg" border alt="Панель управления работающим экземпляром ClickHouse Cloud с опциями подключения" />

Нажмите "Подключиться к SQL Console", чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<Image img={clickhouse_cloud_5} size="lg" border alt="Интерфейс SQL Console ClickHouse Cloud" />

Вы можете обратиться к следующему SQL-запросу или изменить SQL в соответствии с фактической ситуацией.

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

<Image img={clickhouse_cloud_6} size="lg" border alt="Выполнение SQL-запроса для создания базы данных и таблицы ClickHouse Cloud" />

## Создание MQTT сервиса на EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Создание выделенного брокера MQTT на EMQX Cloud так же просто, как несколько кликов.

### Получите учетную запись {#get-an-account}

EMQX Cloud предоставляет бесплатную 14-дневную пробную версию как для стандартного развертывания, так и для профессионального развертывания для каждой учетной записи.

Начните на странице [регистрации EMQX Cloud](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите "Начать бесплатно", чтобы зарегистрировать учетную запись, если вы ранее не использовали EMQX Cloud.

<Image img={emqx_cloud_sign_up} size="lg" border alt="Страница регистрации EMQX Cloud с формой регистрации" />

### Создайте кластер MQTT {#create-an-mqtt-cluster}

После входа в систему нажмите "Облачная консоль" в меню учетной записи, и вы увидите зеленую кнопку для создания нового развертывания.

<Image img={emqx_cloud_create_1} size="lg" border alt="Шаг 1 создания развертывания EMQX Cloud, показывающий варианты развертывания" />

В этом учебном пособии мы будем использовать профессиональное развертывание, потому что только версия Pro предоставляет функциональность интеграции данных, которая может напрямую отправлять данные MQTT в ClickHouse без единой строки кода.

Выберите версию Pro и выберите регион `N.Virginia`, затем нажмите `Создать сейчас`. Всего через несколько минут вы получите полностью управляемый брокер MQTT:

<Image img={emqx_cloud_create_2} size="lg" border alt="Шаг 2 создания развертывания EMQX Cloud, показывающий выбор региона" />

Теперь нажмите на панель, чтобы перейти к просмотру кластера. На этой панели вы увидите обзор вашего брокера MQTT.

<Image img={emqx_cloud_overview} size="lg" border alt="Панель управления EMQX Cloud Overview, показывающая метрики брокера" />

### Добавьте клиентские учетные данные {#add-client-credential}

EMQX Cloud по умолчанию не позволяет анонимные соединения, поэтому вам нужно добавить клиентские учетные данные, чтобы вы могли использовать инструмент MQTT-клиента для отправки данных на этот брокер.

Нажмите 'Аутентификация и ACL' в левом меню и нажмите 'Аутентификация' в подменю. Нажмите кнопку 'Добавить' справа и укажите имя пользователя и пароль для подключения MQTT позже. Здесь мы будем использовать `emqx` и `xxxxxx` в качестве имени пользователя и пароля.

<Image img={emqx_cloud_auth} size="lg" border alt="Интерфейс настройки аутентификации EMQX Cloud для добавления учетных данных" />

Нажмите 'Подтвердить', и теперь у нас есть полностью управляемый брокер MQTT.

### Включите NAT gateway {#enable-nat-gateway}

Прежде чем начать настраивать интеграцию ClickHouse, нам сначала нужно включить NAT gateway. По умолчанию брокер MQTT развернут в частной VPC, который не может отправлять данные в сторонние системы через общую сеть.

Вернитесь на страницу обзора и прокрутите вниз до конца страницы, где вы увидите виджет NAT gateway. Нажмите кнопку Подписаться и следуйте инструкциям. Имейте в виду, что NAT Gateway является дополнительной услугой, но он также предлагает 14-дневную бесплатную пробную версию.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="Панель конфигурации NAT Gateway EMQX Cloud" />

Как только он будет создан, вы найдете публичный IP-адрес в виджете. Обратите внимание, что если вы выбрали "Подключение из конкретного местоположения" во время настройки ClickHouse Cloud, вам нужно будет добавить этот IP-адрес в белый список.

## Интеграция EMQX Cloud с ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

[Интеграции данных EMQX Cloud](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используются для настройки правил обработки и ответа на потоки сообщений EMQX и события устройств. Интеграции данных не только предоставляют четкое и гибкое "настраиваемое" архитектурное решение, но и упрощают процесс разработки, улучшают удобство использования пользователями и снижают степень сцепления между бизнес-системой и EMQX Cloud. Она также предоставляет превосходную инфраструктуру для настройки собственных возможностей EMQX Cloud.

<Image img={emqx_cloud_data_integration} size="lg" border alt="Опции интеграции данных EMQX Cloud, показывающие доступные коннекторы" />

EMQX Cloud предлагает более 30 интеграций с популярными системами данных. ClickHouse — один из них.

<Image img={data_integration_clickhouse} size="lg" border alt="Детали коннектора интеграции данных EMQX Cloud с ClickHouse" />

### Создайте ресурс ClickHouse {#create-clickhouse-resource}

Нажмите "Интеграции данных" в левом меню и нажмите "Просмотреть все ресурсы". Вы найдете ClickHouse в разделе Устойчивость данных или можете искать ClickHouse.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

- Примечание: добавьте примечание для этого ресурса.
- Адрес сервера: это адрес вашей службы ClickHouse Cloud, не забудьте указать порт.
- Имя базы данных: `emqx`, которую мы создали на предыдущих шагах.
- Пользователь: имя пользователя для подключения к вашей службе ClickHouse Cloud.
- Ключ: пароль для подключения.

<Image img={data_integration_resource} size="lg" border alt="Форма настройки ресурса ClickHouse EMQX Cloud с данными подключения" />

### Создайте новое правило {#create-a-new-rule}

Во время создания ресурса вы увидите всплывающее окно, и нажав 'Новое', вы перейдете на страницу создания правила.

EMQX предоставляет мощный [движок правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может трансформировать и обогащать сырой MQTT-сообщение перед его отправкой в сторонние системы.

Вот правило, использованное в этом учебном пособии:

```sql
SELECT
   clientid AS client_id,
   (timestamp div 1000) AS timestamp,
   topic AS topic,
   payload.temp AS temp,
   payload.hum AS hum
FROM
"temp_hum/emqx"
```

Он будет читать сообщения из темы `temp_hum/emqx` и обогащать объект JSON, добавляя информацию о client_id, topic и timestamp.

Таким образом, сырой JSON, который вы отправляете в тему:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="Шаг 1 создания правила интеграции данных EMQX Cloud, показывающий SQL-запрос" />

Вы можете использовать тест SQL, чтобы протестировать и увидеть результаты.

<Image img={data_integration_rule_2} size="md" border alt="Шаг 2 создания правила интеграции данных EMQX Cloud, показывающий результаты теста" />

Теперь нажмите кнопку "ДАЛЕЕ". Этот шаг позволит EMQX Cloud знать, как вставлять обработанные данные в вашу базу данных ClickHouse.

### Добавьте действие ответа {#add-a-response-action}

Если у вас есть только один ресурс, вам не нужно изменять 'Ресурс' и 'Тип действия'.
Вам только нужно установить шаблон SQL. Вот пример, использованный в этом учебном пособии:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="Настройка действия правила интеграции данных EMQX Cloud с шаблоном SQL" />

Это шаблон для вставки данных в Clickhouse, вы можете увидеть переменные, используемые здесь.

### Просмотр деталей правил {#view-rules-details}

Нажмите "Подтвердить" и "Просмотреть детали". Теперь все должно быть хорошо настроено. Вы можете видеть, что интеграция данных работает на странице деталей правил.

<Image img={data_integration_details} size="md" border alt="Детали правила интеграции данных EMQX Cloud, показывающие сводку конфигурации" />

Все MQTT-сообщения, отправленные на тему `temp_hum/emqx`, будут сохранены в вашей базе данных ClickHouse Cloud.

## Сохранение данных в ClickHouse {#saving-data-into-clickhouse}

Мы смоделируем данные о температуре и влажности и отправим эти данные в EMQX Cloud через MQTT X, а затем используем интеграции данных EMQX Cloud, чтобы сохранить данные в ClickHouse Cloud.

<Image img={work_flow} size="lg" border alt="Схема рабочего процесса от EMQX Cloud к ClickHouse, показывающая поток данных" />

### Публикация MQTT-сообщений в EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

Вы можете использовать любой MQTT-клиент или SDK для публикации сообщения. В этом учебном пособии мы будем использовать [MQTT X](https://mqttx.app/), удобное приложение MQTT-клиента, предоставленное EMQ.

<Image img={mqttx_overview} size="lg" border alt="Обзор MQTTX, показывающий интерфейс клиента" />

Нажмите "Новое соединение" в MQTTX и заполните форму подключения:

- Имя: имя соединения. Используйте любое имя, которое хотите.
- Хост: адрес подключения к брокеру MQTT. Вы можете получить его на странице обзора EMQX Cloud.
- Порт: порт подключения к брокеру MQTT. Вы можете получить его на странице обзора EMQX Cloud.
- Имя пользователя/Пароль: используйте учетные данные, созданные выше, которые должны быть `emqx` и `xxxxxx` в этом учебном пособии.

<Image img={mqttx_new} size="lg" border alt="Форма настройки нового соединения MQTTX с деталями подключения" />

Нажмите кнопку "Подключиться" в правом верхнем углу, и соединение должно быть установлено.

Теперь вы можете отправлять сообщения брокеру MQTT с помощью этого инструмента. 
Входные данные:
1. Установите формат полезной нагрузки на "JSON".
2. Установите тему: `temp_hum/emqx` (тема, которую мы только что установили в правиле)
3. Тело JSON:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить больше данных на брокер MQTT.

Данные, отправленные в EMQX Cloud, должны быть обработаны движком правил и автоматически вставлены в ClickHouse Cloud.

<Image img={mqttx_publish} size="lg" border alt="Интерфейс публикации MQTT-сообщений MQTTX, показывающий составление сообщения" />

### Просмотр мониторинга правил {#view-rules-monitoring}

Проверьте мониторинг правил и добавьте одну к количеству успехов.

<Image img={rule_monitor} size="lg" border alt="Панель мониторинга правил EMQX Cloud, показывающая метрики обработки сообщений" />

### Проверьте сохраненные данные {#check-the-data-persisted}

Теперь пришло время взглянуть на данные в ClickHouse Cloud. В идеале данные, которые вы отправляете с помощью MQTTX, отправятся в EMQX Cloud и сохранятся в базе данных ClickHouse Cloud с помощью встроенной интеграции данных.

Вы можете подключиться к SQL-консоли на панели ClickHouse Cloud или использовать любой инструмент клиента для извлечения данных из вашего ClickHouse. В этом учебном пособии мы использовали SQL-консоль. 
Выполнив SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="Результаты запроса ClickHouse, показывающие сохраненные IoT-данные" />

### Резюме {#summary}

Вы не написали ни одной строки кода и теперь имеете возможность перемещать данные MQTT из EMQX Cloud в ClickHouse Cloud. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой, и вы можете сосредоточиться на написании своих IoT-приложений с безопасно хранящимися данными в ClickHouse Cloud.