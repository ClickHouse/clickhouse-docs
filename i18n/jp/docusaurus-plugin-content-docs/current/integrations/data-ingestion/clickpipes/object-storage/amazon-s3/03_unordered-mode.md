---
sidebar_label: '順不同モードの設定'
sidebar_position: 3
title: '継続的インジェスト向けの順不同モードの設定'
slug: /integrations/clickpipes/object-storage/s3/unordered-mode
description: 'S3 ClickPipes で継続的インジェスト向けに順不同モードを設定するためのステップバイステップガイド。'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import cp_eb_s3_enable from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_s3_enable.png';
import cp_eb_rule_define from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_define.png';
import cp_eb_rule_target from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_target.png';
import cp_eb_rule_created from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_created.png';
import Image from '@theme/IdealImage';

デフォルトでは、S3 ClickPipe は、ファイルがバケットに[辞書順](/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-lexicographical-order)で追加されることを前提としています。明確な順序付けがないファイルを取り込むように S3 ClickPipe を設定することもでき、その場合はバケットに接続された [Amazon SQS](https://aws.amazon.com/sqs/) キューを設定し、必要に応じて [Amazon EventBridge](https://aws.amazon.com/eventbridge/) をイベントルーターとして使用します。これにより、ClickPipes は `ObjectCreated:*` イベントを監視し、ファイル名の命名規則に関係なく新しいファイルを取り込むことができます。

:::note
順不同モードは Amazon S3 **でのみ**サポートされており、公開バケットや S3 互換サービスでは**サポートされていません**。このモードを使用するには、バケットに接続された [Amazon SQS](https://aws.amazon.com/sqs/) キューを設定し、必要に応じて [Amazon EventBridge](https://aws.amazon.com/eventbridge/) をイベントルーターとして使用する必要があります。
:::

## 仕組み \{#how-it-works\}

このモードでは、S3 ClickPipe は選択したパス内の**すべてのファイル**を初回ロードし、その後、指定したパスに一致するキュー内の `ObjectCreated:*` イベントを待ち受けます。すでに処理済みのファイルに対するメッセージ、パスに一致しないファイル、または別の種類のイベントは、いずれも**無視**されます。ファイルは、`max insert bytes` または `max file count` で設定したしきい値に達した時点、または設定可能な間隔の経過後 (デフォルトでは 30 秒) に取り込まれます。特定のファイルまたは時点からインジェストを開始することは**できません**。ClickPipes は常に、選択したパス内のすべてのファイルをロードします。

データの取り込み時にはさまざまな障害が発生する可能性があり、その結果、部分的な insert や重複データが生じることがあります。オブジェクトストレージ ClickPipes は insert の失敗に対して耐性があり、一時的なステージングテーブルを使用して exactly-once semantics を提供します。データはまずステージングテーブルに insert されます。問題が発生した場合は、ステージングテーブルを切り詰め、クリーンな状態から insert を再試行します。insert が正常に完了した場合にのみ、パーティションが target テーブルに移動されます。

<VerticalStepper type="numbered" headerLevel="h2">
  ## Amazon SQS キューの作成 \{#create-sqs-queue\}

  **1.** AWSコンソールで、**Simple Queue Service &gt; Create queue** に移動します。デフォルト設定のまま新しい標準キューを作成します。

  :::tip
  SQSキューに**Dead-Letter-Queue (DLQ)**を設定することを強くお勧めします。これにより、失敗したメッセージのデバッグと再試行が容易になります。DLQが設定されている場合、失敗したメッセージはDLQの`maxReceiveCount`パラメータで設定された回数まで再エンキューおよび再処理されます。
  :::

  **2.** 以下の2つのオプションのいずれかを使用して、S3バケットをSQSキューに接続します。EventBridgeはほとんどのユースケースで推奨されます。ファンアウトをサポートし、より柔軟なイベントのフィルタリングが可能であるほか、イベントタイプおよびプレフィックスごとに通知ルールが1つに制限されるS3の制約を受けないためです。

  <Tabs groupId="s3-notification-method">
    <TabItem value="eventbridge" label="EventBridge 経由" default>
      **a.** S3 バケットのプロパティで **Event notifications &gt; Amazon EventBridge** に移動し、EventBridge への通知送信を有効にします。**Save changes** をクリックします。

      <Image img={cp_eb_s3_enable} alt="S3 バケットのプロパティで Amazon EventBridge 通知を有効にする" size="lg" border />

      **b.** AWS Console で **Amazon EventBridge &gt; Rules &gt; Create rule** に移動します。ルール名 (例: `S3ObjectCreated`) を入力し、**default** イベントバスを選択して **Next** をクリックします。**Build event pattern** ステップで、イベントソースとして **AWS events or EventBridge partner events** を選択し、以下のイベントパターンを手動で入力します。`<bucket-name>` は実際のバケット名に置き換えてください。

      <Image img={cp_eb_rule_define} alt="EventBridge ルール名とイベントバスを定義する" size="lg" border />

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

      必要に応じて、プレフィックスまたはサフィックスでフィルタリングするために、パターンに `object.key` 条件を追加できます。追加する場合は、ClickPipe に設定したパスと一致していることを確認してください。

      **c.** **Select target(s)** ステップで、ターゲットタイプとして **AWS service** を選択し、**SQS queue** を指定します。前のステップで作成したキューを選択します。EventBridge が必要な IAM ロールを自動作成できるよう、**Use execution role (recommended)** はチェックしたままにして、**Next** をクリックし、ウィザードを完了します。

      <Image img={cp_eb_rule_target} alt="EventBridge ルールのターゲットとして SQS キューを設定する" size="lg" border />

      <Image img={cp_eb_rule_created} alt="EventBridge ルールが正常に作成された" size="lg" border />

      **d.** EventBridge がこのキューにメッセージを送信できるように、SQS キューのアクセスポリシーを編集します。`<sqs-queue-arn>` と `<eventbridge-rule-arn>` を適切な値に置き換えてください。

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

    <TabItem value="direct" label="直接 S3 → SQS">
      **a.** S3 バケットがこのキューにメッセージを送信できるように、SQS キューのアクセスポリシーを編集します。`<sqs-queue-arn>`、`<bucket-arn>`、`<aws-account-id>` を適切な値に置き換えてください。

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

      **b.** S3 バケットのプロパティで、`ObjectCreated` イベントに対する **Event notifications** を有効にし、宛先を SQS キューに設定します。必要に応じて、通知をトリガーするオブジェクトをフィルタリングするために、プレフィックスまたはサフィックスを指定できます。その場合は、ClickPipe に設定したパスと一致していることを確認してください。

      :::note
      S3 では、同じバケットの同じイベントタイプに対して、重複する複数の通知ルールは設定できません。このバケットに `ObjectCreated` イベント用の通知ルールがすでにある場合は、代わりに EventBridge を使用してください。
      :::
    </TabItem>
  </Tabs>

  ## IAM ロールの設定 \{#configure-iam-role\}

  **1.** ClickHouse Cloud コンソールで、**設定 &gt; ネットワークセキュリティ情報**に移動し、サービスの **IAM ロール ARN** をコピーします。

  **2.** AWSコンソールで、**IAM &gt; Roles &gt; Create role** に移動します。**Custom trust policy** を選択し、以下の内容を貼り付けてください。その際、`<ch-cloud-arn>` を前の手順でコピーしたIAM Role ARNに置き換えます。

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

  **3.** IAMロールに対して、S3からオブジェクトを読み取り、SQSキュー内のメッセージを管理するための[必須権限](/integrations/clickpipes/object-storage/s3/overview#permissions)を持つインラインポリシーを作成します。`<bucket-arn>` および `<sqs-queue-arn>` を適切な値に置き換えてください。

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

  ## 順序なしモードでClickPipeを作成する \{#create-clickpipe\}

  **1.** ClickHouse Cloud コンソールで、**Data Sources &gt; Create ClickPipe** に移動し、**Amazon S3** を選択します。S3 バケットへの接続情報を入力します。**Authentication method** で **IAM role** を選択し、前の手順で作成したロールの ARN を指定します。

  **2.** **Incoming data** の下で、**Continuous ingestion** をオンに切り替えます。インジェストモードとして **Any order** を選択し、バケットに接続されたキューの **SQS queue URL** を指定します。

  **3.** **Parse information** で、target テーブルの **Sorting key** を定義します。マップされたスキーマに必要な調整を行い、ClickPipes データベースユーザーのロールを設定します。

  **4.** 設定を確認し、**Create ClickPipe** をクリックします。ClickPipes は指定されたパスに一致する既存のファイルをすべて読み込むためにバケットの初期スキャンを実行し、その後、新しい `ObjectCreated:*` イベントがキューに到着し次第、ファイルの処理を開始します。
</VerticalStepper>