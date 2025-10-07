---
'sidebar_label': 'Использование HTTP интерфейса'
'slug': '/integrations/azure-data-factory/http-interface'
'description': 'Использование HTTP интерфейса ClickHouse для загрузки данных из Azure
  Data Factory в ClickHouse'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'http interface'
'title': 'Использование ClickHouse HTTP интерфейса для загрузки данных из Azure в
  ClickHouse'
'doc_type': 'guide'
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

[`azureBlobStorage` табличная функция](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
является быстрым и удобным способом загрузки данных из Azure Blob Storage в ClickHouse. Однако ее использование может оказаться не всегда подходящим по следующим причинам:

- Ваши данные могут не храниться в Azure Blob Storage — например, они могут находиться в Azure SQL Database, Microsoft SQL Server или Cosmos DB.
- Политики безопасности могут полностью запрещать внешний доступ к Blob Storage — например, если учетная запись хранения заблокирована без общедоступной конечной точки.

В таких сценариях вы можете использовать Azure Data Factory вместе с
[HTTP интерфейсом ClickHouse](https://clickhouse.com/docs/interfaces/http)
для отправки данных из Azure-сервисов в ClickHouse.

Этот метод меняет направление потока: вместо того, чтобы ClickHouse запрашивал данные из Azure, Azure Data Factory отправляет данные в ClickHouse. Этот подход
обычно требует, чтобы ваш экземпляр ClickHouse был доступен из интернета.

:::info
Можно избежать экспонирования вашего экземпляра ClickHouse в интернет, используя самоуправляемый интеграционный механизм Azure Data Factory. Эта настройка позволяет отправлять данные по частной сети. Однако это выходит за рамки данной статьи. Вы можете найти больше информации в официальном руководстве:
[Создайте и настройте самоуправляемый интеграционный механизм](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## Превращение ClickHouse в REST-сервис {#turning-clickhouse-to-a-rest-service}

Azure Data Factory поддерживает отправку данных во внешние системы по HTTP в формате JSON. Мы можем использовать эту возможность для вставки данных непосредственно в ClickHouse
с помощью [HTTP интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http).
Вы можете узнать больше в [документации HTTP интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http).

В этом примере нам нужно будет только указать целевую таблицу, определить формат входных данных как JSON и включить опции для более гибкого парсинга временных меток.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

Чтобы отправить этот запрос как часть HTTP-запроса, вам просто нужно передать его в виде
строки, закодированной в URL, в параметре query вашего конечного пункта ClickHouse:
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory может обрабатывать это кодирование автоматически с помощью своей встроенной функции `encodeUriComponent`, так что вам не придется делать это вручную.
:::

Теперь вы можете отправлять данные в формате JSON по этому URL. Данные должны соответствовать
структуре целевой таблицы. Вот простой пример с использованием curl, предполагая, что таблица имеет три колонки: `col_1`, `col_2` и `col_3`.
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

Вы также можете отправлять массив объектов JSON или JSON Lines (JSON-объекты, разделенные новыми строками). Azure Data Factory использует формат JSON масссива, который идеально работает с `JSONEachRow` для ClickHouse.

Как видите, на этом этапе вам не нужно делать ничего особенного со стороны ClickHouse. HTTP интерфейс уже предоставляет все необходимое, чтобы функционировать как
REST-подобная конечная точка — дополнительная конфигурация не требуется.

Теперь, когда мы сделали ClickHouse работающим как REST конечная точка, пришло время
настроить Azure Data Factory для ее использования.

В следующих шагах мы создадим экземпляр Azure Data Factory, настроим связанных
сервис для вашего экземпляра ClickHouse, определим набор данных для
[REST-вывода](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
и создадим активность Копирование Данных для отправки данных из Azure в ClickHouse.

## Создание экземпляра Azure Data Factory {#create-an-azure-data-factory-instance}

Это руководство предполагает, что у вас есть доступ к учетной записи Microsoft Azure, и у вас уже настроена подписка и группа ресурсов. Если у вас уже есть настроенный Azure Data Factory, вы можете безопасно пропустить этот шаг и перейти к следующему, используя существующий сервис.

1. Войдите в [Портал Microsoft Azure](https://portal.azure.com/) и кликните
   **Создать ресурс**.
   <Image img={azureHomePage} size="lg" alt="Главная страница Портала Azure" border/>

2. В панели КATEGORIYSPANE слева выберите **Аналитика**, затем нажмите на
   **Data Factory** в списке популярных сервисов.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Новый ресурс на Портале Azure" border/>

3. Выберите вашу подписку и группу ресурсов, введите имя для нового экземпляра Data
   Factory, выберите регион и оставьте версию как V2.
   <Image img={azureNewDataFactory} size="lg" alt="Новый экземпляр Data Factory на Портале Azure" border/>

3. Нажмите **Обзор + Создать**, затем нажмите **Создать**, чтобы запустить развертывание.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Подтверждение нового экземпляра Data Factory на Портале Azure" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Успех нового экземпляра Data Factory на Портале Azure" border/>

После успешного завершения развертывания вы можете начать использовать ваш новый экземпляр Azure Data Factory.

## Создание нового связанного сервиса на основе REST {#-creating-new-rest-based-linked-service}

1. Войдите в Портал Microsoft Azure и откройте ваш экземпляр Data Factory.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Главная страница Портала Azure с Data Factory" border/>

2. На странице обзора Data Factory нажмите **Запустить Studio**.
   <Image img={azureDataFactoryPage} size="lg" alt="Страница Data Factory на Портале Azure" border/>

3. В левом меню выберите **Управление**, затем перейдите в **Связанные сервисы**,
   и нажмите **+ Новый**, чтобы создать новый связанный сервис.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Кнопка нового связанного сервиса Azure Data Factory" border/>

4. В строке поиска **Новый связанный сервис** введите **REST**, выберите **REST** и нажмите **Продолжить**
   для создания [REST-коннектора](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest).
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Поиск нового связанного сервиса Azure Data Factory" border/>

5. В панели конфигурации связанного сервиса введите имя для вашего нового сервиса,
   нажмите на поле **Базовый URL**, затем нажмите **Добавить динамическое содержимое** (эта ссылка появляется только
   при выборе поля).
   <Image img={adfNewLinedServicePane} size="lg" alt="Новая панель связанного сервиса" border/>

6. В панели динамического содержимого вы можете создать параметризованный URL, что
   позволяет вам позже определить запрос при создании наборов данных для разных
   таблиц — это делает связанный сервис повторно используемым.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="Новый связанный сервис, поле базового URL пустое" border/>

7. Нажмите **"+"** рядом с полем фильтра и добавьте новый параметр, назовите его
   `pQuery`, установите тип на Строка и установите значение по умолчанию `SELECT 1`.
   Нажмите **Сохранить**.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="Параметры нового связанного сервиса" border/>

8. В поле выражения введите следующее и нажмите **OK**. Замените
   `your-clickhouse-url.com` на фактический адрес вашего экземпляра ClickHouse.
```text
@{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="Заполненное поле выражения нового связанного сервиса" border/>

9. Вернитесь к основной форме, выберите основную аутентификацию, введите имя пользователя и
   пароль, используемые для подключения к вашему HTTP интерфейсу ClickHouse, нажмите **Проверить соединение**. Если всё настроено правильно, вы увидите сообщение об успехе.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="Проверка соединения нового связанного сервиса" border/>

10. Нажмите **Создать**, чтобы завершить настройку.
    <Image img={adfLinkedServicesList} size="lg" alt="Список связанных сервисов" border/>

Теперь вы должны увидеть ваш вновь зарегистрированный связанный сервис на основе REST в списке.

## Создание нового набора данных для HTTP интерфейса ClickHouse {#creating-a-new-dataset-for-the-clickhouse-http-interface}

Теперь, когда у нас настроен связанный сервис для HTTP интерфейса ClickHouse,
мы можем создать набор данных, который Azure Data Factory будет использовать для отправки данных в
ClickHouse.

В этом примере мы вставим небольшую порцию данных [Датчиков окружающей среды](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

1. Откройте консоль запросов ClickHouse по вашему выбору — это может быть веб-интерфейс ClickHouse Cloud, CLI клиент или любой другой интерфейс, который вы используете для
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

2. В Azure Data Factory Studio выберите Авторы в левой панели. Наведите курсор
   на элемент Набор данных, нажмите иконку с тремя точками и выберите Новый набор данных.
   <Image img={adfNewDatasetItem} size="lg" alt="Новый элемент набора данных" border/>

3. В строке поиска введите **REST**, выберите **REST** и нажмите **Продолжить**.
   Введите имя для вашего набора данных и выберите **связанный сервис**, который вы создали
   на предыдущем шаге. Нажмите **OK**, чтобы создать набор данных.
   <Image img={adfNewDatasetPage} size="lg" alt="Новая страница набора данных" border/>

4. Теперь вы должны увидеть ваш вновь созданный набор данных, перечисленный в разделе Наборы данных в панели Ресурсы Фабрики слева. Выберите набор данных, чтобы
   открыть его свойства. Вы увидите параметр `pQuery`, который был определён в
   связанном сервисе. Щелкните текстовое поле **Значение**. Затем нажмите **Добавить динамическое**
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
   `''`. Это требуется парсеру выражений Azure Data Factory. Если вы этого не сделаете, вы можете не увидеть ошибку сразу — но она возникнет позже, когда вы попытаетесь использовать или сохранить набор данных. Например, `'best_effort'`
   должно быть записано как `''best_effort''`.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="Запрос нового набора данных" border/>

6. Нажмите OK, чтобы сохранить выражение. Нажмите Проверить соединение. Если всё
   настроено правильно, вы увидите сообщение Объединение успешно. Нажмите Опубликовать всё в верхней части страницы, чтобы сохранить ваши изменения.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="Соединение нового набора данных успешно" border/>

### Настройка примера набора данных {#setting-up-an-example-dataset}

В этом примере мы не будем использовать полный набор данных Датчиков окружающей среды, а
просто небольшой поднабор, доступный по адресу
[Пример набора данных датчиков](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv).

:::info
Чтобы сосредоточить это руководство, мы не будем углубляться в точные шаги для создания
исходного набора данных в Azure Data Factory. Вы можете загрузить образцы данных в любое
хранилище данных на ваш выбор — например, Azure Blob Storage, Microsoft SQL
Server или даже в другой поддерживаемый Azure Data Factory формат файлов.
:::

Загрузите набор данных в ваше хранилище Azure Blob (или в любой другой предпочтительный сервис хранения). Затем в Azure Data Factory Studio перейдите в панель Ресурсы Фабрики.
Создайте новый набор данных, который указывает на загруженные данные. Нажмите Опубликовать все, чтобы
сохранить ваши изменения.

## Создание активности копирования для передачи данных в ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

Теперь, когда мы настроили как входные, так и выходные наборы данных, мы можем настроить
активность **Копирование Данных**, чтобы передать данные из нашего примера набора данных в
таблицу `sensors` в ClickHouse.

1. Откройте **Azure Data Factory Studio**, перейдите на вкладку **Авторы**. В панели
   **Ресурсы Фабрики** наведите курсор на **Конвейер**, нажмите иконку с тремя точками и выберите **Новый конвейер**.
   <Image img={adfNewPipelineItem} size="lg" alt="Новый элемент конвейера ADF" border/>

2. В панели **Активности** разверните раздел **Перемещение и преобразование** и
   перетащите активность **Копирование данных** на холст.
   <Image img={adfNewCopyDataItem} size="lg" alt="Новый элемент Копии Данных" border/>

3. Выберите вкладку **Источник** и выберите источник данных, который вы создали ранее.
   <Image img={adfCopyDataSource} size="lg" alt="Источник Копирования Данных" border/>

4. Перейдите на вкладку **Назначение** и выберите набор данных ClickHouse, созданный для вашей
   таблицы датчиков. Установите **Метод запроса** на POST. Убедитесь, что **Тип HTTP-сжатия**
   установлен на **Нет**.
   :::warning
   HTTP-сжатие не работает должным образом в активности Копирования Данных Azure Data Factory. Включив его, Azure отправляет полезную нагрузку, состоящую только из нулевых байтов — вероятно, это ошибка в сервисе. Убедитесь, что сжатие отключено.
   :::
   :::info
   Мы рекомендуем оставлять размер пакета по умолчанию 10 000 или даже увеличить его. Для получения дополнительных сведений смотрите
   [Выбор стратегии вставки / Пакетные вставки, если синхронные](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   для более подробной информации.
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Выбор назначения Копирования Данных" border/>

5. Нажмите **Отладка** в верхней части холста, чтобы запустить конвейер. После короткого
   ожидания, активность будет поставлена в очередь и выполнена. Если всё настроено
   правильно, задача должна завершиться со статусом **Успех**.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Успех отладки Копирования Данных" border/>

6. После завершения нажмите **Опубликовать все**, чтобы сохранить изменения в вашем конвейере и наборах данных.

## Дополнительные ресурсы {#additional-resources-1}
- [HTTP интерфейс](https://clickhouse.com/docs/interfaces/http)
- [Копирование и преобразование данных из и в конечную точку REST с помощью Azure Data Factory](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Выбор стратегии вставки](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [Создайте и настройте самоуправляемый интеграционный механизм](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
