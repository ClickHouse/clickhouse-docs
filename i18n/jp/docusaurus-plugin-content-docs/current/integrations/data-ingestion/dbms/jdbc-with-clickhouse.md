---
'sidebar_label': 'JDBC'
'sidebar_position': 2
'keywords':
- 'clickhouse'
- 'jdbc'
- 'connect'
- 'integrate'
'slug': '/integrations/jdbc/jdbc-with-clickhouse'
'description': 'The ClickHouse JDBC Bridge allows ClickHouse to access data from any
  external data source for which a JDBC driver is available'
'title': 'Connecting ClickHouse to external data sources with JDBC'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# ClickHouseをJDBCで外部データソースに接続する

:::note
JDBCを使用するにはClickHouse JDBCブリッジが必要ですので、データベースからClickHouse Cloudにデータをストリームするためにローカルマシンで`clickhouse-local`を使用する必要があります。詳細については、ドキュメントの**Migrate**セクションにある[**Using clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge)ページをご覧ください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a>は、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)と組み合わせることで、ClickHouseが<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBCドライバ</a>が利用可能な外部データソースからデータにアクセスできるようにします。

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge architecture diagram" background='white'/>
これは、外部データソースにネイティブな組み込み[統合エンジン](/engines/table-engines/integrations)、テーブル関数、または外部辞書が利用できない場合でも、データソース用のJDBCドライバが存在する場合に便利です。

ClickHouse JDBC Bridgeは、読み取りと書き込みの両方に使用できます。また、複数の外部データソースに対して並行して使用することも可能です。たとえば、複数の外部および内部データソースにわたってリアルタイムに分散クエリを実行できます。

このレッスンでは、ClickHouseを外部データソースに接続するためのClickHouse JDBC Bridgeのインストール、設定、実行がいかに簡単であるかを示します。このレッスンでは、外部データソースとしてMySQLを使用します。

さあ始めましょう！

:::note 前提条件
以下を満たすマシンにアクセスできること：
1. Unixシェルとインターネットアクセス
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>がインストールされている
3. **Java**の最新バージョン（例：<a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17）がインストールされている
4. **MySQL**の最新バージョン（例：<a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >=8）がインストールされており、稼働中である
5. **ClickHouse**の最新バージョンが[インストール](/getting-started/install/install.mdx)されており、稼働中である
:::

## ClickHouse JDBC Bridgeをローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBC Bridgeを使用する最も簡単な方法は、ClickHouseが稼働しているのと同じホストにインストールして実行することです。<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge locally deployment diagram" background='white'/>

まず、ClickHouseが稼働しているマシンのUnixシェルに接続し、ClickHouse JDBC Bridgeをインストールするためのローカルフォルダーを作成します（任意の名前を付けて任意の場所に置いて構いません）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、そのフォルダーに<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">最新バージョン</a>のClickHouse JDBC Bridgeをダウンロードします：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQLに接続できるように、名前付きデータソースを作成します：

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

次に、`~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`ファイルに以下の設定をコピーアンドペーストできます：

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
- データソースには任意の名前を使用できます。ここでは`mysql8`を使用しています。
- `jdbcUrl`の値には、実行中のMySQLインスタンスに応じて`<host>`と`<port>`を適切な値に置き換える必要があります。例：`"jdbc:mysql://localhost:3306"`
- `<username>`と`<password>`を自分のMySQLの資格情報に置き換える必要があります。パスワードを使用しない場合は、上記の設定ファイルから`"password": "<password>"`の行を削除できます。
- `driverUrls`の値には、<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">MySQL JDBCドライバの最新バージョン</a>をダウンロードできるURLを指定しています。それだけで、ClickHouse JDBC Bridgeが自動的にそのJDBCドライバを（OS特定のディレクトリに）ダウンロードします。
:::

<br/>

これでClickHouse JDBC Bridgeを起動する準備が整いました：
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
ClickHouse JDBC Bridgeをフォアグラウンドモードで起動しました。ブリッジを停止するには、上記のUnixシェルウィンドウをフォアグラウンドに戻し、`CTRL+C`を押してください。
:::


## ClickHouse内からJDBC接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouseは、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)を使用してMySQLデータにアクセスできます。

以下の例を実行する最も簡単な方法は、[`clickhouse-client`](/interfaces/cli.md)または[Play UI](/interfaces/http.md)にコピーペーストすることです。

- jdbcテーブル関数：

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
jdbcテーブル関数の最初のパラメーターには、上記で設定した名前付きデータソースの名前を使用しています。
:::



- JDBCテーブルエンジン：
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
jdbcエンジン句の最初のパラメーターには、上記で設定した名前付きデータソースの名前を使用しています。

ClickHouse JDBCエンジンテーブルのスキーマと接続されたMySQLテーブルのスキーマは一致している必要があります。たとえば、カラム名と順序は同じでなければならず、カラムデータ型は互換性がある必要があります。
:::


## ClickHouse JDBC Bridgeを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散ClickHouseクラスター（複数のClickHouseホストを持つクラスター）では、ClickHouse JDBC Bridgeを独自のホストに外部でインストールして実行することが理にかなっています：
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge external deployment diagram" background='white'/>
これにより、各ClickHouseホストがJDBC Bridgeにアクセスできるという利点があります。さもなければ、外部データソースにアクセスするために各ClickHouseインスタンスにJDBC Bridgeをローカルにインストールする必要があります。

ClickHouse JDBC Bridgeを外部にインストールするためには、以下の手順を実行します：

1. このガイドのセクション1で説明されている手順に従って、専用ホストにClickHouse JDBC Bridgeをインストール、設定、および実行します。

2. 各ClickHouseホストに次の構成ブロックを<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouseサーバー設定</a>に追加します（選択した構成形式に応じて、XMLまたはYAMLバージョンを使用してください）：

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
   - `JDBC-Bridge-Host`を専用のClickHouse JDBC Bridgeホストのホスト名またはIPアドレスに置き換える必要があります。
   - デフォルトのClickHouse JDBC Bridgeポート`9019`を指定しました。JDBC Bridgeに別のポートを使用している場合は、上記の設定を適宜調整する必要があります。
:::


