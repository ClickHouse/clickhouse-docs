---
sidebar_label: Amazon MSK с коннектором Kafka Sink
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: Официальный коннектор Kafka от ClickHouse с Amazon MSK
keywords: [интеграция, kafka, amazon msk, sink, коннектор]
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Интеграция Amazon MSK с ClickHouse

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/6lKI_WlQ3-s"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## Предварительные требования {#prerequisites}
Мы предполагаем:
* вы знакомы с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md), Amazon MSK и MSK Connectors. Рекомендуем ознакомиться с [Руководством по Началу Работы Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) и [Руководством MSK Connect](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).
* Брокер MSK доступен публично. См. раздел [Публичный доступ](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) в Руководстве для разработчиков.

## Официальный коннектор Kafka от ClickHouse с Amazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### Соберите ваши данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

### Шаги {#steps}
1. Убедитесь, что вы знакомы с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md).
1. [Создать экземпляр MSK](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html).
1. [Создать и назначить IAM роль](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html).
1. Скачайте файл `jar` с страницы [Релиз ClickHouse Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect/releases).
1. Установите скачанный файл `jar` на [странице пользовательских плагинов](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) консоли Amazon MSK.
1. Если Коннектор взаимодействует с публичным экземпляром ClickHouse, [включите доступ в интернет](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).
1. Укажите имя темы, имя хоста экземпляра ClickHouse и пароль в конфигурации.
```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

## Настройка производительности {#performance-tuning}
Один из способов увеличения производительности — это настройка размера пакета и количества записей, которые извлекаются из Kafka, добавив следующее в конфигурацию **worker**:
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

Конкретные значения, которые вы используете, будут зависеть от желаемого количества записей и размера записей. Например, значения по умолчанию:
```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

Вы можете найти дополнительные детали (как по реализации, так и по другим соображениям) в официальной документации [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) и 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config).

## Примечания по сетевым настройкам для MSK Connect {#notes-on-networking-for-msk-connect}

Чтобы MSK Connect мог подключаться к ClickHouse, рекомендуется, чтобы ваш кластер MSK находился в частной подсети с подключенной частной NAT для доступа в интернет. Инструкции по настройке приведены ниже. Обратите внимание, что публичные подсети поддерживаются, но не рекомендуются из-за необходимости постоянно назначать Elastic IP адрес вашему ENI, [AWS предоставляет больше деталей здесь](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).

1. **Создайте частную подсеть:** Создайте новую подсеть в вашем VPC, назначив её как частную подсеть. Эта подсеть не должна иметь прямого доступа к интернету.
1. **Создайте NAT-шлюз:** Создайте NAT-шлюз в публичной подсети вашего VPC. NAT-шлюз позволяет экземплярам в вашей частной подсети подключаться к интернету или другим AWS сервисам, но предотвращает инициацию соединения с этими экземплярами из интернета.
1. **Обновите таблицу маршрутов:** Добавьте маршрут, который направляет интернет-трафик к NAT-шлюзу.
1. **Убедитесь в настройке групп безопасности и сетевых ACL:** Настройте ваши [группы безопасности](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) и [сетевая ACL (Списки контроля доступа)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html), чтобы разрешить соответствующий трафик к вашему экземпляру ClickHouse и от него.
   1. Для ClickHouse Cloud настройте вашу группу безопасности, чтобы разрешить входящий трафик на портах 9440 и 8443. 
   1. Для самостоятельного размещения ClickHouse настройте вашу группу безопасности, чтобы разрешить входящий трафик на порту в вашем конфигурационном файле (по умолчанию 8123).
1. **Присоедините группы безопасности к MSK:** Убедитесь, что эти новые группы безопасности, направленные к NAT-шлюзам, прикреплены к вашему кластеру MSK.
