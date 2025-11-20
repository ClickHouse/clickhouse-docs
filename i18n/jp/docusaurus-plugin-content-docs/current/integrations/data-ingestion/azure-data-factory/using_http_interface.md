---
sidebar_label: 'HTTP インターフェイスの使用'
slug: /integrations/azure-data-factory/http-interface
description: 'ClickHouse の HTTP インターフェイスを使用して Azure Data Factory から ClickHouse にデータを取り込む'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: 'ClickHouse HTTP インターフェイスを使用して Azure データを ClickHouse に取り込む'
doc_type: 'guide'
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


# Azure Data FactoryでClickHouse HTTPインターフェースを使用する {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage`テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
は、Azure Blob StorageからClickHouseへデータを取り込むための高速で便利な方法です。ただし、以下の理由により、常に適しているとは限りません:

- データがAzure Blob Storageに保存されていない場合があります。例えば、Azure SQL Database、Microsoft SQL Server、またはCosmos DBに保存されている可能性があります。
- セキュリティポリシーによりBlob Storageへの外部アクセスが完全に禁止されている場合があります。例えば、ストレージアカウントがパブリックエンドポイントなしでロックダウンされている場合などです。

このような場合、Azure Data Factoryと
[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)
を組み合わせて使用することで、AzureサービスからClickHouseへデータを送信できます。

この方法はデータフローを逆転させます。ClickHouseがAzureからデータを取得するのではなく、Azure Data FactoryがClickHouseへデータをプッシュします。このアプローチでは通常、ClickHouseインスタンスがパブリックインターネットからアクセス可能である必要があります。

:::info
Azure Data Factoryのセルフホステッド統合ランタイムを使用することで、ClickHouseインスタンスをインターネットに公開せずに済ませることが可能です。この設定により、プライベートネットワーク経由でデータを送信できます。ただし、これは本記事の範囲外です。詳細については、公式ガイドを参照してください:
[セルフホステッド統合ランタイムの作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::


## ClickHouseをRESTサービスに変換する {#turning-clickhouse-to-a-rest-service}

Azure Data FactoryはJSON形式でHTTP経由で外部システムにデータを送信する機能をサポートしています。この機能を使用して、[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)を利用してClickHouseに直接データを挿入できます。
詳細は[ClickHouse HTTPインターフェースのドキュメント](https://clickhouse.com/docs/interfaces/http)を参照してください。

この例では、宛先テーブルを指定し、入力データ形式をJSONとして定義し、より柔軟なタイムスタンプ解析を可能にするオプションを含めるだけです。

```sql
INSERT INTO my_table
SETTINGS
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

このクエリをHTTPリクエストの一部として送信するには、ClickHouseエンドポイントのqueryパラメータにURLエンコードされた文字列として渡します。

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factoryは組み込みの`encodeUriComponent`関数を使用してこのエンコーディングを自動的に処理できるため、手動で行う必要はありません。
:::

これで、このURLにJSON形式のデータを送信できます。データは対象テーブルの構造と一致する必要があります。以下は、`col_1`、`col_2`、`col_3`の3つのカラムを持つテーブルを想定したcurlを使用した簡単な例です。

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

JSONオブジェクトの配列、またはJSON Lines(改行区切りのJSONオブジェクト)を送信することもできます。Azure Data FactoryはJSON配列形式を使用しており、これはClickHouseの`JSONEachRow`入力と完全に互換性があります。

ご覧のとおり、このステップではClickHouse側で特別な操作を行う必要はありません。HTTPインターフェースはRESTライクなエンドポイントとして機能するために必要なすべてを既に提供しており、追加の設定は不要です。

ClickHouseをRESTエンドポイントのように動作させることができたので、次はAzure Data Factoryを設定してこれを使用します。

次のステップでは、Azure Data Factoryインスタンスを作成し、ClickHouseインスタンスへのリンクサービスを設定し、[RESTシンク](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)のデータセットを定義し、AzureからClickHouseにデータを送信するコピーデータアクティビティを作成します。


## Azure Data Factoryインスタンスの作成 {#create-an-azure-data-factory-instance}

このガイドは、Microsoft Azureアカウントへのアクセス権があり、サブスクリプションとリソースグループが既に構成されていることを前提としています。Azure Data Factoryが既に構成されている場合は、このステップをスキップして、既存のサービスを使用して次のステップに進むことができます。

1. [Microsoft Azure Portal](https://portal.azure.com/)にログインし、**リソースの作成**をクリックします。

   <Image img={azureHomePage} size='lg' alt='Azure Portalホームページ' border />

2. 左側のカテゴリペインで**分析**を選択し、人気のサービスのリストから**Data Factory**をクリックします。

   <Image
     img={azureNewResourceAnalytics}
     size='lg'
     alt='Azure Portal新規リソース'
     border
   />

3. サブスクリプションとリソースグループを選択し、新しいData Factoryインスタンスの名前を入力し、リージョンを選択して、バージョンはV2のままにしておきます。

   <Image
     img={azureNewDataFactory}
     size='lg'
     alt='Azure Portal新規Data Factory'
     border
   />

4. **確認と作成**をクリックし、次に**作成**をクリックしてデプロイを開始します。

   <Image
     img={azureNewDataFactoryConfirm}
     size='lg'
     alt='Azure Portal新規Data Factory確認'
     border
   />

   <Image
     img={azureNewDataFactorySuccess}
     size='lg'
     alt='Azure Portal新規Data Factory成功'
     border
   />

デプロイが正常に完了したら、新しいAzure Data Factoryインスタンスの使用を開始できます。


## 新しいRESTベースのリンクサービスの作成 {#-creating-new-rest-based-linked-service}

1. Microsoft Azure Portalにログインし、Data Factoryインスタンスを開きます。

   <Image
     img={azureHomeWithDataFactory}
     size='lg'
     alt='Data FactoryのあるAzure Portalホームページ'
     border
   />

2. Data Factoryの概要ページで、**Launch Studio**をクリックします。

   <Image
     img={azureDataFactoryPage}
     size='lg'
     alt='Azure Portal Data Factoryページ'
     border
   />

3. 左側のメニューで**Manage**を選択し、**Linked services**に移動して、
   **+ New**をクリックして新しいリンクサービスを作成します。

   <Image
     img={adfCreateLinkedServiceButton}
     size='lg'
     alt='Azure Data Factory新規リンクサービスボタン'
     border
   />

4. **New linked service search bar**に**REST**と入力し、**REST**を選択して、**Continue**をクリックし、
   [RESTコネクタ](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   インスタンスを作成します。

   <Image
     img={adfNewLinkedServiceSearch}
     size='lg'
     alt='Azure Data Factory新規リンクサービス検索'
     border
   />

5. リンクサービス設定ペインで新しいサービスの名前を入力し、
   **Base URL**フィールドをクリックしてから、**Add dynamic content**をクリックします(このリンクは
   フィールドが選択されている場合にのみ表示されます)。

   <Image
     img={adfNewLinedServicePane}
     size='lg'
     alt='新規リンクサービスペイン'
     border
   />

6. 動的コンテンツペインでは、パラメータ化されたURLを作成できます。これにより、
   異なるテーブル用のデータセットを作成する際に後でクエリを定義できるようになり、
   リンクサービスを再利用可能にします。

   <Image
     img={adfNewLinkedServiceBaseUrlEmpty}
     size='lg'
     alt='新規リンクサービスベースURL空欄'
     border
   />

7. フィルター入力の横にある**"+"**をクリックして新しいパラメータを追加し、
   `pQuery`という名前を付け、型をStringに設定し、デフォルト値を`SELECT 1`に設定します。
   **Save**をクリックします。

   <Image
     img={adfNewLinkedServiceParams}
     size='lg'
     alt='新規リンクサービスパラメータ'
     border
   />

8. 式フィールドに以下を入力し、**OK**をクリックします。
   `your-clickhouse-url.com`を実際のClickHouseインスタンスのアドレスに置き換えてください。

   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```

   <Image
     img={adfNewLinkedServiceExpressionFieldFilled}
     size='lg'
     alt='新規リンクサービス式フィールド入力済み'
     border
   />

9. メインフォームに戻り、Basic認証を選択し、ClickHouse HTTPインターフェースへの接続に使用する
   ユーザー名とパスワードを入力して、**Test connection**をクリックします。
   すべてが正しく設定されていれば、成功メッセージが表示されます。

   <Image
     img={adfNewLinkedServiceCheckConnection}
     size='lg'
     alt='新規リンクサービス接続確認'
     border
   />

10. **Create**をクリックしてセットアップを完了します。
    <Image
      img={adfLinkedServicesList}
      size='lg'
      alt='リンクサービス一覧'
      border
    />

新しく登録されたRESTベースのリンクサービスが一覧に表示されます。


## ClickHouse HTTPインターフェース用の新しいデータセットの作成 {#creating-a-new-dataset-for-the-clickhouse-http-interface}

ClickHouse HTTPインターフェース用のリンクサービスを構成したので、Azure Data FactoryがClickHouseにデータを送信するために使用するデータセットを作成できます。

この例では、[環境センサーデータ](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)の一部を挿入します。

1. 任意のClickHouseクエリコンソールを開きます。ClickHouse CloudのWeb UI、CLIクライアント、またはクエリ実行に使用するその他のインターフェースが利用できます。次に、ターゲットテーブルを作成します:

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

2. Azure Data Factory Studioで、左側のペインから「Author」を選択します。「Dataset」項目にカーソルを合わせ、三点アイコンをクリックし、「New dataset」を選択します。

   <Image img={adfNewDatasetItem} size='lg' alt='新しいデータセット項目' border />

3. 検索バーに**REST**と入力し、**REST**を選択して、**Continue**をクリックします。
   データセットの名前を入力し、前のステップで作成した**リンクサービス**を選択します。**OK**をクリックしてデータセットを作成します。

   <Image img={adfNewDatasetPage} size='lg' alt='新しいデータセットページ' border />

4. 左側のFactory Resourcesペインの「Datasets」セクションに、新しく作成されたデータセットが表示されます。データセットを選択してプロパティを開きます。リンクサービスで定義された`pQuery`パラメータが表示されます。**Value**テキストフィールドをクリックします。次に、**Add dynamic content**をクリックします。

   <Image
     img={adfNewDatasetProperties}
     size='lg'
     alt='新しいデータセットのプロパティ'
     border
   />

5. 開いたペインに、次のクエリを貼り付けます:

   ```sql
   INSERT INTO sensors
   SETTINGS
       date_time_input_format=''best_effort'',
       input_format_json_read_objects_as_strings=1
   FORMAT JSONEachRow
   ```

   :::danger
   クエリ内のすべてのシングルクォート`'`は、2つのシングルクォート`''`に置き換える必要があります。これはAzure Data Factoryの式パーサーで必須です。エスケープしない場合、すぐにエラーが表示されないことがありますが、データセットを使用または保存しようとすると後で失敗します。例えば、`'best_effort'`は`''best_effort''`と記述する必要があります。
   :::

   <Image img={adfNewDatasetQuery} size='xl' alt='新しいデータセットのクエリ' border />

6. **OK**をクリックして式を保存します。**Test connection**をクリックします。すべてが正しく構成されている場合、「Connection successful」メッセージが表示されます。ページ上部の**Publish all**をクリックして変更を保存します。
   <Image
     img={adfNewDatasetConnectionSuccessful}
     size='xl'
     alt='新しいデータセットの接続成功'
     border
   />

### サンプルデータセットのセットアップ {#setting-up-an-example-dataset}

この例では、完全な環境センサーデータセットは使用せず、[センサーデータセットサンプル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)で利用可能な小さなサブセットのみを使用します。

:::info
このガイドを焦点を絞った内容に保つため、Azure Data Factoryでソースデータセットを作成する詳細な手順については説明しません。サンプルデータは、任意のストレージサービスにアップロードできます。例えば、Azure Blob Storage、Microsoft SQL Server、またはAzure Data Factoryがサポートする別のファイル形式などです。
:::

データセットをAzure Blob Storage(または他の任意のストレージサービス)にアップロードします。次に、Azure Data Factory Studioで、Factory Resourcesペインに移動します。アップロードされたデータを参照する新しいデータセットを作成します。**Publish all**をクリックして変更を保存します。


## ClickHouseへデータを転送するコピーアクティビティの作成 {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

入力データセットと出力データセットの両方を設定したので、サンプルデータセットからClickHouseの`sensors`テーブルにデータを転送する**データのコピー**アクティビティを設定できます。

1. **Azure Data Factory Studio**を開き、**作成タブ**に移動します。**ファクトリリソース**ペインで**パイプライン**にカーソルを合わせ、3点アイコンをクリックして、**新しいパイプライン**を選択します。

   <Image
     img={adfNewPipelineItem}
     size='lg'
     alt='ADF 新しいパイプライン項目'
     border
   />

2. **アクティビティ**ペインで、**移動と変換**セクションを展開し、**データのコピー**アクティビティをキャンバスにドラッグします。

   <Image img={adfNewCopyDataItem} size='lg' alt='新しいコピーデータ項目' border />

3. **ソース**タブを選択し、先ほど作成したソースデータセットを選択します。

   <Image img={adfCopyDataSource} size='lg' alt='データのコピー ソース' border />

4. **シンク**タブに移動し、sensorsテーブル用に作成したClickHouseデータセットを選択します。**要求メソッド**をPOSTに設定します。**HTTP圧縮タイプ**が**なし**に設定されていることを確認してください。
   :::warning
   Azure Data Factoryのデータのコピーアクティビティでは、HTTP圧縮が正しく動作しません。有効にすると、Azureはゼロバイトのみで構成されるペイロードを送信します。これはサービスのバグである可能性があります。圧縮は必ず無効のままにしてください。
   :::
   :::info
   デフォルトのバッチサイズである10,000を維持するか、さらに増やすことを推奨します。詳細については、[挿入戦略の選択 / 同期の場合のバッチ挿入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)を参照してください。
   :::

   <Image
     img={adfCopyDataSinkSelectPost}
     size='lg'
     alt='データのコピー シンク POST選択'
     border
   />

5. キャンバス上部の**デバッグ**をクリックしてパイプラインを実行します。しばらく待つと、アクティビティがキューに入れられて実行されます。すべてが正しく設定されていれば、タスクは**成功**ステータスで完了するはずです。

   <Image
     img={adfCopyDataDebugSuccess}
     size='lg'
     alt='データのコピー デバッグ成功'
     border
   />

6. 完了したら、**すべて公開**をクリックして、パイプラインとデータセットの変更を保存します。


## 追加リソース {#additional-resources-1}

- [HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factoryを使用したRESTエンドポイントとの間でのデータのコピーと変換](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [挿入戦略の選択](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [セルフホスト統合ランタイムの作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
