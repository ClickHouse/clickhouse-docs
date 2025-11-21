---
sidebar_label: 'Использование HTTP-интерфейса'
slug: /integrations/azure-data-factory/http-interface
description: 'Использование HTTP-интерфейса ClickHouse для загрузки данных из Azure Data Factory в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: 'Использование HTTP-интерфейса ClickHouse для загрузки данных из Azure в ClickHouse'
doc_type: 'guide'
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


# Использование HTTP-интерфейса ClickHouse в Azure Data Factory {#using-clickhouse-http-interface-in-azure-data-factory}

[Табличная функция `azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
— это быстрый и удобный способ загрузки данных из Azure Blob Storage в
ClickHouse. Однако её использование не всегда подходит по следующим причинам:

- Ваши данные могут храниться не в Azure Blob Storage — например, они могут находиться в Azure SQL Database, Microsoft SQL Server или Cosmos DB.
- Политики безопасности могут полностью запрещать внешний доступ к Blob Storage
  — например, если учётная запись хранилища заблокирована и не имеет публичной конечной точки.

В таких сценариях можно использовать Azure Data Factory совместно с
[HTTP-интерфейсом ClickHouse](https://clickhouse.com/docs/interfaces/http)
для отправки данных из сервисов Azure в ClickHouse.

Этот метод меняет направление потока данных: вместо того чтобы ClickHouse извлекал данные из
Azure, Azure Data Factory отправляет данные в ClickHouse. Этот подход
обычно требует, чтобы экземпляр ClickHouse был доступен из публичного
интернета.

:::info
Можно избежать открытия экземпляра ClickHouse в интернет, используя
Self-hosted Integration Runtime в Azure Data Factory. Эта конфигурация позволяет
передавать данные по частной сети. Однако это выходит за рамки данной
статьи. Дополнительную информацию можно найти в официальном руководстве:
[Создание и настройка локальной среды выполнения интеграции](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::


## Превращение ClickHouse в REST-сервис {#turning-clickhouse-to-a-rest-service}

Azure Data Factory поддерживает отправку данных во внешние системы по HTTP в формате JSON. Эту возможность можно использовать для вставки данных непосредственно в ClickHouse
с помощью [HTTP-интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http).
Подробнее см. в [документации по HTTP-интерфейсу
ClickHouse](https://clickhouse.com/docs/interfaces/http).

Для данного примера необходимо только указать целевую таблицу, определить
формат входных данных как JSON и включить параметры для более гибкого разбора
временных меток.

```sql
INSERT INTO my_table
SETTINGS
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

Чтобы отправить этот запрос как часть HTTP-запроса, достаточно передать его в виде
URL-кодированной строки в параметр query конечной точки ClickHouse:

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory может выполнить это кодирование автоматически с помощью встроенной
функции `encodeUriComponent`, поэтому делать это вручную не требуется.
:::

Теперь можно отправлять данные в формате JSON на этот URL. Данные должны соответствовать
структуре целевой таблицы. Ниже приведён простой пример с использованием curl для
таблицы с тремя столбцами: `col_1`, `col_2` и `col_3`.

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

Также можно отправлять массив JSON-объектов или JSON Lines (JSON-объекты,
разделённые переводом строки). Azure Data Factory использует формат массива JSON, который
отлично работает с форматом ввода `JSONEachRow` в ClickHouse.

Как видно, для этого шага не требуется выполнять какие-либо специальные действия на стороне ClickHouse. HTTP-интерфейс уже предоставляет всё необходимое для работы в качестве
REST-подобной конечной точки — дополнительная настройка не требуется.

Теперь, когда ClickHouse настроен для работы как REST-конечная точка, можно
настроить Azure Data Factory для её использования.

На следующих шагах будет создан экземпляр Azure Data Factory, настроена связанная
служба (Linked Service) для экземпляра ClickHouse, определён набор данных (Dataset) для
[приёмника REST](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
и создано действие копирования данных (Copy Data activity) для отправки данных из Azure в ClickHouse.


## Создание экземпляра Azure Data Factory {#create-an-azure-data-factory-instance}

Данное руководство предполагает, что у вас есть доступ к учетной записи Microsoft Azure и вы
уже настроили подписку и группу ресурсов. Если у вас уже настроен
Azure Data Factory, вы можете пропустить этот шаг
и перейти к следующему, используя существующий сервис.

1. Войдите на [портал Microsoft Azure](https://portal.azure.com/) и нажмите
   **Create a resource**.

   <Image img={azureHomePage} size='lg' alt='Домашняя страница портала Azure' border />

2. На панели категорий слева выберите **Analytics**, затем нажмите
   **Data Factory** в списке популярных сервисов.

   <Image
     img={azureNewResourceAnalytics}
     size='lg'
     alt='Новый ресурс на портале Azure'
     border
   />

3. Выберите подписку и группу ресурсов, введите имя для нового экземпляра
   Data Factory, выберите регион и оставьте версию V2.

   <Image
     img={azureNewDataFactory}
     size='lg'
     alt='Новый Data Factory на портале Azure'
     border
   />

4. Нажмите **Review + Create**, затем нажмите **Create** для запуска развертывания.

   <Image
     img={azureNewDataFactoryConfirm}
     size='lg'
     alt='Подтверждение создания нового Data Factory на портале Azure'
     border
   />

   <Image
     img={azureNewDataFactorySuccess}
     size='lg'
     alt='Успешное создание нового Data Factory на портале Azure'
     border
   />

После успешного завершения развертывания вы можете начать использовать новый экземпляр
Azure Data Factory.


## Создание новой связанной службы на основе REST {#-creating-new-rest-based-linked-service}

1. Войдите на портал Microsoft Azure и откройте экземпляр Data Factory.

   <Image
     img={azureHomeWithDataFactory}
     size='lg'
     alt='Домашняя страница портала Azure с Data Factory'
     border
   />

2. На странице обзора Data Factory нажмите **Launch Studio**.

   <Image
     img={azureDataFactoryPage}
     size='lg'
     alt='Страница Data Factory на портале Azure'
     border
   />

3. В меню слева выберите **Manage**, затем перейдите в **Linked services**
   и нажмите **+ New**, чтобы создать новую связанную службу.

   <Image
     img={adfCreateLinkedServiceButton}
     size='lg'
     alt='Кнопка создания новой связанной службы в Azure Data Factory'
     border
   />

4. В **строке поиска новой связанной службы** введите **REST**, выберите **REST** и нажмите **Continue**,
   чтобы создать экземпляр [коннектора REST](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest).

   <Image
     img={adfNewLinkedServiceSearch}
     size='lg'
     alt='Поиск новой связанной службы в Azure Data Factory'
     border
   />

5. В панели конфигурации связанной службы введите имя для новой службы,
   нажмите на поле **Base URL**, затем нажмите **Add dynamic content** (эта ссылка
   появляется только при выборе поля).

   <Image
     img={adfNewLinedServicePane}
     size='lg'
     alt='Панель новой связанной службы'
     border
   />

6. В панели динамического содержимого можно создать параметризованный URL, который
   позволит определить запрос позже при создании наборов данных для различных
   таблиц — это делает связанную службу переиспользуемой.

   <Image
     img={adfNewLinkedServiceBaseUrlEmpty}
     size='lg'
     alt='Пустое поле базового URL новой связанной службы'
     border
   />

7. Нажмите **«+»** рядом с полем фильтра и добавьте новый параметр, назовите его
   `pQuery`, установите тип String и задайте значение по умолчанию `SELECT 1`.
   Нажмите **Save**.

   <Image
     img={adfNewLinkedServiceParams}
     size='lg'
     alt='Параметры новой связанной службы'
     border
   />

8. В поле выражения введите следующее и нажмите **OK**. Замените
   `your-clickhouse-url.com` на фактический адрес вашего экземпляра ClickHouse.

   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```

   <Image
     img={adfNewLinkedServiceExpressionFieldFilled}
     size='lg'
     alt='Заполненное поле выражения новой связанной службы'
     border
   />

9. Вернувшись в основную форму, выберите Basic authentication, введите имя пользователя и
   пароль для подключения к HTTP-интерфейсу ClickHouse, нажмите **Test
   connection**. Если всё настроено правильно, вы увидите сообщение об успешном подключении.

   <Image
     img={adfNewLinkedServiceCheckConnection}
     size='lg'
     alt='Проверка подключения новой связанной службы'
     border
   />

10. Нажмите **Create**, чтобы завершить настройку.
    <Image
      img={adfLinkedServicesList}
      size='lg'
      alt='Список связанных служб'
      border
    />

Теперь вы должны увидеть вашу новую зарегистрированную связанную службу на основе REST в списке.


## Создание нового набора данных для HTTP-интерфейса ClickHouse {#creating-a-new-dataset-for-the-clickhouse-http-interface}

Теперь, когда у нас настроена связанная служба для HTTP-интерфейса ClickHouse,
мы можем создать набор данных, который Azure Data Factory будет использовать для отправки данных в
ClickHouse.

В этом примере мы вставим небольшую часть [данных датчиков окружающей среды](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

1. Откройте консоль запросов ClickHouse на ваш выбор — это может быть
   веб-интерфейс ClickHouse Cloud, CLI-клиент или любой другой интерфейс, который вы используете для
   выполнения запросов — и создайте целевую таблицу:

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

2. В Azure Data Factory Studio выберите Author на левой панели. Наведите курсор
   на элемент Dataset, нажмите на значок с тремя точками и выберите New dataset.

   <Image img={adfNewDatasetItem} size='lg' alt='New Dataset Item' border />

3. В строке поиска введите **REST**, выберите **REST** и нажмите **Continue**.
   Введите имя для вашего набора данных и выберите **связанную службу**, которую вы создали
   на предыдущем шаге. Нажмите **OK**, чтобы создать набор данных.

   <Image img={adfNewDatasetPage} size='lg' alt='New Dataset Page' border />

4. Теперь вы должны увидеть ваш только что созданный набор данных в разделе Datasets
   на панели Factory Resources слева. Выберите набор данных, чтобы
   открыть его свойства. Вы увидите параметр `pQuery`, который был определён в
   связанной службе. Нажмите на текстовое поле **Value**. Затем нажмите **Add dynamic
   content**.

   <Image
     img={adfNewDatasetProperties}
     size='lg'
     alt='New Dataset Properties'
     border
   />

5. На открывшейся панели вставьте следующий запрос:

   ```sql
   INSERT INTO sensors
   SETTINGS
       date_time_input_format=''best_effort'',
       input_format_json_read_objects_as_strings=1
   FORMAT JSONEachRow
   ```

   :::danger
   Все одинарные кавычки `'` в запросе должны быть заменены на две одинарные кавычки
   `''`. Это требование парсера выражений Azure Data Factory. Если вы
   не экранируете их, вы можете не увидеть ошибку сразу — но это приведёт к сбою
   позже, когда вы попытаетесь использовать или сохранить набор данных. Например, `'best_effort'`
   должно быть записано как `''best_effort''`.
   :::

   <Image img={adfNewDatasetQuery} size='xl' alt='New Dataset Query' border />

6. Нажмите OK, чтобы сохранить выражение. Нажмите Test connection. Если всё
   настроено правильно, вы увидите сообщение Connection successful. Нажмите Publish
   all в верхней части страницы, чтобы сохранить изменения.
   <Image
     img={adfNewDatasetConnectionSuccessful}
     size='xl'
     alt='New Dataset Connection Successful'
     border
   />

### Настройка примера набора данных {#setting-up-an-example-dataset}

В этом примере мы не будем использовать полный набор данных датчиков окружающей среды, а
только небольшое подмножество, доступное по адресу
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv).

:::info
Чтобы сохранить фокус этого руководства, мы не будем подробно описывать точные шаги по созданию
исходного набора данных в Azure Data Factory. Вы можете загрузить образцы данных в любой
сервис хранения на ваш выбор — например, Azure Blob Storage, Microsoft SQL
Server или даже в другой формат файла, поддерживаемый Azure Data Factory.
:::

Загрузите набор данных в ваше хранилище Azure Blob Storage (или другой предпочитаемый сервис
хранения). Затем в Azure Data Factory Studio перейдите на панель Factory Resources.
Создайте новый набор данных, который указывает на загруженные данные. Нажмите Publish all, чтобы
сохранить изменения.


## Создание действия копирования для передачи данных в ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

Теперь, когда мы настроили входные и выходные наборы данных, можно настроить
действие **Copy Data** для передачи данных из нашего примера набора данных в
таблицу `sensors` в ClickHouse.

1. Откройте **Azure Data Factory Studio**, перейдите на вкладку **Author**. На панели
   **Factory Resources** наведите курсор на **Pipeline**, нажмите на значок с тремя точками
   и выберите **New pipeline**.

   <Image
     img={adfNewPipelineItem}
     size='lg'
     alt='Новый элемент конвейера ADF'
     border
   />

2. На панели **Activities** разверните раздел **Move and transform** и
   перетащите действие **Copy data** на холст.

   <Image img={adfNewCopyDataItem} size='lg' alt='Новый элемент Copy Data' border />

3. Выберите вкладку **Source** и укажите исходный набор данных, созданный ранее.

   <Image img={adfCopyDataSource} size='lg' alt='Источник Copy Data' border />

4. Перейдите на вкладку **Sink** и выберите набор данных ClickHouse, созданный для
   таблицы sensors. Установите **Request method** в значение POST. Убедитесь, что **HTTP compression
   type** установлен в значение **None**.
   :::warning
   HTTP-сжатие работает некорректно в действии Copy Data в Azure Data Factory.
   При включении Azure отправляет полезную нагрузку, состоящую только из нулевых байтов
   — вероятно, это ошибка в сервисе. Обязательно оставьте сжатие отключенным.
   :::
   :::info
   Рекомендуется сохранить размер пакета по умолчанию, равный 10 000, или даже увеличить его.
   Для получения дополнительной информации см.
   [Выбор стратегии вставки / Пакетные вставки при синхронном режиме](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous).
   :::

   <Image
     img={adfCopyDataSinkSelectPost}
     size='lg'
     alt='Выбор POST для приемника Copy Data'
     border
   />

5. Нажмите **Debug** в верхней части холста, чтобы запустить конвейер. После короткого
   ожидания действие будет поставлено в очередь и выполнено. Если всё настроено
   правильно, задача должна завершиться со статусом **Success**.

   <Image
     img={adfCopyDataDebugSuccess}
     size='lg'
     alt='Успешная отладка Copy Data'
     border
   />

6. После завершения нажмите **Publish all**, чтобы сохранить изменения конвейера и набора данных.


## Дополнительные ресурсы {#additional-resources-1}

- [HTTP-интерфейс](https://clickhouse.com/docs/interfaces/http)
- [Копирование и преобразование данных из конечной точки REST и в неё с помощью Azure Data Factory](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Выбор стратегии вставки](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [Создание и настройка локальной среды выполнения интеграции](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
