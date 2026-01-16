---
sidebar_label: '概要'
description: 'オブジェクトストレージを ClickHouse Cloud とシームレスに接続します。'
slug: /integrations/clickpipes/object-storage/s3/overview
sidebar_position: 1
title: 'Amazon S3 と ClickHouse Cloud の統合'
doc_type: 'guide'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import R2svg from '@site/static/images/integrations/logos/cloudflare.svg';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_credentials.png';
import Image from '@theme/IdealImage';

S3 ClickPipe は、Amazon S3 および S3 互換オブジェクトストアから ClickHouse Cloud へデータを取り込むための、フルマネージドで高い耐障害性を備えた手段を提供します。**1 回限り**と**継続的なインジェスト**の両方を、exactly-once セマンティクスでサポートします。

S3 ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を使用してプログラムから作成および管理することもできます。


## サポートされているデータソース \\{#supported-data-sources\\}

| Name                 | Logo | Details           |
|----------------------|------|-------------------|
| **Amazon S3**            | <S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '2.5rem', height: 'auto'}}/> | 継続的なインジェストはデフォルトでは[辞書式順序](#continuous-ingestion-lexicographical-order)が必要ですが、[任意の順序でファイルを取り込む](#continuous-ingestion-any-order)ように構成することもできます。 |
| **Cloudflare R2** <br></br> _S3-compatible_ | <R2svg class="image" alt="Cloudflare R2 ロゴ" style={{width: '2.5rem', height: 'auto'}}/> | 継続的なインジェストには[辞書式順序](#continuous-ingestion-lexicographical-order)が必要です。 |
| **DigitalOcean Spaces** <br></br> _S3-compatible_ | <DOsvg class="image" alt="Digital Ocean ロゴ" style={{width: '2.5rem', height: 'auto'}}/>|  継続的なインジェストには[辞書式順序](#continuous-ingestion-lexicographical-order)が必要です。 |

:::tip
オブジェクトストレージサービスプロバイダーごとに URL 形式や API 実装が異なるため、そのままではすべての S3 互換サービスがサポートされるわけではありません。上記に記載されていないサービスで問題が発生している場合は、[弊社チームまでお問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。
:::

## サポート対象フォーマット \\{#supported-formats\\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 機能 \\{#features\\}

### 一度限りのインジェスト \\{#one-time-ingestion\\}

デフォルトでは、S3 ClickPipe は、指定したバケット内でパターンにマッチしたすべてのファイルを、単一バッチ処理で ClickHouse の宛先テーブルにロードします。インジェストタスクが完了すると、ClickPipe は自動的に停止します。この一度限りのインジェストモードは、厳密一回 (exactly-once) セマンティクスを提供し、各ファイルが重複なく確実に処理されることを保証します。

### 継続的インジェスト \\{#continuous-ingestion\\}

継続的インジェストが有効になっている場合、ClickPipes は指定されたパスからデータを継続的にインジェストします。インジェスト順序を決定するために、S3 ClickPipe はデフォルトでファイルの暗黙的な[辞書式順序](#continuous-ingestion-lexicographical-order)に依存します。また、バケットに接続された [Amazon SQS](https://aws.amazon.com/sqs/) キューを使用して、ファイルを[任意の順序](#continuous-ingestion-any-order)でインジェストするように設定することもできます。

#### 辞書順 \\{#continuous-ingestion-lexicographical-order\\}

デフォルトでは、S3 ClickPipe はファイルがバケットに辞書順で追加されることを前提とし、この暗黙的な順序に依存してファイルを順次インジェストします。つまり、新しいファイルは必ず、最後にインジェストされたファイルよりも辞書順で後ろに来る（大きい）名前である必要があります。たとえば、`file1`、`file2`、`file3` という名前のファイルは順番にインジェストされますが、新たに `file 0` がバケットに追加されても、そのファイル名は最後にインジェストされたファイルよりも辞書順で大きくないため、そのファイルは**無視**されます。

このモードでは、S3 ClickPipe は最初に指定されたパス内の**すべてのファイル**を読み込み、その後、設定可能な間隔（デフォルトでは 30 秒）で新しいファイルをポーリングします。特定のファイルや時点からインジェストを開始することは**できません**。ClickPipes は常に指定されたパス内のすべてのファイルを読み込みます。

#### 任意の順序 \\{#continuous-ingestion-any-order\\}

:::note
順不同モードは Amazon S3 に対して**のみ**サポートされており、パブリックバケットには**対応していません**。このモードでは、バケットに接続された [Amazon SQS](https://aws.amazon.com/sqs/) キューのセットアップが必要です。
:::

S3 ClickPipe では、バケットに接続された [Amazon SQS](https://aws.amazon.com/sqs/) キューをセットアップすることで、暗黙的な順序付けを持たないファイルを取り込むように構成できます。これにより、ClickPipes はオブジェクト作成イベントをリッスンし、ファイル命名規則に関係なく新しいファイルをインジェストできるようになります。

このモードでは、S3 ClickPipe は選択したパス内の**すべてのファイル**を初期ロードした後、キュー内で指定したパスに一致する `ObjectCreated:*` イベントをリッスンします。すでに処理済みのファイルに対するメッセージ、パスに一致しないファイル、または異なる種類のイベントはすべて**無視**されます。

:::note
イベントに対して prefix/postfix を設定することは任意です。設定する場合は、ClickPipe に設定したパスと一致していることを確認してください。S3 では、同じイベントタイプに対して複数の重複する通知ルールは許可されません。
:::

ファイルは、`max insert bytes` または `max file count` に設定されたしきい値に達するか、または設定可能な間隔（デフォルトでは 30 秒）が経過するとインジェストされます。特定のファイルや時点からインジェストを開始することは**できません** — ClickPipes は常に選択したパス内のすべてのファイルをロードします。DLQ が設定されている場合、失敗したメッセージは再キューイングされ、DLQ の `maxReceiveCount` パラメータで設定された回数まで再処理されます。

:::tip
SQS キューには **Dead-Letter-Queue (DLQ)** を設定することを強く推奨します。これにより、失敗したメッセージのデバッグおよび再試行が容易になります。
:::

##### SNS から SQS へ \\{#sns-to-sqs\\}

SNS トピック経由で S3 イベント通知を SQS に送信することも可能です。これは、S3 から SQS への直接連携でいくつかの制約に抵触するケースで利用できます。この場合は、[raw message delivery](https://docs.aws.amazon.com/sns/latest/dg/sns-large-payload-raw-message-delivery.html) オプションを有効にする必要があります。

### ファイルパターンマッチング \\{#file-pattern-matching\\}

Object Storage ClickPipes は、ファイルパターンマッチングに POSIX 標準を採用しています。すべてのパターンは **大文字と小文字を区別** し、バケット名の直後からの **フルパス** に対してマッチします。パフォーマンスを高めるために、可能な限り具体的なパターンを使用してください（例：`*.csv` ではなく `data-2024-*.csv` を使用）。

#### サポートされているパターン \\{#supported-patterns\\}

| パターン | 説明 | 例 | マッチするパス |
|---------|-------------|---------|---------|
| `?` | `/` を除く **ちょうど 1 文字だけ** にマッチします | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | `/` を除く **0 文字以上の任意の文字列** にマッチします | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> 再帰 | `/` を含む **0 文字以上の任意の文字列** にマッチします。**再帰的なディレクトリの走査**を可能にします。 | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**例:**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### 非対応のパターン \\{#unsupported-patterns\\}

| Pattern     | Description                 | Example                | Alternatives                              |
|-------------|-----------------------------|------------------------|-------------------------------------------|
| `{abc,def}` | ブレース展開（brace expansion） | `{logs,data}/file.csv` | 各パスごとに個別の ClickPipes を作成します。 |
| `{N..M}`    | 数値範囲の展開                | `file-{1..100}.csv`    | `file-*.csv` または `file-?.csv` を使用します。 |

**例:**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### Exactly-once セマンティクス \\{#exactly-once-semantics\\}

大規模なデータセットを取り込む際には、さまざまな種類の障害が発生する可能性があり、その結果、挿入が一部だけ行われたり、データが重複したりすることがあります。Object Storage 用 ClickPipes は挿入時の障害に対して堅牢であり、Exactly-once セマンティクスを提供します。これは一時的な「staging」テーブルを使用することで実現します。データはまず staging テーブルに挿入されます。この挿入で問題が発生した場合、staging テーブルを空にして、クリーンな状態から挿入を再試行できます。挿入が完了し成功した場合にのみ、staging テーブル内のパーティションが対象テーブルに移動されます。この戦略の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### 仮想カラム \\{#virtual-columns\\}

どのファイルが取り込まれたかを追跡するには、カラムマッピングリストに `_file` 仮想カラムを追加します。`_file` 仮想カラムにはソースオブジェクトのファイル名が含まれており、どのファイルが処理済みかをクエリする際に使用できます。

## アクセス制御 \\{#access-control\\}

### 権限 \\{#permissions\\}

S3 ClickPipe は、パブリックバケットとプライベートバケットをサポートします。[Requester Pays](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html) バケットは**サポートされません**。

#### S3 バケット \\{#s3-bucket\\}

バケットポリシーで、次のアクションを許可する必要があります。

* [`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html)
* [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html)

#### SQS キュー \\{#sqs-queue\\}

[unordered mode](#continuous-ingestion-any-order) を使用する場合、SQS キューのポリシーで次のアクションを許可する必要があります：

* [`sqs:ReceiveMessage`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html)
* [`sqs:DeleteMessage`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessage.html)
* [`sqs:GetQueueAttributes`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueAttributes.html)
* [`sqs:ListQueues`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ListQueues.html)

### 認証 \\{#authentication\\}

#### IAM 認証情報 \\{#iam-credentials\\}

[アクセスキー](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) を使用して認証するには、ClickPipe 接続を設定する際に、**Authentication method** で `Credentials` を選択します。次に、`Access key` と `Secret key` にそれぞれ、アクセスキー ID（例: `AKIAIOSFODNN7EXAMPLE`）とシークレットアクセスキー（例: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`）を入力します。

<Image img={cp_credentials} alt="S3 ClickPipes 用の IAM 認証情報" size="lg" border/>

#### IAM ロール \\{#iam-role\\}

[ロールベースのアクセス](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)で認証を行うには、ClickPipe 接続を設定する際に、**Authentication method** で `IAM role` を選択します。

<Image img={cp_iam} alt="S3 ClickPipes 用の IAM 認証" size="lg" border/>

S3 へのアクセスに必要な信頼ポリシーを持つロールを作成するには、[このガイド](/cloud/data-sources/secure-s3)に従い、[ロールを作成](/cloud/data-sources/secure-s3#option-2-manually-create-iam-role)してください。その後、`IAM role ARN` に IAM ロール ARN を入力します。

### ネットワークアクセス \\{#network-access\\}

S3 ClickPipes は、メタデータの検出とデータのインジェストのために 2 つの異なるネットワークパス（それぞれ ClickPipes サービスと ClickHouse Cloud サービス）を使用します。追加のネットワークセキュリティレイヤー（コンプライアンス目的など）を構成する場合は、ネットワークアクセスを**両方のパスに対して構成する必要があります**。

* **IP ベースのアクセス制御**の場合、S3 バケットポリシーで、[こちら](/integrations/clickpipes#list-of-static-ips)に記載されている ClickPipes サービスリージョンの静的 IP と、ClickHouse Cloud サービスの[静的 IP](/manage/data-sources/cloud-endpoints-api) の両方を許可する必要があります。利用中の ClickHouse Cloud リージョンの静的 IP を取得するには、ターミナルを開いて次を実行します。

    ```bash
    # <your-region> を利用中の ClickHouse Cloud リージョンに置き換えてください
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

* **VPC エンドポイントベースのアクセス制御**の場合、S3 バケットは ClickHouse Cloud サービスと同じリージョンに存在し、`GetObject` 操作を ClickHouse Cloud サービスの VPC エンドポイント ID に制限する必要があります。利用中の ClickHouse Cloud リージョンの VPC エンドポイントを取得するには、ターミナルを開いて次を実行します。

    ```bash
    # <your-region> を利用中の ClickHouse Cloud リージョンに置き換えてください
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
    ```

## 高度な設定 \\{#advanced-settings\\}

ClickPipes には、ほとんどのユースケースの要件を満たす妥当なデフォルト設定が用意されています。ユースケースに応じて追加のチューニングが必要な場合は、次の設定を調整できます:

| 設定                               | デフォルト値  |  説明                               |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 1 回の挿入バッチで処理するバイト数。                                                  |
| `Max file count`                   | 100           | 1 回の挿入バッチで処理する最大ファイル数。                                            |
| `Max threads`                      | auto(3)       | ファイル処理に使用する[同時実行スレッドの最大数](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | ファイル処理に使用する[同時挿入スレッドの最大数](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | テーブルに挿入される[ブロック内バイト数の最小値](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [同時ダウンロードスレッドの最大数](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | ClickHouse クラスターにデータを挿入するまでの最大待機時間を設定します。 |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select の設定](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | アタッチされた VIEW へのプッシュを[逐次ではなく並行して](/operations/settings/settings#parallel_view_processing)行うかどうか。 |
| `Use cluster function`             | true          | 複数ノード間でファイルを並列処理するかどうか。 |

<Image img={cp_advanced_settings} alt="ClickPipes の高度な設定" size="lg" border/>

### スケーリング \\{#scaling\\}

Object Storage ClickPipes は、[vertical autoscaling 設定](/manage/scaling#configuring-vertical-auto-scaling) で決定される最小の ClickHouse サービスサイズに基づいてスケールされます。ClickPipe のサイズはパイプ作成時に決定され、その後に ClickHouse サービス設定を変更しても、ClickPipe のサイズには影響しません。

大規模な取り込みジョブのスループットを向上させるには、ClickPipe を作成する前に ClickHouse サービスをスケールアップしておくことを推奨します。

## 既知の制限事項 \\{#known-limitations\\}

### ファイルサイズ \\{#file-size\\}

ClickPipes は、サイズが **10GB 以下** のオブジェクトのみを取り込み対象とします。ファイルが 10GB を超える場合は、ClickPipes 専用のエラーテーブルにエラーが記録されます。

### 互換性 \\{#compatibility\\}

S3 互換であっても、一部のサービスは S3 ClickPipe が解析できない可能性のある異なる URL 構造を使用していたり（例: Backblaze B2）、連続的で順不同なインジェストのためにプロバイダー固有のキューサービスとの連携を必要とする場合があります。[Supported data sources](#supported-data-sources) に記載されていないサービスで問題が発生している場合は、[弊社チームまでお問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### View support \\{#view-support\\}

ターゲットテーブル上の materialized view もサポートされています。ClickPipes は、ターゲットテーブルだけでなく、それに依存するすべての materialized view に対してもステージングテーブルを作成します。

非 materialized view に対してはステージングテーブルを作成しません。つまり、ターゲットテーブルに 1 つ以上の下流の materialized view がある場合、それらの materialized view では、ターゲットテーブル上の view を介してデータを SELECT しないようにする必要があります。そうしないと、その materialized view 内でデータが欠落する可能性があります。