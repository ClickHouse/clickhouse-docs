---
'slug': '/use-cases/observability/clickstack/getting-started/local-data'
'title': 'Локальные журналы и метрики'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': 'Начало работы с данными и метриками локальных и системных ClickStack'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';

Этот стартовый гид позволяет вам собирать локальные журналы и метрики из вашей системы, отправляя их в ClickStack для визуализации и анализа.

**Этот пример работает только на системах OSX и Linux**

Следующий пример предполагает, что вы запустили ClickStack, используя [инструкции для all-in-one образа](/use-cases/observability/clickstack/getting-started) и подключились к [локальному экземпляру ClickHouse](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) или к [экземпляру ClickHouse Cloud](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

:::note HyperDX в ClickHouse Cloud
Этот пример данных также можно использовать с HyperDX в ClickHouse Cloud, с лишь незначительными корректировками в процессе, как указано. Если вы используете HyperDX в ClickHouse Cloud, пользователям потребуется, чтобы локально работал сборщик Open Telemetry, как описано в [руководстве по началу работы для этой модели развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>

## Перейдите к интерфейсу HyperDX {#navigate-to-the-hyperdx-ui}

Перейдите к [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX, если развертываете локально. Если вы используете HyperDX в ClickHouse Cloud, выберите ваш сервис и `HyperDX` в левом меню.

## Скопируйте ключ API для приема данных {#copy-ingestion-api-key}

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется, если вы используете HyperDX в ClickHouse Cloud.
:::

Перейдите в [`Настройки команды`](http://localhost:8080/team) и скопируйте `Ключ API для приема данных` из раздела `API Keys`. Этот ключ API обеспечивает безопасность приема данных через сборщик OpenTelemetry.

<Image img={copy_api_key} alt="Скопировать ключ API" size="lg"/>

## Создайте локальную конфигурацию OpenTelemetry {#create-otel-configuration}

Создайте файл `otel-local-file-collector.yaml` со следующим содержимым.

**Важно**: Заполните значение `<YOUR_INGESTION_API_KEY>` вашим ключом API для приема данных, скопированным выше (не требуется для HyperDX в ClickHouse Cloud).

```yaml
receivers:
  filelog:
    include:
      - /var/log/**/*.log             # Linux
      - /var/log/syslog
      - /var/log/messages
      - /private/var/log/*.log       # macOS
      - /tmp/all_events.log # macos - see below
    start_at: beginning # modify to collect new files only

  hostmetrics:
    collection_interval: 1s
    scrapers:
      cpu:
        metrics:
          system.cpu.time:
            enabled: true
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.usage:
            enabled: true
          system.memory.utilization:
            enabled: true
      filesystem:
        metrics:
          system.filesystem.usage:
            enabled: true
          system.filesystem.utilization:
            enabled: true
      paging:
        metrics:
          system.paging.usage:
            enabled: true
          system.paging.utilization:
            enabled: true
          system.paging.faults:
            enabled: true
      disk:
      load:
      network:
      processes:

exporters:
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    tls:
      insecure: true
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 262144  # 262,144 items × ~8 KB per item ≈ 2 GB

service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [otlp]
    metrics:
      receivers: [hostmetrics]
      exporters: [otlp]
```

Эта конфигурация собирает системные журналы и метрики для систем OSX и Linux, отправляя результаты в ClickStack через OTLP-эндпоинт на порту 4317.

:::note Временные метки приема
Эта конфигурация настраивает временные метки при приеме, присваивая обновленное значение времени каждому событию. Пользователям рекомендуется [предварительно обрабатывать или парсить временные метки](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching), используя процессоры OTel или операторы в своих журнальных файлах, чтобы обеспечить точное время появления событий.

С этой примерной настройкой, если приемник или файловый процессор настроены на начало с начала файла, все существующие записи журнала получат одну и ту же откорректированную временную метку — время обработки, а не оригинальное время события. Любые новые события, добавленные в файл, получат временные метки, приближенные к их фактическому времени генерации.

Чтобы избежать этого поведения, вы можете установить позицию начала в `end` в конфигурации приемника. Это обеспечивает то, что только новые записи будут встроены и временные метки будут близки к их истинному времени прибытия.
:::

Для получения дополнительных сведений о структуре конфигурации OpenTelemetry (OTel) мы рекомендуем [официальное руководство](https://opentelemetry.io/docs/collector/configuration/).

:::note Подробные журналы для OSX
Пользователи, желающие получить более подробные журналы на OSX, могут запустить команду `log stream --debug --style ndjson >> /tmp/all_events.log` перед запуском сборщика ниже. Это позволит захватить подробные журналы операционной системы в файл `/tmp/all_events.log`, который уже включен в вышеуказанную конфигурацию.
:::

## Запустите сборщик {#start-the-collector}

Запустите следующую команду docker, чтобы стартовать экземпляр OTel сборщика.

```shell
docker run --network=host --rm -it \
  --user 0:0 \
  -v "$(pwd)/otel-local-file-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml
```

:::note Пользователь root
Мы запускаем сборщик от имени пользователя root для доступа ко всем системным журналам — это необходимо для захвата журналов из защищенных путей на системах на базе Linux. Тем не менее, этот подход не рекомендуется для использования в производственной среде. В производственных условиях сборщик OpenTelemetry должен быть развернут как локальный агент с минимально необходимыми разрешениями для доступа к предполагаемым источникам журналов.
:::

Сборщик немедленно начнет собирать локальные системные журналы и метрики.

## Исследуйте системные журналы {#explore-system-logs}

Перейдите к интерфейсу HyperDX. Интерфейс поиска должен быть заполнен локальными системными журналами. Раскройте фильтры, чтобы выбрать `system.log`:

<Image img={hyperdx_20} alt="Локальные журналы HyperDX" size="lg"/>

## Исследуйте системные метрики {#explore-system-metrics}

Мы можем исследовать наши метрики с помощью графиков.

Перейдите к Исследователю графиков через левое меню. Выберите источник `Metrics` и `Maximum` в качестве типа агрегации.

В меню `Выберите метрику` просто введите `memory`, а затем выберите `system.memory.utilization (Gauge)`.

Нажмите кнопку запуска, чтобы визуализировать использование вашей памяти с течением времени.

<Image img={hyperdx_21} alt="Память с течением времени" size="lg"/>

Обратите внимание, что число выводится как плавающая точка в формате `%`. Чтобы отобразить его более четко, выберите `Установить формат числа`.

<Image img={hyperdx_22} alt="Формат числа" size="lg"/>

В последующем меню вы можете выбрать `Процент` из выпадающего списка `Формат вывода`, прежде чем нажать `Применить`.

<Image img={hyperdx_23} alt="Процент памяти со временем" size="lg"/>

</VerticalStepper>