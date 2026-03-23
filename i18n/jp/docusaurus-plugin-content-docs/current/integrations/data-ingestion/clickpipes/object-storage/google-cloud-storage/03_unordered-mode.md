---
sidebar_label: '順不同モードを設定'
sidebar_position: 3
title: '継続的なインジェストのための順不同モードの設定'
slug: /integrations/clickpipes/object-storage/gcs/unordered-mode
description: 'GCS ClickPipes で継続的なインジェスト向けに順不同モードを設定するためのステップバイステップガイド。'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

デフォルトでは、GCS ClickPipe は、ファイルがバケットに[辞書順](/integrations/clickpipes/object-storage/gcs/overview#continuous-ingestion-lexicographical-order)で追加されることを前提としています。バケットに接続された [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) サブスクリプションを設定することで、明確な順序を持たないファイルを取り込むように GCS ClickPipe を設定できます。これにより、ClickPipes は `OBJECT_FINALIZE` 通知を受信し、ファイル名の命名規則に関係なく新しいファイルを取り込むことができます。

:::note
順不同モードは、パブリックバケットでは**サポートされていません**。これを使用するには、**Service Account** 認証と、バケットに接続された [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) サブスクリプションが必要です。
:::

## 仕組み \{#how-it-works\}

このモードでは、GCS ClickPipe は選択したパス内の**すべてのファイル**を初回ロードし、その後、指定したパスに一致する Pub/Sub サブスクリプション経由のオブジェクト通知を待ち受けます。すでに検出済みのファイルに対するメッセージ、パスに一致しないファイル、または別種のイベントは**無視**されます。特定のファイルまたは時点からインジェストを開始することは**できません**。ClickPipes は常に、選択したパス内のすべてのファイルをロードします。

データの取り込み時にはさまざまな障害が発生する可能性があり、その結果、部分的な insert や重複データが生じることがあります。Object Storage ClickPipes は insert 失敗に対して耐性があり、一時的なステージングテーブルを使って exactly-once semantics を提供します。データはまずステージングテーブルに insert されます。問題が発生した場合は、ステージングテーブルが切り詰められ、クリーンな状態から insert が再試行されます。insert が正常に完了した場合にのみ、パーティションが target テーブルに移動されます。

<VerticalStepper type="numbered" headerLevel="h2">
  ## Google Cloud Pub/Sub topic を作成する \{#create-pubsub-topic\}

  **1.** Google Cloud Console で、**Pub/Sub &gt; Topics &gt; Create topic** に移動します。デフォルトのサブスクリプション付きで新しい topic を作成し、**Topic Name** を控えておきます。

  **2.** 上で作成した Pub/Sub topic に [`OBJECT_FINALIZE` events](https://docs.cloud.google.com/storage/docs/pubsub-notifications) を公開する GCS bucket notification を設定します。

  **2.1.** この手順は Google Cloud Console では実行できないため、`gcloud` client または Google Cloud 用の任意のプログラムインターフェースを使う必要があります。たとえば、`gcloud` を使う場合は次のとおりです。

  ```bash
  # bucket 内の新しい object 用の Pub/Sub notification を作成する
  gcloud storage buckets notifications create "gs://${YOUR_BUCKET_NAME}" \
    --topic="projects/${YOUR_PROJECT_ID}/topics/${YOUR_TOPIC_NAME}" \
    --event-types="OBJECT_FINALIZE" \
    --payload-format="json"

  # bucket 内の Pub/Sub notifications を一覧表示する
  gcloud storage buckets notifications describe
  ```

  ## サービスアカウントを設定する \{#configure-service-account\}

  **1.** 指定した bucket 内のオブジェクトを ClickPipes が一覧取得および取得できるようにし、さらに Pub/Sub サブスクリプションからの通知を受信して監視できるようにするため、[必須 permissions](/01_overview.md/#permissions) を持つ [service account](http://docs.cloud.google.com/iam/docs/keys-create-delete) を設定します。

  **1.1.** この手順は Google Cloud Console、`gcloud` client、または Google Cloud 用の任意のプログラムインターフェースを使って実行できます。たとえば、`gcloud` を使う場合は次のとおりです。

  ```bash
  # 1. GCS bucket への読み取りアクセスを付与する
  gcloud storage buckets add-iam-policy-binding "gs://${YOUR_BUCKET_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

  # 2. Pub/Sub subscription への読み取りアクセスを付与する
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.subscriber"

  # 3. Pub/Sub subscription metadata を取得する権限を付与する
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.viewer"
  ```

  ## unordered モードで ClickPipe を作成する \{#create-clickpipe\}

  **1.** ClickHouse Cloud コンソールで、**Data Sources &gt; Create ClickPipe** に移動し、**Google Cloud Storage** を選択します。GCS bucket に接続するための詳細を入力します。**Authentication method** では **Service Account** を選択し、`.json` service account key を指定します。

  **2.** **Continuous ingestion** をオンにし、インジェストモードとして **Any order** を選択してから、bucket に接続されているサブスクリプションの **Pub/Sub subscription** 名を入力します。サブスクリプション名は次の形式に従う必要があります。

  ```text
  projects/${YOUR_PROJECT_ID}/subscriptions/${YOUR_SUBSCRIPTION_NAME}
  ```

  **3.** **Incoming data** をクリックします。target テーブルの **Sorting key** を定義します。必要に応じてマッピングされた schema を調整し、その後 ClickPipes database user の role を設定します。

  **4.** 設定内容を確認し、**Create ClickPipe** をクリックします。ClickPipes は bucket の初回スキャンを実行して、指定したパスに一致する既存のすべてのファイルをロードし、その後、topic に新しい `OBJECT_FINALIZE` events が到着するとファイルの処理を開始します。
</VerticalStepper>