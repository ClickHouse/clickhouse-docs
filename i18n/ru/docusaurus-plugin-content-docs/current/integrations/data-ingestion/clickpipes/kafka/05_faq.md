---
sidebar_label: 'FAQ'
description: 'Часто задаваемые вопросы о ClickPipes для Kafka'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'FAQ по Kafka ClickPipes'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
---



## Часто задаваемые вопросы по Kafka ClickPipes {#faq}

### Общие вопросы {#general}

<details>

<summary>Как работает ClickPipes для Kafka?</summary>

ClickPipes использует выделенную архитектуру на основе Kafka Consumer API для чтения данных из указанного топика с последующей вставкой данных в таблицу ClickHouse в конкретном сервисе ClickHouse Cloud.

</details>

<details>

<summary>
  В чём разница между ClickPipes и движком таблиц Kafka в ClickHouse?
</summary>

Движок таблиц Kafka — это базовая возможность ClickHouse, реализующая модель pull, при которой сам сервер ClickHouse подключается к Kafka, извлекает события и записывает их локально.

ClickPipes — это отдельный облачный сервис, работающий независимо от сервиса ClickHouse. Он подключается к Kafka (или другим источникам данных) и отправляет события в связанный сервис ClickHouse Cloud. Такая разделённая архитектура обеспечивает превосходную операционную гибкость, чёткое разделение ответственности, масштабируемый приём данных, корректную обработку сбоев, расширяемость и многое другое.

</details>

<details>

<summary>Каковы требования для использования ClickPipes для Kafka?</summary>

Для использования ClickPipes для Kafka вам потребуется работающий брокер Kafka и сервис ClickHouse Cloud с включённым ClickPipes. Также необходимо обеспечить доступ ClickHouse Cloud к вашему брокеру Kafka. Это можно сделать, разрешив удалённое подключение на стороне Kafka и добавив в белый список [исходящие IP-адреса ClickHouse Cloud](/manage/data-sources/cloud-endpoints-api) в настройках Kafka. В качестве альтернативы можно использовать [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) для подключения ClickPipes для Kafka к вашим брокерам Kafka.

</details>

<details>

<summary>Поддерживает ли ClickPipes для Kafka AWS PrivateLink?</summary>

AWS PrivateLink поддерживается. Подробную информацию о настройке см. в [документации](/integrations/clickpipes/aws-privatelink).

</details>

<details>

<summary>
  Можно ли использовать ClickPipes для Kafka для записи данных в топик Kafka?
</summary>

Нет, ClickPipes для Kafka предназначен для чтения данных из топиков Kafka, а не для записи в них. Для записи данных в топик Kafka необходимо использовать выделенный продюсер Kafka.

</details>

<details>

<summary>Поддерживает ли ClickPipes несколько брокеров?</summary>

Да, если брокеры являются частью одного кворума, их можно настроить вместе, разделив запятой `,`.

</details>

<details>

<summary>Можно ли масштабировать реплики ClickPipes?</summary>

Да, ClickPipes для потоковой передачи данных можно масштабировать как горизонтально, так и вертикально.
Горизонтальное масштабирование добавляет больше реплик для увеличения пропускной способности, а вертикальное масштабирование увеличивает ресурсы (CPU и RAM), выделенные каждой реплике, для обработки более интенсивных нагрузок.
Это можно настроить при создании ClickPipe или в любой момент в разделе **Настройки** -> **Расширенные настройки** -> **Масштабирование**.

</details>

### Azure Event Hubs {#azure-eventhubs}

<details>

<summary>
  Работает ли ClickPipe для Azure Event Hubs без интерфейса Kafka?
</summary>

Нет. ClickPipes требует, чтобы в пространстве имён Event Hubs был включён интерфейс Kafka. Это доступно только в тарифах выше **basic**. Дополнительную информацию см. в [документации Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace).

</details>

<details>

<summary>Работает ли Azure Schema Registry с ClickPipes?</summary>

Нет. ClickPipes поддерживает только реестры схем, совместимые по API с Confluent Schema Registry, что не относится к Azure Schema Registry. Если вам требуется поддержка этого реестра схем, [свяжитесь с нашей командой](https://clickhouse.com/company/contact?loc=clickpipes).

</details>

<details>

<summary>
  Какие разрешения нужны моей политике для потребления данных из Azure Event Hubs?
</summary>

Для получения списка топиков и потребления событий политика общего доступа, предоставляемая ClickPipes, должна иметь как минимум разрешение Listen.

</details>

<details>

<summary>Почему мой Event Hubs не возвращает данные?</summary>

Если ваш экземпляр ClickHouse находится в другом регионе или на другом континенте по сравнению с развёртыванием Event Hubs, вы можете столкнуться с таймаутами при подключении ClickPipes и повышенной задержкой при потреблении данных из Event Hub. Рекомендуется развёртывать ClickHouse Cloud и Azure Event Hubs в одном облачном регионе или в близко расположенных регионах, чтобы избежать снижения производительности.

</details>

<details>

<summary>Нужно ли указывать номер порта для Azure Event Hubs?</summary>


Да. ClickPipes требует указания номера порта для интерфейса Kafka, который должен быть `:9093`.

</details>

<details>

<summary>Актуальны ли IP-адреса ClickPipes для Azure Event Hubs?</summary>

Да. Чтобы ограничить трафик к вашему экземпляру Event Hubs, добавьте [документированные статические NAT IP-адреса](../
/index.md#list-of-static-ips) в список разрешённых.

</details>

<details>
<summary>Строка подключения предназначена для Event Hub или для пространства имён Event Hub?</summary>

Работают оба варианта. Мы настоятельно рекомендуем использовать политику общего доступа на **уровне пространства имён** для получения образцов данных из нескольких Event Hubs.

</details>
