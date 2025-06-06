import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

Асинхронные вставки в ClickHouse предоставляют мощную альтернативу, когда пакетирование на стороне клиента невозможно. Это особенно ценно в задачах мониторинга, где сотни или тысячи агентов непрерывно отправляют данные - журналы, метрики, трассировки - часто небольшими, в реальном времени, пакетами. Буферизация данных на стороне клиента в таких средах увеличивает сложность, требуя централизованной очереди для обеспечения отправки достаточно больших партий.

:::note
Отправка множества небольших пакетов в синхронном режиме не рекомендуется, так как это приводит к созданию множества частей. Это приведет к плохой производительности запросов и ошибкам ["слишком много частей"](/knowledgebase/exception-too-many-parts).
:::

Асинхронные вставки перекладывают ответственность за пакетирование с клиента на сервер, записывая входящие данные в память, а затем сбрасывая их на диск на основе настраиваемых пороговых значений. Этот подход значительно уменьшает накладные расходы на создание частей, снижает использование CPU и гарантирует, что прием данных остается эффективным - даже при высокой конкуренции.

Основное поведение контролируется с помощью настройки [`async_insert`](/operations/settings/settings#async_insert).

<Image img={async_inserts} size="lg" alt="Асинхронные вставки"/>

Когда включена (1), вставки буферизуются и записываются на диск только после того, как выполнено одно из условий сброса:

(1) буфер достигает заданного размера (async_insert_max_data_size)  
(2) истекает временной порог (async_insert_busy_timeout_ms) или  
(3) накапливается максимальное количество запросов на вставку (async_insert_max_query_number).

Этот процесс пакетирования невидим для клиентов и помогает ClickHouse эффективно объединять трафик вставок из нескольких источников. Однако до выполнения сброса данные не могут быть запрошены. Важно отметить, что существует несколько буферов на каждую комбинацию формы вставки и настроек, а в кластерах буферы поддерживаются на каждом узле - что позволяет осуществлять детализированный контроль в многопользовательских средах. Механика вставки в остальном идентична описанной для [синхронных вставок](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default).

### Выбор режима возврата {#choosing-a-return-mode}

Поведение асинхронных вставок дополнительно уточняется с помощью настройки [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert).

Когда установлен в 1 (по умолчанию), ClickHouse подтверждает вставку только после того, как данные успешно сброшены на диск. Это обеспечивает сильные гарантии надежности и делает обработку ошибок простой: если что-то пойдет не так во время сброса, ошибка будет возвращена клиенту. Этот режим рекомендуется для большинства производственных сценариев, особенно когда сбои вставки должны отслеживаться надежно.

[Бенчмарки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) показывают, что он хорошо масштабируется с конкуренцией - независимо от того, работаете ли вы с 200 или 500 клиентами - благодаря адаптивным вставкам и стабильному поведению создания частей.

Установка `wait_for_async_insert = 0` включает режим "отправил и забыл". Здесь сервер подтверждает вставку, как только данные буферизуются, не дожидаясь их достижения на диске.

Это обеспечивает ультранизкую латентность вставок и максимальную пропускную способность, идеально подходящую для данных с высокой скоростью и низкой критичностью. Однако это связано с рисками: нет гарантии, что данные будут сохранены, ошибки могут проявляться только во время сброса, и сложно проследить за неудачными вставками. Используйте этот режим только в том случае, если ваша нагрузка может терпеть потерю данных.

[Бенчмарки также демонстрируют](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) значительное сокращение количества частей и уменьшение использования CPU, когда сбросы буферов происходят редко (например, каждые 30 секунд), но риск скрытого сбоя остается.

Наша сильная рекомендация - использовать `async_insert=1,wait_for_async_insert=1`, если вы используете асинхронные вставки. Использование `wait_for_async_insert=0` очень рискованно, так как ваш клиент INSERT может не быть в курсе ошибок и также может вызвать потенциальную нагрузку, если ваш клиент продолжает быстро писать в ситуации, когда сервер ClickHouse должен замедлить записи и создать некоторое давление для обеспечения надежности сервиса.

### Дедупликация и надежность {#deduplication-and-reliability}

По умолчанию ClickHouse выполняет автоматическую дедупликацию для синхронных вставок, что делает повторные попытки безопасными в сценариях сбоев. Однако это отключено для асинхронных вставок, если не включено явно (это не следует включать, если у вас есть зависимые материализованные представления - [см. проблему](https://github.com/ClickHouse/ClickHouse/issues/66003)).

На практике, если дедупликация включена, и та же вставка повторяется - например, из-за тайм-аута или потери сети - ClickHouse может безопасно игнорировать дубликат. Это помогает поддерживать идемпотентность и избегать двойной записи данных. Тем не менее, стоит отметить, что проверка вставки и анализ схемы происходят только во время сброса буфера - поэтому ошибки (например, несоответствие типов) будут проявляться только в этот момент.

### Включение асинхронных вставок {#enabling-asynchronous-inserts}

Асинхронные вставки можно включить для конкретного пользователя или для конкретного запроса:

- Включение асинхронных вставок на уровне пользователя. Этот пример использует пользователя `default`, если вы создадите другого пользователя, замените это имя:  
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- Вы можете указать настройки асинхронной вставки, используя клаузу SETTINGS в запросах вставки:  
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- Вы также можете указать настройки асинхронной вставки в качестве параметров подключения при использовании клиента ClickHouse на языке программирования.

  В качестве примера, вот как вы можете сделать это в строке подключения JDBC, когда используете драйвер ClickHouse Java JDBC для подключения к ClickHouse Cloud:  
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
