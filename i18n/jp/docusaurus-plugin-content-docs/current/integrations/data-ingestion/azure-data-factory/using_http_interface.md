---
sidebar_label: 'Using the HTTP interface'
slug: '/integrations/azure-data-factory/http-interface'
description: 'Using ClickHouse''s HTTP interface to bring data from Azure Data Factory
  into ClickHouse'
keywords:
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'http interface'
title: 'Using ClickHouse HTTP Interface to bring Azure data into ClickHouse'
---

import Image from '@theme/IdealImage';
import azureHomePage                            from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-page.png';
import azureNewResourceAnalytics                from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-resource-analytics.png';
import azureNewDataFactory                      from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory.png';
import azureNewDataFactoryConfirm               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-confirm.png';
import azureNewDataFactorySuccess               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-success.png';
import azureHomeWithDataFactory                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-with-data-factory.png';
import azureDataFactoryPage                     from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-factory-page.png';
import adfCreateLinkedServiceButton             from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-create-linked-service-button.png';
import adfNewLinkedServiceSearch                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-search.png';
import adfNewLinedServicePane                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-lined-service-pane.png';
import adfNewLinkedServiceBaseUrlEmpty          from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-base-url-empty.png';
import adfNewLinkedServiceParams                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-params.png';
import adfNewLinkedServiceExpressionFieldFilled from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-expression-field-filled.png';
import adfNewLinkedServiceCheckConnection       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-check-connection.png';
import adfLinkedServicesList                    from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-linked-services-list.png';
import adfNewDatasetItem                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-item.png';
import adfNewDatasetPage                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-page.png';
import adfNewDatasetProperties                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-properties.png';
import adfNewDatasetQuery                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-query.png';
import adfNewDatasetConnectionSuccessful        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-connection-successful.png';
import adfNewPipelineItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-pipeline-item.png';
import adfNewCopyDataItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-copy-data-item.png';
import adfCopyDataSource                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-source.png';
import adfCopyDataSinkSelectPost                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-sink-select-post.png';
import adfCopyDataDebugSuccess                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-debug-success.png';


# Azure Data FactoryにおけるClickHouse HTTPインターフェースの使用 {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
は、Azure Blob StorageからClickHouseにデータを取り込むための
迅速かつ便利な方法です。しかし、以下の理由から常に適切であるとは限りません。

- データがAzure Blob Storageに保存されていない場合 — 例えば、Azure SQL Database、Microsoft SQL Server、またはCosmos DBにある可能性があります。
- セキュリティポリシーにより、Blob Storageへの外部アクセスが
  完全に制限される場合があります — 例えば、ストレージアカウントに
  公共のエンドポイントがない場合です。

このようなシナリオでは、Azure Data Factoryを使用して
[ClickHouse HTTP インターフェース](https://clickhouse.com/docs/interfaces/http)
を利用し、AzureサービスからClickHouseにデータを送信することができます。

この方法は流れを逆転させます：ClickHouseがAzureからデータを
引き出すのではなく、Azure Data FactoryがデータをClickHouseに
プッシュします。このアプローチは通常、ClickHouseインスタンスが
公共のインターネットからアクセス可能である必要があります。

:::info
Azure Data FactoryのSelf-hosted Integration Runtimeを使用することで、
ClickHouseインスタンスをインターネットにさらすことなく、プライベートネットワークを介してデータを送信することが可能です。この設定はこの記事の範囲を超えますが、公式ガイドでさらに詳しい情報が得られます：
[セルフホスト統合
ランタイムの作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## ClickHouseをRESTサービスに変える {#turning-clickhouse-to-a-rest-service}

Azure Data Factoryは、HTTPを介して外部システムにデータをJSONフォーマットで送ることをサポートしています。この機能を利用して、[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)を使って直接ClickHouseにデータを挿入することができます。詳細は[ClickHouse HTTPインターフェースの
ドキュメント](https://clickhouse.com/docs/interfaces/http)を参照してください。

この例では、宛先テーブルを指定し、入力データフォーマットをJSONとして定義し、より柔軟なタイムスタンプ解析を許可するオプションを含めるだけで済みます。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

このクエリをHTTPリクエストの一部として送信するには、クエリパラメータに
URLエンコードされた文字列として渡します：
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factoryは組み込みの
`encodeUriComponent`関数を使用してこのエンコーディングを自動的に処理できるため、手動で行う必要はありません。
:::

これでJSON形式のデータをこのURLに送信できます。データは対象のテーブルの構造に合致する必要があります。以下は、3つのカラム`col_1`、`col_2`、`col_3`を持つテーブルを仮定した簡単なcurlの例です。
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

JSONオブジェクトの配列やJSON Lines（改行区切りのJSONオブジェクト）を送信することも可能です。Azure Data FactoryはJSON配列形式を使用しており、これはClickHouseの`JSONEachRow`入力と完全に互換性があります。

このステップでは、ClickHouse側で特別な操作を行う必要はありません。HTTPインターフェース自体がRESTのようなエンドポイントとして機能するために必要なものをすでに提供しています — 追加の設定は不要です。

ClickHouseをRESTエンドポイントのように振る舞わせたので、Azure Data Factoryをそれを使用するように設定する時が来ました。

次のステップでは、Azure Data Factoryインスタンスを作成し、ClickHouseインスタンスへのLinked Serviceを設定し、
[REST出力](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)のためのDatasetを定義し、データをAzureからClickHouseに送信するためのCopy Dataアクティビティを作成します。

## Azure Data Factoryインスタンスの作成 {#create-an-azure-data-factory-instance}

このガイドでは、Microsoft Azureアカウントにアクセスでき、
すでにサブスクリプションとリソースグループが構成されていることを前提としています。もしすでにAzure Data Factoryが設定されている場合は、このステップをスキップして
既存のサービスを利用できます。

1. [Microsoft Azureポータル](https://portal.azure.com/)にログインし、**リソースの作成**をクリックします。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 左側のカテゴリペインで**分析**を選択し、その後一般的なサービスのリストから**Data Factory**をクリックします。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. サブスクリプションとリソースグループを選択し、新しいData Factoryインスタンスの名前を入力し、リージョンを選択し、バージョンはV2のままにします。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. **確認 + 作成**をクリックし、次に**作成**をクリックしてデプロイを開始します。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

デプロイが正常に完了したら、新しいAzure Data Factoryインスタンスの使用を開始できます。

## 新しいRESTベースのリンクサービスの作成 {#-creating-new-rest-based-linked-service}

1. Microsoft Azure Portalにログインし、Data Factoryインスタンスを開きます。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. Data Factoryの概要ページで、**スタジオを起動**をクリックします。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 左側のメニューで**管理**を選択し、**Linked services**に移動し、**+ 新規**をクリックして新しいリンクサービスを作成します。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. **新規リンクサービス検索バー**に**REST**と入力し、RESTを選択し、**続行**をクリックして[RESTコネクタ](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   インスタンスを作成します。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. リンクサービス設定ペインで新しいサービスの名前を入力し、**ベースURL**フィールドをクリックして**動的コンテンツの追加**をクリックします（このリンクはフィールドが選択されているときのみ表示されます）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 動的コンテンツペインで、パラメータ化されたURLを作成できます。これにより、異なるテーブルのデータセットを作成する際にクエリを後で定義できるため、リンクサービスを再利用可能にします。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. フィルター入力の横にある**"+"**をクリックして新しいパラメータを追加し、名前を`pQuery`とし、型をStringに設定して、デフォルト値を`SELECT 1`に設定します。**保存**をクリックします。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 式フィールドに以下を入力し、**OK**をクリックします。`your-clickhouse-url.com`を実際のClickHouseインスタンスのアドレスに置き換えます。
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. メインフォームに戻って基本認証を選択し、ClickHouse HTTPインターフェースに接続するために使用するユーザー名とパスワードを入力し、**接続テスト**をクリックします。すべてが正しく設定されていれば、成功メッセージが表示されます。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. **作成**をクリックして設定を完了します。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

新たに登録されたRESTベースのリンクサービスがリストに表示されるはずです。

## ClickHouse HTTPインターフェース用の新しいデータセットの作成 {#creating-a-new-dataset-for-the-clickhouse-http-interface}

ClickHouse HTTPインターフェース用のリンクサービスが設定されたので、Azure Data FactoryがClickHouseにデータを送信するために使用するデータセットを作成できます。

この例では、[環境センサー
データ](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)の一部を挿入します。

1. お好みのClickHouseクエリコンソールを開いてください — これはClickHouse CloudのWeb UI、CLIクライアント、またはクエリを実行するために使用する他のインターフェースでも構いません — そしてターゲットテーブルを作成します：
   ```sql
   CREATE TABLE sensors
   (
       sensor_id UInt16,
       lat Float32,
       lon Float32,
       timestamp DateTime,
       temperature Float32
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, sensor_id);
   ```

2. Azure Data Factory Studioで、左側のペインで作成を選択します。データセット項目にマウスを乗せ、三点アイコンをクリックして新しいデータセットを選択します。
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 検索バーに**REST**と入力し、RESTを選択して**続行**をクリックします。データセットの名前を入力し、前のステップで作成した**リンクサービス**を選択します。**OK**をクリックしてデータセットを作成します。
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. 左側のファクトリリソースペインのデータセットセクションに、新しく作成したデータセットが表示されるはずです。そのデータセットを選択して、プロパティを開きます。リンクサービスで定義された`pQuery`パラメータが表示されます。**値**のテキストフィールドをクリックし、次に**動的内容の追加**をクリックします。
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. 開いたペインに次のクエリを貼り付けます：
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   クエリ内のすべてのシングルクォート`'`は、二重シングルクォート`''`に置き換える必要があります。これはAzure Data Factoryの式パーサーによって要求されます。これらをエスケープしないと、直ちにエラーが表示されることはありませんが、データセットを使用または保存しようとしたときに失敗します。例えば、`'best_effort'`は`''best_effort''`と書かれる必要があります。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 式を保存するためにOKをクリックします。接続テストをクリックします。すべてが正しく設定されていれば、接続成功メッセージが表示されます。ページ上部の**すべてを公開**をクリックして変更を保存します。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### 例データセットの設定 {#setting-up-an-example-dataset}

この例では、完全な環境センサーのデータセットを使用するのではなく、[センサー
データセットのサンプル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)の小さな部分を使用します。

:::info
このガイドを集中させるために、Azure Data Factoryでソースデータセットを作成するための正確な手順には触れません。サンプルデータをお好きなストレージサービスにアップロードできます — 例えば、Azure Blob Storage、Microsoft SQL Server、またはAzure Data Factoryがサポートする別のファイル形式です。
:::

データセットをAzure Blob Storage（または他の好みのストレージサービス）にアップロードしたら、Azure Data Factory Studioでファクトリリソースペインに移動します。アップロードしたデータを指す新しいデータセットを作成します。**すべてを公開**をクリックして変更を保存します。

## ClickHouseへのデータ転送のためのCopyアクティビティの作成 {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

入力データセットと出力データセットの両方が設定されたので、**データのコピー**アクティビティを設定して、例のデータセットからClickHouseの`sensors`テーブルにデータを転送できます。

1. **Azure Data Factory Studio**を開き、**作成タブ**に移動します。**ファクトリリソース**ペインで**パイプライン**にマウスを乗せ、三点アイコンをクリックして**新しいパイプライン**を選択します。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. **アクティビティ**ペインで、**移動と変換**セクションを展開し、**データのコピー**アクティビティをキャンバスにドラッグします。
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. **ソース**タブを選択し、先に作成したソースデータセットを選択します。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. **シンク**タブに移動し、センサー テーブル用に作成したClickHouseデータセットを選択します。**リクエストメソッド**をPOSTに設定します。**HTTP圧縮タイプ**は**なし**に設定されていることを確認してください。
   :::warning
   HTTP圧縮はAzure Data Factoryのデータコピーアクティビティで正しく機能しません。有効にすると、Azureはゼロバイトのみを含むペイロードを送信する — サービスのバグの可能性が高いです。圧縮を無効のままにしてください。
   :::
   :::info
   デフォルトのバッチサイズ10,000を維持することをお勧めします。さらに増やすこともできます。詳細については、[挿入戦略の選択 / 同期的なバッチ挿入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)を参照してください。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. キャンバスの上部で**デバッグ**をクリックしてパイプラインを実行します。少し待った後、アクティビティはキューに追加され、実行されます。すべてが正しく設定されていれば、タスクは**成功**の状態で終了するはずです。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 完了したら、**すべてを公開**をクリックしてパイプラインとデータセットの変更を保存します。

## 追加リソース {#additional-resources-1}
- [HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factoryを使用してRESTエンドポイント間でデータをコピーおよび変換する](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [挿入戦略の選択](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [セルフホスト統合ランタイムの作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
