---
slug: /integrations/clickpipes/kinesis/auth
sidebar_label: 'Доступ на основе ролей в Kinesis'
title: 'Доступ на основе ролей в Kinesis'
description: 'В этой статье показано, как клиенты ClickPipes могут использовать доступ на основе ролей для аутентификации в Amazon Kinesis и безопасного доступа к своим потокам данных.'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье показано, как клиенты ClickPipes могут использовать доступ на основе ролей, чтобы аутентифицироваться в Amazon Kinesis и безопасно получать доступ к своим потокам данных.


## Предварительные требования \{#prerequisite\}

Чтобы воспользоваться этим руководством, вам потребуется:

- Активный сервис ClickHouse Cloud
- Учетная запись AWS

## Введение \{#introduction\}

Прежде чем переходить к настройке безопасного доступа к Kinesis, важно понять механизм работы. Ниже приведён обзор того, как ClickPipes могут получать доступ к потокам Amazon Kinesis, принимая роль (assumed role) в AWS-аккаунтах клиентов.

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

Используя этот подход, клиенты могут управлять всем доступом к своим потокам данных Kinesis в одном месте — в IAM-политике для принимаемой роли, — без необходимости изменять политику доступа каждого потока по отдельности.

## Настройка \{#setup\}

<VerticalStepper headerLevel="h3"/>

### Получение ARN роли службы IAM для ClickHouse \{#obtaining-the-clickhouse-service-iam-role-arn\}

- 1. Войдите в свою учетную запись ClickHouse Cloud.
- 2. Выберите сервис ClickHouse, для которого вы хотите создать интеграцию.
- 3. Откройте вкладку **Settings**.
- 4. Прокрутите страницу вниз до раздела **Network security information** в нижней части страницы.
- 5. Скопируйте значение **Service role ID (IAM)** для этого сервиса, как показано ниже.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### Настройка роли IAM для использования AssumeRole \{#setting-up-iam-assume-role\}

#### Ручное создание роли IAM. \{#manually-create-iam-role\}

- 1. Войдите в свою учетную запись AWS в веб-браузере под пользователем IAM, у которого есть права на создание и управление ролями IAM.
- 2. Перейдите в консоль сервиса IAM.
- 3. Создайте новую роль IAM с типом доверенной сущности `AWS account`. Обратите внимание, что имя роли IAM **должно начинаться с** `ClickHouseAccessRole-`, иначе это не будет работать.

   **i. Настройте политику доверия (Trust Policy)**

   Политика доверия позволяет роли IAM ClickHouse принимать (assume) эту роль. Замените `{ClickHouse_IAM_ARN}` на ARN роли IAM из вашего сервиса ClickHouse (полученный на предыдущем шаге).

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

   **ii. Настройте политику прав (Permission Policy)**

   Политика прав предоставляет доступ к вашему потоку Kinesis. Замените следующие плейсхолдеры:
  - `{REGION}`: ваш регион AWS (например, `us-east-1`)
  - `{ACCOUNT_ID}`: идентификатор вашей учетной записи AWS
  - `{STREAM_NAME}`: имя вашего потока Kinesis

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
         "Action": [
           "kinesis:ListStreams"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

- 4. После создания скопируйте новый **IAM Role ARN**. Он необходим для доступа к вашему потоку Kinesis.