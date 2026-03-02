---
sidebar_label: 'FAQ'
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

## Часто задаваемые вопросы о Kafka ClickPipes \{#faq\}

### Общие сведения \{#general\}

<details>

<summary>Как работает ClickPipes для Kafka?</summary>

ClickPipes использует специализированную архитектуру, запускающую Kafka Consumer API для чтения данных из указанного топика и последующей вставки данных в таблицу ClickHouse в конкретном сервисе ClickHouse Cloud.
</details>

<details>

<summary>В чём разница между ClickPipes и ClickHouse Kafka Table Engine?</summary>

Движок таблиц Kafka Table Engine — это базовая возможность ClickHouse, реализующая «pull‑модель», при которой сам сервер ClickHouse подключается к Kafka, извлекает события и затем записывает их локально.

ClickPipes — это отдельный облачный сервис, который работает независимо от сервиса ClickHouse. Он подключается к Kafka (или другим источникам данных) и отправляет события в связанный сервис ClickHouse Cloud. Такая слабо связанная архитектура обеспечивает высокую операционную гибкость, чёткое разделение обязанностей, масштабируемую ингестию, надёжное управление отказами, расширяемость и многое другое.
</details>

<details>

<summary>Каковы требования для использования ClickPipes для Kafka?</summary>

Для использования ClickPipes для Kafka вам понадобится запущенный брокер Kafka и сервис ClickHouse Cloud с включённой поддержкой ClickPipes. Также необходимо обеспечить доступ сервиса ClickHouse Cloud к вашему брокеру Kafka. Это можно сделать, разрешив удалённые подключения на стороне Kafka и добавив в список разрешённых [исходящие IP-адреса ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api) в конфигурации Kafka. В качестве альтернативы вы можете использовать [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) для подключения ClickPipes для Kafka к вашим брокерам Kafka.
</details>

<details>

<summary>Поддерживает ли ClickPipes для Kafka AWS PrivateLink?</summary>

AWS PrivateLink поддерживается. См. [документацию](/integrations/clickpipes/aws-privatelink) для получения дополнительной информации о настройке.
</details>

<details>

<summary>Могу ли я использовать ClickPipes для Kafka для записи данных в топик Kafka?</summary>

Нет, ClickPipes для Kafka предназначен для чтения данных из топиков Kafka, а не для записи данных в них. Для записи данных в топик Kafka вам понадобится отдельный продюсер Kafka.
</details>

<details>

<summary>Поддерживает ли ClickPipes несколько брокеров?</summary>

Да, если брокеры являются частью одного кворума, их можно настроить вместе, перечислив через `,`.
</details>

<details>

<summary>Можно ли масштабировать реплики ClickPipes?</summary>

Да, ClickPipes для стриминга можно масштабировать как горизонтально, так и вертикально.
Горизонтальное масштабирование добавляет больше реплик для увеличения пропускной способности, а вертикальное масштабирование увеличивает ресурсы (CPU и RAM), выделенные каждой реплике, для обработки более интенсивных нагрузок.
Это можно настроить при создании ClickPipe или в любой момент позже в разделе **Settings** -> **Advanced Settings** -> **Scaling**.
</details>

### Azure Event Hubs \{#azure-eventhubs\}

<details>

<summary>Работает ли ClickPipe для Azure Event Hubs без интерфейса Kafka?</summary>

Нет. ClickPipes требует, чтобы для пространства имен Event Hubs был включен интерфейс Kafka. Это доступно только в тарифах выше **basic**. См. [документацию Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace) для получения дополнительной информации.
</details>

<details>

<summary>Работает ли Azure Schema Registry с ClickPipes?</summary>

Нет. ClickPipes поддерживает только реестры схем, которые совместимы по API с Confluent Schema Registry, что не относится к Azure Schema Registry. Если вам требуется поддержка этого реестра схем, [свяжитесь с нашей командой](https://clickhouse.com/company/contact?loc=clickpipes).
</details>

<details>

<summary>Какие разрешения нужны моей политике, чтобы потреблять данные из Azure Event Hubs?</summary>

Чтобы перечислять топики и потреблять события, для ClickPipes в политике общего доступа требуется как минимум право «Listen».
</details>

<details>

<summary>Почему мой Event Hubs не возвращает никаких данных?</summary>

Если ваш экземпляр ClickHouse находится в другом регионе или на другом континенте по сравнению с вашим развертыванием Event Hubs, вы можете столкнуться с тайм-аутами при первичной настройке ClickPipes и с повышенной задержкой при чтении данных из Event Hub. Мы рекомендуем развертывать ClickHouse Cloud и Azure Event Hubs в одном регионе облака или в регионах, расположенных близко друг к другу, чтобы избежать издержек по производительности.
</details>

<details>

<summary>Нужно ли указывать номер порта для Azure Event Hubs?</summary>

Да. ClickPipes ожидает, что вы укажете номер порта для интерфейса Kafka, который должен быть `:9093`.
</details>

<details>

<summary>Остаются ли IP-адреса ClickPipes актуальными для Azure Event Hubs?</summary>

Да. Чтобы ограничить трафик к вашему экземпляру Event Hubs, добавьте [задокументированные статические NAT IP-адреса](../
/index.md#list-of-static-ips) в список разрешённых IP-адресов.

</details>

<details>
<summary>Строка подключения предназначена для конкретного Event Hub или для пространства имен Event Hub?</summary>

Подойдут оба варианта. Мы настоятельно рекомендуем использовать политику общего доступа на **уровне пространства имен**, чтобы получать данные из нескольких Event Hubs.
</details>