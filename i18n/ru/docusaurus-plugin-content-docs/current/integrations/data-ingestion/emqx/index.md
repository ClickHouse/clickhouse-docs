---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'Введение в EMQX и ClickHouse'
title: 'Интеграция EMQX с ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
keywords: ['Интеграция EMQX с ClickHouse', 'Коннектор MQTT для ClickHouse', 'EMQX Cloud и ClickHouse', 'Данные IoT в ClickHouse', 'Брокер MQTT и ClickHouse']
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

# Интеграция EMQX с ClickHouse \{#integrating-emqx-with-clickhouse\}

## Подключение EMQX \{#connecting-emqx\}

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это брокер MQTT с открытым исходным кодом и высокопроизводительным движком обработки сообщений в режиме реального времени, обеспечивающий потоковую обработку событий для IoT‑устройств в очень крупном масштабе. Будучи наиболее масштабируемым брокером MQTT, EMQX помогает подключать любые устройства при любом масштабе. Перемещайте и обрабатывайте ваши IoT‑данные где угодно.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это продукт промежуточного слоя обмена сообщениями MQTT для IoT‑сферы, размещаемый компанией [EMQ](https://www.emqx.com/en). Как первый в мире полностью управляемый облачный сервис обмена сообщениями MQTT 5.0, EMQX Cloud предоставляет единое решение для эксплуатации и сопровождения, а также уникальную изолированную среду для сервисов обмена сообщениями MQTT. В эпоху Интернета вещей EMQX Cloud помогает быстро создавать отраслевые приложения для IoT‑сферы и легко собирать, передавать, обрабатывать и хранить IoT‑данные.

Используя инфраструктуру облачных провайдеров, EMQX Cloud обслуживает десятки стран и регионов по всему миру, предоставляя недорогие, безопасные и надежные облачные сервисы для приложений 5G и Интернета вещей.

<Image img={emqx_cloud_artitecture} size="lg" border alt="Диаграмма архитектуры EMQX Cloud с компонентами облачной инфраструктуры" />

### Предварительные условия \{#assumptions\}

* Вы знакомы с [протоколом MQTT](https://mqtt.org/), который разработан как чрезвычайно легковесный транспортный протокол обмена сообщениями с моделью публикация/подписка.
* Вы используете EMQX или EMQX Cloud в качестве высокопроизводительного движка обработки сообщений в реальном времени, обеспечивающего потоковую обработку событий для IoT‑устройств в крупном масштабе.
* Вы подготовили экземпляр ClickHouse Cloud для долговременного хранения данных устройств.
* Мы используем [MQTT X](https://mqttx.app/) как тестовый MQTT‑клиент для подключения к развертыванию EMQX Cloud и публикации MQTT‑данных. Также подойдут и другие способы подключения к брокеру MQTT.

## Получение сервиса ClickHouse Cloud \{#get-your-clickhouse-cloudservice\}

В ходе этой настройки мы развернули экземпляр ClickHouse в AWS в регионе N. Virginia (us-east -1), при этом экземпляр EMQX Cloud также был развернут в том же регионе.

<Image img={clickhouse_cloud_1} size="sm" border alt="Интерфейс развертывания сервиса ClickHouse Cloud с выбором региона AWS" />

Во время настройки вам также необходимо обратить внимание на параметры подключения. В этом руководстве мы выбираем &quot;Anywhere&quot;, но если вы настраиваете доступ из определенного расположения, вам нужно будет добавить IP-адрес [NAT-шлюза](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), полученный при развертывании EMQX Cloud, в список разрешенных.

<Image img={clickhouse_cloud_2} size="sm" border alt="Параметры подключения ClickHouse Cloud с конфигурацией доступа по IP" />

Затем сохраните имя пользователя и пароль для дальнейшего использования.

<Image img={clickhouse_cloud_3} size="sm" border alt="Экран учетных данных ClickHouse Cloud с именем пользователя и паролем" />

После этого вы получите запущенный экземпляр ClickHouse. Нажмите &quot;Connect&quot;, чтобы получить адрес подключения экземпляра ClickHouse Cloud.

<Image img={clickhouse_cloud_4} size="lg" border alt="Панель запущенного экземпляра ClickHouse Cloud с параметрами подключения" />

Нажмите &quot;Connect to SQL Console&quot;, чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<Image img={clickhouse_cloud_5} size="lg" border alt="Интерфейс SQL Console в ClickHouse Cloud" />

Вы можете использовать приведенный ниже SQL-запрос или изменить SQL в соответствии с вашими потребностями.

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

## Создание MQTT-сервиса в EMQX Cloud \{#create-an-mqtt-service-on-emqx-cloud\}

Создать выделенный MQTT-брокер в EMQX Cloud так же просто, всего в несколько кликов.

### Регистрация учётной записи \{#get-an-account\}

EMQX Cloud предоставляет 14-дневную бесплатную пробную версию как для стандартного, так и для профессионального развертывания для каждой учётной записи.

Перейдите на страницу [EMQX Cloud sign up](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите «Start free», чтобы зарегистрировать учётную запись, если вы впервые используете EMQX Cloud.

<Image img={emqx_cloud_sign_up} size="lg" border alt="Страница регистрации EMQX Cloud с формой регистрации" />

### Создание MQTT-кластера \{#create-an-mqtt-cluster\}

После входа в систему нажмите «Cloud console» в меню учётной записи, и вы увидите зелёную кнопку для создания нового развертывания.

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud, шаг 1 создания развертывания, показаны варианты развертывания" />

В этом руководстве мы будем использовать профессиональное развертывание, потому что только Pro-версия предоставляет функциональность интеграции данных, которая позволяет отправлять MQTT-данные напрямую в ClickHouse без единой строки кода.

Выберите Pro-версию, регион `N.Virginial` и нажмите `Create Now`. Всего через несколько минут вы получите полностью управляемый MQTT-брокер:

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud, шаг 2 создания развертывания, выбор региона" />

Теперь нажмите на панель, чтобы перейти на страницу кластера. На этой панели мониторинга вы увидите обзор вашего MQTT-брокера.

<Image img={emqx_cloud_overview} size="lg" border alt="Обзорная панель EMQX Cloud, показывающая метрики брокера" />

### Добавление учётных данных клиента \{#add-client-credential\}

EMQX Cloud по умолчанию не допускает анонимные подключения, поэтому вам нужно добавить учётные данные клиента, чтобы вы могли использовать MQTT-клиент для отправки данных этому брокеру.

Нажмите «Authentication &amp; ACL» в левом меню и выберите «Authentication» в подменю. Нажмите кнопку «Add» справа и задайте имя пользователя и пароль для последующего MQTT-подключения. Здесь мы будем использовать `emqx` и `xxxxxx` в качестве имени пользователя и пароля.

<Image img={emqx_cloud_auth} size="lg" border alt="Интерфейс настройки аутентификации EMQX Cloud для добавления учётных данных" />

Нажмите «Confirm», и теперь у нас есть полностью управляемый MQTT-брокер, готовый к работе.

### Включение NAT-шлюза \{#enable-nat-gateway\}

Прежде чем мы сможем начать настройку интеграции с ClickHouse, нам сначала нужно включить NAT-шлюз. По умолчанию MQTT-брокер развёрнут в приватном VPC, который не может отправлять данные в сторонние системы через общедоступную сеть.

Вернитесь на страницу «Overview» и прокрутите вниз до конца, где вы увидите виджет NAT Gateway. Нажмите кнопку «Subscribe» и следуйте инструкциям. Обратите внимание, что NAT Gateway — это дополнительный платный сервис, но он также предлагает 14-дневный бесплатный пробный период.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="Панель конфигурации NAT Gateway в EMQX Cloud" />

После его создания вы найдёте публичный IP-адрес в этом виджете. Обратите внимание, что если вы выбрали «Connect from a specific location» при настройке ClickHouse Cloud, вам нужно будет добавить этот IP-адрес в список разрешённых IP-адресов.

## Интеграция EMQX Cloud с ClickHouse Cloud \{#integration-emqx-cloud-with-clickhouse-cloud\}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используется для настройки правил обработки и реакции на потоки сообщений EMQX и события устройств. Data Integrations не только предоставляет понятное и гибкое «конфигурируемое» архитектурное решение, но также упрощает процесс разработки, повышает удобство использования и снижает степень связности между бизнес-системой и EMQX Cloud. Кроме того, он обеспечивает превосходную инфраструктуру для кастомизации проприетарных возможностей EMQX Cloud.

<Image img={emqx_cloud_data_integration} size="lg" border alt="Параметры EMQX Cloud Data Integration с доступными коннекторами" />

EMQX Cloud предлагает более 30 нативных интеграций с популярными системами данных. ClickHouse — одна из них.

<Image img={data_integration_clickhouse} size="lg" border alt="Информация о коннекторе EMQX Cloud ClickHouse Data Integration" />

### Создание ресурса ClickHouse \{#create-clickhouse-resource\}

Нажмите «Data Integrations» в левом меню и затем «View All Resources». Вы найдете ClickHouse в разделе Data Persistence или можете выполнить поиск по ClickHouse.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

* Note: добавьте примечание для этого ресурса.
* Server address: это адрес вашего сервиса ClickHouse Cloud, не забудьте указать порт.
* Database name: `emqx`, базу данных мы создали на предыдущих шагах.
* User: имя пользователя для подключения к вашему сервису ClickHouse Cloud.
* Key: пароль для подключения.

<Image img={data_integration_resource} size="lg" border alt="Форма настройки ресурса EMQX Cloud ClickHouse с параметрами подключения" />

### Создание нового правила \{#create-a-new-rule\}

Во время создания ресурса вы увидите всплывающее окно, и нажатие кнопки «New» перенаправит вас на страницу создания правила.

EMQX предоставляет мощный [движок правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может трансформировать и обогащать исходные MQTT-сообщения перед их отправкой во внешние системы.

Ниже приведено правило, используемое в этом руководстве:

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

Он будет читать сообщения из топика `temp_hum/emqx` и дополнять JSON-объект, добавляя в него client&#95;id, topic и timestamp.

Итак, исходный JSON, который вы отправляете в этот топик:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="Шаг 1 создания правила интеграции данных EMQX Cloud с отображением SQL-запроса" />

Вы можете использовать SQL‑тест, чтобы проверить запрос и увидеть результаты.

<Image img={data_integration_rule_2} size="md" border alt="Шаг 2 создания правила интеграции данных EMQX Cloud с отображением результатов теста" />

Теперь нажмите кнопку «NEXT». На этом шаге вы указываете EMQX Cloud, как записывать обработанные данные в вашу базу данных ClickHouse.

### Добавьте ответное действие \{#add-a-response-action\}

Если у вас только один ресурс, вам не нужно изменять «Resource» и «Action Type».
Вам нужно только задать SQL‑шаблон. Ниже приведён пример, используемый в этом руководстве:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="Настройка действия правила интеграции данных EMQX Cloud с использованием SQL-шаблона" />

Это шаблон для вставки данных в ClickHouse; здесь вы можете увидеть, как используются переменные.

### Просмотр сведений о правиле \{#view-rules-details\}

Нажмите «Confirm» и «View Details». Теперь всё должно быть корректно настроено. На странице сведений о правиле вы можете убедиться, что интеграция данных работает.

<Image img={data_integration_details} size="md" border alt="Сведения о правиле интеграции данных EMQX Cloud, показывающие сводное описание конфигурации" />

Все MQTT-сообщения, отправленные в топик `temp_hum/emqx`, будут сохранены в вашей базе данных ClickHouse Cloud.

## Сохранение данных в ClickHouse \{#saving-data-into-clickhouse\}

Мы будем имитировать данные о температуре и влажности и отправлять их в EMQX Cloud через MQTT X, а затем использовать EMQX Cloud Data Integrations для сохранения данных в ClickHouse Cloud.

<Image img={work_flow} size="lg" border alt="Диаграмма рабочего процесса EMQX Cloud to ClickHouse, показывающая поток данных" />

### Публикация MQTT‑сообщений в EMQX Cloud \{#publish-mqtt-messages-to-emqx-cloud\}

Вы можете использовать любой MQTT‑клиент или SDK для публикации сообщений. В этом руководстве мы будем использовать [MQTT X](https://mqttx.app/) — удобный MQTT‑клиент, предоставляемый EMQ.

<Image img={mqttx_overview} size="lg" border alt="Обзор MQTTX, показывающий интерфейс клиента" />

Нажмите «New Connection» в MQTTX и заполните форму подключения:

* Name: имя подключения. Можно указать любое удобное имя.
* Host: адрес подключения к MQTT‑брокеру. Его можно получить на странице обзора EMQX Cloud.
* Port: порт подключения MQTT‑брокера. Его можно получить на странице обзора EMQX Cloud.
* Username/Password: используйте созданные выше учетные данные, которые в этом руководстве должны быть `emqx` и `xxxxxx`.

<Image img={mqttx_new} size="lg" border alt="Форма настройки нового подключения MQTTX с параметрами подключения" />

Нажмите кнопку «Connect» в правом верхнем углу, после чего подключение должно установиться.

Теперь вы можете отправлять сообщения в MQTT‑брокер, используя этот инструмент.
Параметры ввода:

1. Установите формат полезной нагрузки в «JSON».
2. Установите топик: `temp_hum/emqx` (топик, который мы только что задали в правиле).
3. JSON‑тело:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить больше данных на MQTT‑брокер.

Данные, отправленные в EMQX Cloud, должны быть обработаны движком правил и автоматически вставлены в ClickHouse Cloud.

<Image img={mqttx_publish} size="lg" border alt="Интерфейс MQTTX Publish MQTT Messages с формированием сообщения" />

### Просмотр мониторинга правил \{#view-rules-monitoring\}

Проверьте мониторинг правил и убедитесь, что счётчик успешных срабатываний увеличился на единицу.

<Image img={rule_monitor} size="lg" border alt="Панель мониторинга EMQX Cloud Rule Monitoring, показывающая метрики обработки сообщений" />

### Проверка сохранённых данных \{#check-the-data-persisted\}

Теперь пришло время посмотреть на данные в ClickHouse Cloud. В идеале данные, которые вы отправляете с помощью MQTTX, попадут в EMQX Cloud и будут сохранены в базе данных ClickHouse Cloud с помощью встроенной интеграции данных.

Вы можете подключиться к SQL-консоли в панели ClickHouse Cloud или использовать любой клиентский инструмент, чтобы извлечь данные из вашего ClickHouse. В этом руководстве мы использовали SQL-консоль.
Выполнив SQL-запрос:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="Результаты запроса ClickHouse, демонстрирующие сохранённые данные IoT" />

### Итоги \{#summary\}

Вы не написали ни единой строки кода, а данные MQTT уже поступают из EMQX Cloud в ClickHouse Cloud. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой — вы можете сосредоточиться на разработке IoT‑приложений, пока данные надёжно хранятся в ClickHouse Cloud.
