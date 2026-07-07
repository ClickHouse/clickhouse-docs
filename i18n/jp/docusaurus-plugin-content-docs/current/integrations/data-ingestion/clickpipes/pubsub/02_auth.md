---
slug: /integrations/clickpipes/pubsub/auth
sidebar_label: 'Pub/Sub IAM 権限'
title: 'Pub/Sub IAM 権限'
description: 'この記事では、ClickPipes が Google Cloud Pub/Sub で認証し、トピックからデータを読み取るために必要な GCP IAM 権限と、それらの権限だけを付与するサービスアカウントの設定方法について説明します。'
doc_type: 'guide'
keywords: ['Google Cloud Pub/Sub', 'GCP IAM', 'サービスアカウント']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

:::note
プライベートプレビューのウェイトリストには[こちら](https://clickhouse.com/cloud/clickpipes#pubsub-private-preview)から登録できます。
:::

この記事では、ClickPipes が Google Cloud Pub/Sub で認証し、トピックからデータを読み取るために必要な GCP IAM 権限と、それらの権限だけを付与するサービスアカウントの設定方法について説明します。

## 前提条件 \{#prerequisite\}

このガイドを進めるには、以下が必要です。

* 有効な ClickHouse Cloud サービス
* 取り込み元とする Pub/Sub トピックを含む GCP プロジェクト
* そのプロジェクトで サービスアカウント を作成し、ロールを付与するための IAM 権限

## 認証モデル \{#authentication-model\}

Pub/Sub 用 ClickPipes は、[サービスアカウント JSON キー](https://cloud.google.com/iam/docs/keys-create-delete) を使用して GCP に認証します。パイプの作成時にキー ファイルをアップロードすると、ClickPipes はそのファイルを保存時に暗号化し、実行時には以下の目的で使用します。

* プロジェクト内のトピックを一覧表示して読み取る
* ClickPipes がメッセージの消費に使用する[管理対象サブスクリプション](/integrations/clickpipes/pubsub#managed-subscriptions)を作成および削除する
* そのサブスクリプションからメッセージを消費する
* (必要に応じて) スキーマレジストリから Pub/Sub ネイティブのスキーマを読み取る

現在、Workload Identity や認証情報を直接貼り付けるオプションはありません。現時点でサポートされている認証方式は、サービスアカウント JSON キーのみです。

## 必要な権限 \{#required-permissions\}

ClickPipes では、トピックを所有する GCP プロジェクトに対して、以下の IAM 権限が必要です。これらの権限は、パイプのライフサイクル全体 (検出 (トピックの一覧表示、検証、サンプリング) 、サブスクリプション管理、定常的なインジェスト、クリーンアップ) をカバーします。

### トピックへのアクセス (検出と検証) \{#topic-access\}

| Permission                         | Purpose                          |
| ---------------------------------- | -------------------------------- |
| `pubsub.topics.list`               | 検出時に、プロジェクト内で利用可能なトピックを一覧表示する    |
| `pubsub.topics.get`                | トピックの存在を確認し、スキーマ設定を取得する          |
| `pubsub.topics.attachSubscription` | サブスクリプションの作成時に、対象の**トピック**に対して必要 |

### サブスクリプションのライフサイクル (検出とインジェスト) \{#subscription-lifecycle\}

| Permission                     | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `pubsub.subscriptions.create`  | 管理対象サブスクリプション (`clickpipes-{pipeID}`) および一時的な検出用サブスクリプションを作成 |
| `pubsub.subscriptions.get`     | ヘルスチェック (60 秒ごと) 、フォロワーのポーリング、サブスクリプションの検証                   |
| `pubsub.subscriptions.delete`  | 一時的な検出用サブスクリプションをクリーンアップし、パイプの削除時に管理対象サブスクリプションを削除           |
| `pubsub.subscriptions.consume` | `Receive()`、`Ack()`、`Nack()`、およびタイムスタンプへのシーク操作               |

### スキーマへのアクセス (任意 — ネイティブ Avro/Protobuf トピックにのみ必要) \{#schema-access\}

| 権限                   | 目的                                 |
| -------------------- | ---------------------------------- |
| `pubsub.schemas.get` | Pub/Sub スキーマレジストリからネイティブのスキーマ定義を取得 |

## 定義済みロール \{#predefined-roles\}

| ロール                                                                                                  | 十分か     | 注記                                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| [`roles/pubsub.editor`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.editor)         | はい      | 必要な権限をすべてカバーします。最も広範な選択肢です。                                                                                     |
| [`roles/pubsub.subscriber`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.subscriber) | **いいえ** | `topics.list`、`topics.attachSubscription`、`subscriptions.create`、`subscriptions.delete`、`schemas.get` が不足しています。 |
| [`roles/pubsub.viewer`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.viewer)         | **いいえ** | 読み取り専用のため、サブスクリプションの管理やメッセージの受信はできません。                                                                          |
| カスタムロール *(推奨)*                                                                                       | はい      | 最小権限でアクセスするには、上記 7 つの中核権限 (必要に応じて `schemas.get` を追加) を使用してください。                                                 |

## セットアップ \{#setup\}

<VerticalStepper headerLevel="h3" />

### カスタムロールを作成する (推奨) \{#create-custom-role\}

最小権限の原則に従い、ClickPipes に必要な権限だけを持つカスタムロールを作成します。

これは `gcloud` CLI で実行できます。

```bash
gcloud iam roles create clickpipes.pubsub.ingestion \
  --project=YOUR_PROJECT_ID \
  --title="ClickPipes Pub/Sub Ingestion" \
  --description="Permissions required by ClickHouse ClickPipes to ingest from Pub/Sub" \
  --permissions=pubsub.topics.list,pubsub.topics.get,pubsub.topics.attachSubscription,pubsub.subscriptions.create,pubsub.subscriptions.get,pubsub.subscriptions.delete,pubsub.subscriptions.consume \
  --stage=GA
```

または、GCP Console で **IAM &amp; Admin → Roles → Create role** に移動し、[Required permissions](#required-permissions) に記載されている権限を追加します。

:::note オプションの権限
ネイティブの Pub/Sub Avro または Protobuf スキーマを使用するトピックから取り込む場合は、`--permissions` リストに `pubsub.schemas.get` を追加します。それ以外の場合は、ロールを最小限に保つため追加しないでください。
:::

カスタムロールの作成を省略したい場合は、代わりに `roles/pubsub.editor` を付与することもできます。

### サービスアカウントを作成する \{#create-service-account\}

ClickPipe 用の専用のサービスアカウントを作成します。

```bash
gcloud iam service-accounts create clickpipes-pubsub \
  --project=YOUR_PROJECT_ID \
  --display-name="ClickPipes Pub/Sub Ingestion"
```

### サービスアカウントにロールを付与する \{#grant-role\}

作成したロール (または `roles/pubsub.editor`) を、プロジェクト レベルでサービスアカウントに付与します：

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="projects/YOUR_PROJECT_ID/roles/clickpipes.pubsub.ingestion"
```

### サービスアカウント キーを作成してダウンロードする \{#create-key\}

サービスアカウント用の JSON キーを作成し、ローカルにダウンロードします。

```bash
gcloud iam service-accounts keys create clickpipes-pubsub-key.json \
  --iam-account=clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

パイプの作成時に、この `clickpipes-pubsub-key.json` ファイルを ClickPipes UI にアップロードします。

:::note キーは機密情報として扱ってください
サービスアカウント キーには、GCP プロジェクトへのアクセス権があります。ファイルは安全に保管し、ソース管理にコミットせず、定期的にローテーションしてください。ClickPipes は、アップロード後、保存中のキーを暗号化します。
:::

## 注意事項 \{#notes\}

* `pubsub.topics.attachSubscription` はサブスクリプションではなく、**トピック リソース**に対して必要です。サブスクリプション レベルの権限だけを付与した場合に、これが見落とされることがよくあります。
* トピックでネイティブの Pub/Sub スキーマ (Avro または Protobuf) を使用していない場合、`pubsub.schemas.get` 権限は不要です。
* 管理対象サブスクリプションの名前は `clickpipes-{pipeID}` で、ack 期限は 60 秒、メッセージ保持期間は 7 日間、メッセージの順序付けは有効です。
* 一時的な検出用サブスクリプションの名前は `clickpipes-discovery-{uuid}` で、ack 期限は 10 秒、保持期間は 10 分、自動失効の有効期限 (TTL) は 24 時間です。
* ClickPipes では、`PermissionDenied` エラーと `Unauthenticated` エラーは再試行不可として扱われます。権限が不足している場合、無期限に再試行するのではなく、パイプはすぐに失敗します。