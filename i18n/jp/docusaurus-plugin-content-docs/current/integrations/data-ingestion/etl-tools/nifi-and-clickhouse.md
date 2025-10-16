---
'sidebar_label': 'NiFi'
'sidebar_position': 12
'keywords':
- 'clickhouse'
- 'NiFi'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'slug': '/integrations/nifi'
'description': 'NiFiデータパイプラインを使用してClickHouseにデータをストリーミングする'
'title': 'Apache NiFiをClickHouseに接続する'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connect Apache NiFi to ClickHouse

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフローマネジメントソフトウェアです。ETLデータパイプラインの作成を可能にし、300以上のデータプロセッサが付属しています。このステップバイステップのチュートリアルでは、Apache NiFiをClickHouseにソースおよび宛先として接続し、サンプルデータセットをロードする方法を示します。

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Apache NiFiをダウンロードして実行する {#2-download-and-run-apache-nifi}

1. 新しいセットアップの場合、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start`を実行して開始します。

## 3. ClickHouse JDBCドライバをダウンロードする {#3-download-the-clickhouse-jdbc-driver}

1. GitHubの<a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBCドライバリリースページ</a>にアクセスし、最新のJDBCリリースバージョンを探します。
2. リリースバージョンで「Show all xx assets」をクリックし、「shaded」または「all」というキーワードを含むJARファイルを探します。例えば、`clickhouse-jdbc-0.5.0-all.jar`です。
3. JARファイルをApache NiFiがアクセスできるフォルダに置き、絶対パスをメモします。

## 4. `DBCPConnectionPool`コントローラーサービスを追加し、そのプロパティを設定する {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFiでコントローラーサービスを設定するには、「ギア」ボタンをクリックしてNiFiフロー設定ページにアクセスします。

    <Image img={nifi01} size="sm" border alt="NiFi Flow Configuration page with gear button highlighted" />

2. コントローラーサービスタブを選択し、右上の`+`ボタンをクリックして新しいコントローラーサービスを追加します。

    <Image img={nifi02} size="lg" border alt="Controller Services tab with add button highlighted" />

3. `DBCPConnectionPool`を検索し、「Add」ボタンをクリックします。

    <Image img={nifi03} size="lg" border alt="Controller Service selection dialog with DBCPConnectionPool highlighted" />

4. 新しく追加した`DBCPConnectionPool`はデフォルトで無効の状態です。設定を開始するには「ギア」ボタンをクリックします。

    <Image img={nifi04} size="lg" border alt="Controller Services list showing invalid DBCPConnectionPool with gear button highlighted" />

5. 「プロパティ」セクションに次の値を入力します。

  | Property                    | Value                                                              | Remark                                                                        |
  | --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
  | Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 接続URLのHOSTNAMEを適宜置き換えます。                                         |
  | Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               ||
  | Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBCドライバJARファイルへの絶対パス                                  |
  | Database User               | default                                                            | ClickHouseのユーザー名                                                       |
  | Password                    | password                                                          | ClickHouseのパスワード                                                       |

6. 設定セクションで、コントローラーサービスの名前を「ClickHouse JDBC」に変更し、簡単に参照できるようにします。

    <Image img={nifi05} size="lg" border alt="DBCPConnectionPool configuration dialog showing properties filled in" />

7. 「稲妻」ボタンをクリックして`DBCPConnectionPool`コントローラーサービスを有効化し、その後「Enable」ボタンをクリックします。

    <Image img={nifi06} size="lg" border alt="Controller Services list with lightning button highlighted" />

    <br/>

    <Image img={nifi07} size="lg" border alt="Enable Controller Service confirmation dialog" />

8. コントローラーサービスタブをチェックし、コントローラーサービスが有効になっていることを確認します。

    <Image img={nifi08} size="lg" border alt="Controller Services list showing enabled ClickHouse JDBC service" />

## 5. `ExecuteSQL`プロセッサを使用してテーブルから読み込む {#5-read-from-a-table-using-the-executesql-processor}

1. ​`​ExecuteSQL`プロセッサと適切な上流および下流プロセッサを追加します。

    <Image img={nifi09} size="md" border alt="NiFi canvas showing ExecuteSQL processor in a workflow" />

2. ​`​ExecuteSQL`プロセッサの「プロパティ」セクションに次の値を入力します。

    | Property                            | Value                                | Remark                                                  |
    |-------------------------------------|--------------------------------------|---------------------------------------------------------|
    | Database Connection Pooling Service | ClickHouse JDBC                      | ClickHouse用に設定したコントローラーサービスを選択します。   |
    | SQL select query                    | SELECT * FROM system.metrics         | ここにクエリを入力します。                               |

3. `​​ExecuteSQL`プロセッサを開始します。

    <Image img={nifi10} size="lg" border alt="ExecuteSQL processor configuration with properties filled in" />

4. 「FlowFile」の出力キューの1つを調べて、クエリが正常に処理されたことを確認します。

    <Image img={nifi11} size="lg" border alt="List queue dialog showing flowfiles ready for inspection" />

5. 結果を表示するには、「formatted」にビューを切り替えます。

    <Image img={nifi12} size="lg" border alt="FlowFile content viewer showing query results in formatted view" />

## 6. `MergeRecord`および`PutDatabaseRecord`プロセッサを使用してテーブルに書き込む {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 単一の挿入で複数の行を書き込むために、最初に複数のレコードを単一のレコードにマージする必要があります。これには`MergeRecord`プロセッサを使用します。

2. `MergeRecord`プロセッサの「プロパティ」セクションに次の値を入力します。

    | Property                  | Value             | Remark                                                                                                                          |
    |---------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------|
    | Record Reader             | `JSONTreeReader`    | 適切なレコードリーダーを選択します。                                                                                              |
    | Record Writer             | `JSONReadSetWriter` | 適切なレコードライターを選択します。                                                                                              |
    | Minimum Number of Records | 1000              | これを高い数値に変更し、単一のレコードを形成するためにマージされる最小行数を確保します。デフォルトは1行です。                        |
    | Maximum Number of Records | 10000             | 「Minimum Number of Records」よりも高い数値に変更します。デフォルトは1,000行です。                                               |

3. 複数のレコードが1つにマージされたことを確認するために、`MergeRecord`プロセッサの入力と出力を確認します。出力は複数の入力レコードの配列であることに注意してください。

    入力
    <Image img={nifi13} size="sm" border alt="MergeRecord processor input showing single records" />

    出力
    <Image img={nifi14} size="sm" border alt="MergeRecord processor output showing merged array of records" />

4. `PutDatabaseRecord`プロセッサの「プロパティ」セクションに次の値を入力します。

    | Property                            | Value           | Remark                                                                                                                                   |
    | ----------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | Record Reader                       | `JSONTreeReader`  | 適切なレコードリーダーを選択します。                                                                                                     |
    | Database Type                       | Generic         | デフォルトのままにします。                                                                                                               |
    | Statement Type                      | INSERT          |                                                                                                                                          |
    | Database Connection Pooling Service | ClickHouse JDBC | ClickHouseコントローラーサービスを選択します。                                                                                           |
    | Table Name                          | tbl             | ここにテーブル名を入力します。                                                                                                           |
    | Translate Field Names               | false           | フィールド名がカラム名と一致するようにするために「false」に設定します。                                                               |
    | Maximum Batch Size                  | 1000            | 挿入ごとの最大行数。この値は、`MergeRecord`プロセッサの「Minimum Number of Records」の値より低くしないでください。                     |

5. 各挿入が複数の行を含んでいることを確認するために、テーブル内の行数が「Minimum Number of Records」で定義された値以上に増加していることを確認します。

    <Image img={nifi15} size="sm" border alt="Query results showing row count in the destination table" />

6. おめでとうございます - Apache NiFiを使用してClickHouseにデータを正常にロードしました！
