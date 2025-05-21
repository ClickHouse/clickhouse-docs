---
sidebar_label: 'HTTPインターフェースの使用'
slug: /integrations/azure-data-factory/http-interface
description: 'ClickHouseのHTTPインターフェースを使用してAzure Data FactoryからClickHouseにデータを取り込む'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: 'ClickHouse HTTPインターフェースを使用してAzureデータをClickHouseに取り込む'
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
は、Azure Blob StorageからClickHouseへのデータ取り込みを迅速かつ便利に行う方法です。しかし、以下の理由から常に適しているとは限りません:

- データがAzure Blob Storageに保存されていない場合 — 例えば、Azure SQL Database、Microsoft SQL Server、またはCosmos DBに保存されている可能性があります。
- セキュリティポリシーにより、Blob Storageへの外部アクセスが完全に制限されている場合があります — 例えば、ストレージアカウントがパブリックエンドポイントなしでロックされている場合です。

このようなシナリオでは、Azure Data Factoryを使用して、[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)を介してAzureサービスからClickHouseにデータを送信できます。

この方法はフローを逆転させます: ClickHouseがAzureからデータを取得するのではなく、Azure Data FactoryがデータをClickHouseにプッシュします。このアプローチでは、通常、ClickHouseインスタンスがパブリックインターネットからアクセス可能である必要があります。

:::info
Azure Data Factoryのセルフホスト型統合ランタイムを使用することで、ClickHouseインスタンスをインターネットにさらすことを避けることができます。この設定により、プライベートネットワークを介してデータを送信できます。ただし、この記事の範囲を超えています。公式ガイドで詳細を確認できます:
[セルフホスト型統合ランタイムの作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## ClickHouseをRESTサービスに変える {#turning-clickhouse-to-a-rest-service}

Azure Data Factoryは、外部システムにHTTP経由でJSON形式のデータを送信することをサポートしています。この機能を利用して、[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)を使用してデータをClickHouseに直接挿入できます。詳細は[ClickHouse HTTPインターフェースの
ドキュメント](https://clickhouse.com/docs/interfaces/http)をご覧ください。

この例では、宛先テーブルを指定し、入力データ形式をJSONとして定義し、より柔軟なタイムスタンプ解析を許可するオプションを含める必要があります。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

このクエリをHTTPリクエストの一部として送信するには、単にそれをClickHouseエンドポイントのクエリパラメーターにURLエンコードされた文字列として渡します:
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factoryは、内蔵の`encodeUriComponent`関数を使用してこのエンコーディングを自動的に処理できるため、手動で行う必要はありません。
:::

これで、このURLにJSON形式のデータを送信できます。データはターゲットテーブルの構造に一致する必要があります。以下は、3つのカラム`col_1`、`col_2`、および`col_3`を持つテーブルを想定したcurlを使用したシンプルな例です。
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

JSONのオブジェクトの配列や、JSON Lines（改行区切りのJSONオブジェクト）を送信することもできます。Azure Data Factoryは、ClickHouseの`JSONEachRow`入力に完全に合致するJSON配列形式を使用します。

このステップでは、ClickHouse側で特別なことを行う必要はありません。HTTPインターフェースはすでにRESTのようなエンドポイントとして機能するために必要なすべてを提供しています — 追加の構成は不要です。

ClickHouseがRESTエンドポイントのように動作するようになったので、次はAzure Data Factoryをそれを使用するように設定することです。

次のステップでは、Azure Data Factoryインスタンスを作成し、ClickHouseインスタンスへのリンクサービスを設定し、[RESTシンク](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)用のデータセットを定義し、AzureからClickHouseにデータを送信するためのコピー活動を作成します。

## Azure Data Factoryインスタンスの作成 {#create-an-azure-data-factory-instance}

このガイドは、Microsoft Azureアカウントにアクセスでき、すでにサブスクリプションとリソースグループを設定していることを前提としています。すでにAzure Data Factoryを設定している場合は、このステップをスキップして既存のサービスを使用して次のステップに進むことができます。

1. [Microsoft Azureポータル](https://portal.azure.com/)にログインし、**リソースの作成**をクリックします。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 左側のカテゴリーペインで**Analytics**を選択し、人気のサービスのリストから**Data Factory**をクリックします。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. サブスクリプションとリソースグループを選択し、新しいData Factoryインスタンスの名前を入力し、リージョンを選択して、バージョンはV2のままにします。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. **レビュー + 作成**をクリックし、次に**作成**をクリックしてデプロイメントを開始します。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

デプロイメントが成功裏に完了したら、新しいAzure Data Factoryインスタンスを使用し始めることができます。

## 新しいRESTベースのリンクサービスを作成する {#-creating-new-rest-based-linked-service}

1. Microsoft Azureポータルにログインし、Data Factoryインスタンスを開きます。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. Data Factoryの概要ページで**スタジオを起動**をクリックします。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 左側のメニューで**管理**を選択し、**リンクサービス**に移動して、**+ 新規**をクリックして新しいリンクサービスを作成します。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. **新しいリンクサービス検索バー**に**REST**と入力し、**REST**を選択して、[RESTコネクタ](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)インスタンスを作成するために**続行**をクリックします。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. リンクサービスの設定ペインで新しいサービスの名前を入力し、**Base URL**フィールドをクリックし、次に**動的コンテンツを追加**をクリックします（このリンクはフィールドが選択されているときだけ表示されます）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 動的コンテンツペインでは、パラメータ化されたURLを作成できます。これにより、異なるテーブル用のデータセットを作成する際にクエリを後で定義できるため、リンクサービスを再利用可能にします。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. フィルター入力の横にある**"+"**をクリックし、新しいパラメータを追加し、名前を`pQuery`とし、タイプを文字列に設定し、デフォルト値を`SELECT 1`に設定します。**保存**をクリックします。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 式フィールドに次の内容を入力し、**OK**をクリックします。`your-clickhouse-url.com`を実際のClickHouseインスタンスのアドレスに置き換えます。
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. メインフォームに戻り、基本認証を選択し、ClickHouse HTTPインターフェースに接続するために使用するユーザー名とパスワードを入力し、**接続チェック**をクリックします。すべてが正しく構成されていれば、成功メッセージが表示されます。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. **作成**をクリックして設定を完了します。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

これで、新しく登録したRESTベースのリンクサービスがリストに表示されるはずです。

## ClickHouse HTTPインターフェース用の新しいデータセットを作成する {#creating-a-new-dataset-for-the-clickhouse-http-interface}

ClickHouse HTTPインターフェース用のリンクサービスが構成されたので、Azure Data FactoryがClickHouseにデータを送信するために使用するデータセットを作成できます。

この例では、[環境センサーのデータ](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)の小さな部分を挿入します。

1. 使用する好きなClickHouseクエリコンソールを開きます — ClickHouse CloudウェブUI、CLIクライアント、またはクエリを実行するために使用する他のインターフェースです — そして、ターゲットテーブルを作成します:
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

2. Azure Data Factory Studioで、左側のペインで著者を選択します。データセット項目にカーソルを合わせ、三点アイコンをクリックし、新しいデータセットを選択します。
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 検索バーに**REST**と入力し、**REST**を選択して**続行**をクリックします。データセットの名前を入力し、前のステップで作成した**リンクサービス**を選択します。**OK**をクリックしてデータセットを作成します。
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. これで、左側のFactory Resourcesペインのデータセットセクションに新しく作成したデータセットが表示されるはずです。データセットを選択して、そのプロパティを開きます。リンクサービスで定義された`pQuery`パラメータが表示されます。**値**テキストフィールドをクリックし、次に**動的コンテンツを追加**をクリックします。
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. 開いたペインに次のクエリを貼り付けます:
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   クエリ内のすべてのシングルクオート`'`は、2つのシングルクオート`''`に置き換える必要があります。これはAzure Data Factoryの式パーサーによって要求されます。エスケープしない場合、エラーがすぐに表示されない可能性がありますが — データセットを使用または保存しようとすると後で失敗します。たとえば、`'best_effort'`は`''best_effort''`と書く必要があります。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 式を保存するにはOKをクリックします。接続チェックをクリックします。すべてが正しく構成されていれば、接続成功メッセージが表示されます。ページ上部の**すべてを公開**をクリックして、変更を保存します。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### サンプルデータセットの設定 {#setting-up-an-example-dataset}

この例では、完全な環境センサーのデータセットを使用するのではなく、[センサーのデータセットサンプル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)で入手可能な小さなサブセットを使用します。

:::info
このガイドを焦点を絞ったものにするため、Azure Data Factoryでのソースデータセットの正確な作成手順には触れません。サンプルデータをお好きなストレージサービスにアップロードできます — たとえば、Azure Blob Storage、Microsoft SQL Server、またはAzure Data Factoryがサポートする他のファイル形式などです。
:::

データセットをAzure Blob Storage（または他の好みのストレージサービス）にアップロードします。その後、Azure Data Factory StudioでFactory Resourcesペインに移動し、アップロードしたデータを指す新しいデータセットを作成します。変更を保存するために**すべてを公開**をクリックします。

## ClickHouseへのデータ転送用のコピーアクティビティの作成 {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

入力データセットと出力データセットの両方を構成したので、**コピー データ**アクティビティを設定して、サンプルデータセットからClickHouseの`sensors`テーブルにデータを転送できます。

1. **Azure Data Factory Studio**を開き、**著者タブ**に移動します。**Factory Resources**ペインで**パイプライン**にカーソルを合わせ、三点アイコンをクリックして**新しいパイプライン**を選択します。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. **アクティビティ**ペインで、**移動および変換**セクションを展開し、**コピー データ**アクティビティをキャンバスにドラッグします。
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. **ソース**タブを選択し、先ほど作成したソースデータセットを選択します。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. **シンク**タブに移動し、センサーのテーブル用に作成されたClickHouseデータセットを選択します。**リクエストメソッド**をPOSTに設定します。**HTTP圧縮タイプ**が**なし**に設定されていることを確認します。
   :::warning
   HTTP圧縮は、Azure Data Factoryのコピー データアクティビティで正しく動作しません。有効にすると、Azureはゼロバイトのみのペイロードを送信します — サービスのバグの可能性があります。圧縮は無効にしておくことを忘れないでください。
   :::
   :::info
   デフォルトのバッチサイズは10,000のままにするか、さらに増やすことをお勧めします。詳細については、[挿入戦略の選択/同期の場合のバッチ挿入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)で詳細を確認してください。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. キャンバスの上部にある**デバッグ**をクリックしてパイプラインを実行します。しばらく待つと、アクティビティがキューに入れられ、実行されます。すべてが正しく構成されていれば、タスクは**成功**ステータスで終了するはずです。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 完了したら、パイプラインとデータセットの変更を保存するために**すべてを公開**をクリックします。

## 追加リソース {#additional-resources-1}
- [HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factoryを使用してRESTエンドポイントからのデータのコピーと変換](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [挿入戦略の選択](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [セルフホスト型統合ランタイムの作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
