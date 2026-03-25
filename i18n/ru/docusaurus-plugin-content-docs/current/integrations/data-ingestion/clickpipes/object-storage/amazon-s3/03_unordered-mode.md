---
sidebar_label: 'Настройка неупорядоченного режима'
sidebar_position: 3
title: 'Настройка неупорядоченного режима для непрерывной ингестии'
slug: /integrations/clickpipes/object-storage/s3/unordered-mode
description: 'Пошаговое руководство по настройке неупорядоченного режима для непрерывной ингестии в ClickPipes для S3.'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import cp_eb_s3_enable from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_s3_enable.png';
import cp_eb_rule_define from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_define.png';
import cp_eb_rule_target from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_target.png';
import cp_eb_rule_created from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_created.png';
import Image from '@theme/IdealImage';

По умолчанию S3 ClickPipe предполагает, что файлы добавляются в бакет в [лексикографическом порядке](/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-lexicographical-order). S3 ClickPipe можно настроить на приём файлов без явного порядка, создав очередь [Amazon SQS](https://aws.amazon.com/sqs/), подключённую к бакету, и при необходимости используя [Amazon EventBridge](https://aws.amazon.com/eventbridge/) в качестве маршрутизатора событий. Это позволяет ClickPipes отслеживать события `ObjectCreated:*` и выполнять приём новых файлов независимо от принятого соглашения об именовании.

:::note
Неупорядоченный режим **поддерживается только** для Amazon S3 и **не** поддерживается для публичных бакетов или S3-совместимых сервисов. Для него необходимо настроить очередь [Amazon SQS](https://aws.amazon.com/sqs/), подключённую к бакету, и при необходимости использовать [Amazon EventBridge](https://aws.amazon.com/eventbridge/) в качестве маршрутизатора событий.
:::

## Как это работает \{#how-it-works\}

В этом режиме S3 ClickPipe выполняет первоначальную загрузку **всех файлов** по выбранному пути, а затем отслеживает в очереди события `ObjectCreated:*`, соответствующие указанному пути. Любое сообщение для ранее обнаруженного файла, файла, не соответствующего пути, или события другого типа будет **игнорироваться**. Файлы загружаются, когда достигается порог, настроенный в `max insert bytes` или `max file count`, либо по истечении настраиваемого интервала (по умолчанию 30 секунд). **Невозможно** начать ингестию с определённого файла или момента времени — ClickPipes всегда загружают все файлы по выбранному пути.

При приёме данных могут возникать различные сбои, что может приводить к частичным вставкам или дублированию данных. ClickPipes для объектного хранилища устойчивы к сбоям вставки и обеспечивают семантику exactly-once с использованием временных промежуточных таблиц. Сначала данные вставляются в промежуточную таблицу; если что-то идёт не так, промежуточная таблица очищается, и вставка повторяется из чистого состояния. Только после успешного завершения вставки партиции перемещаются в целевую таблицу.

<VerticalStepper type="numbered" headerLevel="h2">
  ## Создание очереди Amazon SQS \{#create-sqs-queue\}

  **1.** В консоли AWS перейдите в раздел **Simple Queue Service &gt; Create queue**. Используйте настройки по умолчанию для создания новой стандартной очереди.

  :::tip
  Настоятельно рекомендуем настроить **Dead-Letter-Queue (DLQ)** для очереди SQS — это упрощает отладку и повторную обработку неудачных сообщений. Если DLQ настроен, неудачные сообщения будут повторно помещены в очередь и обработаны повторно столько раз, сколько указано в параметре `maxReceiveCount` DLQ.
  :::

  **2.** Подключите ваш S3 бакет к очереди SQS, используя один из двух вариантов ниже. EventBridge рекомендуется для большинства сценариев использования, поскольку поддерживает fan-out, более гибкую фильтрацию событий и не подпадает под ограничение S3, допускающее только одно правило уведомления на тип события на prefix.

  <Tabs groupId="s3-notification-method">
    <TabItem value="eventbridge" label="через EventBridge" default>
      **a.** В свойствах S3 бакета перейдите в **Event notifications &gt; Amazon EventBridge** и включите отправку уведомлений в EventBridge. Нажмите **Save changes**.

      <Image img={cp_eb_s3_enable} alt="Включение уведомлений Amazon EventBridge в свойствах S3 бакета" size="lg" border />

      **b.** В AWS Console перейдите в **Amazon EventBridge &gt; Rules &gt; Create rule**. Задайте имя правила (например, `S3ObjectCreated`), выберите шину событий **default** и нажмите **Next**. На шаге **Build event pattern** выберите **AWS events or EventBridge partner events** в качестве источника событий, затем вручную введите следующий шаблон события, заменив `<bucket-name>` именем вашего бакета:

      <Image img={cp_eb_rule_define} alt="Задание имени правила EventBridge и шины событий" size="lg" border />

      ```json
      {
        "source": ["aws.s3"],
        "detail-type": ["Object Created"],
        "detail": {
          "bucket": {
            "name": ["<bucket-name>"]
          }
        }
      }
      ```

      При необходимости добавьте в шаблон условие `object.key`, чтобы фильтровать по префиксу или суффиксу. Если добавляете его, убедитесь, что оно соответствует пути, заданному для ClickPipe.

      **c.** На шаге **Select target(s)** выберите **AWS service** в качестве типа цели и укажите **SQS queue**. Выберите очередь, созданную на предыдущем шаге. Оставьте флажок **Use execution role (recommended)** установленным, чтобы EventBridge автоматически создал необходимую роль IAM, затем нажмите **Next** и завершите мастер.

      <Image img={cp_eb_rule_target} alt="Настройка очереди SQS в качестве цели правила EventBridge" size="lg" border />

      <Image img={cp_eb_rule_created} alt="Правило EventBridge успешно создано" size="lg" border />

      **d.** Отредактируйте политику доступа очереди SQS, чтобы разрешить EventBridge отправлять в неё сообщения. Замените `<sqs-queue-arn>` и `<eventbridge-rule-arn>` соответствующими значениями:

      ```json
      {
        "Version": "2012-10-17",
        "Id": "example-ID",
        "Statement": [
          {
            "Sid": "AllowEventBridgeToSendMessage",
            "Effect": "Allow",
            "Principal": {
              "Service": "events.amazonaws.com"
            },
            "Action": "SQS:SendMessage",
            "Resource": "<sqs-queue-arn>",
            "Condition": {
              "ArnLike": {
                "aws:SourceArn": "<eventbridge-rule-arn>"
              }
            }
          }
        ]
      }
      ```
    </TabItem>

    <TabItem value="direct" label="Напрямую S3 → SQS">
      **a.** Отредактируйте политику доступа очереди SQS, чтобы разрешить вашему S3 бакету отправлять в неё сообщения. Замените `<sqs-queue-arn>`, `<bucket-arn>` и `<aws-account-id>` соответствующими значениями:

      ```json
      {
        "Version": "2012-10-17",
        "Id": "example-ID",
        "Statement": [
          {
            "Sid": "AllowS3ToSendMessage",
            "Effect": "Allow",
            "Principal": {
              "Service": "s3.amazonaws.com"
            },
            "Action": "SQS:SendMessage",
            "Resource": "<sqs-queue-arn>",
            "Condition": {
              "ArnLike": {
                "aws:SourceArn": "<bucket-arn>"
              },
              "StringEquals": {
                "aws:SourceAccount": "<aws-account-id>"
              }
            }
          }
        ]
      }
      ```

      **b.** В свойствах S3 бакета включите **Event notifications** для событий `ObjectCreated` и укажите в качестве назначения очередь SQS. При необходимости задайте префикс или суффикс, чтобы фильтровать, какие объекты будут вызывать уведомления, — если задаёте их, убедитесь, что они соответствуют пути, заданному для ClickPipe.

      :::note
      S3 не позволяет создавать несколько пересекающихся правил уведомлений для одних и тех же типов событий в одном бакете. Если у вас уже есть правило уведомлений для событий `ObjectCreated` в этом бакете, используйте вместо этого подход с EventBridge.
      :::
    </TabItem>
  </Tabs>

  ## Настройка роли IAM \{#configure-iam-role\}

  **1.** В Cloud Console ClickHouse перейдите в раздел **Settings &gt; Network security information** и скопируйте **IAM role ARN** для вашего сервиса.

  **2.** В консоли AWS перейдите в раздел **IAM &gt; Roles &gt; Create role**. Выберите **Custom trust policy** и вставьте следующее содержимое, заменив `<ch-cloud-arn>` на ARN роли IAM, скопированный на предыдущем шаге:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowAssumeRole",
        "Effect": "Allow",
        "Principal": {
          "AWS": "<ch-cloud-arn>"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  ```

  **3.** Создайте встроенную политику для роли IAM с [необходимыми правами доступа](/integrations/clickpipes/object-storage/s3/overview#permissions) для чтения объектов из S3 и управления сообщениями в очереди SQS. Замените `<bucket-arn>` и `<sqs-queue-arn>` соответствующими значениями:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "S3BucketMetadataAccess",
        "Effect": "Allow",
        "Action": [
          "s3:GetBucketLocation",
          "s3:ListBucket"
        ],
        "Resource": "<bucket-arn>"
      },
      {
        "Sid": "AllowGetListObjects",
        "Effect": "Allow",
        "Action": [
          "s3:Get*",
          "s3:List*"
        ],
        "Resource": "<bucket-arn>/*"
      },
      {
        "Sid": "SQSNotificationsAccess",
        "Effect": "Allow",
        "Action": [
          "sqs:DeleteMessage",
          "sqs:ListQueues",
          "sqs:ReceiveMessage",
          "sqs:GetQueueAttributes"
        ],
        "Resource": "<sqs-queue-arn>"
      }
    ]
  }
  ```

  ## Создание ClickPipe в неупорядоченном режиме \{#create-clickpipe\}

  **1.** В Cloud Console ClickHouse Cloud перейдите в раздел **Data Sources &gt; Create ClickPipe** и выберите **Amazon S3**. Введите данные для подключения к вашему S3 бакету. В разделе **Authentication method** выберите **IAM role** и укажите ARN роли, созданной на предыдущем шаге.

  **2.** В разделе **Incoming data** включите **Continuous ingestion**. Выберите **Any order** в качестве режима ингестии и укажите **SQS queue URL** для очереди, подключённой к вашему бакету.

  **3.** В разделе **Parse information** определите **ключ сортировки** для целевой таблицы. Внесите необходимые изменения в сопоставленную schema, затем настройте роль для пользователя базы данных ClickPipes.

  **4.** Проверьте настройку и нажмите **Create ClickPipe**. ClickPipes выполнит первоначальное сканирование вашего бакета для загрузки всех существующих файлов, соответствующих указанному пути, а затем начнёт обрабатывать файлы по мере поступления новых событий `ObjectCreated:*` в очередь.
</VerticalStepper>