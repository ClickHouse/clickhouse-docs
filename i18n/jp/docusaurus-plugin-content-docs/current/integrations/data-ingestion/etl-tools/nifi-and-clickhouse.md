---
sidebar_label: NiFi
sidebar_position: 12
keywords: [clickhouse, NiFi, connect, integrate, etl, data integration]
slug: /integrations/nifi
description: NiFi データパイプラインを使用して ClickHouse にデータをストリーミングする
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import nifi01 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_01.png';
import nifi02 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_02.png';
import nifi03 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_03.png';
import nifi04 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_04.png';
import nifi05 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_05.png';
import nifi06 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_06.png';
import nifi07 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_07.png';
import nifi08 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_08.png';
import nifi09 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_09.png';
import nifi10 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_10.png';
import nifi11 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_11.png';
import nifi12 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_12.png';
import nifi13 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_13.png';
import nifi14 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_14.png';
import nifi15 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_15.png';


# Apache NiFi を ClickHouse に接続する

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフローマネジメントソフトウェアです。 ETL データパイプラインの作成を可能にし、300 以上のデータプロセッサが付属しています。このステップバイステップのチュートリアルでは、Apache NiFi を ClickHouse にソースおよびデスティネーションとして接続し、サンプルデータセットをロードする方法を示します。

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Apache NiFi をダウンロードし、実行する {#2-download-and-run-apache-nifi}

1. 新しいセットアップの場合、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start` を実行して開始します。

## 3. ClickHouse JDBC ドライバーをダウンロードする {#3-download-the-clickhouse-jdbc-driver}

1. <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC ドライバーリリースページ</a> にアクセスし、最新の JDBC リリースバージョンを探します。
2. リリースバージョン内で、「すべての xx アセットを表示」をクリックし、「shaded」または「all」を含む JAR ファイルを探します。例えば、`clickhouse-jdbc-0.5.0-all.jar` などです。
3. JAR ファイルを Apache NiFi がアクセスできるフォルダーに配置し、絶対パスをメモしておきます。

## 4. `DBCPConnectionPool` コントローラーサービスを追加し、そのプロパティを設定する {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFi でコントローラーサービスを設定するには、「ギア」ボタンをクリックして NiFi フローメンテナンスページに移動します。

    <img src={nifi01} class="image" alt="NiFi フロー設定" style={{width: '50%'}}/>

2. 「コントローラーサービス」タブを選択し、右上の `+` ボタンをクリックして新しいコントローラーサービスを追加します。

    <img src={nifi02} class="image" alt="コントローラーサービスの追加" style={{width: '80%'}}/>

3. `DBCPConnectionPool` を検索し、「追加」ボタンをクリックします。

    <img src={nifi03} class="image" alt="​`DBCPConnectionPool` を検索" style={{width: '80%'}}/>

4. 新しく追加された `DBCPConnectionPool` はデフォルトで無効の状態になります。「ギア」ボタンをクリックして設定を開始します。

    <img src={nifi04} class="image" alt="NiFi フロー設定" style={{width: '80%'}}/>

5. 「プロパティ」セクションで、以下の値を入力します。

  | プロパティ                     | 値                                                               | 備考                                                                        |
  | ------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
  | データベース接続 URL          | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 接続 URL の HOSTNAME を適宜置き換えます                                      |
  | データベースドライバー クラス名  | com.clickhouse.jdbc.ClickHouseDriver                             ||
  | データベースドライバーの場所    | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC ドライバー JAR ファイルへの絶対パス                        |
  | データベースユーザー            | default                                                          | ClickHouse ユーザー名                                                       |
  | パスワード                     | password                                                   | ClickHouse パスワード                                                       |

6. 設定セクションで、コントローラーサービスの名前を「ClickHouse JDBC」に変更して簡単に参照できるようにします。

    <img src={nifi05} class="image" alt="NiFi フロー設定" style={{width: '80%'}}/>

7. 「稲妻」ボタンをクリックしてから「有効」ボタンをクリックし、`DBCPConnectionPool` コントローラーサービスをアクティブにします。

    <img src={nifi06} class="image" alt="NiFi フロー設定" style={{width: '80%'}}/>

    <br/>

    <img src={nifi07} class="image" alt="NiFi フロー設定" style={{width: '80%'}}/>

8. 「コントローラーサービス」タブで、コントローラーサービスが有効になっていることを確認します。

    <img src={nifi08} class="image" alt="NiFi フロー設定" style={{width: '80%'}}/>

## 5. `ExecuteSQL` プロセッサを使用してテーブルから読み取る {#5-read-from-a-table-using-the-executesql-processor}

1. ​`​ExecuteSQL` プロセッサを追加し、適切な上流および下流プロセッサを整えます。

    <img src={nifi09} class="image" alt="​`ExecuteSQL` プロセッサ" style={{width: '50%'}}/>

2. ​`​ExecuteSQL` プロセッサの「プロパティ」セクションに、以下の値を入力します。

    | プロパティ                            | 値                               | 備考                                                  |
    |---------------------------------------|----------------------------------|-------------------------------------------------------|
    | データベース接続プーリングサービス  | ClickHouse JDBC                  | ClickHouse 用に設定されたコントローラーサービスを選択 |
    | SQL セレクトクエリ                   | SELECT * FROM system.metrics      | ここにクエリを入力します                             |

3. `​​ExecuteSQL` プロセッサを起動します。

    <img src={nifi10} class="image" alt="`​​ExecuteSQL` プロセッサ" style={{width: '80%'}}/>

4. クエリが正常に処理されたことを確認するには、出力キューの `FlowFile` の 1 つを検査します。

    <img src={nifi11} class="image" alt="​`​ExecuteSQL` プロセッサ" style={{width: '80%'}}/>

5. 「フォーマット」でビューを切り替えて、出力 `FlowFile` の結果を表示します。

    <img src={nifi12} class="image" alt="`​​ExecuteSQL` プロセッサ" style={{width: '80%'}}/>

## 6. `MergeRecord` と `PutDatabaseRecord` プロセッサを使用してテーブルに書き込む {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 単一の挿入で複数の行を書くためには、最初に複数のレコードを 1 つのレコードに統合する必要があります。これは、`MergeRecord` プロセッサを使用して行うことができます。

2. `MergeRecord` プロセッサの「プロパティ」セクションに、以下の値を入力します。

    | プロパティ                  | 値                | 備考                                                                                              |
    |-----------------------------|--------------------|---------------------------------------------------------------------------------------------------|
    | レコードリーダー            | `JSONTreeReader`     | 適切なレコードリーダーを選択                                                                      |
    | レコードライター            | `JSONReadSetWriter`  | 適切なレコードライターを選択                                                                      |
    | 最小レコード数              | 1000               | これを高い数字に変更して、最小行数が統合されて 1 つのレコードを形成するようにします。デフォルトは 1 行です。 |
    | 最大レコード数              | 10000              | 「最小レコード数」よりも大きい数字に変更します。デフォルトは 1,000 行です。                     |

3. 複数のレコードが 1 つに統合されたことを確認するために、`MergeRecord` プロセッサの入力と出力を検査します。出力は複数の入力レコードの配列であることに注意してください。

    入力
    <img src={nifi13} class="image" alt="​`​ExecuteSQL` プロセッサ" style={{width: '50%'}}/>

    出力
    <img src={nifi14} class="image" alt="​`​ExecuteSQL` プロセッサ" style={{width: '50%'}}/>

4. `PutDatabaseRecord` プロセッサの「プロパティ」セクションに、以下の値を入力します。

    | プロパティ                            | 値              | 備考                                                                                                          |
    |---------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------|
    | レコードリーダー                      | `JSONTreeReader`   | 適切なレコードリーダーを選択                                                                                   |
    | データベースタイプ                    | Generic           | デフォルトのままにします                                                                                      |
    | ステートメントタイプ                  | INSERT            |                                                                                                               |
    | データベース接続プーリングサービス    | ClickHouse JDBC   | ClickHouse コントローラーサービスを選択                                                                        |
    | テーブル名                            | tbl               | ここにテーブル名を入力します                                                                                 |
    | フィールド名の翻訳                   | false             | フィールド名がカラム名と一致している必要があるため、「false」に設定します                                     |
    | 最大バッチサイズ                      | 1000              | 1 回の挿入あたりの最大行数。この値は `MergeRecord` プロセッサの「最小レコード数」よりも少なくしてはいけません  |

4. 各挿入に複数の行が含まれていることを確認するためには、テーブル内の行数が `MergeRecord` で定義した「最小レコード数」以上で増加していることを確認します。

    <img src={nifi15} class="image" alt="`​​ExecuteSQL` プロセッサ" style={{width: '50%'}}/>

5. おめでとうございます！ Apache NiFi を使用して ClickHouse にデータを正常にロードしました！
