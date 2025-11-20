---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'Введение в интеграцию EMQX с ClickHouse'
title: 'Интеграция EMQX с ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
keywords: ['интеграция EMQX с ClickHouse', 'MQTT-коннектор для ClickHouse', 'EMQX Cloud и ClickHouse', 'IoT-данные в ClickHouse', 'MQTT-брокер и ClickHouse']
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


# Интеграция EMQX и ClickHouse



## Подключение EMQX {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) — это MQTT-брокер с открытым исходным кодом, оснащённый высокопроизводительным движком обработки сообщений в реальном времени, который обеспечивает потоковую передачу событий для IoT-устройств в массовом масштабе. Как наиболее масштабируемый MQTT-брокер, EMQX позволяет подключать любые устройства в любом масштабе. Перемещайте и обрабатывайте данные IoT где угодно.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) — это продукт промежуточного ПО для обмена сообщениями MQTT в области IoT, размещённый компанией [EMQ](https://www.emqx.com/en). Как первый в мире полностью управляемый облачный сервис обмена сообщениями MQTT 5.0, EMQX Cloud предоставляет комплексное решение для эксплуатации и обслуживания, а также уникальную изолированную среду для служб обмена сообщениями MQTT. В эпоху Интернета вещей EMQX Cloud помогает быстро создавать отраслевые приложения для области IoT и легко собирать, передавать, обрабатывать и сохранять данные IoT.

Используя инфраструктуру облачных провайдеров, EMQX Cloud обслуживает десятки стран и регионов по всему миру, предоставляя экономичные, безопасные и надёжные облачные сервисы для приложений 5G и Интернета вещей.

<Image
  img={emqx_cloud_artitecture}
  size='lg'
  border
  alt='Диаграмма архитектуры EMQX Cloud, показывающая компоненты облачной инфраструктуры'
/>

### Предварительные требования {#assumptions}

- Вы знакомы с [протоколом MQTT](https://mqtt.org/), который разработан как чрезвычайно лёгкий транспортный протокол обмена сообщениями по модели публикация/подписка.
- Вы используете EMQX или EMQX Cloud в качестве движка обработки сообщений в реальном времени, обеспечивающего потоковую передачу событий для IoT-устройств в массовом масштабе.
- Вы подготовили экземпляр ClickHouse Cloud для сохранения данных устройств.
- Мы используем [MQTT X](https://mqttx.app/) в качестве инструмента тестирования MQTT-клиента для подключения к развёртыванию EMQX Cloud и публикации данных MQTT. Также подойдут и другие методы подключения к MQTT-брокеру.


## Получение сервиса ClickHouse Cloud {#get-your-clickhouse-cloudservice}

В рамках данной настройки мы развернули экземпляр ClickHouse на AWS в регионе Северная Виргиния (us-east-1), экземпляр EMQX Cloud также был развернут в том же регионе.

<Image
  img={clickhouse_cloud_1}
  size='sm'
  border
  alt='Интерфейс развертывания сервиса ClickHouse Cloud с выбором региона AWS'
/>

В процессе настройки необходимо также обратить внимание на параметры подключения. В данном руководстве мы выбираем вариант "Anywhere", но если вы указываете конкретное местоположение, необходимо добавить IP-адрес [NAT-шлюза](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html), полученный при развертывании EMQX Cloud, в белый список.

<Image
  img={clickhouse_cloud_2}
  size='sm'
  border
  alt='Настройки подключения ClickHouse Cloud с конфигурацией IP-доступа'
/>

Затем необходимо сохранить имя пользователя и пароль для дальнейшего использования.

<Image
  img={clickhouse_cloud_3}
  size='sm'
  border
  alt='Экран учетных данных ClickHouse Cloud с именем пользователя и паролем'
/>

После этого вы получите работающий экземпляр ClickHouse. Нажмите "Connect", чтобы получить адрес подключения к экземпляру ClickHouse Cloud.

<Image
  img={clickhouse_cloud_4}
  size='lg'
  border
  alt='Панель управления работающим экземпляром ClickHouse Cloud с опциями подключения'
/>

Нажмите "Connect to SQL Console", чтобы создать базу данных и таблицу для интеграции с EMQX Cloud.

<Image
  img={clickhouse_cloud_5}
  size='lg'
  border
  alt='Интерфейс SQL-консоли ClickHouse Cloud'
/>

Вы можете использовать следующий SQL-запрос или изменить его в соответствии с вашими требованиями.

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

<Image
  img={clickhouse_cloud_6}
  size='lg'
  border
  alt='Выполнение SQL-запроса создания базы данных и таблицы в ClickHouse Cloud'
/>


## Создание MQTT-сервиса в EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Создание выделенного MQTT-брокера в EMQX Cloud выполняется всего за несколько кликов.

### Регистрация учетной записи {#get-an-account}

EMQX Cloud предоставляет 14-дневный бесплатный пробный период как для стандартного, так и для профессионального развертывания для каждой учетной записи.

Перейдите на страницу [регистрации EMQX Cloud](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) и нажмите «Начать бесплатно», чтобы зарегистрировать учетную запись, если вы впервые используете EMQX Cloud.

<Image
  img={emqx_cloud_sign_up}
  size='lg'
  border
  alt='Страница регистрации EMQX Cloud с формой регистрации'
/>

### Создание MQTT-кластера {#create-an-mqtt-cluster}

После входа в систему нажмите «Cloud console» в меню учетной записи — вы увидите зеленую кнопку для создания нового развертывания.

<Image
  img={emqx_cloud_create_1}
  size='lg'
  border
  alt='EMQX Cloud: Создание развертывания, шаг 1, показывающий варианты развертывания'
/>

В этом руководстве мы будем использовать профессиональное развертывание, поскольку только версия Pro предоставляет функциональность интеграции данных, которая позволяет отправлять MQTT-данные напрямую в ClickHouse без единой строки кода.

Выберите версию Pro, укажите регион `N.Virginial` и нажмите `Create Now`. Всего за несколько минут вы получите полностью управляемый MQTT-брокер:

<Image
  img={emqx_cloud_create_2}
  size='lg'
  border
  alt='EMQX Cloud: Создание развертывания, шаг 2, показывающий выбор региона'
/>

Теперь нажмите на панель, чтобы перейти к представлению кластера. На этой панели управления вы увидите обзор вашего MQTT-брокера.

<Image
  img={emqx_cloud_overview}
  size='lg'
  border
  alt='Панель обзора EMQX Cloud, показывающая метрики брокера'
/>

### Добавление учетных данных клиента {#add-client-credential}

EMQX Cloud по умолчанию не разрешает анонимные подключения, поэтому необходимо добавить учетные данные клиента, чтобы использовать клиентский инструмент MQTT для отправки данных на этот брокер.

Нажмите «Authentication & ACL» в левом меню, затем нажмите «Authentication» в подменю. Нажмите кнопку «Add» справа и укажите имя пользователя и пароль для последующего MQTT-подключения. Здесь мы будем использовать `emqx` и `xxxxxx` в качестве имени пользователя и пароля.

<Image
  img={emqx_cloud_auth}
  size='lg'
  border
  alt='Интерфейс настройки аутентификации EMQX Cloud для добавления учетных данных'
/>

Нажмите «Confirm» — теперь у нас есть готовый полностью управляемый MQTT-брокер.

### Включение NAT-шлюза {#enable-nat-gateway}

Прежде чем приступить к настройке интеграции с ClickHouse, необходимо сначала включить NAT-шлюз. По умолчанию MQTT-брокер развертывается в частной VPC, которая не может отправлять данные в сторонние системы через публичную сеть.

Вернитесь на страницу обзора и прокрутите вниз до конца страницы, где вы увидите виджет NAT-шлюза. Нажмите кнопку Subscribe и следуйте инструкциям. Обратите внимание, что NAT Gateway — это дополнительная платная услуга, но она также предлагает 14-дневный бесплатный пробный период.

<Image
  img={emqx_cloud_nat_gateway}
  size='lg'
  border
  alt='Панель конфигурации NAT-шлюза EMQX Cloud'
/>

После создания вы найдете публичный IP-адрес в виджете. Обратите внимание: если вы выбрали «Connect from a specific location» при настройке ClickHouse Cloud, вам необходимо будет добавить этот IP-адрес в белый список.


## Интеграция EMQX Cloud с ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) используется для настройки правил обработки потоков сообщений EMQX и событий устройств. Data Integrations не только предоставляет понятное и гибкое конфигурируемое архитектурное решение, но также упрощает процесс разработки, повышает удобство использования и снижает степень связанности между бизнес-системой и EMQX Cloud. Кроме того, он обеспечивает превосходную инфраструктуру для настройки собственных возможностей EMQX Cloud.

<Image
  img={emqx_cloud_data_integration}
  size='lg'
  border
  alt='Параметры интеграции данных EMQX Cloud с доступными коннекторами'
/>

EMQX Cloud предлагает более 30 встроенных интеграций с популярными системами данных. ClickHouse — одна из них.

<Image
  img={data_integration_clickhouse}
  size='lg'
  border
  alt='Детали коннектора интеграции данных EMQX Cloud с ClickHouse'
/>

### Создание ресурса ClickHouse {#create-clickhouse-resource}

Нажмите «Data Integrations» в левом меню, затем нажмите «View All Resources». Вы найдете ClickHouse в разделе Data Persistence или можете воспользоваться поиском.

Нажмите на карточку ClickHouse, чтобы создать новый ресурс.

- Note: добавьте примечание для этого ресурса.
- Server address: адрес вашего сервиса ClickHouse Cloud, не забудьте указать порт.
- Database name: `emqx` — база данных, созданная на предыдущих шагах.
- User: имя пользователя для подключения к вашему сервису ClickHouse Cloud.
- Key: пароль для подключения.

<Image
  img={data_integration_resource}
  size='lg'
  border
  alt='Форма настройки ресурса ClickHouse в EMQX Cloud с параметрами подключения'
/>

### Создание нового правила {#create-a-new-rule}

При создании ресурса появится всплывающее окно, и нажатие кнопки «New» откроет страницу создания правила.

EMQX предоставляет мощный [механизм правил](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html), который может преобразовывать и обогащать исходные MQTT-сообщения перед отправкой в сторонние системы.

Вот правило, используемое в этом руководстве:

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

Оно будет читать сообщения из топика `temp_hum/emqx` и обогащать JSON-объект, добавляя информацию о client_id, topic и timestamp.

Таким образом, исходный JSON, который вы отправляете в топик:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image
  img={data_integration_rule_1}
  size='md'
  border
  alt='Шаг 1 создания правила интеграции данных EMQX Cloud с SQL-запросом'
/>

Вы можете использовать тестирование SQL для проверки и просмотра результатов.

<Image
  img={data_integration_rule_2}
  size='md'
  border
  alt='Шаг 2 создания правила интеграции данных EMQX Cloud с результатами тестирования'
/>

Теперь нажмите кнопку «NEXT». На этом шаге нужно указать EMQX Cloud, как вставлять обработанные данные в вашу базу данных ClickHouse.

### Добавление действия-ответа {#add-a-response-action}

Если у вас только один ресурс, вам не нужно изменять «Resource» и «Action Type».
Вам нужно только задать SQL-шаблон. Вот пример, используемый в этом руководстве:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image
  img={data_integration_rule_action}
  size='md'
  border
  alt='Настройка действия правила интеграции данных EMQX Cloud с SQL-шаблоном'
/>

Это шаблон для вставки данных в ClickHouse, в котором используются переменные.

### Просмотр деталей правила {#view-rules-details}

Нажмите «Confirm» и «View Details». Теперь всё должно быть настроено правильно. Вы можете увидеть работу интеграции данных на странице деталей правила.

<Image
  img={data_integration_details}
  size='md'
  border
  alt='Детали правила интеграции данных EMQX Cloud с сводкой конфигурации'
/>

Все MQTT-сообщения, отправленные в топик `temp_hum/emqx`, будут сохранены в вашей базе данных ClickHouse Cloud.


## Сохранение данных в ClickHouse {#saving-data-into-clickhouse}

Мы смоделируем данные температуры и влажности и отправим их в EMQX Cloud через MQTT X, а затем используем интеграцию данных EMQX Cloud для сохранения данных в ClickHouse Cloud.

<Image
  img={work_flow}
  size='lg'
  border
  alt='Диаграмма рабочего процесса передачи данных из EMQX Cloud в ClickHouse'
/>

### Публикация MQTT-сообщений в EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

Для публикации сообщений можно использовать любой MQTT-клиент или SDK. В этом руководстве мы будем использовать [MQTT X](https://mqttx.app/) — удобное клиентское приложение MQTT от EMQ.

<Image
  img={mqttx_overview}
  size='lg'
  border
  alt='Обзор MQTTX с интерфейсом клиента'
/>

Нажмите «New Connection» в MQTTX и заполните форму подключения:

- Name: Имя подключения. Используйте любое имя на ваш выбор.
- Host: Адрес подключения к MQTT-брокеру. Его можно найти на странице обзора EMQX Cloud.
- Port: Порт подключения к MQTT-брокеру. Его можно найти на странице обзора EMQX Cloud.
- Username/Password: Используйте учетные данные, созданные ранее. В этом руководстве это должны быть `emqx` и `xxxxxx`.

<Image
  img={mqttx_new}
  size='lg'
  border
  alt='Форма настройки нового подключения MQTTX с параметрами подключения'
/>

Нажмите кнопку «Connect» в правом верхнем углу — подключение должно быть установлено.

Теперь вы можете отправлять сообщения в MQTT-брокер с помощью этого инструмента.
Параметры:

1. Установите формат полезной нагрузки «JSON».
2. Укажите топик: `temp_hum/emqx` (топик, который мы только что задали в правиле)
3. Тело JSON:

```bash
{"temp": 23.1, "hum": 0.68}
```

Нажмите кнопку отправки справа. Вы можете изменить значение температуры и отправить дополнительные данные в MQTT-брокер.

Данные, отправленные в EMQX Cloud, должны быть обработаны движком правил и автоматически вставлены в ClickHouse Cloud.

<Image
  img={mqttx_publish}
  size='lg'
  border
  alt='Интерфейс публикации MQTT-сообщений в MQTTX с формой составления сообщения'
/>

### Просмотр мониторинга правил {#view-rules-monitoring}

Проверьте мониторинг правил — счетчик успешных операций должен увеличиться на единицу.

<Image
  img={rule_monitor}
  size='lg'
  border
  alt='Панель мониторинга правил EMQX Cloud с метриками обработки сообщений'
/>

### Проверка сохраненных данных {#check-the-data-persisted}

Теперь пора проверить данные в ClickHouse Cloud. В идеале данные, отправленные через MQTTX, должны поступить в EMQX Cloud и сохраниться в базе данных ClickHouse Cloud с помощью встроенной интеграции данных.

Вы можете подключиться к SQL-консоли на панели ClickHouse Cloud или использовать любой клиентский инструмент для получения данных из ClickHouse. В этом руководстве мы использовали SQL-консоль.
Выполните SQL-запрос:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image
  img={clickhouse_result}
  size='lg'
  border
  alt='Результаты запроса ClickHouse с сохраненными IoT-данными'
/>

### Резюме {#summary}

Вы не написали ни строчки кода, а данные MQTT уже перемещаются из EMQX Cloud в ClickHouse Cloud. С EMQX Cloud и ClickHouse Cloud вам не нужно управлять инфраструктурой — просто сосредоточьтесь на разработке IoT-приложений, а данные будут надежно храниться в ClickHouse Cloud.
