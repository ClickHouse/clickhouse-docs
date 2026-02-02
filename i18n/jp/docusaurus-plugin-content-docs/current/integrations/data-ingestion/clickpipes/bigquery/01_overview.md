---
sidebar_label: '概要'
description: 'ClickPipes を使用して BigQuery から ClickHouse Cloud へデータをエクスポートする方法。'
slug: /integrations/clickpipes/bigquery/overview
sidebar_position: 1
title: 'BigQuery と ClickHouse Cloud の連携'
doc_type: 'ガイド'
---

import IntroClickPipe from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_iam.png';
import Image from '@theme/IdealImage';

<IntroClickPipe />


## 機能 \{#features\}

### 初期ロード \{#initial-load\}

BigQuery ClickPipe は、BigQuery の [dataset](https://docs.cloud.google.com/bigquery/docs/datasets-intro) 内で選択されたテーブルを、ClickHouse の宛先テーブルに単一のバッチ処理でロードします。インジェストタスクが完了すると、ClickPipe は自動的に停止します。初期ロードのインジェスト処理には、ステージング用としてユーザーが用意した Google Cloud Storage (GCS) バケットが必要です。将来的には、この中間バケットは ClickPipes によって提供および管理される予定です。

:::note
ClickPipes は、BigQuery からステージング用 GCS バケットへデータを取得するために、バッチ抽出ジョブを使用します。この操作によって、BigQuery 側で **処理料金が発生することはありません**。
:::

### CDC（変更データキャプチャ） \{#cdc\}

CDC はプライベートプレビュー中は**サポートされていません**が、将来的にサポートされる予定です。それまでの間は、初回ロードが完了した後に BigQuery のデータエクスポートを ClickHouse Cloud に継続的に同期するために、[Google Cloud Storage ClickPipe](../object-storage/google-cloud-storage/01_overview.md) の利用を推奨します。

## データ型のマッピング \{#data-type-mapping\}

[BigQuery データ型](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types)の一覧です。

| BigQuery Data Type | ClickHouse Data Type | 詳細                                                                    |
|--------------------|----------------------|-------------------------------------------------------------------------|
| `BOOL`             | `Bool`               |                                                                         |
| `INT64`            | `Int64`              |                                                                         |
| `FLOAT64`          | `Float64`            |                                                                         |
| `NUMERIC`          | `Decimal(P, S)`      | 精度は最大 38 桁、スケールは最大 9。精度とスケールは保持されます。      |
| `BIGNUMERIC`       | `Decimal(P, S)`      | 精度は最大 76 桁、スケールは最大 38。精度とスケールは保持されます。     |
| `STRING`           | `String`             |                                                                         |
| `BYTES`            | `String`             |                                                                         |
| `JSON`             | `String` (JSON)      |                                                                         |
| `DATE`             | `Date`               |                                                                         |
| `TIME`             | `String`             | マイクロ秒単位の精度。                                                  |
| `DATETIME`         | `DateTime`           | マイクロ秒単位の精度。                                                  |
| `TIMESTAMP`        | `DateTime64(6)`      | マイクロ秒単位の精度。                                                  |
| `GEOGRAPHY`        | `String`             |                                                                         |
| `GEOMETRY`         | `String`             |                                                                         |
| `UUID`             | `String`             |                                                                         |
| `ARRAY<T>`         | `Array(T)`           |                                                                         |
| `ARRAY<DATE>`      | `Array(Date)`        |                                                                         |
| `STRUCT` (RECORD)  | `String`             |                                                                         |

## アクセス制御 \{#access-control\}

### 認証 \{#authentication\}

#### サービス アカウントの認証情報 \{#service-account-credentials\}

ClickPipes は、[サービス アカウント キー](https://docs.cloud.google.com/iam/docs/keys-create-delete) を使用して Google Cloud プロジェクトに対して認証します。ClickPipes が BigQuery からデータをエクスポートし、それをステージング用 GCS バケットにロードしてから ClickHouse に読み込めるようにするために、必要最小限の [権限](#permissions) のみを付与した専用のサービス アカウントを作成することをおすすめします。

<Image img={cp_iam} alt="BigQuery と Cloud Storage 権限を持つサービス アカウント キーの作成" size="lg" border/>

### 権限 \{#permissions\}

#### BigQuery \{#bigquery\}

サービス アカウントには、次の BigQuery ロールが必要です：

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

アクセス範囲をさらに限定するには、ロールがアクセスできるリソースを制限するために [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) を使用することを推奨します。たとえば、同期したいテーブルを含む特定のデータセットに対してのみ `dataViewer` ロールが付与されるように制限できます。

```bash
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```


#### Cloud Storage \{#cloud-storage\}

このサービス アカウントには、次の Cloud Storage ロールが必要です。

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

アクセス権をさらに細かく制御するには、[IAM 条件](https://docs.cloud.google.com/bigquery/docs/conditions) を使用して、そのロールがアクセスできるリソースを制限することを推奨します。たとえば、`objectAdmin` および `bucketViewer` ロールを、ClickPipes の同期用に作成した専用バケットのみに制限できます。

```bash
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```
