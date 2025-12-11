---
sidebar_label: '概要'
description: 'オブジェクトストレージを ClickHouse Cloud とシームレスに接続します。'
slug: /integrations/clickpipes/object-storage/abs/overview
sidebar_position: 1
title: 'Azure Blob Storage と ClickHouse Cloud の統合'
doc_type: 'guide'
---

import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

ABS ClickPipe は、Azure Blob Storage から ClickHouse Cloud へデータを取り込むための、フルマネージドで高い耐障害性を備えた手段を提供します。**一度きりのインジェスト**と**継続的なインジェスト**の両方を、厳密 1 回実行 (exactly-once) セマンティクスでサポートします。

ABS ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を使用してプログラムから管理することもできます。


## 対応フォーマット {#supported-formats}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 機能 {#features}

### ワンタイム インジェスト {#one-time-ingestion}

ABS ClickPipe は、指定されたコンテナ内でパターンにマッチするすべてのファイルを、単一のバッチ処理として ClickHouse の宛先テーブルに読み込みます。インジェストタスクが完了すると、ClickPipe は自動的に停止します。このワンタイム インジェストモードは exactly-once セマンティクスを提供し、各ファイルが重複なく確実に処理されることを保証します。

### 継続的インジェスト {#continuous-ingestion}

継続的インジェストが有効な場合、ClickPipes は指定されたパスからデータを継続的にインジェストし続けます。インジェストの順序を決定するために、ABS ClickPipe はファイルの暗黙的な[辞書式順序](#continuous-ingestion-lexicographical-order)に依存します。

#### 辞書順 {#continuous-ingestion-lexicographical-order}

ABS ClickPipe は、ファイルがコンテナ内に辞書順で追加されることを前提としており、この暗黙の順序に依存してファイルを順番にインジェストします。つまり、新しいファイルは、最後にインジェストされたファイルよりも辞書順で後ろになければ**なりません**。たとえば、`file1`、`file2`、`file3` というファイルは順番にインジェストされますが、新たに `file 0` がコンテナに追加された場合、そのファイル名が最後にインジェストされたファイルよりも辞書順で後ろではないため、そのファイルは**無視**されます。

このモードでは、ABS ClickPipe は指定されたパス内の**すべてのファイル**を最初に読み込み、その後、設定可能な間隔（デフォルトでは 30 秒）で新しいファイルをポーリングします。特定のファイルまたは時点からインジェストを開始することは**できません**。ClickPipes は常に、指定されたパス内のすべてのファイルを読み込みます。

### File pattern matching {#file-pattern-matching}

Object Storage ClickPipes は、ファイルパターンマッチングで POSIX 標準に従います。すべてのパターンは **大文字と小文字を区別** し、コンテナ名の後ろの **フルパス** に対してマッチします。パフォーマンス向上のため、可能な限り具体的なパターンを使用してください（例: `*.csv` ではなく `data-2024-*.csv`）。

#### サポートされているパターン {#supported-patterns}

| パターン | 説明 | 例 | マッチ例 |
|---------|-------------|---------|---------|
| `?` | `/` を除くちょうど **1** 文字にマッチします | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | `/` を除く **0 文字以上** にマッチします | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> 再帰的 | `/` を含む **0 文字以上** にマッチします。再帰的なディレクトリ走査を有効にします。 | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**例:**

* `https://storageaccount.blob.core.windows.net/container/folder/*.csv`
* `https://storageaccount.blob.core.windows.net/container/logs/**/data.json`
* `https://storageaccount.blob.core.windows.net/container/file-?.parquet`
* `https://storageaccount.blob.core.windows.net/container/data-2024-*.csv.gz`

#### サポートされないパターン {#unsupported-patterns}

| Pattern     | Description                 | Example                | Alternatives                              |
|-------------|-----------------------------|------------------------|-------------------------------------------|
| `{abc,def}` | ブレース展開（代替指定）    | `{logs,data}/file.csv` | パスごとに個別の ClickPipes を作成する。 |
| `{N..M}`    | 数値範囲展開                | `file-{1..100}.csv`    | `file-*.csv` または `file-?.csv` を使用する。 |

**例:**

* `https://storageaccount.blob.core.windows.net/container/{documents-01,documents-02}.json`
* `https://storageaccount.blob.core.windows.net/container/file-{1..100}.csv`
* `https://storageaccount.blob.core.windows.net/container/{logs,metrics}/data.parquet`

### 厳密な 1 回限りのセマンティクス {#exactly-once-semantics}

大規模なデータセットを取り込む際にはさまざまな種類の障害が発生する可能性があり、その結果、一部だけが挿入されてしまったり、重複データが生じたりすることがあります。Object Storage ClickPipes は挿入エラーに対して高い耐障害性を持ち、厳密な 1 回限りのセマンティクスを保証します。これは一時的な「staging」テーブルを使用することで実現しています。まずデータは staging テーブルに挿入されます。この挿入処理で問題が発生した場合、staging テーブルを TRUNCATE し、クリーンな状態から挿入を再試行できます。挿入が完了し、正常に終了した場合にのみ、staging テーブル内のパーティションがターゲットテーブルに移動されます。この戦略の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### 仮想カラム {#virtual-columns}

どのファイルが取り込まれたかを追跡するには、カラムマッピングのリストに `_file` 仮想カラムを追加します。`_file` 仮想カラムには元のオブジェクトのファイル名が含まれており、どのファイルが処理されたかをクエリするために利用できます。

## アクセス制御 {#access-control}

### Permissions {#permissions}

ABS ClickPipe ではプライベートコンテナのみをサポートします。パブリックコンテナは **サポートされません**。

コンテナが格納されているバケットのポリシーで、[`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) と [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) アクションを許可する必要があります。

### 認証 {#authentication}

:::note
Microsoft Entra ID 認証（マネージド ID を含む）は現在サポートされていません。
:::

Azure Blob Storage の認証には [connection string](https://docs.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) を使用します。これは、アクセスキーと共有アクセス署名（SAS）の両方をサポートします。

#### アクセス キー {#access-key}

[アカウント アクセス キー](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage) を使用して認証するには、以下の形式の接続文字列を指定します。

```bash
DefaultEndpointsProtocol=https;AccountName=storage-account-name;AccountKey=account-access-key;EndpointSuffix=core.windows.net
```

ストレージアカウント名とアクセスキーは、Azure ポータルの **Storage Account &gt; Access keys** から確認できます。


#### Shared Access Signature (SAS) {#sas}

[Shared Access Signature (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview) で認証を行うには、SAS トークンを含む接続文字列を指定します。

```bash
BlobEndpoint=https://storage-account-name.blob.core.windows.net/;SharedAccessSignature=sas-token
```

Azure Portal の **Storage Account &gt; Shared access signature** で、取り込み対象のコンテナおよび BLOB に対して必要な権限（`Read`、`List`）を付与した SAS トークンを生成します。


## 高度な設定 {#advanced-settings}

ClickPipes は、ほとんどのユースケースの要件を満たす適切なデフォルト値を提供します。ユースケースに応じてさらなる調整が必要な場合は、次の設定を変更できます。

| 設定                               | デフォルト値  | 説明                                  |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 1 回の挿入バッチで処理するバイト数。                                  |
| `Max file count`                   | 100           | 1 回の挿入バッチで処理するファイルの最大数。                          |
| `Max threads`                      | auto(3)       | ファイル処理に使用する [同時実行スレッド数の上限](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | ファイル処理に使用する [同時実行挿入スレッド数の上限](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | テーブルに挿入可能な [ブロック内の最小バイトサイズ](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [同時実行ダウンロードスレッド数の上限](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | ClickHouse クラスターにデータを挿入する前の最大待機期間を設定します。 |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select 設定](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | アタッチされた VIEW への書き込みを[逐次ではなく並行して](/operations/settings/settings#parallel_view_processing)実行するかどうか。 |
| `Use cluster function`             | true          | 複数ノード間でファイルを並列処理するかどうか。 |

<Image img={cp_advanced_settings} alt="ClickPipes の高度な設定" size="lg" border/>

### スケーリング {#scaling}

Object Storage ClickPipes は、[設定済みの垂直オートスケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)によって決定される ClickHouse サービスの最小サイズを基準にスケールされます。ClickPipe のサイズは、パイプを作成した時点で決まります。その後に ClickHouse サービスの設定を変更しても、ClickPipe のサイズは変わりません。

大規模な取り込みジョブのスループットを高めるには、ClickPipe を作成する前に ClickHouse サービスをスケールアップしておくことを推奨します。

## 既知の制限事項 {#known-limitations}

### ファイルサイズ {#file-size}

ClickPipes は、サイズが **10GB 以下** のオブジェクトのみを取り込み対象とします。ファイルが 10GB を超える場合は、ClickPipes 専用のエラーテーブルにエラーが記録されます。

### レイテンシー {#latency}

10万ファイルを超えるコンテナの場合、新しいファイルを検出する際に、既定のポーリング間隔に加えて Azure Blob Storage の `LIST` 操作による追加のレイテンシーが発生します:

- **10万ファイル未満**: 約30秒（既定のポーリング間隔）
- **10万ファイル**: 約40〜45秒  
- **25万ファイル**: 約55〜70秒
- **50万ファイル以上**: 90秒を超える可能性あり

[continuous ingestion](#continuous-ingestion) の場合、ClickPipes はコンテナをスキャンし、最後にインジェストされたファイルよりも辞書順で後ろに位置する新しいファイルを特定する必要があります。1回のリスト操作あたりのファイル数を減らすため、ファイルをより小さなコンテナに整理するか、階層的なディレクトリ構造を使用することを推奨します。

### ビューのサポート {#view-support}

ターゲットテーブルに対する materialized view もサポートされています。ClickPipes はターゲットテーブルだけでなく、それに依存するすべての materialized view 用にもステージングテーブルを作成します。

通常の（非 materialized）view に対してはステージングテーブルを作成しません。つまり、ターゲットテーブルに 1 つ以上の下流の materialized view がある場合、それらの materialized view では、ターゲットテーブル上の view を介してデータを参照しないようにする必要があります。そうしないと、その materialized view でデータが欠落する可能性があります。

### 依存関係 {#dependencies}

ClickPipe の実行中に宛先テーブル、その materialized view（カスケードする materialized view を含む）、またはそれらの materialized view のターゲットテーブルに変更を加えると、再試行可能なエラーが発生します。これらの依存関係のスキーマを変更する場合は、ClickPipe を一時停止し、変更を適用してから再開してください。