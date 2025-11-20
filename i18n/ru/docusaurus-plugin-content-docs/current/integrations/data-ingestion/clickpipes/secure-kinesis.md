---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Ролевой доступ к Kinesis'
title: 'Ролевой доступ к Kinesis'
description: 'В этой статье описывается, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации в Amazon Kinesis и безопасного доступа к потокам данных.'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье показано, как пользователи ClickPipes могут использовать ролевой доступ для аутентификации в Amazon Kinesis и безопасного доступа к потокам данных.


## Предварительные требования {#prerequisite}

Для работы с этим руководством вам потребуется:

- Активный сервис ClickHouse Cloud
- Учетная запись AWS


## Введение {#introduction}

Прежде чем перейти к настройке безопасного доступа к Kinesis, важно понять принцип работы. Ниже представлен обзор того, как ClickPipes может получать доступ к потокам Amazon Kinesis, принимая на себя роль в AWS-аккаунтах клиентов.

<Image img={secure_kinesis} alt='Безопасный Kinesis' size='lg' border />

При использовании этого подхода клиенты могут управлять всем доступом к своим потокам данных Kinesis в одном месте (в IAM-политике принимаемой роли), не изменяя политику доступа для каждого потока по отдельности.


## Настройка {#setup}

<VerticalStepper headerLevel='h3' />

### Получение ARN IAM-роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. Войдите в учетную запись ClickHouse Cloud.
- 2. Выберите сервис ClickHouse, для которого требуется создать интеграцию.
- 3. Перейдите на вкладку **Settings** (Настройки).
- 4. Прокрутите страницу вниз до раздела **Network security information** (Информация о сетевой безопасности).
- 5. Скопируйте значение **Service role ID (IAM)** (Идентификатор роли сервиса), как показано ниже.

<Image img={secures3_arn} alt='ARN защищенного S3' size='lg' border />

### Настройка IAM assume role {#setting-up-iam-assume-role}

#### Создание IAM-роли вручную {#manually-create-iam-role}

- 1. Войдите в учетную запись AWS через веб-браузер с помощью IAM-пользователя, имеющего права на создание и управление IAM-ролями.
- 2. Перейдите в консоль сервиса IAM.
- 3. Создайте новую IAM-роль с типом доверенной сущности `AWS account`. Обратите внимание, что имя IAM-роли **должно начинаться с** `ClickHouseAccessRole-`.

  **i. Настройка политики доверия**

  Политика доверия позволяет IAM-роли ClickHouse принимать эту роль. Замените `{ClickHouse_IAM_ARN}` на ARN IAM-роли вашего сервиса ClickHouse (полученный на предыдущем шаге).

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

  **ii. Настройка политики разрешений**

  Политика разрешений предоставляет доступ к потоку Kinesis. Замените следующие заполнители:
  - `{REGION}`: регион AWS (например, `us-east-1`)
  - `{ACCOUNT_ID}`: идентификатор учетной записи AWS
  - `{STREAM_NAME}`: имя потока Kinesis

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "kinesis:DescribeStream",
          "kinesis:GetShardIterator",
          "kinesis:GetRecords",
          "kinesis:ListShards",
          "kinesis:RegisterStreamConsumer",
          "kinesis:DeregisterStreamConsumer",
          "kinesis:ListStreamConsumers"
        ],
        "Resource": [
          "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "kinesis:SubscribeToShard",
          "kinesis:DescribeStreamConsumer"
        ],
        "Resource": [
          "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}/*"
        ]
      },
      {
        "Effect": "Allow",
        "Action": ["kinesis:ListStreams"],
        "Resource": "*"
      }
    ]
  }
  ```

- 4. Скопируйте ARN созданной IAM-роли. Он необходим для доступа к потоку Kinesis.
