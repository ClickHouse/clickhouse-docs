---
sidebar_label: 'Часто задаваемые вопросы'
description: 'Часто задаваемые вопросы о ClickPipes для Kafka'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'FAQ по Kafka ClickPipes'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

## Часто задаваемые вопросы о Kafka ClickPipes \\{#faq\\}

### Общие сведения \\{#general\\}

<details>

<summary>Как работает ClickPipes для Kafka?</summary>

ClickPipes использует специализированную архитектуру, запускающую Kafka Consumer API для чтения данных из указанного топика и последующей вставки данных в таблицу ClickHouse в конкретном сервисе ClickHouse Cloud.

</details>

<details>

<summary>
  В чём разница между ClickPipes и движком таблиц ClickHouse Kafka Table
  Engine?
</summary>

Движок Kafka Table является базовой возможностью ClickHouse, реализующей «pull-модель», при которой сам сервер ClickHouse подключается к Kafka, извлекает события и затем записывает их локально.

ClickPipes — это отдельный облачный сервис, работающий независимо от сервиса ClickHouse. Он подключается к Kafka (или другим источникам данных) и отправляет события в связанный сервис ClickHouse Cloud. Такая развязанная архитектура обеспечивает высокую операционную гибкость, чёткое разделение ответственности, масштабируемую ингестию, управляемую обработку отказов, расширяемость и многое другое.

</details>

<details>

<summary>Каковы требования для использования ClickPipes для Kafka?</summary>

Для использования ClickPipes для Kafka вам потребуется работающий брокер Kafka и сервис ClickHouse Cloud с включённым ClickPipes. Также необходимо убедиться, что ClickHouse Cloud имеет доступ к вашему брокеру Kafka. Этого можно добиться, разрешив удалённые подключения на стороне Kafka и добавив в список разрешённых [исходящие IP-адреса ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api) в вашей конфигурации Kafka. В качестве альтернативы вы можете использовать [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) для подключения ClickPipes для Kafka к вашим брокерам Kafka.

</details>

<details>

<summary>Поддерживает ли ClickPipes для Kafka AWS PrivateLink?</summary>

AWS PrivateLink поддерживается. См. [документацию](/integrations/clickpipes/aws-privatelink) для получения дополнительной информации по настройке.

</details>

<details>

<summary>
  Могу ли я использовать ClickPipes для Kafka для записи данных в топик Kafka?
</summary>

Нет, ClickPipes для Kafka предназначен для чтения данных из топиков Kafka, а не для записи данных в них. Для записи данных в топик Kafka вам потребуется использовать отдельный продюсер Kafka.

</details>

<details>

<summary>Поддерживает ли ClickPipes несколько брокеров?</summary>

Да, если брокеры входят в один и тот же кворум, их можно настроить совместно, перечислив через `,`.

</details>

<details>

<summary>Можно ли масштабировать реплики ClickPipes?</summary>

Да, ClickPipes для потоковой передачи можно масштабировать как горизонтально, так и вертикально.
Горизонтальное масштабирование добавляет больше реплик для увеличения пропускной способности, а вертикальное масштабирование увеличивает ресурсы (CPU и RAM), выделенные каждой реплике, для обработки более интенсивных нагрузок.
Это можно настроить при создании ClickPipe или в любой момент позже в разделе **Settings** -> **Advanced Settings** -> **Scaling**.

</details>

### Azure Event Hubs \\{#azure-eventhubs\\}

<details>

<summary>
  Работает ли ClickPipe для Azure Event Hubs без Kafka-интерфейса?
</summary>

Нет. Для работы ClickPipes требуется, чтобы в пространстве имён Event Hubs был включён Kafka-интерфейс. Это доступно только в тарифах выше **basic**. См. [документацию Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace) для получения дополнительной информации.

</details>

<details>

<summary>Работает ли Azure Schema Registry с ClickPipes?</summary>

Нет. ClickPipes поддерживает только реестры схем, которые являются API-совместимыми с Confluent Schema Registry, что не относится к Azure Schema Registry. Если вам нужна поддержка этого реестра схем, [свяжитесь с нашей командой](https://clickhouse.com/company/contact?loc=clickpipes).

</details>

<details>

<summary>
  Какие разрешения необходимы в моей политике для чтения данных из Azure Event Hubs?
</summary>

Для получения списка топиков и чтения событий предоставляемая ClickPipes политика совместного доступа должна как минимум содержать право «Listen».

</details>

<details>

<summary>Почему мой Event Hubs не возвращает данные?</summary>

Если ваш экземпляр ClickHouse находится в другом регионе или на другом континенте по сравнению с развертыванием Event Hubs, при подключении ClickPipes вы можете сталкиваться с таймаутами, а при чтении данных из Event Hub — с повышенной задержкой. Мы рекомендуем разворачивать ClickHouse Cloud и Azure Event Hubs в одном и том же облачном регионе или в регионах, расположенных близко друг к другу, чтобы избежать издержек по производительности.

</details>

<details>

<summary>Нужно ли указывать номер порта для Azure Event Hubs?</summary>

Да. ClickPipes ожидает, что вы укажете номер порта Kafka-интерфейса — `:9093`.

</details>

<details>

<summary>Остаются ли IP-адреса ClickPipes по-прежнему актуальными для Azure Event Hubs?</summary>

Да. Чтобы ограничить трафик к вашему экземпляру Event Hubs, добавьте [задокументированные статические NAT IP-адреса](../
/index.md#list-of-static-ips) в настройки контроля доступа по IP.

</details>

<details>
<summary>Строка подключения предназначена для Event Hub или для пространства имён Event Hub?</summary>

Подходят оба варианта. Мы настоятельно рекомендуем использовать политику совместного доступа на **уровне пространства имён**, чтобы получать выборки из нескольких Event Hubs.

</details>