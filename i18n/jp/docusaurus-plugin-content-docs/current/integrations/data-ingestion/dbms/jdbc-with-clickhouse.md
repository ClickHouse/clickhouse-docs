---
sidebar_label: JDBC
sidebar_position: 2
keywords: [clickhouse, jdbc, connect, integrate]
slug: /integrations/jdbc/jdbc-with-clickhouse
description: ClickHouse JDBCブリッジにより、JDBCドライバーが利用可能な任意の外部データソースからデータにアクセスできます。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# ClickHouseをJDBCで外部データソースに接続する

:::note
JDBCを使用するにはClickHouse JDBCブリッジが必要ですので、ローカルマシンで`clickhouse-local`を使用してデータベースからClickHouse Cloudにデータをストリーミングする必要があります。詳細については、**Migrate**セクションの[**clickhouse-localの使用**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge)ページをご覧ください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBCブリッジ</a>は、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)と組み合わせて、ClickHouseが利用可能な任意の外部データソースからデータにアクセスすることを可能にします。このデータソースには<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBCドライバー</a>が必要です。

<img src={Jdbc01} class="image" alt="ClickHouse JDBC Bridge"/>
ネイティブの組み込みの[統合エンジン](/engines/table-engines/integrations)、テーブル関数、または外部辞書が利用できない外部データソースがある場合でも、データソースに対するJDBCドライバーが存在すれば便利です。

ClickHouse JDBCブリッジは、読み取りと書き込みの両方に使用できます。また、複数の外部データソース向けにリアルタイムで分散クエリを実行できます。

このレッスンでは、ClickHouseと外部データソースを接続するためにClickHouse JDBCブリッジをインストール、設定、および実行する方法を簡単にご紹介します。このレッスンでは、MySQLを外部データソースとして使用します。

さあ、始めましょう！

:::note 事前条件
以下の条件を満たすマシンへのアクセスが必要です：
1. Unixシェルとインターネットアクセス
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>がインストールされていること
3. 現在のバージョンの**Java**（例：<a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17）がインストールされていること
4. 現在のバージョンの**MySQL**（例：<a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >=8）がインストールされ、実行中であること
5. 現在のバージョンの**ClickHouse**が[インストール](/getting-started/install.md)され、実行中であること
:::

## ClickHouse JDBCブリッジをローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBCブリッジを使用する最も簡単な方法は、ClickHouseが実行されているのと同じホストにインストールして実行することです。<img src={Jdbc02} class="image" alt="ClickHouse JDBC Bridge locally"/>

まず、ClickHouseが実行されているマシンのUnixシェルに接続し、後でClickHouse JDBCブリッジをインストールするローカルフォルダーを作成します（フォルダーの名前を自由に設定し、好きな場所に置いてください）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、そのフォルダーに< a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">現在のバージョン</a>のClickHouse JDBCブリッジをダウンロードします：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQLに接続するために、名前付きデータソースを作成します：

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

以下の設定を`~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`ファイルにコピー＆ペーストできます：

 ```json
 {
   "mysql8": {
   "driverUrls": [
     "https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"
   ],
   "jdbcUrl": "jdbc:mysql://<host>:<port>",
   "username": "<username>",
   "password": "<password>"
   }
 }
 ```

:::note
上記の設定ファイルについて
- データソースの名前には自由に名前を設定できますが、ここでは`mysql8`を使用しました。
- `jdbcUrl`の値において、`<host>`および`<port>`を実行中のMySQLインスタンスに応じた値に置き換える必要があります（例： `"jdbc:mysql://localhost:3306"`）。
- `<username>`および`<password>`をMySQLの認証情報に置き換える必要があります。パスワードを使用しない場合は、上記設定ファイルの`"password": "<password>"`行を削除できます。
- `driverUrls`の値には、<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">MySQL JDBCドライバーの現在のバージョン</a>をダウンロードできるURLを指定しました。これで、ClickHouse JDBCブリッジはそのJDBCドライバーを自動的にダウンロードします（OS固有のディレクトリに）。
:::

<br/>

ClickHouse JDBCブリッジを開始する準備が整いました：
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
ClickHouse JDBCブリッジをフォアグラウンドモードで起動しました。ブリッジを停止するには、上記のUnixシェルウィンドウをフォアグラウンドに持ってきて`CTRL+C`を押します。
:::


## ClickHouse内からJDBC接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouseは、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)のいずれかを使用してMySQLデータにアクセスできます。

以下の例を実行する最も簡単な方法は、それらを[`clickhouse-client`](/interfaces/cli.md)または[Play UI](/interfaces/http.md)にコピー＆ペーストすることです。



- jdbcテーブル関数:

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
jdbcテーブル関数の最初のパラメーターには、上記で構成した名前付きデータソースの名前を使用しています。
:::



- JDBCテーブルエンジン:
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
jdbcエンジン句の最初のパラメーターには、上記で構成した名前付きデータソースの名前を使用しています。

ClickHouse JDBCエンジンテーブルのスキーマと接続されたMySQLテーブルのスキーマは一致する必要があります。例えば、カラム名と順序は同じである必要があり、カラムデータ型も互換性がある必要があります。
:::







## ClickHouse JDBCブリッジを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散ClickHouseクラスタ（複数のClickHouseホストを持つクラスタ）においては、ClickHouse JDBCブリッジを外部の専用ホストにインストールして実行する方が理にかなっています：
<img src={Jdbc03} class="image" alt="ClickHouse JDBC Bridge externally"/>
これにより、各ClickHouseホストがJDBCブリッジにアクセスできるという利点があります。そうでなければ、JDBCブリッジは外部データソースにアクセスする必要のある各ClickHouseインスタンスにローカルにインストールする必要があります。

ClickHouse JDBCブリッジを外部にインストールするために、以下のステップを実行します：

1. 専用ホストでClickHouse JDBCブリッジをインストール、設定、および実行するために、ガイドのセクション1の手順に従います。

2. 各ClickHouseホストに対して、以下の構成ブロックを<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouseサーバー構成</a>に追加します（選択した構成形式によって、XMLまたはYAMLバージョンを使用してください）：

<Tabs>
<TabItem value="xml" label="XML">

```xml
<jdbc_bridge>
   <host>JDBC-Bridge-Host</host>
   <port>9019</port>
</jdbc_bridge>
```

</TabItem>
<TabItem value="yaml" label="YAML">

```yaml
jdbc_bridge:
    host: JDBC-Bridge-Host
    port: 9019
```

</TabItem>
</Tabs>

:::note
   - `JDBC-Bridge-Host`を専用のClickHouse JDBCブリッジホストのホスト名またはIPアドレスに置き換える必要があります。
   - デフォルトのClickHouse JDBCブリッジポート`9019`を指定しました。別のポートを使用する場合は、上記の構成を適宜修正してください。
:::




[//]: # (## 4. 追加情報)

[//]: # ()
[//]: # (TODO: )

[//]: # (- jdbcテーブル関数では、スキーマをパラメータとして指定した方がパフォーマンスが向上することを言及)

[//]: # ()
[//]: # (- ad hocクエリとテーブルクエリ、保存されたクエリ、名前付きクエリについて言及)

[//]: # ()
[//]: # (- insert intoについて言及)
