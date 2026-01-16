---
sidebar_label: '概要'
description: 'オブジェクトストレージを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/object-storage/gcs/overview
sidebar_position: 1
title: 'Google Cloud Storage と ClickHouse Cloud の連携'
doc_type: 'guide'
---

import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/google-cloud-storage/cp_credentials.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

GCS ClickPipe は、Google Cloud Storage (GCS) からデータをインジェストするための、フルマネージドで高い耐障害性を備えた手段を提供します。**一度限り**のインジェストと**継続的なインジェスト**の両方を、exactly-once セマンティクスでサポートします。

GCS ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を使用してプログラムから管理することもできます。


## サポートされる形式 \{#supported-formats\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 機能 \{#features\}

### 一回限りのインジェスト \{#one-time-ingestion\}

デフォルトでは、GCS ClickPipe は、指定されたバケット内でパターンにマッチするすべてのファイルを、ClickHouse の宛先テーブルに単一のバッチ操作として読み込みます。インジェストタスクが完了すると、ClickPipe は自動的に停止します。この一回限りのインジェストモードは、exactly-once セマンティクスを提供し、各ファイルが重複なく確実に処理されることを保証します。

### 継続的なインジェスト \{#continuous-ingestion\}

継続的なインジェストが有効な場合、ClickPipes は指定されたパスからデータを継続的にインジェストし続けます。インジェストの順序を決定するために、GCS ClickPipe はファイルの暗黙的な[辞書式順序](#continuous-ingestion-lexicographical-order)に依存します。

#### Lexicographical order \{#continuous-ingestion-lexicographical-order\}

GCS ClickPipe は、ファイルがバケットに辞書順で追加されることを前提としており、この暗黙的な順序に依存してファイルを順次インジェストします。つまり、新しいファイルは必ず、最後にインジェストされたファイルよりも辞書順で後ろに来る必要があります。例えば、`file1`、`file2`、`file3` という名前のファイルは順番にインジェストされますが、新たに `file 0` がバケットに追加された場合、そのファイル名は最後にインジェストされたファイルより辞書順で後ろに来ないため、そのファイルは**無視**されます。

このモードでは、GCS ClickPipe は最初に指定されたパス内の**すべてのファイル**を読み込み、その後、新しいファイルがないかを設定可能な間隔（デフォルトでは 30 秒）でポーリングします。特定のファイルや時点からインジェストを開始することは**できません** — ClickPipes は常に、指定されたパス内のすべてのファイルを読み込みます。

### ファイルパターンマッチング \{#file-pattern-matching\}

Object Storage ClickPipes は、ファイルパターンマッチングに POSIX 標準に準拠します。すべてのパターンは**大文字と小文字を区別**し、バケット名の後ろの**フルパス**全体に対してマッチします。パフォーマンスを向上させるため、可能な限り具体的なパターンを使用してください（例: `*.csv` ではなく `data-2024-*.csv`）。

#### サポートされているパターン \{#supported-patterns\}

| Pattern | 説明 | 例 | 一致例 |
|---------|-------------|---------|---------|
| `?` | `/` を除く **1 文字だけ** にマッチ | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | `/` を除く **0 文字以上** にマッチ | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> 再帰 | `/` を含む **0 文字以上** にマッチ。ディレクトリを再帰的に走査できる。 | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**例:**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### サポート対象外のパターン \{#unsupported-patterns\}

| パターン     | 説明                              | 例                      | 代替案                                      |
|-------------|-----------------------------------|-------------------------|---------------------------------------------|
| `{abc,def}` | ブレース展開（代替候補の列挙）    | `{logs,data}/file.csv`  | 各パスごとに個別の ClickPipes を作成します。 |
| `{N..M}`    | 数値範囲のブレース展開           | `file-{1..100}.csv`     | `file-*.csv` または `file-?.csv` を使用します。 |

**例:**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### Exactly-once セマンティクス \{#exactly-once-semantics\}

大規模なデータセットを取り込む際にはさまざまな種類の障害が発生し得るため、insert が部分的にしか行われなかったり、データが重複したりする可能性があります。Object Storage ClickPipes は insert の失敗に対して堅牢で、Exactly-once セマンティクスを提供します。これは一時的な「staging」テーブルを使用することで実現されています。まずデータは staging テーブルに insert されます。この insert で問題が発生した場合、staging テーブルを truncate し、クリーンな状態から insert を再試行できます。insert が完了して成功した場合にのみ、staging テーブル内のパーティションがターゲットテーブルへ移動されます。この戦略の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### 仮想カラム \{#virtual-columns\}

どのファイルが取り込まれたかを追跡するには、カラムマッピングのリストに `_file` 仮想カラムを追加します。`_file` 仮想カラムにはソースオブジェクトのファイル名が含まれており、どのファイルが処理されたかをクエリで確認できます。

## アクセス制御 \{#access-control\}

### 権限 \{#permissions\}

GCS ClickPipe は、パブリックバケットおよびプライベートバケットをサポートします。[Requester Pays](https://docs.cloud.google.com/storage/docs/requester-pays) バケットはサポートされて**いません**。

[`roles/storage.objectViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectViewer) ロールをバケットレベルで付与する必要があります。このロールには、[`storage.objects.list`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/list) および [`storage.objects.get`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/get#required-permissions) IAM 権限が含まれており、指定したバケット内のオブジェクトを ClickPipes が一覧表示および取得できるようにします。

### 認証 \{#authentication\}

:::note
サービス アカウントによる認証は現在サポートされていません。
:::

#### HMAC 資格情報 \{#hmac-credentials\}

認証に [HMAC keys](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) を使用するには、ClickPipe 接続を設定する際に、**Authentication method** で `Credentials` を選択します。続いて、`Access key` および `Secret key` の欄に、それぞれアクセスキー（例: `GOOGTS7C7FUP3AIRVJTE2BCDKINBTES3HC2GY5CBFJDCQ2SYHV6A6XXVTJFSA`）とシークレットキー（例: `bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ`）を入力します。

<Image img={cp_credentials} alt="GCS ClickPipes 用の HMAC 資格情報" size="lg" border/>

HMAC キー付きのサービスアカウントを作成するには、[このガイド](https://clickhouse.com/docs/integrations/gcs#create-a-service-account-hmac-key-and-secret) に従ってください。

### ネットワークアクセス \{#network-access\}

GCS ClickPipes は、メタデータの検出とデータインジェストのために、それぞれ ClickPipes サービスと ClickHouse Cloud サービスという 2 つの異なるネットワークパスを使用します。追加のネットワークセキュリティ層（例：コンプライアンス目的）を構成したい場合、**両方のパスに対してネットワークアクセスを設定する必要があります**。

* **IP ベースのアクセス制御**を使用する場合は、GCS バケットの [IP フィルタリングルール](https://docs.cloud.google.com/storage/docs/ip-filtering-overview) で、[こちら](/integrations/clickpipes#list-of-static-ips)に記載されている ClickPipes サービスリージョンの固定 IP アドレスに加え、ClickHouse Cloud サービスの [固定 IP アドレス](/manage/data-sources/cloud-endpoints-api) も許可する必要があります。ClickHouse Cloud リージョンの固定 IP アドレスを取得するには、ターミナルを開いて次のコマンドを実行します。

    ```bash
    # <your-region> を ClickHouse Cloud のリージョンに置き換えてください
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.gcp[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

## 詳細設定 \{#advanced-settings\}

ClickPipes には、多くのユースケースの要件を満たす妥当なデフォルト値が用意されています。ユースケースによっては、さらに細かい調整が必要な場合は、次の設定を変更できます。

| 設定                              | デフォルト値 |  説明                              |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 1 回の挿入バッチで処理するバイト数。                                                  |
| `Max file count`                   | 100           | 1 回の挿入バッチで処理するファイルの最大数。                                          |
| `Max threads`                      | auto(3)       | ファイル処理に使用する[同時実行スレッド数の上限](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | ファイル処理に使用する[同時実行挿入スレッド数の上限](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | テーブルに挿入できる[ブロック内の最小バイトサイズ](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [同時実行ダウンロードスレッド数の上限](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | ClickHouse クラスターにデータを挿入する前に待機する最大時間を設定します。             |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select の設定](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | アタッチされた VIEW へのプッシュを[逐次ではなく並行して](/operations/settings/settings#parallel_view_processing)実行するかどうか。 |
| `Use cluster function`             | true          | 複数ノード間でファイルを並列処理するかどうか。 |

<Image img={cp_advanced_settings} alt="ClickPipes の詳細設定" size="lg" border/>

### スケーリング \{#scaling\}

Object Storage ClickPipes は、[垂直オートスケーリング設定の構成](/manage/scaling#configuring-vertical-auto-scaling)によって決定される最小の ClickHouse サービスサイズに基づいてスケーリングされます。ClickPipe のサイズは、ClickPipe 作成時に決定されます。その後に ClickHouse サービス設定を変更しても、ClickPipe のサイズには影響しません。

大規模な取り込みジョブのスループット（処理能力）を向上させるには、ClickPipe を作成する前に ClickHouse サービスをスケーリングすることを推奨します。

## 既知の制限事項 \{#known-limitations\}

### ファイルサイズ \{#file-size\}

ClickPipes は、サイズが **10GB 以下** のオブジェクトのみ取り込みを試行します。ファイルが 10GB を超える場合、ClickPipes 専用のエラーテーブルにエラーが記録されます。

### 互換性 \{#compatibility\}

GCS ClickPipe は相互運用性のために Cloud Storage の [XML API](https://docs.cloud.google.com/storage/docs/interoperability) を使用します。この API を利用するには、`gs://` ではなく `https://storage.googleapis.com/` バケットプレフィックスを使用し、認証には [HMAC keys](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) を使用する必要があります。

### View support \{#view-support\}

対象テーブルに対する materialized view もサポートされます。ClickPipes は、対象テーブルだけでなく、それに依存するすべての materialized view 用のステージングテーブルを作成します。

通常の（非 materialized）view に対してはステージングテーブルを作成しません。つまり、対象テーブルに 1 つ以上の下流の materialized view がある場合、それらの materialized view では、対象テーブルに対する view を経由してデータを SELECT しないようにする必要があります。そうしないと、その materialized view 内でデータ欠損が発生する可能性があります。