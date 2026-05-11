---
sidebar_label: 'Использование HTTP-интерфейса'
slug: /integrations/azure-data-factory/http-interface
description: 'Использование HTTP-интерфейса ClickHouse для загрузки данных из Azure Data Factory в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'данные', 'http interface']
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
— это быстрый и удобный способ приёма данных из Azure Blob Storage в
ClickHouse. Однако её использование может подходить не всегда по следующим причинам:

- Ваши данные могут не храниться в Azure Blob Storage — например, они могут находиться в Azure SQL Database, Microsoft SQL Server или Cosmos DB.
- Политики безопасности могут полностью запрещать внешний доступ к Blob Storage — например, если учётная запись хранения заблокирована и не имеет общедоступной конечной точки.

В таких случаях вы можете использовать Azure Data Factory вместе с
[HTTP-интерфейсом ClickHouse](https://clickhouse.com/docs/interfaces/http),
чтобы отправлять данные из служб Azure в ClickHouse.

Этот метод инвертирует направление потока: вместо того чтобы ClickHouse забирал данные из
Azure, Azure Data Factory отправляет данные в ClickHouse. Такой подход
обычно требует, чтобы ваш экземпляр ClickHouse был доступен из публичной сети Интернет.

:::info
Можно избежать вывода вашего экземпляра ClickHouse в Интернет, используя
Self-hosted Integration Runtime службы Azure Data Factory. Эта конфигурация
позволяет передавать данные по частной сети. Однако она выходит за рамки
данной статьи. Дополнительную информацию вы можете найти в официальном руководстве:
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## Превращение ClickHouse в REST‑сервис \{#turning-clickhouse-to-a-rest-service\}

Azure Data Factory поддерживает отправку данных во внешние системы по HTTP в
формате JSON. Мы можем использовать эту возможность, чтобы напрямую загружать
данные в ClickHouse через [HTTP-интерфейс ClickHouse](https://clickhouse.com/docs/interfaces/http).
Подробнее об этом см. в [документации по HTTP-интерфейсу
ClickHouse](https://clickhouse.com/docs/interfaces/http).

В этом примере нам нужно только указать целевую таблицу, задать формат
входных данных как JSON и включить параметры, позволяющие более гибко разбирать
значения временных меток.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

Чтобы отправить этот запрос как часть HTTP‑запроса, просто передайте его как
URL‑кодированную строку в параметр `query` конечной точки ClickHouse:

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory может обрабатывать это кодирование автоматически с помощью
встроенной функции `encodeUriComponent`, поэтому вам не нужно выполнять его вручную.
:::

Теперь вы можете отправлять данные в формате JSON на этот URL-адрес. Структура данных
должна соответствовать структуре целевой таблицы. Вот простой пример с
использованием curl, предполагая, что у вас есть таблица с тремя столбцами: `col_1`, `col_2` и `col_3`.

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

Вы также можете отправлять JSON-массив объектов или JSON Lines (JSON-объекты,
разделённые переводом строки). Azure Data Factory использует формат JSON-массива,
который прекрасно работает с форматом ввода ClickHouse `JSONEachRow`.

Как видно, на этом шаге вам не нужно делать ничего особенного на стороне
ClickHouse. HTTP-интерфейс уже предоставляет всё необходимое, чтобы выступать
в роли REST-подобной конечной точки — дополнительная конфигурация не требуется.

Теперь, когда мы настроили ClickHouse так, чтобы он работал как REST-эндпоинт, пора
сконфигурировать Azure Data Factory для его использования.

На следующих шагах мы создадим экземпляр Azure Data Factory, настроим Linked
Service к вашему экземпляру ClickHouse, определим Dataset для
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
и создадим Copy Data activity для отправки данных из Azure в ClickHouse.


## Создание экземпляра Azure Data Factory \{#create-an-azure-data-factory-instance\}

В этом руководстве предполагается, что у вас есть доступ к учетной записи Microsoft Azure
и уже настроены подписка и группа ресурсов. Если у вас уже
настроен Azure Data Factory, вы можете пропустить этот шаг
и перейти к следующему, используя существующую службу.

1. Войдите в [Microsoft Azure Portal](https://portal.azure.com/) и нажмите
   **Create a resource**.
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. В области **Categories** слева выберите **Analytics**, затем в списке популярных служб
   нажмите **Data Factory**.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. Выберите подписку и группу ресурсов, введите имя для нового экземпляра Azure
   Data Factory, выберите регион и оставьте версию V2.
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. Нажмите **Review + Create**, затем нажмите **Create**, чтобы запустить развертывание.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

После успешного завершения развертывания вы можете начать использовать новый
экземпляр Azure Data Factory.

## Создание новой связанной службы на основе REST \{#-creating-new-rest-based-linked-service\}

1. Войдите в портал Microsoft Azure и откройте экземпляр Data Factory.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Главная страница портала Azure с Data Factory" border/>

2. На странице обзора Data Factory нажмите **Launch Studio**.
   <Image img={azureDataFactoryPage} size="lg" alt="Страница Azure Portal Data Factory" border/>

3. В меню слева выберите **Manage**, затем перейдите в **Linked services**
   и нажмите **+ New**, чтобы создать новую связанную службу.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Кнопка создания новой связанной службы в Azure Data Factory" border/>

4. В поле поиска **New linked service search bar** введите **REST**, выберите **REST** и нажмите **Continue**,
   чтобы создать экземпляр [коннектора REST](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest).
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Поиск новой связанной службы в Azure Data Factory" border/>

5. В области конфигурации связанной службы введите имя для новой службы,
   щёлкните по полю **Base URL**, затем нажмите **Add dynamic content** (эта ссылка
   появляется только при выделении поля).
   <Image img={adfNewLinedServicePane} size="lg" alt="Область создания новой связанной службы" border/>

6. В области динамического содержимого вы можете создать параметризованный URL,
   который позволит задать запрос позже при создании наборов данных для разных
   таблиц — это делает связанную службу многократно используемой.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="Пустое поле Base Url новой связанной службы" border/>

7. Нажмите **"+"** рядом с полем фильтра и добавьте новый параметр, назовите его
   `pQuery`, установите тип String и задайте значение по умолчанию `SELECT 1`.
   Нажмите **Save**.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="Параметры новой связанной службы" border/>

8. В поле выражения введите следующее и нажмите **OK**. Замените
   `your-clickhouse-url.com` на фактический адрес вашего экземпляра ClickHouse.
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="Поле выражения новой связанной службы заполнено" border/>

9. Вернувшись к основной форме, выберите Basic authentication, введите имя
   пользователя и пароль, используемые для подключения к HTTP-интерфейсу ClickHouse,
   нажмите **Test connection**. Если всё настроено правильно, вы увидите сообщение
   об успешном подключении.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="Проверка соединения новой связанной службы" border/>

10. Нажмите **Create**, чтобы завершить настройку.
    <Image img={adfLinkedServicesList} size="lg" alt="Список связанных служб" border/>

Теперь в списке должна отображаться вновь зарегистрированная связанная служба на основе REST.

## Создание нового набора данных для интерфейса ClickHouse HTTP \{#creating-a-new-dataset-for-the-clickhouse-http-interface\}

Теперь, когда у нас настроена связанная служба (linked service) для интерфейса ClickHouse HTTP,
мы можем создать набор данных, который Azure Data Factory будет использовать для отправки данных в
ClickHouse.

В этом примере мы вставим небольшой фрагмент [Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

1. Откройте консоль запросов ClickHouse по своему выбору — это может быть
   ClickHouse Cloud web UI, CLI-клиент или любой другой интерфейс, который вы используете для
   выполнения запросов, — и создайте целевую таблицу:
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

2. В Azure Data Factory Studio выберите раздел **Author** в левой панели. Наведите курсор
   на элемент **Dataset**, нажмите на значок с тремя точками и выберите **New dataset**.
   <Image img={adfNewDatasetItem} size="lg" alt="Новый элемент набора данных" border/>

3. В строке поиска введите **REST**, выберите **REST** и нажмите **Continue**.
   Введите имя для набора данных и выберите **linked service**, созданный
   на предыдущем шаге. Нажмите **OK**, чтобы создать набор данных.
   <Image img={adfNewDatasetPage} size="lg" alt="Страница создания нового набора данных" border/>

4. Теперь вы увидите вновь созданный набор данных в разделе **Datasets**
   на панели **Factory Resources** слева. Выберите набор данных, чтобы
   открыть его свойства. Вы увидите параметр `pQuery`, который был определён в
   связанной службе. Щёлкните по текстовому полю **Value**, затем нажмите **Add dynamic**
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
   Все одинарные кавычки `'` в запросе должны быть заменены на две одинарные кавычки
   `''`. Это требуется парсером выражений Azure Data Factory. Если вы
   не экранируете их, вы можете не увидеть ошибку сразу — но она возникнет
   позже, когда вы попытаетесь использовать или сохранить набор данных. Например, `'best_effort'`
   должно быть записано как `''best_effort''`.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="Запрос нового набора данных" border/>

6. Нажмите **OK**, чтобы сохранить выражение. Нажмите **Test connection**. Если всё
   настроено правильно, вы увидите сообщение «Connection successful». Нажмите **Publish
   all** в верхней части страницы, чтобы сохранить изменения.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="Успешное подключение нового набора данных" border/>

### Настройка примерного набора данных \{#setting-up-an-example-dataset\}

В этом примере мы не будем использовать полный Environmental Sensors Dataset, а
возьмём только небольшой поднабор, доступный по ссылке
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv).

:::info
Чтобы сосредоточиться на теме этого руководства, мы не будем подробно разбирать точные шаги по созданию
исходного набора данных в Azure Data Factory. Вы можете загрузить образец данных в любой
выбранный вами сервис хранения — например, Azure Blob Storage, Microsoft SQL
Server или даже в другой файловый формат, поддерживаемый Azure Data Factory.
:::

Загрузите набор данных в Azure Blob Storage (или другой предпочитаемый сервис
хранения), затем в Azure Data Factory Studio перейдите в панель Factory Resources.
Создайте новый набор данных, который ссылается на загруженные данные. Нажмите «Publish all»,
чтобы сохранить изменения.

## Создание действия Copy Data для передачи данных в ClickHouse \{#creating-the-copy-activity-to-transfer-data-to-clickhouse\}

Теперь, когда мы настроили входной и выходной наборы данных, можно создать
действие **Copy Data** для передачи данных из нашего примерного набора данных в
таблицу `sensors` в ClickHouse.

1. Откройте **Azure Data Factory Studio**, перейдите на вкладку **Author**. В
   панели **Factory Resources** наведите курсор на **Pipeline**, нажмите на
   значок с тремя точками и выберите **New pipeline**.
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. В панели **Activities** разверните раздел **Move and transform** и
   перетащите действие **Copy data** на рабочую область.
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. Выберите вкладку **Source** и укажите исходный набор данных, созданный ранее.
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. Перейдите на вкладку **Sink** и выберите набор данных ClickHouse, созданный для вашей
   таблицы `sensors`. Установите **Request method** в значение **POST**. Убедитесь, что
   **HTTP compression type** установлено в **None**.
   :::warning
   HTTP-сжатие работает некорректно в действии Copy Data сервиса Azure Data Factory.
   При его включении Azure отправляет полезную нагрузку нулевого размера —
   вероятно, это ошибка сервиса. Обязательно оставьте сжатие отключённым.
   :::
   :::info
   Мы рекомендуем оставить размер пакета по умолчанию 10 000 или даже увеличить его.
   Дополнительные сведения см. в разделе
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous).
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. Нажмите **Debug** в верхней части рабочей области, чтобы запустить конвейер.
   Через короткое время действие будет поставлено в очередь и выполнено. Если всё
   настроено правильно, задача должна завершиться со статусом **Success**.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. После завершения нажмите **Publish all**, чтобы сохранить изменения в конвейере и наборах данных.

## Дополнительные ресурсы \{#additional-resources-1\}

- [Интерфейс HTTP](https://clickhouse.com/docs/interfaces/http)
- [Копирование и преобразование данных из и в конечную точку REST с помощью Azure Data Factory](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Выбор стратегии вставки данных (Insert)](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [Создание и настройка локальной среды интеграции (self-hosted integration runtime)](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)