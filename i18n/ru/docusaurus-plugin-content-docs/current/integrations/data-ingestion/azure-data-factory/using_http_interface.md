---
sidebar_label: 'Использование HTTP интерфейса'
slug: /integrations/azure-data-factory/http-interface
description: 'Использование HTTP интерфейса ClickHouse для загрузки данных из Azure Data Factory в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: 'Использование HTTP интерфейса ClickHouse для загрузки данных Azure в ClickHouse'
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


# Использование HTTP интерфейса ClickHouse в Azure Data Factory {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` Табличная Функция](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
является быстрым и удобным способом загрузки данных из Azure Blob Storage в
ClickHouse. Однако, ее использование может не всегда подходить по следующим причинам:

- Ваши данные могут быть не сохранены в Azure Blob Storage — например, они могут находиться в Azure SQL Database, Microsoft SQL Server или Cosmos DB.
- Политики безопасности могут полностью запретить внешний доступ к Blob Storage — например, если учетная запись хранилища заблокирована и не имеет публичной конечной точки.

В таких сценариях вы можете использовать Azure Data Factory вместе с
[HTTP интерфейсом ClickHouse](https://clickhouse.com/docs/interfaces/http)
для отправки данных из сервисов Azure в ClickHouse.

Этот метод меняет поток: вместо того, чтобы ClickHouse получал данные из Azure,
Azure Data Factory отправляет данные в ClickHouse. Обычно требуется, чтобы ваша
инстанция ClickHouse была доступна из общественного интернета.

:::info
Можно избежать открытия вашей инстанции ClickHouse для интернета, используя
Azure Data Factory's Self-hosted Integration Runtime. Эта настройка позволяет
отправлять данные по частной сети. Однако это выходит за рамки данной статьи.
Вы можете найти более подробную информацию в официальном руководстве:
[Создание и конфигурация самостоятельно размещенного интеграционного
времени](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## Превращение ClickHouse в REST сервис {#turning-clickhouse-to-a-rest-service}

Azure Data Factory поддерживает отправку данных во внешние системы по HTTP в формате JSON.
Мы можем использовать эту возможность для вставки данных напрямую в ClickHouse
с помощью [HTTP интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http).
Вы можете узнать больше в [документации HTTP интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http).

В этом примере нам нужно всего лишь указать целевую таблицу, определить
формат входных данных как JSON и включить опции для более гибкого анализа
меток времени.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

Чтобы отправить этот запрос в качестве части HTTP запроса, вам просто нужно передать его как
URL-кодированную строку в параметре запроса вашего ClickHouse конечного пункта:
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory может обрабатывать это кодирование автоматически, используя
встроенную функцию `encodeUriComponent`, поэтому вам не нужно делать это вручную.
:::

Теперь вы можете отправить данные в формате JSON на этот URL. Данные должны соответствовать
структуре целевой таблицы. Вот простой пример с использованием curl, предполагая, что таблица
состояла из трех колонок: `col_1`, `col_2`, и `col_3`.
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

Вы также можете отправить массив объектов JSON или JSON Lines (разделенные новой строкой
JSON объекты). Azure Data Factory использует формат массива JSON, который отлично
соответствует `JSONEachRow` входу ClickHouse.

Как вы видите, для этого шага вам не нужно делать ничего особенного на стороне ClickHouse.
HTTP интерфейс уже предоставляет все необходимое для функционирования как
REST-подобный конечный пункт — дополнительная конфигурация не требуется.

Теперь, когда мы сделали ClickHouse похожим на REST конечный пункт, пора
настроить Azure Data Factory для его использования.

В следующих шагах мы создадим инстанцию Azure Data Factory, настроим Linked
Service для вашей инстанции ClickHouse, определим Dataset для
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest),
и создадим активность Копирование Данных для отправки данных из Azure в ClickHouse.

## Создание инстанции Azure Data Factory {#create-an-azure-data-factory-instance}

Данный руководстве предполагает, что у вас есть доступ к учетной записи Microsoft Azure и что вы
уже настроили подписку и группу ресурсов. Если у вас уже есть настроенный Azure Data Factory,
то вы можете безопасно пропустить этот шаг и перейти к следующему, используя вашу существующую службу.

1. Войдите в [Портал Microsoft Azure](https://portal.azure.com/) и нажмите
   **Создать ресурс**.
   <Image img={azureHomePage} size="lg" alt="Главная страница портала Azure" border/>

2. В левой панели категорий выберите **Аналитика**, затем нажмите на
   **Data Factory** в списке популярных сервисов.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Новый ресурс Azure в портале" border/>

3. Выберите свою подписку и группу ресурсов, введите имя для новой инстанции Data
   Factory, выберите регион и оставьте версию как V2.
   <Image img={azureNewDataFactory} size="lg" alt="Новая инстанция Data Factory в портале Azure" border/>

3. Нажмите **Обзор + Создать**, затем нажмите **Создать** для запуска развертывания.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Подтверждение новой инстанции Data Factory в портале Azure" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Успех новой инстанции Data Factory в портале Azure" border/>

После успешного завершения развертывания, вы можете начать использовать вашу новую
инстанцию Azure Data Factory.

## Создание нового основанного на REST Linked Service {#-creating-new-rest-based-linked-service}

1. Войдите в портал Microsoft Azure и откройте вашу инстанцию Data Factory.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Главная страница портала Azure с Data Factory" border/>

2. На странице обзора Data Factory нажмите **Запустить Студию**.
   <Image img={azureDataFactoryPage} size="lg" alt="Страница Data Factory в портале Azure" border/>

3. В левом меню выберите **Управление**, затем перейдите в **Связанные службы**,
   и нажмите **+ Новый**, чтобы создать новую связанную службу.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Кнопка создания нового связанного сервиса в Azure Data Factory" border/>

4. В строке поиска **Новая связанная служба** введите **REST**, выберите **REST** и нажмите **Продолжить**
   для создания [REST коннектора](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest).
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Поиск нового связанного сервиса в Azure Data Factory" border/>

5. В панели конфигурации связанной службы введите имя для вашего нового сервиса,
   нажмите на поле **Базовый URL**, затем нажмите **Добавить динамическое содержимое** (эта ссылка появится только
   при выборе поля).
   <Image img={adfNewLinedServicePane} size="lg" alt="Панель нового связанного сервиса" border/>

6. В панели динамического содержимого вы можете создать параметризованный URL, который
   позволяет вам определить запрос позже при создании наборов данных для различных
   таблиц — это делает связанную службу повторно используемой.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="Пустой базовый URL нового связанного сервиса" border/>

7. Нажмите **"+"** рядом с полем фильтра и добавьте новый параметр, назовите его
   `pQuery`, установите тип как String и установите значение по умолчанию на `SELECT 1`.
   Нажмите **Сохранить**.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="Параметры нового связанного сервиса" border/>

8. В поле выражения введите следующее и нажмите **ОК**. Замените
   `your-clickhouse-url.com` на фактический адрес вашей инстанции ClickHouse.
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="Заполненное поле выражения нового связанного сервиса" border/>

9. Вернитесь к основной форме, выберите Основную аутентификацию, введите имя пользователя и
   пароль, используемые для подключения к вашему HTTP интерфейсу ClickHouse, нажмите **Проверка
   соединения**. Если все настроено корректно, вы увидите сообщение об успехе.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="Проверка соединения нового связанного сервиса" border/>

10. Нажмите **Создать** для завершения настройки.
    <Image img={adfLinkedServicesList} size="lg" alt="Список связанных служб" border/>

Теперь вы должны увидеть свою новую зарегистрированную связанную службу на основе REST в списке.

## Создание нового набора данных для HTTP интерфейса ClickHouse {#creating-a-new-dataset-for-the-clickhouse-http-interface}

Теперь, когда у нас есть настроенная связанная служба для HTTP интерфейса ClickHouse,
мы можем создать набор данных, который Azure Data Factory будет использовать для отправки данных в
ClickHouse.

В этом примере мы вставим небольшую часть [Данных сенсоров окружающей среды](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

1. Откройте консоль запросов ClickHouse на ваш выбор — это может быть веб-интерфейс ClickHouse Cloud, клиент CLI или любой другой интерфейс, который вы используете для
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

2. В Azure Data Factory Studio выберите Автора в левой панели. Наведите
   курсор на элемент Набор данных, нажмите на значок с тремя точками и выберите Новый набор данных.
   <Image img={adfNewDatasetItem} size="lg" alt="Новый элемент набора данных" border/>

3. В строке поиска введите **REST**, выберите **REST**, и нажмите **Продолжить**.
   Введите имя для вашего набора данных и выберите **связанную службу**, которую вы создали
   на предыдущем шаге. Нажмите **ОК**, чтобы создать набор данных.
   <Image img={adfNewDatasetPage} size="lg" alt="Страница нового набора данных" border/>

4. Теперь вы должны увидеть ваш новый созданный набор данных в разделе Наборы данных
   в панели ресурсов фабрики слева. Выберите набор данных, чтобы открыть его свойства. Вы увидите параметр `pQuery`, который был определен в
   связанной службе. Нажмите на поле текста **Значение**. Затем нажмите **Добавить динамическое**
   содержимое.
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
   `''`. Это необходимо для парсера выражений Azure Data Factory. Если вы не экранируете их, вы можете не увидеть ошибку сразу — но она произойдет
   позже, когда вы попытаетесь использовать или сохранить набор данных. Например, `'best_effort'`
   должно быть записано как `''best_effort''`.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="Новый запрос набора данных" border/>

6. Нажмите ОК, чтобы сохранить выражение. Нажмите Проверка соединения. Если все
   настроено корректно, вы увидите сообщение об успешном соединении. Нажмите Опубликовать
   все в верхней части страницы, чтобы сохранить ваши изменения.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="Успешное соединение нового набора данных" border/>

### Настройка примера набора данных {#setting-up-an-example-dataset}

В этом примере, мы не будем использовать полный набор данных сенсоров окружающей среды, а
только небольшую подмножество, доступное по ссылке
[Пример набора данных сенсоров](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv).

:::info
Чтобы сохранить этот гид сконцентрированным, мы не будем углубляться в точные шаги создания 
исходного набора данных в Azure Data Factory. Вы можете загрузить пример данных в любое
сервис хранения на ваш выбор — например, Azure Blob Storage, Microsoft SQL Server,
или даже в другом формате файлов, поддерживаемом Azure Data Factory.
:::

Загрузите набор данных в ваше Azure Blob Storage (или другую предпочитаемую службу хранения). Затем, в Azure Data Factory Studio, перейдите в панель ресурсов фабрики.
Создайте новый набор данных, который указывает на загруженные данные. Нажмите Опубликовать все, чтобы
сохранить ваши изменения.

## Создание активности копирования для передачи данных в ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

Теперь, когда мы настроили как входные, так и выходные наборы данных, мы можем настроить
активность **Копирование Данных** для передачи данных из нашего примера набора данных в
таблицу `sensors` в ClickHouse.

1. Откройте **Azure Data Factory Studio**, перейдите на вкладку **Автора**. В панели
   **Ресурсы фабрики** наведите курсор на **Конвейер**, нажмите на значок с тремя точками
   и выберите **Новый конвейер**.
   <Image img={adfNewPipelineItem} size="lg" alt="Новый элемент конвейера ADF" border/>

2. В панели **Деятельности** раскройте раздел **Перемещение и преобразование** и перетащите
   активность **Копирование данных** на холст.
   <Image img={adfNewCopyDataItem} size="lg" alt="Новый элемент копирования данных" border/>

3. Выберите вкладку **Источником** и выберите источник набора данных, который вы создали ранее.
   <Image img={adfCopyDataSource} size="lg" alt="Источник копирования данных" border/>

4. Перейдите на вкладку **Приемник** и выберите созданный для вашей
   таблицы сенсоров набор данных ClickHouse. Установите **Метод запроса** на POST. Убедитесь,
   что **Тип сжатия HTTP** установлен на **Нет**.
   :::warning
   Сжатие HTTP не работает корректно в активности Копирования Данных Azure Data Factory. Когда оно включено, Azure отправляет нагрузку, состоящую только из нулевых байтов — вероятно, это ошибка в службе. Обязательно оставьте сжатие выключенным.
   :::
   :::info
   Мы рекомендуем сохранить размер пакета по умолчанию 10,000, или даже увеличить его
   дальше. Для получения дополнительной информации см. [Выбор стратегии вставки / Пакетные вставки, если синхронно](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous).
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Выбор приемника копирования данных" border/>

5. Нажмите **Отладка** в верхней части холста, чтобы запустить конвейер. После короткого ожидания
   активность будет поставлена в очередь и выполнена. Если все настроено корректно, задача должна завершиться со статусом **Успех**.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Успех отладки копирования данных" border/>

6. После завершения нажмите **Опубликовать все**, чтобы сохранить ваш конвейер и изменения в наборе данных.

## Дополнительные ресурсы {#additional-resources-1}
- [HTTP интерфейс](https://clickhouse.com/docs/interfaces/http)
- [Копирование и преобразование данных из и в REST конечный пункт с использованием Azure Data Factory](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Выбор стратегии вставки](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [Создание и настройка самостоятельно размещенного интеграционного времени](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
