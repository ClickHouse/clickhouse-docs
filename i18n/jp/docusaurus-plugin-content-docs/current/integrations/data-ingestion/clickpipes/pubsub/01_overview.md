---
sidebar_label: 'GCP Pub/Sub 向け ClickPipes'
description: 'Google Cloud Pub/Sub のトピックを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/pubsub
title: 'Google Pub/Sub と ClickHouse Cloud の統合'
doc_type: 'guide'
keywords: ['clickpipes', 'pubsub', 'gcp pub/sub', 'google cloud pub/sub', 'ストリーミング', 'gcp', 'データ インジェスト', '圧縮', 'gzip', 'zstd', 'lz4', 'snappy']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1_pubsub.png';
import cp_step2_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_pubsub.png';
import cp_step3_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_pubsub.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

# Google Pub/Sub と ClickHouse Cloud の統合 \{#integrating-google-pubsub-with-clickhouse-cloud\}

:::note
[こちら](https://clickhouse.com/cloud/clickpipes#pubsub-private-preview)からプライベートプレビューのウェイトリストに登録できます。
:::

Pub/Sub ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](/integrations/clickpipes/programmatic-access/openapi) や [Terraform](/integrations/clickpipes/programmatic-access/terraform) を使用してプログラムからデプロイおよび管理することもできます。

## 前提条件 \{#prerequisite\}

[ClickPipes の概要](../index.md)を確認済みで、取り込み元のトピックを含む GCP プロジェクトへのアクセス権があり、適切な Pub/Sub 権限を持つサービスアカウントを作成している必要があります。ClickPipes に必要な権限の正確な一覧については、[Pub/Sub IAM 権限ガイド](./02_auth.md)を参照してください。

## 最初の ClickPipe を作成する \{#creating-your-first-clickpipe\}

1. ClickHouse Cloud サービスの SQL Console にアクセスします。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border />

2. 左側のメニューで `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border />

3. データソースとして **GCP Pub/Sub** を選択します。

<Image img={cp_step1_pubsub} alt="データソースとして GCP Pub/Sub を選択" size="lg" border />

4. フォームに ClickPipe 名、**GCP Project ID**、および Pub/Sub へのアクセス権を持つサービスアカウントの **service account JSON file** を入力します。Project ID は 6～30 文字で、小文字、数字、ハイフンを使用でき、先頭は英字である必要があり、末尾をハイフンにすることはできません。

<Image img={cp_step2_pubsub} alt="接続の詳細を入力" size="lg" border />

5. 取り込み元の **Pub/Sub トピック** を選択します。認証情報の検証が完了すると、プルダウンには GCP プロジェクト内の トピック が自動的に読み込まれ、アルファベット順で表示されます。

   * **Data format。** トピック を選択すると、ClickPipes は Pub/Sub のスキーマレジストリに問い合わせます。トピック に native の Avro または Protobuf スキーマが関連付けられている場合、Data format と Schema は自動検出され、セレクターはその トピック の最新スキーマに固定されます。native スキーマがない トピック は、デフォルトで JSONEachRow になります。
   * **開始オフセット。** 読み取りを開始する位置を選択します。使用できるオプションは **Latest** (新しいメッセージのみ) 、**Earliest** (保持されている最も古いメッセージ) 、**Seek to Timestamp** (UTC の日時 picker 付き) です。
   * **フィルタ式 (省略可) 。** メッセージ attribute に対する Pub/Sub の[サブスクリプションフィルタ](https://cloud.google.com/pubsub/docs/subscription-message-filter)です。たとえば `attributes.type = "telemetry"` のように指定します。フィルタが適用されるのはメッセージ attribute のみで、ペイロードには適用されません。また、pipe の作成後に変更することはできません (変更するには pipe を再作成する必要があります) 。
   * UI には、選択した トピック のサンプルメッセージが表示されます。**Flatten object** トグルを使用すると、ネストされた JSON が宛先側でどのようにフラット化されるかをプレビューできます。

<Image img={cp_step3_pubsub} alt="Pub/Sub トピック、フォーマット、開始オフセットを設定" size="lg" border />

6. 次のステップでは、データを新しい ClickHouse table に取り込むか、既存の table を再利用するかを選択できます。画面の指示に従って、table 名、スキーマ、設定を変更してください。上部のサンプル table で、変更内容をリアルタイムにプレビューできます。

<Image img={cp_step4a} alt="table、スキーマ、設定を指定" size="lg" border />

提供されているコントロールを使用して、詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="詳細コントロールを設定" size="lg" border />

7. また、既存の ClickHouse table にデータを取り込むこともできます。その場合、UI ではソース側のフィールドを、選択した宛先 table の ClickHouse フィールドにマッピングできます。

<Image img={cp_step4b} alt="既存の table を使用" size="lg" border />

8. 最後に、内部 ClickPipes ユーザーの権限を設定できます。

**権限:** ClickPipes は、宛先 table にデータを書き込むための専用ユーザーを作成します。カスタムロールまたは定義済みロールのいずれかを使って、この内部ユーザーに割り当てるロールを選択できます。

* `Full access`: クラスターへのフルアクセス権限です。宛先 table で materialized view や Dictionary を使用する場合に便利です。
  * `Only destination table`: 宛先 table のみに対する `INSERT` 権限です。

<Image img={cp_step5} alt="権限" border />

9. 「Complete Setup」をクリックすると、システムによって ClickPipe が登録され、サマリー table に一覧表示されます。

<Image img={cp_success} alt="成功通知" size="sm" border />

<Image img={cp_remove} alt="削除通知" size="lg" border />

サマリー table には、ソースまたは ClickHouse 内の宛先 table のサンプルデータを表示するためのコントロールが用意されています。

<Image img={cp_destination} alt="宛先を表示" size="lg" border />

また、ClickPipe を削除したり、取り込み job の概要を表示したりするためのコントロールもあります。

<Image img={cp_overview} alt="概要を表示" size="lg" border />

10. **おめでとうございます！** 最初の Pub/Sub ClickPipe の設定が正常に完了しました。以降は継続的に実行され、Pub/Sub トピック から ClickHouse Cloud サービスへリアルタイムでデータを取り込みます。

## 管理対象サブスクリプション \{#managed-subscriptions\}

Pub/Sub メッセージはトピックから直接ではなく、サブスクリプション経由で消費されます。ClickPipes は各 パイプ 用の専用サブスクリプションを作成して管理するため、ユーザーが選択するのは常にトピックのみです。

* 管理対象サブスクリプションの名前は `clickpipes-{pipeID}` で、パイプ の起動時にそのトピック上に作成されます。
* 60 秒の ack デッドライン、7 日間のメッセージ保持、およびメッセージ順序指定の有効化で構成されています。
* サブスクリプションの作成は冪等です。パイプ の再起動時やレプリカの再スケジュール時には、設定されたトピックをすでに参照している既存のサブスクリプションがあれば、それが再利用されます。
* トピック検出とメッセージサンプリングの際には、ClickPipes は短命の一時的なサブスクリプション (`clickpipes-discovery-{uuid}`) も作成し、サンプリング完了後すぐに削除します。
* パイプ が削除されると、ClickPipes はクリーンアップ処理の一環として管理対象サブスクリプションを削除します。

したがって、指定するサービス アカウントには、サブスクリプションからメッセージを消費する権限に加えて、プロジェクト上でサブスクリプションを作成および削除する権限も必要です。完全な一覧については、[Pub/Sub IAM permissions guide](./02_auth.md) を参照してください。

## 対応データフォーマット \{#supported-data-formats\}

対応フォーマットは次のとおりです：

* [JSON](/interfaces/formats/JSON)
* [Avro](/interfaces/formats/Avro) — Pub/Sub ネイティブスキーマ経由 (BINARY エンコーディング)
* [Protobuf](/interfaces/formats/Protobuf) — Pub/Sub ネイティブスキーマ経由 (BINARY エンコーディング)

Avro と Protobuf の場合、スキーマはトピックに関連付けられた Pub/Sub スキーマレジストリから取得されます。パイプは常にトピックのスキーマの最新リビジョンを使用します。UI のスキーマセレクターは設計上、読み取り専用です。

## 圧縮 \{#compression\}

Pub/Sub 用の ClickPipes は、圧縮されたメッセージを自動的に検出して解凍します。Pub/Sub クライアントは生のバイト列を配信し、解凍は設定不要で ClickPipes が処理します。

サポートされている圧縮 codec は次のとおりです。

* **gzip**
* **zstd**
* **lz4**
* **snappy** (フレーム形式)

圧縮は、各メッセージ内のマジックバイトに基づいて自動的に検出されます。既知の圧縮シグネチャが見つからない場合、そのメッセージは非圧縮として扱われます。検出された圧縮タイプはスキーマ推論時にも表示されるため、UI のサンプルデータプレビューには解凍後のペイロードが正しく表示されます。

:::note
JSON のようなテキストベースのフォーマットでは、自動検出は安全です。これは、表示可能な ASCII 文字が圧縮のマジックバイトと衝突することがないためです。解凍後のペイロードは 64MB に制限されます。
:::

## 対応しているデータ型 \{#supported-data-types\}

### 標準データ型のサポート \{#standard-types-support\}

現在 ClickPipes でサポートされている ClickHouse データ型は次のとおりです。

* 基本的な数値型 - [U]Int8/16/32/64、Float32/64、BFloat16
* 大きな整数型 - [U]Int128/256
* Decimal 型
* Boolean
* String
* FixedString
* Date、Date32
* DateTime、DateTime64 (UTC タイムゾーンのみ)
* Enum8/Enum16
* UUID
* IPv4
* IPv6
* すべての ClickHouse LowCardinality 型
* キーと値に上記のいずれかの型を使用する Map (Nullable を含む)
* 要素に上記のいずれかの型を使用する Tuple および Array (Nullable を含む、深さは 1 レベルのみ)
* SimpleAggregateFunction 型 (AggregatingMergeTree または SummingMergeTree の宛先向け)

### Variant 型のサポート \{#variant-type-support\}

ソースデータストリーム内の任意の JSON フィールドに対して、Variant 型 (`Variant(String, Int64, DateTime)` など) を手動で指定できます。
ただし、ClickPipes における適切な Variant のサブタイプの判定方法の都合上、Variant の定義に使用できる整数型または日時型は 1 つだけです。たとえば、`Variant(Int64, UInt32)` はサポートされていません。

### JSON type のサポート \{#json-type-support\}

常に JSON オブジェクトとなる JSON フィールドは、JSON の宛先カラムに割り当てることができます。固定パスやスキップするパスも含め、宛先カラムは目的の JSON type に手動で変更する必要があります。

## Pub/Sub 仮想カラム \{#pubsub-virtual-columns\}

以下の仮想カラムが Pub/Sub トピックでサポートされています。新しい宛先テーブルを作成する際は、`Add Column` ボタンを使用して仮想カラムを追加できます。

| Name                  | Description                                        | Recommended Data Type |
| --------------------- | -------------------------------------------------- | --------------------- |
| &#95;message&#95;id   | ブローカーによって割り当てられた Pub/Sub メッセージ ID                  | String                |
| &#95;publish&#95;time | Pub/Sub の公開タイムスタンプ (UTC、ミリ秒精度)                     | DateTime64(3)         |
| &#95;ordering&#95;key | Pub/Sub の ordering key (メッセージにキーが設定されていない場合は空文字列)  | String                |
| &#95;attributes       | ユーザー定義の Pub/Sub メッセージ属性                            | Map(String, String)   |
| &#95;raw&#95;message  | Pub/Sub メッセージのペイロード全体 (デフォルトでは無効)                  | String                |

`_raw_message` フィールドは、Pub/Sub メッセージのペイロード全体だけが必要な場合 (たとえば、ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して下流の materialized view を生成する場合) に使用できます。このようなパイプでは、「仮想ではない」カラムをすべて削除することで、ClickPipes のパフォーマンスが向上する場合があります。

## 制限事項 \{#limitations\}

* [DEFAULT](/sql-reference/statements/create/table#default) はサポートされていません。
* 最小の (XS) レプリカサイズで実行している場合、個々のメッセージの上限はデフォルトで 8MB (非圧縮) で、より大きいレプリカでは 16MB (非圧縮) です。この上限を超えるメッセージはエラーとして拒否されます。より大きなメッセージが必要な場合は、サポートまでお問い合わせください。
* Pub/Sub のサブスクリプション フィルタは変更できません。フィルタ式を変更するには、パイプ を再作成する必要があります。
* フィルタはメッセージ属性にのみ適用され、メッセージペイロードには適用されません。

## パフォーマンス \{#performance\}

### バッチ処理 \{#batching\}

ClickPipes は、ClickHouse にデータをバッチ単位で挿入します。これは、データベース内でパーツが増えすぎるのを防ぎ、クラスターのパフォーマンス低下を避けるためです。

バッチは、次のいずれかの条件を満たすと挿入されます。

* バッチサイズが上限に達した場合 (100,000 行、またはレプリカメモリ 1GB あたり 32MB)
* バッチのオープン時間が上限に達した場合 (5 秒)

### レイテンシ \{#latency\}

レイテンシ (Pub/Sub メッセージが公開されてから、そのメッセージが ClickHouse で利用可能になるまでの時間として定義) は、さまざまな要因 (パブリッシャー側のレイテンシ、ネットワークのレイテンシ、メッセージのサイズ/フォーマット) に左右されます。前節で説明した[バッチ処理](#batching)も、レイテンシに影響します。想定されるレイテンシを把握するため、実際のユースケースでテストすることを推奨します。

低レイテンシに関する具体的な要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### 順序キー \{#ordering-keys\}

Pub/Sub では、同じ[順序キー](https://cloud.google.com/pubsub/docs/ordering)を持つメッセージが、単一のサブスクライバーに対して公開順に配信されることが保証されます。ClickPipes では、管理対象のサブスクリプションで順序付けがデフォルトで有効です。つまり、メッセージに順序キーが含まれている場合、サブスクライバーはそれらを順序どおりに受信し、順序キーが含まれていない場合の動作は変わりません。

プロデューサーがすべてのメッセージを少数の順序キー (または単一のキー) で公開すると、Pub/Sub はそれらのメッセージを少数のサブスクライバーに集中させるため、水平方向のスループットが制限される可能性があります。順序付けが不要な場合は順序キーを省略するか、カーディナリティの高い順序キーを使用することを推奨します。

### スケーリング \{#scaling\}

Pub/Sub 向け ClickPipes は、水平方向と垂直方向の両方にスケールできるように設計されています。各パイプは 1 つの管理対象サブスクリプション を使用します。これは設定できません。デフォルトでは、1 つのコンシューマーがその サブスクリプション からメッセージを取得します。コンシューマー数は ClickPipe の作成時、または **設定** -&gt; **詳細設定** -&gt; **スケーリング** からいつでも増やせます。ClickPipes は サブスクリプション からのメッセージを実行中のコンシューマーに自動的に分散するため、追加の調整は不要です。

ClickPipes は、可用性ゾーンに分散されたアーキテクチャによって高可用性を実現します。これには、少なくとも 2 つのコンシューマーまでスケールする必要があります。

実行中のコンシューマー数にかかわらず、耐障害性は設計上確保されています。コンシューマーまたはその基盤インフラストラクチャに障害が発生した場合でも、ClickPipes は自動的にコンシューマーを再起動し、メッセージ処理を継続します。

### 配信セマンティクス \{#delivery-semantics\}

Pub/Sub 向け ClickPipes は、**at-least-once** 配信を提供します。Pub/Sub メッセージは、対応する行が ClickHouse に挿入された後 (または不正なレコードの場合は error table に書き込まれた後) にのみ確認応答されます。無限に再配信されるのを防ぐため、処理されたメッセージはすべて確認応答されます。これには、error table に振り分けられた不正なレコードも含まれます。レプリカが insert の後、ack が Pub/Sub に到達する前にクラッシュした場合、そのメッセージは ack 期限の経過後に再配信され、再度挿入されます。そのため、下流のコンシューマーは重複を許容できる必要があります。exactly-once セマンティクスが必要な場合は、`_message_id` 仮想カラムを使って下流で重複排除を行ってください (各 Pub/Sub メッセージ ID は、1 つの トピック 内で一意です) 。

## 認証 \{#authentication\}

Pub/Sub 向け ClickPipes は、サービスアカウントの JSON キーを使用して GCP で認証を行います。パイプの作成時にキーファイルをアップロードすると、ClickPipes はそのファイルを保存時に暗号化し、実行時にはメッセージの取り込みと、管理対象サブスクリプションのライフサイクル管理に使用します。

必要な IAM 権限の正確な一覧と、推奨されるカスタムロール定義については、[Pub/Sub IAM permissions guide](./02_auth.md) を参照してください。