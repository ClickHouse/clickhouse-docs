---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Контроль доступа на основе ролей Kinesis'
title: 'Контроль доступа на основе ролей Kinesis'
description: 'В этой статье показано, как клиенты ClickPipes могут использовать контроль доступа на основе ролей для аутентификации в Amazon Kinesis и безопасного доступа к своим потокам данных.'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье показано, как клиенты ClickPipes могут использовать контроль доступа на основе ролей для аутентификации в Amazon Kinesis и безопасного доступа к своим потокам данных.

## Введение {#introduction}

Перед тем как углубиться в настройку безопасного доступа к Kinesis, важно понять механизм. Вот обзор того, как ClickPipes может получить доступ к потокам Amazon Kinesis, принимая на себя роль в AWS-аккаунтах клиентов.

<Image img={secure_kinesis} alt="Безопасный Kinesis" size="lg" border/>

Используя этот подход, клиенты могут управлять всем доступом к своим потокам данных Kinesis в одном месте (IAM политика предполагаемой роли), не изменяя каждую политику доступа для потока отдельно.

## Настройка {#setup}

### Получение ARN IAM роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свой облачный аккаунт ClickHouse.

2 - Выберите сервис ClickHouse, с которым вы хотите создать интеграцию.

3 - Перейдите на вкладку **Настройки**.

4 - Прокрутите страницу вниз до раздела **Информация о сетевой безопасности** внизу страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, принадлежащее сервису, как показано ниже.

<Image img={secures3_arn} alt="Безопасный S3 ARN" size="lg" border/>

### Настройка IAM роли assume {#setting-up-iam-assume-role}

#### Вручную создайте IAM роль. {#manually-create-iam-role}

1 - Войдите в свой AWS аккаунт в веб-браузере с IAM пользователем, который имеет разрешение на создание и управление IAM ролями.

2 - Перейдите в консоль IAM.

3 - Создайте новую IAM роль с следующей IAM и Trust политикой. Обратите внимание, что имя IAM роли **должно начинаться с** `ClickHouseAccessRole-`, чтобы это работало.

Политика доверия (Пожалуйста, замените `{ClickHouse_IAM_ARN}` на ARN IAM роли, принадлежащей вашему экземпляру ClickHouse):

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

IAM политика (Пожалуйста, замените `{STREAM_NAME}` на имя вашего потока Kinesis):

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

4 - Скопируйте новый **IAM Role Arn** после создания. Это то, что необходимо для доступа к вашему потоку Kinesis.
