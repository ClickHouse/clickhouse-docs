---
sidebar_label: '概要'
description: 'ClickPipes を使用して BigQuery のデータを ClickHouse Cloud にエクスポートする方法。'
slug: /integrations/clickpipes/bigquery/overview
sidebar_position: 1
title: 'BigQuery と ClickHouse Cloud の統合'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_iam.png';
import Image from '@theme/IdealImage';

<IntroClickPipe />


## 機能 \{#features\}

### 初回ロード \{#initial-load\}

BigQuery ClickPipe は、選択された BigQuery の [dataset](https://docs.cloud.google.com/bigquery/docs/datasets-intro) 内のテーブルを、単一のバッチ処理で ClickHouse の宛先テーブルにロードします。インジェストタスクが完了すると、ClickPipe は自動的に停止します。初回ロードのインジェスト処理では、ステージング用にユーザーが用意した Google Cloud Storage (GCS) バケットが必要です。将来的には、この中間バケットは ClickPipes によって提供および管理される予定です。

:::note
ClickPipes は、BigQuery からステージング用 GCS バケットにデータを取得するためにバッチ抽出ジョブを使用します。この処理によって、BigQuery において **処理料金が発生することはありません**。
:::

### CDC（変更データキャプチャ） \{#cdc\}

CDC は Private Preview では**サポートされていません**が、今後サポートされる予定です。それまでの間は、初回ロード完了後に [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) を使用して、BigQuery のデータエクスポートを ClickHouse Cloud と継続的に同期することを推奨します。

## データ型マッピング \{#data-type-mapping\}

[BigQuery データ型](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types)。

| BigQuery データ型 | ClickHouse データ型 | 詳細                                                                 |
|--------------------|----------------------|-----------------------------------------------------------------------|
| `BOOL`             | `Bool`               |                                                                       |
| `INT64`            | `Int64`              |                                                                       |
| `FLOAT64`          | `Float64`            |                                                                       |
| `NUMERIC`          | `Decimal(P, S)`      | 精度は最大 38、スケールは最大 9 で、精度とスケールは保持されます。    |
| `BIGNUMERIC`       | `Decimal(P, S)`      | 精度は最大 76、スケールは最大 38 で、精度とスケールは保持されます。   |
| `STRING`           | `String`             |                                                                       |
| `BYTES`            | `String`             |                                                                       |
| `JSON`             | `String` (JSON)      |                                                                       |
| `DATE`             | `Date`               |                                                                       |
| `TIME`             | `String`             | マイクロ秒精度。                                                      |
| `DATETIME`         | `DateTime`           | マイクロ秒精度。                                                      |
| `TIMESTAMP`        | `DateTime64(6)`      | マイクロ秒精度。                                                      |
| `GEOGRAPHY`        | `String`             |                                                                       |
| `GEOMETRY`         | `String`             |                                                                       |
| `UUID`             | `String`             |                                                                       |
| `ARRAY<T>`         | `Array(T)`           |                                                                       |
| `ARRAY<DATE>`      | `Array(Date)`        |                                                                       |
| `STRUCT` (RECORD)  | `String`             |                                                                       |

## アクセス制御 \{#access-control\}

### 認証 \{#authentication\}

#### サービス アカウントの認証情報 \{#service-account-credentials\}

ClickPipes は、[サービス アカウント キー](https://docs.cloud.google.com/iam/docs/keys-create-delete) を使用して Google Cloud プロジェクトに対して認証します。ClickPipes が BigQuery からデータをエクスポートし、それをステージング用の GCS バケットにロードし、さらに ClickHouse に取り込めるようにするために、必要最小限の[権限](#permissions)のみを付与した専用のサービス アカウントを作成することを推奨します。

<Image img={cp_iam} alt="BigQuery と Cloud Storage の権限を持つサービス アカウント キーの作成" size="lg" border/>

### 権限 \{#permissions\}

#### BigQuery \{#bigquery\}

サービス アカウントには、次の BigQuery ロールが必要です。

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

アクセス範囲をさらに絞り込むには、ロールがアクセスできるリソースを制限するために [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) を使用することを推奨します。たとえば、同期したいテーブルを含む特定のデータセットに対してのみ `dataViewer` ロールを付与するように制限できます。

```bash
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```


#### Cloud Storage \{#cloud-storage\}

サービス アカウントには、次の Cloud Storage ロールが必要です:

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

アクセス範囲をさらに絞り込むには、[IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) を使用して、これらのロールがアクセス可能なリソースを制限することを推奨します。たとえば、`objectAdmin` と `bucketViewer` ロールを、ClickPipes の同期用に作成した専用バケットに限定できます。

```bash
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```
