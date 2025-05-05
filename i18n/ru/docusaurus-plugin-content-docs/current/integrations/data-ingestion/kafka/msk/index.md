---
sidebar_label: 'Amazon MSK с Sink коннектором'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'Официальный Kafka коннектор от ClickHouse для Amazon MSK'
keywords: ['интеграция', 'kafka', 'amazon msk', 'sink', 'коннектор']
title: 'Интеграция Amazon MSK с ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


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
* вы знакомы с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md), Amazon MSK и MSK Connectors. Рекомендуем ознакомиться с [Руководством по началу работы с Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) и [Руководством по MSK Connect](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).
* Брокер MSK доступен в публичном режиме. См. раздел [Публичный доступ](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) Руководства разработчика.

## Официальный Kafka коннектор от ClickHouse для Amazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### Соберите информацию о подключении {#gather-your-connection-details}

<ConnectionDetails />

### Шаги {#steps}
1. Убедитесь, что вы знакомы с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
1. [Создайте экземпляр MSK](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html).
1. [Создайте и назначьте IAM роль](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html).
1. Скачайте файл `jar` со страницы [Релизы ClickHouse Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect/releases).
1. Установите загруженный файл `jar` на [странице пользовательских плагинов](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) в консоли Amazon MSK.
1. Если коннектор взаимодействует с публичным экземпляром ClickHouse, [включите доступ в интернет](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).
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
Одним из способов увеличения производительности является настройка размера пакета и количества записей, которые извлекаются из Kafka, добавив следующее в конфигурацию **worker**:
```yml
consumer.max.poll.records=[ЧИСЛО ЗАПИСЕЙ]
consumer.max.partition.fetch.bytes=[ЧИСЛО ЗАПИСЕЙ * РАЗМЕР ЗАПИСИ В БАЙТАХ]
```

Конкретные значения будут варьироваться в зависимости от желаемого числа записей и размера записи. Например, значения по умолчанию:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

Более подробную информацию (как по реализации, так и по другим аспектам) можно найти в официальной документации по [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) и 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config).

## Замечания по сетевым настройкам для MSK Connect {#notes-on-networking-for-msk-connect}

Для того чтобы MSK Connect смог подключиться к ClickHouse, мы рекомендуем, чтобы ваш кластер MSK находился в частной подсети с подключенным Private NAT для доступа в интернет. Инструкции по настройке приведены ниже. Обратите внимание, что публичные подсети поддерживаются, но не рекомендуются из-за необходимости постоянно назначать Elastic IP адрес вашему ENI, [AWS предоставляет более подробную информацию здесь](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **Создайте частную подсеть:** Создайте новую подсеть в вашем VPC, назначив её как частную подсеть. Эта подсеть не должна иметь прямого доступа в интернет.
1. **Создайте NAT шлюз:** Создайте NAT шлюз в публичной подсети вашего VPC. NAT шлюз позволяет экземплярам в вашей частной подсети подключаться к интернету или другим AWS сервисам, но предотвращает инициацию соединения с этими экземплярами из интернета.
1. **Обновите таблицу маршрутизации:** Добавьте маршрут, который направляет трафик, идущий в интернет, на NAT шлюз.
1. **Убедитесь в настройках группы безопасности и сетевых ACL:** Настройте ваши [группы безопасности](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) и [сетевые ACL (Списки контроля доступа)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) для разрешения соответствующего трафика к и от вашего экземпляра ClickHouse. 
   1. Для ClickHouse Cloud настройте вашу группу безопасности для разрешения входящего трафика на портах 9440 и 8443. 
   1. Для самоуправляемого ClickHouse настройте вашу группу безопасности для разрешения входящего трафика на порту в вашем конфигурационном файле (по умолчанию 8123).
1. **Присоедините группы безопасности к MSK:** Убедитесь, что новые группы безопасности, направленные на NAT шлюзы, прикреплены к вашему кластеру MSK.
