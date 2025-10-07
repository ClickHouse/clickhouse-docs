---
slug: '/integrations/clickpipes/secure-kinesis'
sidebar_label: 'Контроль доступа на основе ролей Kinesis'
description: 'Эта статья демонстрирует, как клиенты ClickPipes могут использовать'
title: 'Контроль доступа на основе ролей Kinesis'
doc_type: guide
---
import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

Эта статья демонстрирует, как клиенты ClickPipes могут использовать контроль доступа на основе ролей для аутентификации с Amazon Kinesis и безопасного доступа к своим потокам данных.

## Пререквизиты {#prerequisite}

Для выполнения этого руководства вам понадобится:
- Активный сервис ClickHouse Cloud
- Учетная запись AWS

## Введение {#introduction}

Перед тем как перейти к настройке безопасного доступа к Kinesis, важно понять механизм. Вот обзор того, как ClickPipes может получать доступ к потокам Amazon Kinesis, предполагая роль в учетной записи AWS клиентов.

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

Используя этот подход, клиенты могут управлять всем доступом к своим потокам данных Kinesis в одном месте (политика IAM предполагаемой роли), не изменяя индивидуально политику доступа для каждого потока.

## Настройка {#setup}

<VerticalStepper headerLevel="h3"/>

### Получение Arn роли IAM сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. Войдите в свою учетную запись ClickHouse Cloud.
- 2. Выберите сервис ClickHouse, для которого хотите создать интеграцию.
- 3. Выберите вкладку **Настройки**.
- 4. Прокрутите вниз до раздела **Информация о сетевой безопасности** внизу страницы.
- 5. Скопируйте значение **ID роли сервиса (IAM)**, относящееся к сервису, как показано ниже.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### Настройка предполагаемой роли IAM {#setting-up-iam-assume-role}

#### Вручную создайте роль IAM. {#manually-create-iam-role}

- 1. Войдите в свою учетную запись AWS в веб-браузере с пользователем IAM, который имеет разрешение на создание и управление ролями IAM.
- 2. Перейдите в консоль службы IAM.
- 3. Создайте новую роль IAM с типом доверенной сущности `AWS account`. Обратите внимание, что имя роли IAM **должно начинаться с** `ClickHouseAccessRole-`, чтобы это работало.

Для политики доверия замените `{ClickHouse_IAM_ARN}` на Arn роли IAM, относящейся к вашему экземпляру ClickHouse. Для политики IAM замените `{STREAM_NAME}` на имя вашего потока Kinesis.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": "sts:AssumeRole"
    },
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
        "arn:aws:kinesis:region:account-id:stream/{STREAM_NAME}/*"
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

</VerticalStepper>

```

- 4. Скопируйте новый **IAM Role Arn** после создания. Это то, что нужно для доступа к вашему потоку Kinesis.