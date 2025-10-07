---
'sidebar_label': 'Часто задаваемые вопросы'
'description': 'Часто задаваемые вопросы о ClickPipes для Kafka'
'slug': '/integrations/clickpipes/kafka/faq'
'sidebar_position': 1
'title': 'Kafka ClickPipes Часто задаваемые вопросы'
'doc_type': 'guide'
---
## Kafka ClickPipes FAQ {#faq}

### Общие вопросы {#general}

<details>

<summary>Как работает ClickPipes для Kafka?</summary>

ClickPipes использует специализированную архитектуру, работающую на API потребителя Kafka для чтения данных из заданной темы, а затем вставляет данные в таблицу ClickHouse на конкретном сервисе ClickHouse Cloud.
</details>

<details>

<summary>В чем разница между ClickPipes и движком таблиц ClickHouse для Kafka?</summary>

Движок таблиц Kafka является основной возможностью ClickHouse, которая реализует "модель вытягивания", где сам сервер ClickHouse подключается к Kafka, извлекает события и затем записывает их локально.

ClickPipes - это отдельный облачный сервис, который работает независимо от сервиса ClickHouse. Он подключается к Kafka (или другим источникам данных) и отправляет события на связанный сервис ClickHouse Cloud. Эта раздельная архитектура обеспечивает превосходную операционную гибкость, четкое разделение задач, масштабируемый прием данных, управление отказами и многое другое.
</details>

<details>

<summary>Каковы требования для использования ClickPipes для Kafka?</summary>

Чтобы использовать ClickPipes для Kafka, вам потребуется работающий брокер Kafka и сервис ClickHouse Cloud с активированным ClickPipes. Также необходимо убедиться, что ClickHouse Cloud может получить доступ к вашему брокеру Kafka. Это можно сделать, разрешив удаленное подключение на стороне Kafka, добавив IP-адреса [выходящего трафика ClickHouse Cloud](/manage/security/cloud-endpoints-api) в белый список в вашей настройке Kafka. В качестве альтернативы, вы можете использовать [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) для подключения ClickPipes для Kafka к вашим брокерам Kafka.
</details>

<details>

<summary>Поддерживает ли ClickPipes для Kafka AWS PrivateLink?</summary>

AWS PrivateLink поддерживается. См. [документацию](/integrations/clickpipes/aws-privatelink) для получения дополнительной информации о том, как его настроить.
</details>

<details>

<summary>Могу ли я использовать ClickPipes для Kafka для записи данных в тему Kafka?</summary>

Нет, ClickPipes для Kafka предназначен для чтения данных из тем Kafka, а не для записи данных в них. Чтобы записать данные в тему Kafka, вам понадобится использовать специализированный продюсер Kafka.
</details>

<details>

<summary>Поддерживает ли ClickPipes несколько брокеров?</summary>

Да, если брокеры являются частью одного кворума, их можно настроить вместе, разделив запятой `,`.
</details>

<details>

<summary>Могут ли реплики ClickPipes быть масштабированы?</summary>

Да, ClickPipes для потоковой передачи могут быть масштабированы как горизонтально, так и вертикально. Горизонтальное масштабирование добавляет больше реплик для увеличения пропускной способности, в то время как вертикальное масштабирование увеличивает ресурсы (CPU и RAM), выделенные каждой реплике для обработки более интенсивных нагрузок. Это можно настроить во время создания ClickPipe или в любое другое время в разделе **Настройки** -> **Расширенные настройки** -> **Масштабирование**.
</details>

### Azure Event Hubs {#azure-eventhubs}

<details>

<summary>Работает ли ClickPipe для Azure Event Hubs без Kafka поверхности?</summary>

Нет. ClickPipes требует, чтобы пространство имен Event Hubs имело включенную Kafka поверхность. Это доступно только на уровнях выше **базового**. См. [документацию Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace) для получения дополнительной информации.
</details>

<details>

<summary>Работает ли Azure Schema Registry с ClickPipes?</summary>

Нет. ClickPipes поддерживает только регистраторы схем, которые совместимы с API Confluent Schema Registry, что не относится к Azure Schema Registry. Если вам нужна поддержка этого регистра схем, [свяжитесь с нашей командой](https://clickhouse.com/company/contact?loc=clickpipes).
</details>

<details>

<summary>Какие разрешения нужны моей политике, чтобы потреблять данные из Azure Event Hubs?</summary>

Чтобы перечислить темы и потреблять события, совместная политика доступа, предоставленная ClickPipes, требует, как минимум, права 'Listen'.
</details>

<details>

<summary>Почему мой Event Hubs не возвращает никаких данных?</summary>

Если ваш экземпляр ClickHouse находится в другом регионе или на другом континенте от вашего развертывания Event Hubs, вы можете столкнуться с тайм-аутами при подключении ваших ClickPipes и высоким временем задержки при потреблении данных из Event Hub. Мы рекомендуем развертывать ClickHouse Cloud и Azure Event Hubs в одном облачном регионе или в региона, расположенные близко друг к другу, чтобы избежать потерь в производительности.
</details>

<details>

<summary>Следует ли включать номер порта для Azure Event Hubs?</summary>

Да. ClickPipes ожидает, что вы включите номер порта для Kafka поверхности, который должен быть `:9093`.
</details>

<details>

<summary>Актуальны ли IP-адреса ClickPipes для Azure Event Hubs?</summary>

Да. Чтобы ограничить трафик к вашему экземпляру Event Hubs, пожалуйста, добавьте [документированные статические NAT IPs](../index.md#list-of-static-ips) в белый список.
</details>

<details>
<summary>Является ли строка подключения для Event Hub или для пространства имен Event Hub?</summary>

Обе работают. Мы настоятельно рекомендуем использовать совместную политику доступа на **уровне пространства имен**, чтобы получить образцы из нескольких Event Hubs.
</details>