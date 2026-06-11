---
slug: /use-cases/observability/clickstack/integration-partners/odigos
title: 'Отправка OpenTelemetry в ClickStack с помощью Odigos'
sidebar_label: 'Odigos'
pagination_prev: null
pagination_next: null
description: 'Автоинструментация рабочих нагрузок Kubernetes с помощью Odigos и экспорт телеметрии в ClickStack по OTLP'
doc_type: 'guide'
keywords: ['Odigos', 'ClickStack', 'ClickHouse', 'OpenTelemetry', 'eBPF', 'автоинструментация']
---

import PartnerBadge from '@theme/badges/PartnerBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<PartnerBadge />

:::note[Кратко]
В этом руководстве показано, как экспортировать телеметрию Odigos в ClickStack. Вы узнаете, как:

* Развернуть Odigos в Kubernetes с помощью Helm
* Добавить источники в интерфейсе Odigos
* Добавить пункт назначения OTLP HTTP, указывающий на ClickStack
* Проверить журналы, метрики и трассировки в ClickStack

Odigos автоматически добавляет инструментацию в приложения без изменения кода и перезапуска; ClickStack хранит данные в ClickHouse и позволяет выполнять по ним запросы.

Требуемое время: 10–20 минут
:::

{/* vale off */ }

## Что такое Odigos? \{#what-is-odigos\}

{/* vale on */ }

[Odigos](https://odigos.io/) — это плоскость управления инструментированием для Kubernetes и виртуальных машин, которая инструментирует приложения на уровне ядра с помощью **eBPF**. Поскольку сбор выполняется в ядре, накладные расходы на приложение остаются низкими, а наблюдаемость — высокой. Вы получаете OpenTelemetry-трассировки, метрики, журналы и профили промышленного уровня без внедрения новых агентов в прикладной код и без ожидания обновлений библиотек во всех сервисах.

Именно этот слой eBPF делает возможной глубокую и согласованную телеметрию в большом масштабе. Odigos может автоматически включать и отключать более глубокое инструментирование, когда это нужно, чтобы упростить отладку и устранение проблем:

* **Контекст на уровне кода** — атрибуты, связанные с функциями и поведением среды выполнения
* **HTTP-трафик** — запросы и ответы между вашими сервисами
* **Системы обмена сообщениями** — полезная нагрузка и сообщения из Kafka и аналогичных брокеров
* **Подробная информация об ошибках** — трассировки стека при сбоях
* **Пользовательское инструментирование** — расширяйте покрытие там, где автоинструментирование уже не справляется, без изменений кода и перезапусков

За кулисами Odigos создает и управляет полноценным конвейером OpenTelemetry для вашего кластера: коллекторами, которые масштабируются вместе с нагрузкой, маршрутизацией в выбранные вами целевые системы и логикой конвейера, которой вы управляете через интерфейс. Настройте **сэмплирование** для управления объемом, **маскирование PII** для исключения конфиденциальных данных из экспорта и **правила OTTL** для фильтрации, преобразования или обогащения телеметрии до того, как она покинет кластер.

{/* vale off */ }

## Почему Odigos + ClickStack? \{#why-odigos-clickstack\}

{/* vale on */ }

Развертывание OpenTelemetry в большом количестве сервисов часто занимает много времени и даёт лишь поверхностную наблюдаемость приложений. Odigos выполняет eBPF-инструментирование для более глубокой телеметрии и управляет работой коллекторов в Kubernetes; ClickStack предоставляет хранилище на базе ClickHouse и интерфейс HyperDX для выполнения запросов к телеметрии в масштабе.

:::tip[Ключевые выводы]

* **Odigos** автоматически добавляет инструментирование для любой рабочей нагрузки Kubernetes без необходимости перезапуска и автоматически управляет конвейерами OpenTelemetry.
* **ClickStack** хранит журналы, метрики и трассировки в ClickHouse и отображает их в HyperDX.
  :::

## Предварительные требования \{#prerequisites\}

* **ClickStack** установлен и доступен из вашего кластера Kubernetes. См. [Начало работы с ClickStack с открытым исходным кодом](/use-cases/observability/clickstack/getting-started/oss) или [Начало работы с Управляемым ClickStack](/use-cases/observability/clickstack/getting-started/managed).
* Ваша **HTTP-конечная точка OTLP** ClickStack (порт `4318`) и значение для аутентификации, которое Odigos будет передавать в заголовке `Authorization`. Для ClickStack с открытым исходным кодом это **ключ API для ингестии ClickStack** из **Team Settings → API Keys** в интерфейсе HyperDX. Для Управляемого ClickStack это **`OTLP_AUTH_TOKEN`**, который вы задаёте при запуске собственного автономного коллектора ClickStack.
* **Кластер Kubernetes** (узлы Linux с ядром 4.18 или новее для инструментирования eBPF)
* **Helm**, **kubectl** и учётные данные для доступа к кластеру, чтобы выполнить установку в пространство имен `odigos-system`
* **On-prem-токен Odigos Enterprise** — обратитесь к [команде Odigos](https://odigos.io/) для получения доступа

{/* vale off */ }

## Интеграция ClickStack с Odigos \{#integrate-odigos-clickstack\}

{/* vale on */ }

<VerticalStepper headerLevel="h4">
  #### Развёртывание Odigos с помощью Helm \{#deploy-odigos\}

  Odigos Enterprise требует лицензионный токен для локального развёртывания. Экспортируйте его в оболочке:

  ```bash
  export ODIGOS_ONPREM_TOKEN="<your-enterprise-token>"
  ```

  Кроме того, можно сохранить токен в Kubernetes Secret с именем `odigos-pro` перед установкой. См. [Установка Odigos Enterprise](https://docs.odigos.io/enterprise/setup/installation).

  Добавьте Helm-репозиторий Odigos и установите чарт в `odigos-system`:

  ```bash
  helm repo add odigos https://odigos-io.github.io/odigos/
  helm repo update

  helm upgrade --install odigos odigos/odigos \
    --namespace odigos-system \
    --create-namespace \
    --set onPremToken=$ODIGOS_ONPREM_TOKEN
  ```

  Дополнительные переопределения конфигурации можно передать с помощью флагов `--set` или пользовательского файла значений (`-f`). Значения по умолчанию для чарта находятся в файле [helm/odigos/values.yaml](https://github.com/odigos-io/odigos/blob/main/helm/odigos/values.yaml) на GitHub.

  Убедитесь, что поды Odigos запущены:

  ```bash
  kubectl get pods -n odigos-system
  ```

  #### Добавление источников в интерфейсе Odigos \{#add-sources\}

  1. Пробросьте порт сервиса интерфейса Odigos:

  ```bash
  kubectl port-forward svc/ui -n odigos-system 3000:3000
  ```

  2. Откройте [http://localhost:3000](http://localhost:3000) в своем браузере.
  3. Перейдите в раздел **Sources** и выберите пространства имен или рабочие нагрузки, которые хотите инструментировать.
  4. Нажмите кнопку Done внизу, когда отметите все рабочие нагрузки для инструментирования.
  5. Убедитесь, что в столбце Sources рабочие нагрузки успешно инструментированы.

  #### Добавление ClickStack в качестве пункта назначения в интерфейсе Odigos \{#add-destination-ui\}

  Чтобы отправлять телеметрию в ClickStack, добавьте пункт назначения **OTLP HTTP** в Odigos. Конкретная конфигурация зависит от способа развёртывания ClickStack. В версии ClickStack с открытым исходным кодом OpenTelemetry Collector поставляется в комплекте, а ключ ингестии автоматически генерируется в интерфейсе HyperDX. При использовании Управляемого ClickStack вы запускаете собственный автономный коллектор ClickStack и самостоятельно задаёте токен аутентификации при запуске контейнера.

  :::tip[Альтернатива: запись напрямую в ClickHouse]
  Если ClickHouse доступен из вашего кластера Kubernetes, можно полностью пропустить OTLP-коллектор и использовать вместо него [нативный пункт назначения **ClickHouse**](#native-clickhouse-destination) в Odigos. Это работает как для версии с открытым исходным кодом, так и для Управляемого ClickStack.
  :::

  <Tabs groupId="clickstack-deployment">
    <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом" default>
      В ClickStack с открытым исходным кодом, например в образе all-in-one, OpenTelemetry Collector, работающий как шлюз, уже включён, а ключ API для ингестии ClickStack HyperDX генерирует автоматически.

      1. В интерфейсе Odigos нажмите **Add Destination** и выберите **OTLP HTTP**.
      2. В поле **OTLP HTTP Endpoint** укажите конечную точку коллектора ClickStack (например, `http://clickstack.example.com:4318`). Подробнее о конечной точке см. в разделе [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-data-to-collector-oss).
      3. Скопируйте ключ API для ингестии ClickStack в интерфейсе ClickStack из раздела **Team Settings → API Keys**.
      4. В разделе **Headers** добавьте:
         * **Key**: `Authorization`
         * **Value**: ваш ключ API для ингестии ClickStack
      5. Включите **Logs**, **Metrics** и **Traces**.
      6. Сохраните пункт назначения.
    </TabItem>

    <TabItem value="managed-clickstack" label="Управляемый ClickStack">
      Управляемый ClickStack не включает размещённый OpenTelemetry Collector и не отображает ключ ингестии в интерфейсе. Вместо этого вам нужно самостоятельно запустить [дистрибутив коллектора ClickStack в автономном режиме](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector) и при запуске контейнера задать токен аутентификации через переменную окружения `OTLP_AUTH_TOKEN`. После этого Odigos будет отправлять OTLP HTTP-трафик в этот коллектор, передавая тот же токен в заголовке `Authorization`.

      1. Запустите коллектор ClickStack в автономном режиме, указав ваш сервис ClickHouse Cloud и защитив его с помощью `OTLP_AUTH_TOKEN` по вашему выбору:

         ```shell
         export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
         export CLICKHOUSE_USER=<CLICKHOUSE_USER>
         export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
         export OTLP_AUTH_TOKEN="a_very_secure_string"

         docker run \
           -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
           -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
           -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
           -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
           -p 4317:4317 \
           -p 4318:4318 \
           clickhouse/clickstack-otel-collector:latest
         ```

         Рекомендации по TLS, выделенным пользователям для ингестии и другим аспектам production-среды см. в разделе [Securing the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector).
      2. В интерфейсе Odigos нажмите **Add Destination** и выберите **OTLP HTTP**.
      3. В поле **OTLP HTTP Endpoint** укажите конечную точку автономного коллектора, который вы только что запустили (например, `http://my-collector.example.com:4318`).
      4. В разделе **Headers** добавьте:
         * **Key**: `Authorization`
         * **Value**: значение `OTLP_AUTH_TOKEN`, которое вы задали для коллектора
      5. Включите **Logs**, **Metrics** и **Traces**.
      6. Сохраните пункт назначения.

      :::note[Необязательно: манифест Kubernetes]
      Тот же пункт назначения можно настроить с помощью манифеста `Destination` вместо интерфейса. См. раздел [Configure destinations with Kubernetes manifests](#destination-manifest) в Advanced configuration.
      :::
    </TabItem>
  </Tabs>

  #### Проверка телеметрии в ClickStack \{#verify-telemetry\}

  1. Откройте интерфейс ClickStack (HyperDX):
     * **ClickStack с открытым исходным кодом**: например, `http://<host>:8080` в образе all-in-one.
     * **Управляемый ClickStack**: откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud), затем нажмите **Launch ClickStack**. Подробности см. в разделе [Переход к интерфейсу ClickStack](/use-cases/observability/clickstack/getting-started/managed#navigate-to-clickstack-ui-cloud).
  2. Проверьте, появились ли в **журналах**, **метриках** и **трассировках** данные из ваших инструментированных сервисов.
  3. Отфильтруйте трассировки по `odigos.version`, чтобы проверить сквозную передачу данных.

  Если данные отсутствуют, проверьте журналы коллектора: `kubectl logs deploy/odigos-gateway -n odigos-system`
</VerticalStepper>

## Расширенная конфигурация \{#advanced-configuration\}

### Нормализатор логов HyperDX \{#hyperdx-log-normalizer\}

Если вы экспортируете данные напрямую в ClickHouse с помощью собственного пункта назначения **ClickHouse** в Odigos (вместо OTLP HTTP в ClickStack), включите **нормализатор логов HyperDX** (`HYPERDX_LOG_NORMALIZER: true`). Он разбирает JSON в теле логов и нормализует атрибуты, чтобы упростить выполнение запросов в интерфейсе ClickStack.

### Нативный пункт назначения ClickHouse \{#native-clickhouse-destination\}

Если ClickHouse доступен напрямую из вашего кластера, вы можете использовать нативный пункт назначения **ClickHouse** в Odigos вместо OTLP HTTP. Настройте конечную точку ClickHouse, имя базы данных и параметры схемы в интерфейсе или с помощью манифеста — см. [пункт назначения ClickHouse в Odigos](https://docs.odigos.io/backends/clickhouse).

* **Схема для продакшена**: Установите `CLICKHOUSE_CREATE_SCHEME` в `false` и примените собственный DDL.
* **TLS / аутентификация**: Используйте `CLICKHOUSE_TLS_ENABLED`, `CLICKHOUSE_USERNAME` и Kubernetes Secret для хранения пароля.

### Настройка пунктов назначения с помощью манифестов Kubernetes \{#destination-manifest\}

**OTLP HTTP (ClickStack)**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickstack
  namespace: odigos-system
spec:
  type: otlphttp
  destinationName: otlphttp
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    OTLP_HTTP_ENDPOINT: 'http://clickstack.example.com:4318'
    # API ingestion key for open source ClickStack, or OTLP_AUTH_TOKEN for Managed ClickStack
    OTLP_HTTP_HEADERS: 'Authorization:<YOUR_AUTHORIZATION_VALUE>'
```

**ClickHouse (напрямую)**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickhouse
  namespace: odigos-system
spec:
  type: clickhouse
  destinationName: clickhouse
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    CLICKHOUSE_ENDPOINT: 'http://clickstack.example.com:8123'
    CLICKHOUSE_DATABASE_NAME: 'otel'
    CLICKHOUSE_CREATE_SCHEME: 'true'
```

Примените манифест:

```bash
kubectl apply -f destination.yaml
```

{/* vale off */ }

### VM-агент Odigos \{#odigos-vm-agent\}

{/* vale on */ }

[Odigos VM Agent](https://docs.odigos.io/vmagent/overview) выполняет инструментацию процессов Linux, сервисов systemd и/или контейнеров Docker с помощью eBPF. Телеметрия экспортируется в те же пункты назначения, что и в кластерной версии Odigos, включая ClickStack через OTLP HTTP.

VM Agent входит в состав Odigos Pro. Сведения о настройке, источниках и конфигурации пунктов назначения см. в [обзоре VM Agent](https://docs.odigos.io/vmagent/overview).

{/* vale off */ }

### Odigos Central \{#odigos-central\}

{/* vale on */ }

[Odigos Central](https://docs.odigos.io/central/overview) — это централизованная плоскость управления, которая позволяет из одного интерфейса управлять инструментированием, пунктами назначения и конфигурацией конвейеров сразу в нескольких кластерах Kubernetes, вместо того чтобы настраивать каждый кластер по отдельности.

Odigos Central доступен в Odigos Enterprise. Подробнее об управлении несколькими кластерами, SSO и единых правилах сэмплирования см. в [обзоре Odigos Central](https://docs.odigos.io/central/overview).

## Следующие шаги \{#next-steps\}

* **Анализируйте трассировки** для инструментированных сервисов в ClickStack
* **Создавайте панели мониторинга** для метрик, экспортируемых Odigos
* **Настройте схему ClickHouse и TTL** с учетом ваших требований к хранению данных и шаблонов запросов

## Читайте также \{#read-more\}

* [Установка Odigos Enterprise](https://docs.odigos.io/enterprise/setup/installation)
* [ClickHouse как пункт назначения в Odigos](https://docs.odigos.io/backends/clickhouse)
* [Обзор Odigos VM Agent](https://docs.odigos.io/vmagent/overview)
* [Обзор Odigos Central](https://docs.odigos.io/central/overview)
* [Хватит гадать в продакшене: трассировка с полной детализацией в любом масштабе с ClickHouse и Odigos](https://clickhouse.com/blog/odigos-full-fidelity-tracing)
* [Начало работы с ClickStack с открытым исходным кодом](/use-cases/observability/clickstack/getting-started/oss)