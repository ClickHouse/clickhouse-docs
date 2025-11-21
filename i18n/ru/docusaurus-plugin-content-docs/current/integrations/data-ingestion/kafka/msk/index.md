---
sidebar_label: 'Amazon MSK с Kafka Connector Sink'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'Официальный коннектор Kafka от ClickHouse с Amazon MSK'
keywords: ['интеграция', 'kafka', 'amazon msk', 'sink', 'коннектор']
title: 'Интеграция Amazon MSK с ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
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

> Примечание: политика, показанная в видео, имеет разрешительный характер и предназначена только для быстрого начала работы. См. ниже рекомендации по IAM с наименьшими привилегиями.



## Предварительные требования {#prerequisites}

Предполагается, что:

- вы знакомы с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md), Amazon MSK и MSK Connectors. Рекомендуем ознакомиться с [руководством по началу работы с Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) и [руководством по MSK Connect](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).
- брокер MSK общедоступен. См. раздел [Public Access](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) в руководстве для разработчиков.


## Официальный Kafka-коннектор от ClickHouse с Amazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### Подготовьте данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

### Шаги {#steps}

1. Убедитесь, что вы ознакомились с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
1. [Создайте экземпляр MSK](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html).
1. [Создайте и назначьте IAM-роль](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html).
1. Скачайте файл `jar` со [страницы релизов](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) ClickHouse Connect Sink.
1. Установите скачанный файл `jar` на [странице пользовательских плагинов](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) консоли Amazon MSK.
1. Если коннектор взаимодействует с публичным экземпляром ClickHouse, [включите доступ в интернет](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).
1. Укажите имя топика, имя хоста экземпляра ClickHouse и пароль в конфигурации.

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


## Рекомендуемые разрешения IAM (минимальные привилегии) {#iam-least-privilege}

Используйте минимальный набор разрешений, необходимых для вашей конфигурации. Начните с базовой конфигурации, приведенной ниже, и добавляйте дополнительные сервисы только при их использовании.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MSKClusterAccess",
      "Effect": "Allow",
      "Action": [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeClusterV2",
        "kafka:ListClusters",
        "kafka:ListClustersV2"
      ],
      "Resource": "*"
    },
    {
      "Sid": "KafkaAuthorization",
      "Effect": "Allow",
      "Action": [
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeCluster",
        "kafka-cluster:DescribeGroup",
        "kafka-cluster:DescribeTopic",
        "kafka-cluster:ReadData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalGlueSchemaRegistry",
      "Effect": "Allow",
      "Action": [
        "glue:GetSchema*",
        "glue:ListSchemas",
        "glue:ListSchemaVersions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalSecretsManager",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

- Используйте блок Glue только при использовании AWS Glue Schema Registry.
- Используйте блок Secrets Manager только при получении учетных данных или хранилищ доверенных сертификатов из Secrets Manager. Укажите конкретный ARN.
- Используйте блок S3 только при загрузке артефактов (например, хранилища доверенных сертификатов) из S3. Укажите конкретный bucket/prefix.

См. также: [Рекомендации по работе с Kafka – IAM](../../clickpipes/kafka/04_best_practices.md#iam).


## Настройка производительности {#performance-tuning}

Один из способов повышения производительности — настроить размер пакета и количество записей, извлекаемых из Kafka, добавив следующие параметры в конфигурацию **worker**:

```yml
consumer.max.poll.records=[КОЛИЧЕСТВО ЗАПИСЕЙ]
consumer.max.partition.fetch.bytes=[КОЛИЧЕСТВО ЗАПИСЕЙ * РАЗМЕР ЗАПИСИ В БАЙТАХ]
```

Конкретные значения зависят от требуемого количества записей и размера записи. Например, значения по умолчанию:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

Более подробную информацию (как по реализации, так и по другим аспектам) можно найти в официальной документации [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) и
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config).


## Примечания по настройке сети для MSK Connect {#notes-on-networking-for-msk-connect}

Для подключения MSK Connect к ClickHouse рекомендуется размещать кластер MSK в частной подсети с подключенным Private NAT для доступа в интернет. Инструкции по настройке приведены ниже. Обратите внимание, что публичные подсети поддерживаются, но не рекомендуются из-за необходимости постоянного назначения Elastic IP-адреса вашему ENI. [Подробнее об этом в документации AWS](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).

1. **Создайте частную подсеть:** Создайте новую подсеть в вашем VPC, обозначив её как частную. Эта подсеть не должна иметь прямого доступа к интернету.
1. **Создайте NAT Gateway:** Создайте NAT-шлюз в публичной подсети вашего VPC. NAT-шлюз позволяет экземплярам в частной подсети подключаться к интернету или другим сервисам AWS, но предотвращает инициирование соединения с этими экземплярами из интернета.
1. **Обновите таблицу маршрутизации:** Добавьте маршрут, направляющий трафик, предназначенный для интернета, к NAT-шлюзу.
1. **Убедитесь в правильной настройке групп безопасности и сетевых ACL:** Настройте ваши [группы безопасности](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) и [сетевые ACL (списки контроля доступа)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) для разрешения соответствующего трафика.
   1. От рабочих ENI MSK Connect к брокерам MSK на порт TLS (обычно 9094).
   1. От рабочих ENI MSK Connect к конечной точке ClickHouse: 9440 (нативный TLS) или 8443 (HTTPS).
   1. Разрешите входящий трафик в группе безопасности брокера из группы безопасности рабочих узлов MSK Connect.
   1. Для самостоятельно развёрнутого ClickHouse откройте порт, настроенный на вашем сервере (по умолчанию 8123 для HTTP).
1. **Присоедините группы безопасности к MSK:** Убедитесь, что эти группы безопасности присоединены к вашему кластеру MSK и рабочим узлам MSK Connect.
1. **Подключение к ClickHouse Cloud:**
   1. Публичная конечная точка + список разрешённых IP: требуется исходящий NAT из частных подсетей.
   1. Частное подключение, где доступно (например, VPC peering/PrivateLink/VPN). Убедитесь, что DNS-имена хостов VPC и разрешение имён включены, и DNS может разрешить частную конечную точку.
1. **Проверьте подключение (краткий контрольный список):**
   1. Из среды коннектора разрешите DNS начальной загрузки MSK и подключитесь через TLS к порту брокера.
   1. Установите TLS-соединение с ClickHouse на порту 9440 (или 8443 для HTTPS).
   1. При использовании сервисов AWS (Glue/Secrets Manager) разрешите исходящий трафик к этим конечным точкам.
