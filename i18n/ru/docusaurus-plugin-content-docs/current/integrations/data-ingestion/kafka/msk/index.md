---
sidebar_label: 'Amazon MSK с коннектором Kafka (Sink)'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'Официальный коннектор Kafka от ClickHouse для Amazon MSK'
keywords: ['интеграция', 'kafka', 'amazon msk', 'sink', 'коннектор']
title: 'Интеграция Amazon MSK с ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Интеграция Amazon MSK с ClickHouse \{#integrating-amazon-msk-with-clickhouse\}

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

> Примечание: политика доступа, показанная в видео, является слишком разрешительной и предназначена только для быстрого начала работы. См. ниже рекомендации по настройке IAM по принципу наименьших привилегий.

## Предварительные требования \{#prerequisites\}

Мы предполагаем:

* вы знакомы с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md),
* вы знакомы с Amazon MSK и коннекторами MSK. Рекомендуем руководства Amazon MSK: [Getting Started guide](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) и [MSK Connect guide](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).

## Официальный коннектор Kafka от ClickHouse для Amazon MSK \{#the-official-kafka-connector-from-clickhouse-with-amazon-msk\}

### Соберите сведения для подключения \{#gather-your-connection-details\}

<ConnectionDetails />

### Шаги \{#steps\}

1. Ознакомьтесь с [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md).
2. [Создайте экземпляр MSK](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html).
3. [Создайте и назначьте роль IAM](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html).
4. Загрузите файл `jar` со страницы релизов ClickHouse Connector Sink ([Release page](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)).
5. Установите загруженный файл `jar` на странице [Custom plugin](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) консоли Amazon MSK.
6. Если коннектор взаимодействует с публичным экземпляром ClickHouse, [включите доступ в интернет](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).
7. Укажите имя топика, имя хоста экземпляра ClickHouse и пароль в конфигурации.

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


## Рекомендуемые разрешения IAM (минимально необходимые привилегии) \{#iam-least-privilege\}

Используйте наименьший набор разрешений, необходимых для вашей конфигурации. Начните с базового набора ниже и добавляйте дополнительные службы только в том случае, если вы их используете.

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
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

* Используйте блок Glue только если вы применяете AWS Glue Schema Registry.
* Используйте блок Secrets Manager только если вы получаете учетные данные и truststore из Secrets Manager. Ограничьте область действия ARN.
* Используйте блок S3 только если вы загружаете артефакты (например, truststore) из S3. Ограничьте область действия bucket/префикса.

См. также: [Рекомендации по работе с Kafka – IAM](../../clickpipes/kafka/04_best_practices.md#iam).


## Настройка производительности \{#performance-tuning\}

Один из способов повысить производительность — изменить размер пакета и количество записей, извлекаемых из Kafka, добавив следующее в конфигурацию **worker**:

```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

Конкретные значения, которые вы будете использовать, будут отличаться в зависимости от требуемого количества записей и их размера. Например, значения по умолчанию таковы:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

Вы можете найти более подробную информацию (как по реализации, так и по другим аспектам) в официальной документации [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) и
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config).


## Заметки по сетевой конфигурации для MSK Connect \{#notes-on-networking-for-msk-connect\}

Чтобы MSK Connect мог подключаться к ClickHouse, мы рекомендуем размещать ваш кластер MSK в приватной подсети с подключённым Private NAT для доступа в интернет. Инструкции по настройке приведены ниже. Обратите внимание, что публичные подсети поддерживаются, но не рекомендуются из‑за необходимости постоянно назначать Elastic IP-адрес вашему ENI, [подробнее об этом см. в документации AWS](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **Создайте приватную подсеть:** Создайте новую подсеть в рамках вашего VPC и обозначьте её как приватную. Эта подсеть не должна иметь прямого доступа в интернет.
1. **Создайте NAT-шлюз:** Создайте NAT-шлюз в публичной подсети вашего VPC. NAT-шлюз позволяет инстансам в вашей приватной подсети подключаться к интернету или другим сервисам AWS, но предотвращает установку входящих подключений из интернета к этим инстансам.
1. **Обновите таблицу маршрутизации:** Добавьте маршрут, направляющий трафик в интернет к NAT-шлюзу.
1. **Проверьте конфигурацию Security Groups и сетевых ACL:** Настройте ваши [security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) и [сетевые ACL (Access Control Lists)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) так, чтобы они разрешали необходимый трафик.
   1. От рабочих ENI MSK Connect к брокерам MSK по TLS-порту (обычно 9094).
   1. От рабочих ENI MSK Connect к конечной точке ClickHouse: 9440 (нативный TLS) или 8443 (HTTPS).
   1. Разрешите входящий трафик на security group брокера от security group рабочих MSK Connect.
   1. Для самостоятельно развернутого (self-hosted) ClickHouse откройте порт, настроенный на вашем сервере (по умолчанию 8123 для HTTP).
1. **Привяжите Security Groups к MSK:** Убедитесь, что соответствующие security groups привязаны к вашему кластеру MSK и рабочим MSK Connect.
1. **Подключение к ClickHouse Cloud:**
   1. Публичная конечная точка + список разрешённых IP-адресов (IP allowlist): требует исходящего трафика через NAT из приватных подсетей.
   1. Приватное подключение, где доступно (например, VPC peering/PrivateLink/VPN). Убедитесь, что включены DNS-имена VPC и разрешение DNS (VPC DNS hostnames/resolution), и что DNS может разрешать приватную конечную точку.
1. **Проверьте подключение (краткий чек‑лист):**
   1. В среде коннектора убедитесь, что разрешается DNS-имя bootstrap для MSK и выполняется подключение по TLS к порту брокера.
   1. Установите TLS-подключение к ClickHouse на порт 9440 (или 8443 для HTTPS).
   1. Если используются сервисы AWS (Glue/Secrets Manager), разрешите исходящий трафик к их конечным точкам.