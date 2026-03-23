---
sidebar_label: 'Настройка неупорядоченного режима'
sidebar_position: 3
title: 'Настройка неупорядоченного режима для непрерывной ингестии'
slug: /integrations/clickpipes/object-storage/gcs/unordered-mode
description: 'Пошаговое руководство по настройке неупорядоченного режима для непрерывной ингестии в ClickPipes для GCS.'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

По умолчанию GCS ClickPipe исходит из того, что файлы добавляются в бакет в [лексикографическом порядке](/integrations/clickpipes/object-storage/gcs/overview#continuous-ingestion-lexicographical-order). Можно настроить GCS ClickPipe для приёма файлов, у которых нет естественного порядка, создав подписку [Google Cloud Pub/Sub](https://cloud.google.com/pubsub), подключённую к бакету. Это позволяет ClickPipes отслеживать уведомления `OBJECT_FINALIZE` и выполнять приём любых новых файлов независимо от схемы именования файлов.

:::note
Неупорядоченный режим **не** поддерживается для публичных бакетов. Для него требуется аутентификация через **сервисный аккаунт** и подписка [Google Cloud Pub/Sub](https://cloud.google.com/pubsub), подключённая к бакету.
:::

## Как это работает \{#how-it-works\}

В этом режиме GCS ClickPipe выполняет первоначальную загрузку **всех файлов** по выбранному пути, а затем отслеживает уведомления об объектах через подписку Pub/Sub, соответствующие указанному пути. Любое сообщение о ранее обнаруженном файле, файле, не соответствующем пути, или событии другого типа будет **игнорироваться**. **Невозможно** начать ингестию с определённого файла или момента времени — ClickPipes всегда загружает все файлы по выбранному пути.

При приёме данных могут возникать различные сбои, которые могут приводить к частичным вставкам или дублированию данных. ClickPipes для Объектного хранилища устойчивы к сбоям вставки и обеспечивают exactly-once semantics за счёт использования временных промежуточных таблиц. Сначала данные вставляются в промежуточную таблицу; если что-то идёт не так, промежуточная таблица очищается, а вставка повторяется с чистого состояния. Только после успешного завершения вставки партиции перемещаются в целевую таблицу.

<VerticalStepper type="numbered" headerLevel="h2">
  ## Создайте тему Google Cloud Pub/Sub \{#create-pubsub-topic\}

  **1.** В Google Cloud Console перейдите в **Pub/Sub &gt; Topics &gt; Create topic**. Создайте новую тему с подпиской по умолчанию и запишите **Topic Name**.

  **2.** Настройте уведомление бакета GCS, которое публикует [события `OBJECT_FINALIZE`](https://docs.cloud.google.com/storage/docs/pubsub-notifications) в тему Pub/Sub, созданную выше.

  **2.1.** Этот шаг нельзя выполнить в Google Cloud Console, поэтому необходимо использовать клиент `gcloud` или предпочитаемый программный интерфейс Google Cloud. Например, с помощью `gcloud`:

  ```bash
  # Создать уведомление Pub/Sub для новых объектов в бакете
  gcloud storage buckets notifications create "gs://${YOUR_BUCKET_NAME}" \
    --topic="projects/${YOUR_PROJECT_ID}/topics/${YOUR_TOPIC_NAME}" \
    --event-types="OBJECT_FINALIZE" \
    --payload-format="json"

  # Вывести список уведомлений Pub/Sub в бакете
  gcloud storage buckets notifications describe
  ```

  ## Настройте service account \{#configure-service-account\}

  **1.** Настройте [service account](http://docs.cloud.google.com/iam/docs/keys-create-delete) с [необходимыми правами доступа](/01_overview.md/#permissions), чтобы разрешить ClickPipes перечислять и получать объекты в указанном бакете, а также получать и мониторить уведомления из подписки Pub/Sub.

  **1.1.** Этот шаг можно выполнить в Google Cloud Console, с помощью клиента `gcloud` или предпочитаемого программного интерфейса Google Cloud. Например, с помощью `gcloud`:

  ```bash
  # 1. Предоставить доступ на чтение к бакету GCS
  gcloud storage buckets add-iam-policy-binding "gs://${YOUR_BUCKET_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

  # 2. Предоставить доступ на чтение к подписке Pub/Sub
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.subscriber"

  # 3. Предоставить право на получение метаданных подписки Pub/Sub
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.viewer"
  ```

  ## Создайте ClickPipe в неупорядоченном режиме \{#create-clickpipe\}

  **1.** В консоли ClickHouse Cloud перейдите в **Data Sources &gt; Create ClickPipe** и выберите **Google Cloud Storage**. Введите данные для подключения к вашему бакету GCS. В разделе **Authentication method** выберите **Service Account** и укажите ключ service account в формате `.json`.

  **2.** Включите **Continuous ingestion**, затем выберите **Any order** в качестве режима ингестии и укажите имя **Pub/Sub subscription** для подписки, подключённой к вашему бакету. Имя подписки должно соответствовать следующему формату:

  ```text
  projects/${YOUR_PROJECT_ID}/subscriptions/${YOUR_SUBSCRIPTION_NAME}
  ```

  **3.** Нажмите **Incoming data**. Задайте **ключ сортировки** для целевой таблицы. При необходимости внесите изменения в сопоставленную схему, затем настройте роль для пользователя базы данных ClickPipes.

  **4.** Проверьте настройку и нажмите **Create ClickPipe**. ClickPipes выполнит первоначальное сканирование вашего бакета, чтобы загрузить все существующие файлы, соответствующие указанному пути, а затем начнёт обрабатывать файлы по мере поступления в тему новых событий `OBJECT_FINALIZE`.
</VerticalStepper>