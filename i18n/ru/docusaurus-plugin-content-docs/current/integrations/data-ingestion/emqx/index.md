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

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это open-source MQTT брокер с высокопроизводительным движком обработки сообщений в реальном времени, обеспечивающий потоковую передачу событий для IoT устройств в огромных масштабах. Как самый масштабируемый MQTT брокер, EMQX может помочь вам подключить любое устройство, в любых масштабах. Перемещайте и обрабатывайте свои IoT данные где угодно.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это продукт промежуточного ПО для обмена сообщениями MQTT в области IoT, размещенный [EMQ](https://www.emqx.com/en). Будучи первым в мире полностью управляемым облачным сервисом обмена сообщениями MQTT 5.0, EMQX Cloud предоставляет одноразовое размещение для обслуживания и уникальное изолированное окружение для сервисов обмена сообщениями MQTT. В эпоху Интернета всего EMQX Cloud может помочь вам быстро создавать отраслевые приложения для области IoT и легко собирать, передавать, вычислять и хранить данные IoT.

С инфраструктурой, предоставленной облачными провайдерами, EMQX Cloud обслуживает десятки стран и регионов по всему миру, предоставляя недорогие, безопасные и надежные облачные услуги для приложений 5G и Интернета всего.

<Image img={emqx_cloud_artitecture} size="lg" border alt="Диаграмма архитектуры EMQX Cloud, показывающая компоненты облачной инфраструктуры" />

### Предположения {#assumptions}

* Вы знакомы с [MQTT протоколом](https://mqtt.org/), который разработан как чрезвычайно легковесный протокол передачи сообщений публикации/подписки.
* Вы используете EMQX или EMQX Cloud как движок обработки сообщений в реальном времени, обеспечивающий потоковую передачу событий для IoT устройств в огромных масштабах.
* Вы подготовили экземпляр Clickhouse Cloud для сохранения данных устройств.
* Мы используем [MQTT X](https://mqttx.app/) в качестве инструмента тестирования MQTT клиента для подключения развертывания EMQX Cloud для публикации MQTT данных. Или другие методы подключения к MQTT брокеру также подойдут.


## Получите свой сервис ClickHouse Cloud {#get-your-clickhouse-cloudservice}

В процессе настройки мы развернули экземпляр ClickHouse в AWS в N. Virginia (us-east -1), в то время как экземпляр EMQX Cloud также был развернут в том же регионе.

<Image img={clickhouse_cloud_1} size="sm" border alt="Интерфейс развертывания ClickHouse Cloud Service, показывающий выбор региона AWS" />

В процессе настройки также нужно обращать внимание на настройки подключения. В этом учебнике мы выбрали "Везде", но если вы подаете заявку на конкретное место, вам нужно будет добавить адрес IP [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), который вы получили из развертывания EMQX Cloud в белый список.

<Image img={clickhouse_cloud_2} size="sm" border alt="Настройки подключения ClickHouse Cloud, показывающие конфигурацию доступа по IP" />

Затем вам нужно сохранить ваше имя пользователя и пароль для будущего использования.

<Image img={clickhouse_cloud_3} size="sm" border alt="Экран учетных данных ClickHouse Cloud, показывающий имя пользователя и пароль" />

После этого вы получите работающий экземпляр ClickHouse. Нажмите "Подключиться", чтобы получить адрес подключения экземпляра ClickHouse Cloud.

<Image img={clickhouse_cloud_4} size="lg" border alt="Панель управления работающим экземпляром ClickHouse Cloud с вариантами подключения" />

Нажмите "Подключиться к SQL Console", чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<Image img={clickhouse_cloud_5} size="lg" border alt="Интерфейс SQL Console ClickHouse Cloud" />

Вы можете использовать следующий SQL-запрос или настроить SQL в соответствии с фактической ситуацией.

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

<Image img={clickhouse_cloud_6} size="lg" border alt="Выполнение SQL-запроса создания базы данных и таблицы ClickHouse Cloud" />

## Создайте MQTT сервис на EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Создать выделенный MQTT брокер на EMQX Cloud так же просто, как сделать несколько кликов.

### Получите учетную запись {#get-an-account}

EMQX Cloud предоставляет 14-дневную бесплатную пробную версию как для стандартного развертывания, так и для профессионального развертывания для каждой учетной записи.

Начните на странице [регистрации EMQX Cloud](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите "начать бесплатно", чтобы зарегистрировать учетную запись, если вы впервые на EMQX Cloud.

<Image img={emqx_cloud_sign_up} size="lg" border alt="Страница регистрации EMQX Cloud с формой регистрации" />

### Создайте MQTT кластер {#create-an-mqtt-cluster}

После входа в систему, нажмите на "Cloud Console" в меню учетной записи, и вы увидите зеленую кнопку для создания нового развертывания.

<Image img={emqx_cloud_create_1} size="lg" border alt="Создание развертывания EMQX Cloud Шаг 1 показывает варианты развертывания" />

В этом учебнике мы воспользуемся Профессиональным развертыванием, потому что только версия Pro предоставляет функциональность интеграции данных, которая может отправлять MQTT данные напрямую в ClickHouse без единой строки кода.

Выберите версию Pro и выберите регион `N.Virginial`, затем нажмите `Создать сейчас`. Всего через несколько минут вы получите полностью управляемый MQTT брокер:

<Image img={emqx_cloud_create_2} size="lg" border alt="Создание развертывания EMQX Cloud Шаг 2 показывает выбор региона" />

Теперь нажмите на панель, чтобы перейти к представлению кластера. На этой панели вы увидите обзор вашего MQTT брокера.

<Image img={emqx_cloud_overview} size="lg" border alt="Обзорная панель EMQX Cloud, показывающая метрики брокера" />

### Добавить учетные данные клиента {#add-client-credential}

EMQX Cloud по умолчанию не позволяет анонимные подключения, поэтому вам нужно добавить учетные данные клиента, чтобы использовать инструмент MQTT клиента для отправки данных на этот брокер.

Нажмите ‘Аутентификация & ACL’ в левом меню и нажмите ‘Аутентификация’ в подменю. Нажмите кнопку ‘Добавить’ справа и задайте имя пользователя и пароль для подключения MQTT позже. Здесь мы воспользуемся `emqx` и `xxxxxx` для имени пользователя и пароля.

<Image img={emqx_cloud_auth} size="lg" border alt="Интерфейс настройки аутентификации EMQX Cloud для добавления учетных данных" />

Нажмите 'Подтвердить', и теперь у нас есть полностью управляемый MQTT брокер, готовый к работе.

### Включите NAT gateway {#enable-nat-gateway}

Перед тем как мы сможем начать настройку интеграции ClickHouse, мы сначала должны включить NAT gateway. По умолчанию MQTT брокер развернут в частной VPC, которая не может отправлять данные на сторонние системы через общую сеть.

Вернитесь на страницу Обзора и прокрутите вниз к нижней части страницы, где вы увидите виджет NAT gateway. Нажмите кнопку Подписаться и следуйте инструкциям. Обратите внимание, что NAT Gateway является дополнительной услугой, но она также предлагает 14-дневную бесплатную пробную версию.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="Панель конфигурации NAT Gateway EMQX Cloud" />

Как только он будет создан, вы найдете публичный IP-адрес в виджете. Обратите внимание, что если вы выбрали "Подключение из конкретного места" во время настройки ClickHouse Cloud, вам нужно будет добавить этот IP-адрес в белый список.


## Интеграция EMQX Cloud с ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

[Интеграции данных EMQX Cloud](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используются для настройки правил обработки и реагирования на потоки сообщений EMQX и события устройств. Интеграции данных не только предоставляют ясное и гибкое "настраиваемое" архитектурное решение, но и упрощают процесс разработки, улучшают удобство пользователей и уменьшают степень связи между бизнес-системой и EMQX Cloud. Это также предоставляет превосходную инфраструктуру для пользовательской настройки собственных возможностей EMQX Cloud.

<Image img={emqx_cloud_data_integration} size="lg" border alt="Опции интеграции данных EMQX Cloud показывают доступные коннекторы" />

EMQX Cloud предлагает более 30 родных интеграций с популярными системами данных. ClickHouse – одна из них.

<Image img={data_integration_clickhouse} size="lg" border alt="Подробности коннектора интеграции данных ClickHouse EMQX Cloud" />

### Создайте ресурс ClickHouse {#create-clickhouse-resource}

Нажмите "Интеграции данных" в левом меню и нажмите "Просмотреть все ресурсы". Вы найдёте ClickHouse в разделе Сохранение данных или можете поискать ClickHouse.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

- Примечание: добавьте заметку для этого ресурса.
- Адрес сервера: это адрес вашего сервиса ClickHouse Cloud, не забудьте указать порт.
- Название базы данных: `emqx`, который мы создали на предыдущих шагах.
- Пользователь: имя пользователя для подключения к вашему сервису ClickHouse Cloud.
- Ключ: пароль для подключения.

<Image img={data_integration_resource} size="lg" border alt="Форма настройки ресурса ClickHouse EMQX Cloud с данными подключения" />

### Создайте новое правило {#create-a-new-rule}

Во время создания ресурса вы увидите всплывающее окно, и нажав 'Новое', вы перейдете на страницу создания правила.

EMQX предоставляет мощный [движок правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может преобразовывать и обогащать необработанное MQTT сообщение перед его отправкой в сторонние системы.

Вот правило, используемое в этом учебнике:

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

Оно будет считывать сообщения из темы `temp_hum/emqx` и обогащать JSON-объект, добавляя информацию о client_id, topic и timestamp.

Итак, необработанный JSON, который вы отправляете в тему:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="Шаг 1 создания правила интеграции данных EMQX Cloud, показывающий SQL-запрос" />

Вы можете использовать тест SQL, чтобы протестировать и увидеть результаты.

<Image img={data_integration_rule_2} size="md" border alt="Шаг 2 создания правила интеграции данных EMQX Cloud, показывающий результаты теста" />

Теперь нажмите на кнопку "ДАЛЕЕ". Этот шаг предназначен для того, чтобы сказать EMQX Cloud, как вставить обработанные данные в вашу базу данных ClickHouse.

### Добавьте действие ответа {#add-a-response-action}

Если у вас только один ресурс, вам не нужно изменять ‘Ресурс’ и ‘Тип действия’.
Вам нужно только задать шаблон SQL. Вот пример, использованный в этом учебнике:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="Настройка действия интеграции данных EMQX Cloud с шаблоном SQL" />

Это шаблон для вставки данных в Clickhouse, вы можете видеть, что здесь используются переменные.

### Просмотр подробностей правил {#view-rules-details}

Нажмите "Подтвердить" и "Просмотреть детали". Теперь все должно быть правильно настроено. Вы можете видеть, как интеграция данных работает на странице деталей правил.

<Image img={data_integration_details} size="md" border alt="Подробности правила интеграции данных EMQX Cloud, показывающие обобщение конфигурации" />

Все MQTT сообщения, отправленные в тему `temp_hum/emqx`, будут сохранены в вашей базе данных ClickHouse Cloud.

## Сохранение данных в ClickHouse {#saving-data-into-clickhouse}

Мы будем моделировать данные о температуре и влажности и передавать эти данные в EMQX Cloud через MQTT X, а затем использовать интеграции данных EMQX Cloud для сохранения данных в ClickHouse Cloud.

<Image img={work_flow} size="lg" border alt="Диаграмма рабочего процесса EMQX Cloud к ClickHouse, показывающая поток данных" />

### Публикация MQTT сообщений в EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

Вы можете использовать любой MQTT клиент или SDK для публикации сообщения. В этом учебнике мы будем использовать [MQTT X](https://mqttx.app/), удобное приложение MQTT клиента, предоставленное EMQ.

<Image img={mqttx_overview} size="lg" border alt="Обзор MQTTX, показывающий интерфейс клиента" />

Нажмите "Новое подключение" в MQTTX и заполните форму подключения:

- Имя: Название подключения. Используйте любое имя, которое хотите.
- Хост: адрес подключения к MQTT брокеру. Вы можете получить его на странице обзора EMQX Cloud.
- Порт: порт подключения к MQTT брокеру. Вы можете получить его на странице обзора EMQX Cloud.
- Имя пользователя/Пароль: Используйте учетные данные, созданные выше, которые должны быть `emqx` и `xxxxxx` в этом учебнике.

<Image img={mqttx_new} size="lg" border alt="Форма нового подключения MQTTX с данными подключения" />

Нажмите кнопку "Подключиться" в правом верхнем углу, и подключение должно быть установлено.

Теперь вы можете отправлять сообщения на MQTT брокер, используя этот инструмент.
Вводы:
1. Установите формат полезной нагрузки на "JSON".
2. Установите тему: `temp_hum/emqx` (тематика, которую мы только что задали в правиле)
3. Тело JSON:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить больше данных на MQTT брокер.

Данные, отправленные в EMQX Cloud, должны быть обработаны движком правил и автоматически вставлены в ClickHouse Cloud.

<Image img={mqttx_publish} size="lg" border alt="Интерфейс публикации сообщений MQTTX, показывающий составление сообщения" />

### Просмотр мониторинга правил {#view-rules-monitoring}

Проверьте мониторинг правил и добавьте к количеству успехов.

<Image img={rule_monitor} size="lg" border alt="Доска мониторинга правил EMQX Cloud, показывающая метрики обработки сообщений" />

### Проверьте сохраненные данные {#check-the-data-persisted}

Теперь пора взглянуть на данные в ClickHouse Cloud. В идеале, данные, которые вы отправляете с использованием MQTTX, должны поступить в EMQX Cloud и сохраниться в базе данных ClickHouse Cloud с помощью нативной интеграции данных.

Вы можете подключиться к SQL консоли на панели ClickHouse Cloud или использовать любой клиентский инструмент, чтобы извлечь данные из вашего ClickHouse. В этом учебнике мы использовали SQL консоль.
Выполнив SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="Результаты запроса ClickHouse, показывающие сохраненные данные IoT" />

### Резюме {#summary}

Вы не написали ни строки кода и теперь имеете возможность перемещать данные MQTT из EMQX Cloud в ClickHouse Cloud. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой, и вы можете сосредоточиться на написании своих IoT приложений с данными, надежно хранящимися в ClickHouse Cloud.
