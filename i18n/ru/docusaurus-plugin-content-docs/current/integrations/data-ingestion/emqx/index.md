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

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это открытый MQTT брокер с высокопроизводительным движком обработки сообщений в реальном времени, обеспечивающим потоковое событие для IoT-устройств в огромном масштабе. Являясь самым масштабируемым MQTT брокером, EMQX может помочь вам подключить любое устройство при любом масштабе. Перемещайте и обрабатывайте свои IoT-данные в любом месте.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это промежуточное ПО для обмена сообщениями MQTT для области IoT, размещенное [EMQ](https://www.emqx.com/en). Будучи первым в мире полностью управляемым облачным сервисом обмена сообщениями MQTT 5.0, EMQX Cloud предоставляет одноточечные услуги О&M и уникальную изолированную среду для сервисов обмена сообщениями MQTT. В эпоху Интернета всего EMQX Cloud может помочь вам быстро создавать отраслевые приложения для области IoT и легко собирать, передавать, вычислять и сохранять IoT-данные.

С инфраструктурой, предоставляемой облачными провайдерами, EMQX Cloud обслуживает десятки стран и регионов по всему миру, предлагая недорогие, безопасные и надежные облачные услуги для приложений 5G и Интернета всего.

<Image img={emqx_cloud_artitecture} size="lg" border alt="Диаграмма архитектуры EMQX Cloud, показывающая компоненты облачной инфраструктуры" />

### Предположения {#assumptions}

* Вы знакомы с [протоколом MQTT](https://mqtt.org/), который разработан как чрезвычайно легковесный протокол обмена сообщениями с публикацией/подпиской.
* Вы используете EMQX или EMQX Cloud для обработки сообщений в реальном времени, обеспечивая потоковое событие для IoT-устройств в огромном масштабе.
* Вы подготовили экземпляр Clickhouse Cloud для сохранения данных устройств.
* Мы используем [MQTT X](https://mqttx.app/) в качестве инструмента тестирования MQTT-клиента для подключения развертывания EMQX Cloud для публикации данных MQTT. Или другие методы подключения к MQTT брокеру также подойдут.


## Получите свой сервис ClickHouse Cloud {#get-your-clickhouse-cloudservice}

Во время этой настройки мы развернули экземпляр ClickHouse в AWS в Н. Вирджинии (us-east -1), в то время как экземпляр EMQX Cloud также был развернут в том же регионе.

<Image img={clickhouse_cloud_1} size="sm" border alt="Интерфейс развертывания сервиса ClickHouse Cloud, показывающий выбор региона AWS" />

Во время процесса настройки вам также необходимо обратить внимание на параметры подключения. В этом учебном пособии мы выбираем "Везде", но если вы подаете заявку на конкретное местоположение, вам потребуется добавить IP-адрес [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), который вы получили от вашего развертывания EMQX Cloud, в список разрешенных адресов.

<Image img={clickhouse_cloud_2} size="sm" border alt="Настройки подключения ClickHouse Cloud, показывающие конфигурацию доступа по IP" />

Затем вам нужно сохранить ваше имя пользователя и пароль для дальнейшего использования.

<Image img={clickhouse_cloud_3} size="sm" border alt="Экран учетных данных ClickHouse Cloud, показывающий имя пользователя и пароль" />

После этого у вас будет работающий экземпляр ClickHouse. Нажмите "Подключиться", чтобы получить адрес подключения экземпляра ClickHouse Cloud.

<Image img={clickhouse_cloud_4} size="lg" border alt="Панель управления работающим экземпляром ClickHouse Cloud с параметрами подключения" />

Нажмите "Подключиться к SQL-консоли", чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<Image img={clickhouse_cloud_5} size="lg" border alt="Интерфейс SQL-консоли ClickHouse Cloud" />

Вы можете обратиться к следующему SQL-запросу или изменить SQL в соответствии с вашей ситуацией.

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

<Image img={clickhouse_cloud_6} size="lg" border alt="Выполнение SQL-запроса на создание базы данных и таблицы в ClickHouse Cloud" />

## Создание MQTT сервиса на EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Создание выделенного MQTT брокера на EMQX Cloud так же просто, как несколько кликов.

### Получите учетную запись {#get-an-account}

EMQX Cloud предоставляет 14-дневную бесплатную пробную версию как для стандартного развертывания, так и для профессионального развертывания для каждой учетной записи.

Начните со страницы [регистрации EMQX Cloud](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите "Начать бесплатно", чтобы зарегистрировать учетную запись, если вы новичок в EMQX Cloud.

<Image img={emqx_cloud_sign_up} size="lg" border alt="Страница регистрации EMQX Cloud с формой регистрации" />

### Создание MQTT кластера {#create-an-mqtt-cluster}

После входа в систему нажмите "Cloud Console" в меню учетной записи, и вы увидите зеленую кнопку для создания нового развертывания.

<Image img={emqx_cloud_create_1} size="lg" border alt="Шаг 1 создания развертывания EMQX Cloud, показывающий варианты развертывания" />

В этом учебном пособии мы будем использовать Профессиональное развертывание, потому что только Pro версия предоставляет функциональность интеграции данных, которая может отправлять данные MQTT непосредственно в ClickHouse без единой строки кода.

Выберите версию Pro и выберите регион `N.Virginial`, затем нажмите `Создать сейчас`. Всего через несколько минут вы получите полностью управляемый MQTT брокер:

<Image img={emqx_cloud_create_2} size="lg" border alt="Шаг 2 создания развертывания EMQX Cloud, показывающий выбор региона" />

Теперь нажмите панель, чтобы перейти к обзору кластера. На этой панели вы увидите обзор вашего MQTT брокера.

<Image img={emqx_cloud_overview} size="lg" border alt="Панель управления EMQX Cloud с обзором показателей брокера" />

### Добавить учетные данные клиента {#add-client-credential}

EMQX Cloud не допускает анонимные подключения по умолчанию, поэтому вам нужно добавить учетные данные клиента, чтобы вы могли использовать инструмент клиента MQTT для отправки данных на этот брокер.

Нажмите 'Аутентификация & ACL' в левом меню и нажмите 'Аутентификация' в подсmeni. Нажмите кнопку 'Добавить' справа и введите имя пользователя и пароль для подключения MQTT позже. Здесь мы будем использовать `emqx` и `xxxxxx` в качестве имени пользователя и пароля.

<Image img={emqx_cloud_auth} size="lg" border alt="Интерфейс настройки аутентификации EMQX Cloud для добавления учетных данных" />

Нажмите 'Подтвердить', и теперь у нас есть полностью управляемый MQTT брокер, готовый к использованию.

### Включить NAT gateway {#enable-nat-gateway}

Перед тем как начать настраивать интеграцию с ClickHouse, сначала нужно включить NAT gateway. По умолчанию MQTT брокер развернут в частной VPC, которая не может отправлять данные на сторонние системы через общую сеть.

Вернитесь на страницу обзора и прокрутите вниз, где вы увидите виджет NAT gateway. Нажмите кнопку Подписаться и следуйте инструкциям. Обратите внимание, что NAT Gateway является услугой с добавленной стоимостью, но она также предлагает 14-дневную бесплатную пробную версию.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="Панель конфигурации NAT Gateway EMQX Cloud" />

После его создания вы увидите публичный IP-адрес в виджете. Обратите внимание, что если вы выберете "Подключиться из конкретного местоположения" во время настройки ClickHouse Cloud, вам нужно будет добавить этот IP-адрес в список разрешенных адресов.


## Интеграция EMQX Cloud с ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используется для настройки правил для обработки и реагирования на потоки сообщений EMQX и события устройств. Интеграция данных не только обеспечивает четкое и гибкое "настраиваемое" архитектурное решение, но также упрощает процесс разработки, улучшает удобство использования и уменьшает степень взаимозависимости между бизнес-системой и EMQX Cloud. Она также предоставляет отличную инфраструктуру для кастомизации собственных возможностей EMQX Cloud.

<Image img={emqx_cloud_data_integration} size="lg" border alt="Опции интеграции данных EMQX Cloud, показывающие доступные соединители" />

EMQX Cloud предлагает более 30 нативных интеграций с популярными системами данных. ClickHouse является одной из них.

<Image img={data_integration_clickhouse} size="lg" border alt="Подробности соединителя интеграции данных EMQX Cloud с ClickHouse" />

### Создание ресурса ClickHouse {#create-clickhouse-resource}

Нажмите "Интеграции данных" в левом меню и нажмите "Просмотр всех ресурсов". Вы найдете ClickHouse в разделе Хранение данных или можете найти ClickHouse по поиску.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

- Примечание: добавьте заметку для этого ресурса.
- Адрес сервера: это адрес вашего сервиса ClickHouse Cloud, не забудьте порт.
- Имя базы данных: `emqx`, которую мы создали на предыдущих шагах.
- Пользователь: имя пользователя для подключения к вашему сервису ClickHouse Cloud.
- Ключ: пароль для подключения.

<Image img={data_integration_resource} size="lg" border alt="Форма настройки ресурса ClickHouse Cloud с деталями подключения" />

### Создание нового правила {#create-a-new-rule}

Во время создания ресурса вы увидите всплывающее окно, и нажав 'Новый', вы перейдете на страницу создания правила.

EMQX предоставляет мощный [движок правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может преобразовывать и обогащать необработанное MQTT-сообщение перед его отправкой в сторонние системы.

Вот правило, используемое в этом учебном пособии:

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

Оно будет считывать сообщения из темы `temp_hum/emqx` и обогащать объект JSON, добавляя информацию о client_id, topic и timestamp.

Таким образом, необработанный JSON, который вы отправляете в тему:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="Шаг 1 создания правила интеграции данных EMQX Cloud, показывающий SQL-запрос" />

Вы можете использовать SQL-тест, чтобы протестировать и увидеть результаты.

<Image img={data_integration_rule_2} size="md" border alt="Шаг 2 создания правила интеграции данных EMQX Cloud, показывающий результаты тестирования" />

Теперь нажмите на кнопку "ДАЛЕЕ". Этот шаг нужен, чтобы сообщить EMQX Cloud, как вставить уточненные данные в вашу базу данных ClickHouse.

### Добавить действие ответа {#add-a-response-action}

Если у вас только один ресурс, вам не нужно изменять 'Ресурс' и 'Тип действия'.
Вам нужно только установить шаблон SQL. Вот пример, использованный в этом учебном пособии:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="Настройка действия правила интеграции данных EMQX Cloud с шаблоном SQL" />

Это шаблон для вставки данных в Clickhouse, вы можете видеть переменные, которые здесь используются.

### Просмотреть детали правил {#view-rules-details}

Нажмите "Подтвердить" и "Просмотреть детали". Теперь все должно быть хорошо настроено. Вы можете видеть, как работает интеграция данных на странице деталей правил.

<Image img={data_integration_details} size="md" border alt="Детали правила интеграции данных EMQX Cloud, показывающие сводку конфигурации" />

Все MQTT-сообщения, отправленные в тему `temp_hum/emqx`, будут сохраняться в вашей базе данных ClickHouse Cloud.

## Сохранение данных в ClickHouse {#saving-data-into-clickhouse}

Мы смоделируем данные о температуре и влажности и отправим эти данные в EMQX Cloud через MQTT X, а затем используем интеграцию данных EMQX Cloud, чтобы сохранить данные в ClickHouse Cloud.

<Image img={work_flow} size="lg" border alt="Диаграмма рабочего процесса от EMQX Cloud до ClickHouse, показывающая поток данных" />

### Публикация MQTT сообщений в EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

Вы можете использовать любой MQTT клиент или SDK для публикации сообщения. В этом учебном пособии мы будем использовать [MQTT X](https://mqttx.app/), дружелюбное приложение клиента MQTT, предоставляемое EMQ.

<Image img={mqttx_overview} size="lg" border alt="Обзор MQTTX, показывающий интерфейс клиента" />

Нажмите "Новое соединение" в MQTTX и заполните форму соединения:

- Имя: имя соединения. Используйте любое имя, которое вам нравится.
- Хост: адрес подключения к MQTT брокеру. Вы можете получить его на странице обзора EMQX Cloud.
- Порт: порт подключения к MQTT брокеру. Вы можете получить его на странице обзора EMQX Cloud.
- Имя пользователя/Пароль: используйте учетные данные, созданные выше, которые должны быть `emqx` и `xxxxxx` в этом учебном пособии.

<Image img={mqttx_new} size="lg" border alt="Форма настройки нового соединения MQTTX с деталями подключения" />

Нажмите кнопку "Подключиться" в правом верхнем углу, и соединение должно быть установлено.

Теперь вы можете отправлять сообщения на MQTT брокер, используя этот инструмент.
Вводы:
1. Установите формат полезной нагрузки на "JSON".
2. Установите тему: `temp_hum/emqx` (тема, которую мы только что установили в правиле)
3. JSON тело:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить больше данных на MQTT брокер.

Данные, отправленные в EMQX Cloud, должны быть обработаны движком правил и автоматически вставлены в ClickHouse Cloud.

<Image img={mqttx_publish} size="lg" border alt="Интерфейс публикации сообщений MQTTX, показывающий составление сообщения" />

### Просмотр мониторинга правил {#view-rules-monitoring}

Проверьте мониторинг правил и добавьте к количеству успешных.

<Image img={rule_monitor} size="lg" border alt="Панель мониторинга правил EMQX Cloud, показывающая метрики обработки сообщений" />

### Проверьте сохраненные данные {#check-the-data-persisted}

Теперь время взглянуть на данные в ClickHouse Cloud. В идеале данные, которые вы отправляете с помощью MQTTX, попадут в EMQX Cloud и сохранятся в базе данных ClickHouse Cloud с помощью нативной интеграции данных.

Вы можете подключиться к SQL консоли на панели ClickHouse Cloud или использовать любой клиентский инструмент для извлечения данных из вашего ClickHouse. В этом учебном пособии мы использовали SQL консоль.
Выполнив SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="Результаты запроса ClickHouse, показывающие сохраненные IoT данные" />

### Резюме {#summary}

Вы не написали ни одной строки кода, и теперь у вас есть данные MQTT, перемещающиеся из облака EMQX в облако ClickHouse. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой и можно сосредоточиться на написании ваших IoT приложений с данными, хранящимися безопасно в ClickHouse Cloud.
