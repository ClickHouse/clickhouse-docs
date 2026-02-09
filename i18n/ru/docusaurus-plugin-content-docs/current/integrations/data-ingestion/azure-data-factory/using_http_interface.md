---
sidebar_label: 'Использование HTTP-интерфейса'
slug: /integrations/azure-data-factory/http-interface
description: 'Использование HTTP-интерфейса ClickHouse для загрузки данных из Azure Data Factory в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'данные', 'http-интерфейс']
title: 'Использование HTTP-интерфейса ClickHouse для загрузки данных Azure в ClickHouse'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';

import azureHomePage                            from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-page.png';
import azureNewResourceAnalytics                from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-resource-analytics.png';
import azureNewDataFactory                      from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory.png';
import azureNewDataFactoryConfirm               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-confirm.png';
import azureNewDataFactorySuccess               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-success.png';
import azureHomeWithDataFactory                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-with-data-factory.png';
import azureDataFactoryPage                     from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-factory-page.png';
import adfCreateLinkedServiceButton             from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-create-linked-service-button.png';
import adfNewLinkedServiceSearch                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-search.png';
import adfNewLinedServicePane                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-lined-service-pane.png';
import adfNewLinkedServiceBaseUrlEmpty          from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-base-url-empty.png';
import adfNewLinkedServiceParams                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-params.png';
import adfNewLinkedServiceExpressionFieldFilled from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-expression-field-filled.png';
import adfNewLinkedServiceCheckConnection       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-check-connection.png';
import adfLinkedServicesList                    from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-linked-services-list.png';
import adfNewDatasetItem                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-item.png';
import adfNewDatasetPage                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-page.png';
import adfNewDatasetProperties                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-properties.png';
import adfNewDatasetQuery                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-query.png';
import adfNewDatasetConnectionSuccessful        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-connection-successful.png';
import adfNewPipelineItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-pipeline-item.png';
import adfNewCopyDataItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-copy-data-item.png';
import adfCopyDataSource                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-source.png';
import adfCopyDataSinkSelectPost                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-sink-select-post.png';
import adfCopyDataDebugSuccess                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-debug-success.png';

# Использование HTTP-интерфейса ClickHouse в Azure Data Factory \{#using-clickhouse-http-interface-in-azure-data-factory\}

Табличная функция [`azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
— это быстрый и удобный способ организовать приём данных из Azure Blob Storage в
ClickHouse. Однако её использование может быть не всегда подходящим по следующим причинам:

- Ваши данные могут не храниться в Azure Blob Storage — например, они могут находиться в Azure SQL Database, Microsoft SQL Server или Cosmos DB.
- Политики безопасности могут полностью запрещать внешний доступ к Blob Storage — например, если учётная запись хранилища заблокирована и не имеет общедоступной конечной точки.

В таких сценариях вы можете использовать Azure Data Factory вместе с
[HTTP-интерфейсом ClickHouse](https://clickhouse.com/docs/interfaces/http),
чтобы отправлять данные из сервисов Azure в ClickHouse.

Этот метод меняет направление потока: вместо того чтобы ClickHouse забирал данные из
Azure, Azure Data Factory отправляет данные в ClickHouse. Такой подход
обычно требует, чтобы ваш экземпляр ClickHouse был доступен из публичного
интернета.

:::info
Можно избежать открытия экземпляра ClickHouse в интернет,
используя Self-hosted Integration Runtime в Azure Data Factory. Такая конфигурация
позволяет передавать данные по частной сети. Однако это выходит за рамки
данной статьи. Более подробную информацию можно найти в официальном руководстве:
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## Превращение ClickHouse в REST‑сервис \{#turning-clickhouse-to-a-rest-service\}

Azure Data Factory поддерживает отправку данных во внешние системы по HTTP в
формате JSON. Мы можем использовать эту возможность, чтобы вставлять данные
непосредственно в ClickHouse с помощью [HTTP‑интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http).
Подробнее об этом можно узнать в [документации по HTTP‑интерфейсу
ClickHouse](https://clickhouse.com/docs/interfaces/http).

В этом примере нам нужно только указать целевую таблицу, задать формат входных
данных как JSON и включить параметры, позволяющие более гибко разбирать
временные метки.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

Чтобы отправить этот запрос как часть HTTP-запроса, просто передайте его
в виде URL-кодированной строки в параметр `query` вашей конечной точки ClickHouse:

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory может автоматически выполнять это кодирование с помощью
встроенной функции `encodeUriComponent`, поэтому вам не нужно делать это вручную.
:::

Теперь вы можете отправлять данные в формате JSON на этот URL-адрес. Структура данных
должна соответствовать структуре таблицы назначения. Ниже приведён простой пример
с использованием утилиты curl для таблицы с тремя столбцами: `col_1`, `col_2` и `col_3`.

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

Вы также можете отправлять JSON-массив объектов или JSON Lines (JSON-объекты,
разделённые символом новой строки). Azure Data Factory использует формат JSON-массива,
который отлично работает с форматом ввода `JSONEachRow` в ClickHouse.

Как видите, на этом шаге вам не нужно делать ничего особенного на стороне
ClickHouse. HTTP-интерфейс уже предоставляет всё необходимое, чтобы выступать
в роли REST-подобной конечной точки — дополнительная конфигурация не требуется.

Теперь, когда мы настроили ClickHouse так, чтобы он работал как REST-эндпоинт, пора
настроить Azure Data Factory для его использования.

На следующих шагах мы создадим экземпляр Azure Data Factory, настроим Linked
Service к вашему экземпляру ClickHouse, определим Dataset для
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
и создадим действие Copy Data для отправки данных из Azure в ClickHouse.


## Создание экземпляра Azure Data Factory \{#create-an-azure-data-factory-instance\}

В этом руководстве предполагается, что у вас есть доступ к учетной записи Microsoft Azure
и уже настроены подписка и группа ресурсов. Если Azure Data Factory у вас
уже настроен, вы можете пропустить этот шаг и перейти к следующему,
используя существующий сервис.

1. Войдите в [Microsoft Azure Portal](https://portal.azure.com/) и нажмите
   **Create a resource**.
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. В области **Categories** слева выберите **Analytics**, затем в списке популярных сервисов
   нажмите **Data Factory**.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. Выберите свою подписку и группу ресурсов, введите имя для нового экземпляра
   Data Factory, выберите регион и оставьте версию V2.
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. Нажмите **Review + Create**, затем нажмите **Create**, чтобы запустить развертывание.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

После успешного завершения развертывания вы можете начать использовать новый экземпляр
Azure Data Factory.

## Создание новой связанной службы на основе REST \{#-creating-new-rest-based-linked-service\}

1. Войдите в Microsoft Azure Portal и откройте экземпляр Data Factory.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Главная страница Azure Portal с Data Factory" border/>

2. На странице обзора Data Factory нажмите **Launch Studio**.
   <Image img={azureDataFactoryPage} size="lg" alt="Страница Azure Portal Data Factory" border/>

3. В левом меню выберите **Manage**, затем перейдите в **Linked services**
   и нажмите **+ New**, чтобы создать новую связанную службу.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Кнопка создания новой связанной службы в Azure Data Factory" border/>

4. В **New linked service search bar** введите **REST**, выберите **REST** и нажмите **Continue**,
   чтобы создать экземпляр [REST-коннектора](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest).
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Поиск новой связанной службы в Azure Data Factory" border/>

5. В панели конфигурации связанной службы введите имя для новой службы,
   нажмите поле **Base URL**, затем нажмите **Add dynamic content** (эта ссылка
   появляется только при выделении поля).
   <Image img={adfNewLinedServicePane} size="lg" alt="Панель новой связанной службы" border/>

6. В панели динамического содержимого вы можете создать параметризованный URL,
   который позволит определить запрос позже при создании наборов данных для
   разных таблиц — это делает связанную службу повторно используемой.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="Новое поле Base Url связанной службы пустое" border/>

7. Нажмите **"+"** рядом с полем фильтра и добавьте новый параметр, назовите его
   `pQuery`, установите тип `String` и задайте значение по умолчанию `SELECT 1`.
   Нажмите **Save**.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="Параметры новой связанной службы" border/>

8. В поле выражения введите следующее и нажмите **OK**. Замените
   `your-clickhouse-url.com` фактическим адресом экземпляра ClickHouse.
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="Поле выражения новой связанной службы заполнено" border/>

9. Вернувшись в основную форму, выберите Basic authentication, введите имя
   пользователя и пароль, используемые для подключения к HTTP-интерфейсу ClickHouse,
   нажмите **Test connection**. Если всё настроено правильно, вы увидите сообщение
   об успешном подключении.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="Проверка подключения новой связанной службы" border/>

10. Нажмите **Create**, чтобы завершить настройку.
    <Image img={adfLinkedServicesList} size="lg" alt="Список связанных служб" border/>

Теперь в списке должна появиться вновь созданная связанная служба на основе REST.

## Создание нового набора данных для интерфейса ClickHouse HTTP \{#creating-a-new-dataset-for-the-clickhouse-http-interface\}

Теперь, когда у нас настроена связанная служба для интерфейса ClickHouse HTTP,
мы можем создать набор данных, который Azure Data Factory будет использовать для
отправки данных в ClickHouse.

В этом примере мы вставим небольшую часть [набора данных Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

1. Откройте консоль выполнения запросов ClickHouse на ваш выбор — это может
   быть веб-интерфейс ClickHouse Cloud, CLI‑клиент или любой другой интерфейс,
   который вы используете для выполнения запросов, — и создайте целевую таблицу:
   ```sql
   CREATE TABLE sensors
   (
       sensor_id UInt16,
       lat Float32,
       lon Float32,
       timestamp DateTime,
       temperature Float32
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, sensor_id);
   ```

2. В Azure Data Factory Studio выберите **Author** в левой панели. Наведите курсор
   на элемент **Dataset**, нажмите значок с тремя точками и выберите **New dataset**.
   <Image img={adfNewDatasetItem} size="lg" alt="Новый элемент набора данных" border/>

3. В строке поиска введите **REST**, выберите **REST** и нажмите **Continue**.
   Введите имя для набора данных и выберите **linked service**, созданную
   на предыдущем шаге. Нажмите **OK**, чтобы создать набор данных.
   <Image img={adfNewDatasetPage} size="lg" alt="Страница создания нового набора данных" border/>

4. Теперь вы должны увидеть вновь созданный набор данных в разделе **Datasets**
   в панели **Factory Resources** слева. Выберите набор данных, чтобы открыть его
   свойства. Вы увидите параметр `pQuery`, который был определён в linked
   service. Щёлкните текстовое поле **Value**, затем нажмите **Add dynamic**
   content.
   <Image img={adfNewDatasetProperties} size="lg" alt="Свойства нового набора данных" border/>

5. В открывшейся панели вставьте следующий запрос:
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   Все одинарные кавычки `'` в запросе должны быть заменены на две одинарные
   кавычки `''`. Это требуется парсером выражений Azure Data Factory. Если вы
   не экранируете их, вы можете сразу не увидеть ошибку — но позже произойдёт
   сбой, когда вы попытаетесь использовать или сохранить набор данных. Например,
   `'best_effort'` должно быть записано как `''best_effort''`.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="Запрос нового набора данных" border/>

6. Нажмите **OK**, чтобы сохранить выражение. Нажмите **Test connection**. Если всё
   настроено правильно, вы увидите сообщение **Connection successful**. Нажмите
   **Publish all** в верхней части страницы, чтобы сохранить изменения.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="Подключение нового набора данных успешно" border/>

### Настройка примерного набора данных \{#setting-up-an-example-dataset\}

В этом примере мы не будем использовать полный набор данных Environmental
Sensors Dataset, а только небольшой поднабор, доступный по ссылке
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv).

:::info
Чтобы сохранить фокус этого руководства, мы не будем рассматривать точные шаги
по созданию исходного набора данных в Azure Data Factory. Вы можете загрузить
пример данных в любой сервис хранения по вашему выбору — например, Azure Blob
Storage, Microsoft SQL Server или даже в другой формат файла, поддерживаемый
Azure Data Factory.
:::

Загрузите набор данных в Azure Blob Storage (или другой предпочитаемый сервис
хранения), затем в Azure Data Factory Studio перейдите к панели **Factory
Resources**. Создайте новый набор данных, указывающий на загруженные данные.
Нажмите **Publish all**, чтобы сохранить изменения.

## Создание действия Copy Data для передачи данных в ClickHouse \{#creating-the-copy-activity-to-transfer-data-to-clickhouse\}

Теперь, когда мы настроили и входной, и выходной наборы данных, мы можем
создать действие **Copy Data** для передачи данных из нашего примерного набора
данных в таблицу `sensors` в ClickHouse.

1. Откройте **Azure Data Factory Studio** и перейдите на вкладку **Author**. В
   области **Factory Resources** наведите указатель на **Pipeline**, нажмите
   значок с тремя точками и выберите **New pipeline**.
   <Image img={adfNewPipelineItem} size="lg" alt="Новый конвейер ADF" border/>

2. В области **Activities** разверните раздел **Move and transform** и
   перетащите действие **Copy data** на рабочую область.
   <Image img={adfNewCopyDataItem} size="lg" alt="Новый элемент Copy Data" border/>

3. Выберите вкладку **Source** и укажите исходный набор данных, созданный ранее.
   <Image img={adfCopyDataSource} size="lg" alt="Источник для Copy Data" border/>

4. Перейдите на вкладку **Sink** и выберите набор данных ClickHouse, созданный
   для вашей таблицы `sensors`. Установите **Request method** в значение POST.
   Убедитесь, что **HTTP compression type** имеет значение **None**.
   :::warning
   HTTP-сжатие работает некорректно в действии Copy Data в Azure Data Factory.
   При его включении Azure отправляет полезную нагрузку размером 0 байт — 
   вероятно, это ошибка в сервисе. Обязательно оставьте сжатие отключённым.
   :::
   :::info
   Рекомендуем оставить размер пакета по умолчанию — 10 000, или даже
   увеличить его. Подробности см. в разделе
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous).
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Выбор Sink для Copy Data с методом POST" border/>

5. Нажмите **Debug** в верхней части рабочей области, чтобы запустить
   конвейер. Через короткое время действие будет поставлено в очередь и
   выполнено. Если всё настроено корректно, задача должна завершиться со
   статусом **Success**.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Успешная отладка Copy Data" border/>

6. По завершении нажмите **Publish all**, чтобы сохранить изменения конвейера и наборов данных.

## Дополнительные ресурсы \{#additional-resources-1\}

- [HTTP-интерфейс](https://clickhouse.com/docs/interfaces/http)
- [Копирование и преобразование данных в и из конечной точки REST с помощью Azure Data Factory](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Выбор стратегии вставки](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [Создание и настройка локальной среды выполнения интеграции (self-hosted)](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)