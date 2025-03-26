---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Доступ на основе ролей для Kinesis'
title: 'Доступ на основе ролей для Kinesis'
description: 'В этой статье демонстрируется, как клиенты ClickPipes могут использовать контроль доступа на основе ролей для аутентификации с Amazon Kinesis и безопасного доступа к своим потокам данных.'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье демонстрируется, как клиенты ClickPipes могут использовать контроль доступа на основе ролей для аутентификации с Amazon Kinesis и безопасного доступа к своим потокам данных.

## Введение {#introduction}

Перед тем как погрузиться в настройку безопасного доступа к Kinesis, важно понять механизм. Вот обзор того, как ClickPipes может получать доступ к потокам Amazon Kinesis, принимая роль в учетных записях AWS клиентов.

<Image img={secure_kinesis} alt="Безопасный Kinesis" size="lg" border/>

Используя этот подход, клиенты могут управлять всем доступом к своим потокам данных Kinesis в одном месте (IAM политика предполагаемой роли), не прибегая к изменению политики доступа для каждого потока индивидуально.

## Настройка {#setup}

### Получение Arn IAM роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою облачную учетную запись ClickHouse.

2 - Выберите сервис ClickHouse, с которым вы хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** внизу страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, принадлежащее сервису, как показано ниже.

<Image img={secures3_arn} alt="Безопасный S3 ARN" size="lg" border/>

### Настройка IAM assume role {#setting-up-iam-assume-role}

#### Вручную создайте IAM роль. {#manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере с пользователем IAM, которому предоставлены разрешения на создание и управление IAM ролями.

2 - Перейдите в консоль сервиса IAM.

3 - Создайте новую IAM роль с следующими IAM и доверительной политикой. Обратите внимание, что имя IAM роли **должно начинаться с** `ClickHouseAccessRole-`, чтобы это работало.

Доверительная политика (пожалуйста, замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, принадлежащий вашему экземпляру ClickHouse):

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

IAM политика (пожалуйста, замените `{STREAM_NAME}` на имя вашего потока Kinesis):

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

4 - Скопируйте новый **ARN роли IAM** после создания. Это то, что нужно для доступа к вашему потоку Kinesis.
