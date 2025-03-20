---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: Ролевой доступ к Kinesis
title: Ролевой доступ к Kinesis
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';

В этой статье демонстрируется, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации с Amazon Kinesis и безопасного доступа к своим потокам данных.

## Введение {#introduction}

Перед тем, как углубиться в настройку безопасного доступа к Kinesis, важно понять механизм. Вот обзор того, как ClickPipes может получить доступ к потокам Amazon Kinesis, принимая на себя роль в учетных записях AWS клиентов.

<img src={secure_kinesis} alt="Безопасный Kinesis" />

Используя этот подход, клиенты могут управлять всем доступом к своим потокам данных Kinesis в одном месте (политика IAM предполагаемой роли), не модифицируя политику доступа каждого потока индивидуально.

## Настройка {#setup}

### Получение ARN IAM роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого хотите создать интеграцию.

3 - Перейдите на вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, относящееся к сервису, как показано ниже.

<img src={secures3_arn} alt="Безопасный S3 ARN" />

### Настройка роли IAM assume {#setting-up-iam-assume-role}

#### Вручную создайте IAM роль. {#manually-create-iam-role}

1 - Войдите в свою учетную запись AWS через веб-браузер с пользователем IAM, который имеет разрешение на создание и управление IAM ролями.

2 - Перейдите в консоль сервиса IAM.

3 - Создайте новую IAM роль с следующей политикой IAM и доверия. Обратите внимание, что имя IAM роли **должно начинаться с** `ClickHouseAccessRole-`, чтобы это работало.

Политика доверия (пожалуйста, замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, относящуюся к вашему экземпляру ClickHouse):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Политика IAM (пожалуйста, замените `{STREAM_NAME}` на имя вашего потока Kinesis):

```json
{
    "Version": "2012-10-17",
        "Statement": [
        {
            "Action": [
                "kinesis:DescribeStream",
                "kinesis:GetShardIterator",
                "kinesis:GetRecords",
                "kinesis:ListShards",
                "kinesis:SubscribeToShard",
                "kinesis:DescribeStreamConsumer",
                "kinesis:RegisterStreamConsumer",
                "kinesis:DeregisterStreamConsumer",
                "kinesis:ListStreamConsumers"
            ],
            "Resource": [
                "arn:aws:kinesis:region:account-id:stream/{STREAM_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "kinesis:ListStreams"
            ],
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}
```

4 - Скопируйте новый **ARN IAM роли** после создания. Это то, что необходимо для доступа к вашему Kinesis потоку.
