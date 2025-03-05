---
sidebar_label: JDBC
sidebar_position: 2
keywords: [clickhouse, jdbc, connect, integrate]
slug: /integrations/jdbc/jdbc-with-clickhouse
description: ClickHouse JDBC ブリッジは、JDBC ドライバーが利用可能な任意の外部データソースから ClickHouse がデータにアクセスできるようにします
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# ClickHouse を JDBC で外部データソースに接続

:::note
JDBC を使用するには ClickHouse JDBC ブリッジが必要なので、データベースから ClickHouse Cloud にデータをストリーミングするために `clickhouse-local` をローカルマシンで使用する必要があります。詳細については、ドキュメントの **Migrate** セクションの [**Using clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) ページを参照してください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC ブリッジ</a> は、[jdbc テーブル関数](/sql-reference/table-functions/jdbc.md) または [JDBC テーブルエンジン](/engines/table-engines/integrations/jdbc.md) と組み合わせることで、ClickHouse が <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC ドライバー</a> が利用可能な外部データソースからデータにアクセスできるようにします:
<img src={Jdbc01} class="image" alt="ClickHouse JDBC Bridge"/>
これは、外部データソースに利用できるネイティブビルトイン [統合エンジン](/engines/table-engines/index.md#integration-engines-integration-engines)、テーブル関数、または外部辞書がない場合に便利ですが、データソース用の JDBC ドライバーが存在する場合です。

ClickHouse JDBC ブリッジは、読み取りと書き込みの両方に使用できます。また、複数の外部データソースに対して並行して実行することができ、たとえば、リモートで複数の外部および内部データソースに対して分散クエリを実行できます。

このレッスンでは、ClickHouse を外部データソースに接続するために、ClickHouse JDBC ブリッジをインストール、構成、実行するのがいかに簡単であるかを示します。このレッスンでは、MySQL を外部データソースとして使用します。

さあ、始めましょう！

:::note 前提条件
以下の条件を満たすマシンにアクセスできる必要があります：
1. Unix シェルとインターネット接続
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a> がインストールされている
3. 最新版の **Java** (例: <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17) がインストールされている
4. 最新版の **MySQL** (例: <a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >=8) がインストールされ、稼働している
5. 最新版の **ClickHouse** が [インストールされ](/getting-started/install.md) 稼働している
:::

## ClickHouse JDBC ブリッジをローカルにインストール {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBC ブリッジを使用する最も簡単な方法は、ClickHouse が稼働しているのと同じホストにインストールして実行することです:<img src={Jdbc02} class="image" alt="ClickHouse JDBC Bridge locally"/>

最初に、ClickHouse が稼働しているマシンの Unix シェルに接続し、後で ClickHouse JDBC ブリッジをインストールするローカルフォルダーを作成します（フォルダーに好きな名前を付け、好きな場所に置いても構いません）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、そのフォルダーに <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">最新バージョン</a>の ClickHouse JDBC ブリッジをダウンロードします：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQL に接続できるように、名前付きデータソースを作成しています：

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

次に、以下の構成を `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` ファイルにコピーして貼り付けます：

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
上記の構成ファイルでは
- データソースに好きな名前を付けることができますが、私たちは `mysql8` を使用しました
- `jdbcUrl` の値では `<host>` と `<port>` を、稼働している MySQL インスタンスに応じた適切な値に置き換える必要があります。例: `"jdbc:mysql://localhost:3306"`
- `<username>` と `<password>` を MySQL の資格情報に置き換える必要があります。パスワードを使用していない場合は、上記の構成ファイルから `"password": "<password>"` 行を削除できます
- `driverUrls` の値では、<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">最新バージョン</a>の MySQL JDBC ドライバーをダウンロードできる URL を指定しました。これだけで、ClickHouse JDBC ブリッジはその JDBC ドライバーを自動的にダウンロードします（OS 固有のディレクトリに）。
:::

<br/>

これで ClickHouse JDBC ブリッジを起動する準備が整いました：
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
前景モードで ClickHouse JDBC ブリッジを起動しました。ブリッジを停止するには、上記の Unix シェルウィンドウを前面に持ってきて `CTRL+C` を押してください。
:::


## ClickHouse から JDBC 接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse は、[jdbc テーブル関数](/sql-reference/table-functions/jdbc.md) または [JDBC テーブルエンジン](/engines/table-engines/integrations/jdbc.md) を使用して MySQL データにアクセスできるようになりました。

以下の例を実行する最も簡単な方法は、それを [`clickhouse-client`](/interfaces/cli.md) または [Play UI](/interfaces/http.md) にコピーして貼り付けることです。



- jdbc テーブル関数:

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
jdbc テーブル関数の最初のパラメーターには、上記で構成した名前付きデータソースの名前を使用しています。
:::



- JDBC テーブルエンジン:
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
jdbc エンジン句の最初のパラメーターには、上記で構成した名前付きデータソースの名前を使用しています。

ClickHouse JDBC エンジンテーブルのスキーマと接続された MySQL テーブルのスキーマは一致する必要があります。たとえば、カラム名と順序は同じで、カラムデータ型も互換性がある必要があります。
:::







## ClickHouse JDBC ブリッジを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散 ClickHouse クラスター（複数の ClickHouse ホストを持つクラスター）では、ClickHouse JDBC ブリッジを外部の独自ホストにインストールして実行することが理にかなっています：
<img src={Jdbc03} class="image" alt="ClickHouse JDBC Bridge externally"/>
これにより、各 ClickHouse ホストが JDBC ブリッジにアクセスできるようになります。さもなければ、外部データソースにアクセスするために、各 ClickHouse インスタンスごとに JDBC ブリッジをローカルにインストールする必要があります。

ClickHouse JDBC ブリッジを外部にインストールするには、次の手順を実行します：

1. このガイドのセクション 1 に記載された手順に従って、専用ホストに ClickHouse JDBC ブリッジをインストール、構成、および実行します。

2. 各 ClickHouse ホストに、選択した構成形式に応じて、<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse サーバー構成</a> に次の構成ブロックを追加します。XML または YAML バージョンのいずれかを使用してください：

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
   - `JDBC-Bridge-Host` を専用の ClickHouse JDBC ブリッジホストのホスト名またはIPアドレスに置き換える必要があります
   - デフォルトの ClickHouse JDBC ブリッジポート `9019` を指定しました。異なるポートを使用している場合は、上記の構成をそれに応じて調整する必要があります
:::



