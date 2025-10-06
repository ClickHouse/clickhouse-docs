---
'sidebar_label': 'JDBC'
'sidebar_position': 2
'keywords':
- 'clickhouse'
- 'jdbc'
- 'connect'
- 'integrate'
'slug': '/integrations/jdbc/jdbc-with-clickhouse'
'description': 'ClickHouse JDBCブリッジは、JDBCドライバーが利用可能な任意の外部データソースからClickHouseがデータにアクセスできるようにします'
'title': 'ClickHouseをJDBCで外部データソースに接続する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# ClickHouseをJDBCで外部データソースに接続する

:::note
JDBCを使用するにはClickHouse JDBCブリッジが必要ですので、ローカルマシンで`clickhouse-local`を使用してデータベースからClickHouse Cloudにデータをストリーミングする必要があります。詳細については、**Migrate**セクションの[**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge)ページを訪問してください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a>は、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)や[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)と組み合わせることで、任意の外部データソースからデータにアクセスできるようにします。この外部データソースには<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBCドライバー</a>が必要です：

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge architecture diagram" background='white'/>
これは、外部データソース用のネイティブ組み込み[インテグレーションエンジン](/engines/table-engines/integrations)、テーブル関数、または外部辞書が利用できない場合に便利ですが、データソース用のJDBCドライバーが存在する場合です。

ClickHouse JDBC Bridgeは、読み取りと書き込みの両方に使用できます。また、複数の外部データソースに対して並列で使用することもでき、たとえば、ClickHouseで複数の外部および内部データソースに対して分散クエリをリアルタイムで実行できます。

このレッスンでは、ClickHouseと外部データソースを接続するためにClickHouse JDBC Bridgeをインストール、設定、および実行する方法を説明します。今回はMySQLを外部データソースとして使用します。

それでは始めましょう！

:::note 前提条件
次の条件を満たすマシンにアクセスできること：
1. Unixシェルとインターネットアクセス
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>がインストールされていること
3. 現在のバージョンの**Java**（例：<a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17）がインストールされていること
4. 現在のバージョンの**MySQL**（例：<a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >=8）がインストールされて実行されていること
5. 現在のバージョンの**ClickHouse**が[インストール済み](/getting-started/install/install.mdx)で実行されていること
:::

## ClickHouse JDBCブリッジをローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBC Bridgeを使用する最も簡単な方法は、ClickHouseが実行されているのと同じホストにインストールして実行することです：<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge locally deployment diagram" background='white'/>

まず、ClickHouseが実行されているマシンのUnixシェルに接続し、後でClickHouse JDBCブリッジをインストールするためのローカルフォルダーを作成します（フォルダーの名前や場所は自由に決めてください）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、そのフォルダーに<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">現在のバージョン</a>のClickHouse JDBCブリッジをダウンロードします：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQLに接続するための名前付きデータソースを作成します：

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

次に、次の構成を`~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`ファイルにコピーして貼り付けます：

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
上記の構成ファイルにおいて
- データソースの名前は自由に設定できます。私たちは`mysql8`を使用しました。
- `jdbcUrl`の値には、実行中のMySQLインスタンスに応じて、`<host>`および`<port>`を適切な値に置き換える必要があります。例：`"jdbc:mysql://localhost:3306"`
- `<username>`と`<password>`は、MySQLの認証情報に置き換える必要があります。パスワードを使用しない場合は、上記の構成ファイルから`"password": "<password>"`行を削除できます。
- `driverUrls`の値には、<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">現在のバージョン</a>のMySQL JDBCドライバーをダウンロードできるURLを指定します。これだけで、ClickHouse JDBC BridgeがそのJDBCドライバーを自動的にダウンロードします（OS固有のディレクトリに）。
:::

<br/>

これでClickHouse JDBCブリッジを起動する準備が整いました：
```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```
:::note
私たちはフォアグラウンドモードでClickHouse JDBCブリッジを起動しました。ブリッジを停止するには、上記のUnixシェルウィンドウをフォアグラウンドに持ってきて`CTRL+C`を押してください。
:::

## ClickHouse内からJDBC接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouseは、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)を使用してMySQLデータにアクセスできます。

次の例を実行する最も簡単な方法は、[ `clickhouse-client`](/interfaces/cli.md)または[Play UI](/interfaces/http.md)にコピーして貼り付けることです。

- jdbc テーブル関数：

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```
:::note
jdbcテーブル関数の最初のパラメータとして、上記で設定した名前付きデータソースの名前を使用します。
:::

- JDBC テーブルエンジン：
```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```
:::note
jdbcエンジン句の最初のパラメータとして、上記で設定した名前付きデータソースの名前を使用します。

ClickHouse JDBCエンジンのテーブルスキーマと接続されるMySQLテーブルのスキーマは整合性を持たなければならず、列の名前と順序が一致し、列のデータ型が互換性がある必要があります。
:::

## ClickHouse JDBCブリッジを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散ClickHouseクラスター（複数のClickHouseホストを持つクラスター）の場合、ClickHouse JDBCブリッジを専用ホスト上に外部でインストールして実行することが理にかなっています：
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge external deployment diagram" background='white'/>
これにより、各ClickHouseホストがJDBCブリッジにアクセスできる利点があります。そうしないと、外部データソースにアクセスするために、各ClickHouseインスタンスごとにJDBCブリッジをローカルにインストールする必要があります。

ClickHouse JDBCブリッジを外部にインストールするために、次の手順を実行します：

1. このガイドのセクション1の手順に従って、専用ホストにClickHouse JDBCブリッジをインストール、設定、実行します。

2. 各ClickHouseホストに、<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouseサーバー設定</a>への次の構成ブロックを追加します（選択した設定フォーマットに応じて、XMLまたはYAMLバージョンを使用してください）：

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
- デフォルトのClickHouse JDBCブリッジポート`9019`を指定しました。JDBCブリッジに異なるポートを使用している場合は、上記の構成を適宜修正する必要があります。
:::

[//]: # (## 4. Additional Info)

[//]: # ()
[//]: # (TODO: )

[//]: # (- jdbcテーブル関数では、パフォーマンスが向上するためにスキーマをパラメータとして指定することを述べる)

[//]: # ()
[//]: # (- adhocクエリとテーブルクエリ、保存されたクエリ、名前付きクエリの違いについて言及する)

[//]: # ()
[//]: # (- insert intoについて言及する)
