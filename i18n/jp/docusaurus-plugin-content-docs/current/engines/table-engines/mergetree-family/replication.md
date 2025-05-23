---
'description': 'ClickHouse におけるデータレプリケーションの概要'
'sidebar_label': 'データレプリケーション'
'sidebar_position': 20
'slug': '/engines/table-engines/mergetree-family/replication'
'title': 'データレプリケーション'
---




# データレプリケーション

:::note
ClickHouse Cloud では、レプリケーションが自動的に管理されます。引数を追加せずにテーブルを作成してください。たとえば、以下のテキストでは、

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}',
    ver
)
```

を次のように置き換えます：

```sql
ENGINE = ReplicatedMergeTree
```
:::

レプリケーションは、MergeTreeファミリーのテーブルにのみ対応しています：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

レプリケーションは、個々のテーブルのレベルで機能し、サーバー全体ではなくなります。サーバーは、レプリケーションテーブルと非レプリケーションテーブルの両方を同時に保存できます。

レプリケーションはシャーディングに依存しません。各シャードには独自の独立したレプリケーションがあります。

`INSERT` および `ALTER` クエリの圧縮データはレプリケーションされます（詳細については、[ALTER](/sql-reference/statements/alter) のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` および `RENAME` クエリは、単一のサーバーで実行され、レプリケーションされません：

- `CREATE TABLE` クエリは、クエリが実行されたサーバーに新しいレプリケーション可能なテーブルを作成します。このテーブルが他のサーバーにすでに存在する場合、これは新しいレプリカを追加します。
- `DROP TABLE` クエリは、クエリが実行されたサーバーにあるレプリカを削除します。
- `RENAME` クエリは、レプリカの1つのテーブルの名前を変更します。言い換えれば、レプリケーションテーブルは異なるレプリカで異なる名前を持つことができます。

ClickHouseは、レプリカのメタ情報を保存するために [ClickHouse Keeper](/guides/sre/keeper/index.md) を使用します。ZooKeeperバージョン3.4.5以降を使用することも可能ですが、ClickHouse Keeperが推奨されます。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper) サーバー構成セクションでパラメータを設定します。

:::note
セキュリティ設定を無視しないでください。ClickHouseは、ZooKeeperセキュリティサブシステムの `digest` [ACLスキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) をサポートしています。
:::

ClickHouse Keeperクラスタのアドレスを設定する例：

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <node>
        <host>example3</host>
        <port>2181</port>
    </node>
</zookeeper>
```

ClickHouseは、補助的なZooKeeperクラスタにレプリカのメタ情報を保存することもサポートしています。これは、エンジン引数としてZooKeeperクラスタ名とパスを提供することで行います。言い換えれば、異なるZooKeeperクラスタに異なるテーブルのメタデータを保存することができます。

補助的なZooKeeperクラスタのアドレスを設定する例：

```xml
<auxiliary_zookeepers>
    <zookeeper2>
        <node>
            <host>example_2_1</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_2</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_3</host>
            <port>2181</port>
        </node>
    </zookeeper2>
    <zookeeper3>
        <node>
            <host>example_3_1</host>
            <port>2181</port>
        </node>
    </zookeeper3>
</auxiliary_zookeepers>
```

デフォルトのZooKeeperクラスタの代わりに、補助的なZooKeeperクラスタにテーブルのメタデータを保存するには、次のようにReplicatedMergeTreeエンジンでテーブルを作成するためのSQLを使用できます：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

既存のZooKeeperクラスタを指定でき、システムはその上に独自のデータ用のディレクトリを使用します（ディレクトリはレプリケーション可能なテーブルを作成するときに指定されます）。

設定ファイルにZooKeeperが設定されていない場合、レプリケーションテーブルを作成することはできず、既存のレプリケーションテーブルは読み取り専用になります。

ZooKeeperは `SELECT` クエリでは使用されません。なぜなら、レプリケーションは `SELECT` のパフォーマンスに影響を与えず、非レプリケーションテーブルと同じ速度でクエリが実行されるからです。分散レプリケーションテーブルをクエリするとき、ClickHouseの動作は設定 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) と [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) によって制御されます。

各 `INSERT` クエリに対して、約10のエントリがZooKeeperに対していくつかのトランザクションを通じて追加されます（正確には、挿入されたデータの各ブロックに対して; 1つのINSERTクエリにはブロックまたは `max_insert_block_size = 1048576` 行ごとに1つのブロックが含まれています）。これは、非レプリケーションテーブルに比べて `INSERT` の遅延がわずかに長くなる原因となります。しかし、データを秒間最大1回の `INSERT` のバッチで挿入するという推奨に従えば、問題はありません。ZooKeeperクラスタを調整するために使用されるClickHouseクラスタ全体では、合計で数百の `INSERTs` が毎秒行われます。データ挿入のスループット（1秒間の行数）は、非レプリケーションデータと同じ高さです。

非常に大きなクラスタの場合、シャードごとに異なるZooKeeperクラスタを使用できます。しかし、私たちの経験では、約300サーバーを持つ生産クラスタでは必要性が証明されていません。

レプリケーションは非同期でマルチマスターです。 `INSERT` クエリ（および `ALTER`）は、利用可能なサーバーに任意に送信できます。データはクエリが実行されたサーバーに挿入され、その後他のサーバーにコピーされます。非同期であるため、最近挿入されたデータは他のレプリカに少し遅延して表示されます。一部のレプリカが使用できない場合、データはそれらが利用可能になると書き込まれます。レプリカが利用可能な場合、レイテンシは圧縮データのブロックをネットワークを介して転送するのにかかる時間です。レプリケータブルテーブル用のバックグラウンドタスクを実行するスレッドの数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 設定で設定できます。

`ReplicatedMergeTree` エンジンは、レプリケーションフェッチ用の専用スレッドプールを使用します。プールのサイズは、[background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 設定によって制限されており、サーバーの再起動で調整できます。

デフォルトでは、INSERTクエリは、1つのレプリカからのデータ書き込みの確認を待機します。データが1つのレプリカに正常に書き込まれ、そしてこのレプリカを持つサーバーが存在しなくなると、保存されたデータは失われます。複数のレプリカからデータの書き込み確認を受け取るためには、`insert_quorum` オプションを使用してください。

各データブロックは、原子的に書き込まれます。INSERTクエリは、最大`max_insert_block_size = 1048576`行までのブロックに分割されます。言い換えれば、INSERTクエリが1048576行未満であれば、それは原子的に行われます。

データブロックは重複排除されます。同じデータブロックの複数回の書き込み（同じ順序で同じ行を含む同じサイズのデータブロック）については、ブロックは1回だけ書き込まれます。これは、クライアントアプリケーションがデータがDBに書き込まれたかどうかわからないネットワークの失敗時を考慮して、INSERTクエリを単に繰り返すことができるためです。データが同一である場合、INSERTが送信されたレプリカは重要ではありません。 `INSERTs`は冪等です。重複排除パラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) サーバー設定で制御されます。

レプリケーション中、挿入するソースデータのみがネットワークを介して転送されます。それ以降のデータ変換（マージ）は、すべてのレプリカで同じように調整されて実行されます。これによりネットワーク使用量が最小化されるため、レプリケーションは異なるデータセンターにレプリカがある場合でもうまく機能します。（異なるデータセンターへのデータの重複は、レプリケーションの主な目的であることに注意してください。）

同じデータのレプリカを任意の数持つことができます。私たちの経験に基づいて、比較的信頼性が高く便利な解決策は、生産環境での二重レプリケーションを使用し、各サーバーがRAID-5またはRAID-6（場合によってはRAID-10）を使用することです。

システムはレプリカのデータの同期性を監視し、障害後に回復することができます。フェイルオーバーは自動（小さなデータの違いの場合）または半自動（データがあまりにも異なるときで、設定エラーを示す可能性があります）です。

## レプリケーションテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloud では、レプリケーションが自動的に管理されます。引数を追加せずにテーブルを作成してください。たとえば、以下のテキストでは、

```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```

を次のように置き換えます：

```sql
ENGINE = ReplicatedMergeTree
```
:::

テーブルエンジン名に `Replicated` プレフィックスが追加されます。例えば、`ReplicatedMergeTree` 。

:::tip
ClickHouse Cloud では `Replicated` の追加はオプションです。すべてのテーブルがレプリケートされます。
:::

### Replicated\*MergeTreeパラメータ {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeper内のテーブルへのパス。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeperにおけるレプリカ名。

#### other_parameters {#other_parameters}

`other_parameters` — レプリケーションされたバージョンの作成に使用されるエンジンのパラメータ（たとえば、`ReplacingMergeTree`のバージョン）。

例：

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">

<summary>非推奨の構文の例</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

例のように、これらのパラメータには、中括弧内の置き換えが含まれる場合があります。置き換えられた値は、設定ファイルの [macros](/operations/server-configuration-parameters/settings.md/#macros) セクションから取得されます。

例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper内のテーブルへのパスは、各レプリケーションテーブルに対してユニークである必要があります。異なるシャードのテーブルは異なるパスを持つ必要があります。
この場合、パスは次の部分で構成されます：

`/clickhouse/tables/` は共通プレフィックスです。正確にこれを使用することをお勧めします。

`{shard}` は、シャード識別子に展開されます。

`table_name` は、ClickHouse Keeper内のテーブルのノード名です。テーブル名と同じにするのが良いアイデアです。これは明示的に定義され、テーブル名と異なり、RENAMEクエリの後に変わることはありません。
*ヒント*: `table_name`の前にデータベース名を追加することもできます。例: `db_name.table_name`

2つの組み込みの置き換え `{database}` と `{table}` を使用することができます。これらはそれぞれテーブル名とデータベース名に展開されます（これらのマクロが `macros` セクションで定義されていない限り）。したがって、 ZooKeeper のパスは `'/clickhouse/tables/{shard}/{database}/{table}'` として指定できます。
これらの組み込みの置き換えを使用する際には、テーブルの名前変更に注意してください。ClickHouse Keeper内のパスは変更できず、テーブルの名前が変更されると、マクロは異なるパスに展開され、テーブルはClickHouse Keeperに存在しないパスを参照し、読み取り専用モードに入ります。

レプリカ名は、同じテーブルの異なるレプリカを識別します。例のように、サーバー名を使用できます。この名前は、各シャード内でユニークである必要があります。

置き換えを使用するのではなく、パラメータを明示的に定義することもできます。これは、テストや小規模クラスタの構成に便利です。ただし、この場合、分散DDLクエリ（`ON CLUSTER`）を使用することはできません。

大規模なクラスタで作業する場合、置き換えを使用することをお勧めします。なぜなら、それによりエラーの可能性が低くなるからです。

サーバー構成ファイルで `Replicated` テーブルエンジンのデフォルト引数を指定することができます。たとえば：

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブルを作成する際に引数を省略することができます：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

これは次のように等価です：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカで `CREATE TABLE` クエリを実行します。このクエリは新しいレプリケーションテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

もし他のレプリカに既にデータが含まれている場合や新しいレプリカを追加した場合、クエリを実行した後、他のレプリカから新しいレプリカにデータがコピーされます。言い換えれば、新しいレプリカは他のレプリカと同期されます。

レプリカを削除するには、`DROP TABLE` を実行します。ただし、削除されるのは1つのレプリカのみで、クエリが実行されたサーバーに存在するレプリカだけです。

## 障害後の回復 {#recovery-after-failures}

サーバーが起動する際にClickHouse Keeperが利用できない場合、レプリケーションテーブルは読み取り専用モードに切り替わります。システムは定期的にClickHouse Keeperへの接続を試みます。

`INSERT`中にClickHouse Keeperが利用できない場合、もしくはClickHouse Keeperとのやり取り中にエラーが発生した場合、例外がスローされます。

ClickHouse Keeperに接続した後、システムはローカルファイルシステム上のデータセットが期待されるデータセットと一致するかを確認します（ClickHouse Keeperはこの情報を保存します）。小さな不一致がある場合、システムはレプリカとのデータを同期することで解決します。

システムが破損したデータパーツ（ファイルのサイズが誤っている）や認識されないパーツ（ファイルシステムに書き込まれたがClickHouse Keeperに記録されていないパーツ）を検出した場合、それらを `detached` サブディレクトリに移動します（削除されません）。不足しているパーツはレプリカからコピーされます。

ClickHouseは、自動的に大量のデータを削除するような破壊的操作を行わないことに注意してください。

サーバーが起動したとき（またはClickHouse Keeperとの新しいセッションを確立したとき）、システムはすべてのファイルの数量とサイズのみを確認します。もしファイルサイズが一致しているが、どこかの中間でバイトが変更されている場合、これは即座には検出されませんが、`SELECT` クエリのためにデータを読み取ろうとしたときにのみ検出されます。クエリが不一致のチェックサムや圧縮ブロックのサイズに関する例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルデータセットが期待されるデータセットとあまりにも異なる場合、安全メカニズムが起動します。サーバーはこれをログに記録し、起動を拒否します。この状況が発生する可能性があるのは、設定エラーの可能性を示すためです。これは、あるシャードのレプリカが別のシャードのレプリカとして誤って構成されている場合に発生します。ただし、このメカニズムのしきい値はかなり低く設定されており、この状況は通常の障害回復中に発生する可能性があります。この場合、データは半自動的に復元されます-「ボタンを押す」ことによって。

回復を開始するには、ClickHouse Keeperに `/path_to_table/replica_name/flags/force_restore_data` ノードを作成し、任意の内容を含めるか、すべてのレプリケーションテーブルを復元するためのコマンドを実行します：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

その後、サーバーを再起動します。起動時に、サーバーはこれらのフラグを削除し、回復を開始します。

## 完全なデータ損失後の回復 {#recovery-after-complete-data-loss}

サーバーのすべてのデータとメタデータが消失した場合、次の手順に従って回復します：

1. サーバーにClickHouseをインストールします。サブスティテューションを設定ファイル内で正しく定義します。これにはシャード識別子とレプリカが含まれます。
2. 手動で複製する必要のある未レプリケートテーブルがあった場合、レプリカからデータをコピーします（`/var/lib/clickhouse/data/db_name/table_name/` ディレクトリで）。
3. レプリカから `/var/lib/clickhouse/metadata/` にあるテーブルの定義をコピーします。テーブル定義内でシャードまたはレプリカ識別子が明示的に定義されている場合は、それを修正して、対応するレプリカに合うようにします。（代わりにサーバーを起動し、`.sql`ファイルに存在すべきすべての `ATTACH TABLE` クエリを実行します。）
4. 回復を開始するには、ClickHouse Keeperに `/path_to_table/replica_name/flags/force_restore_data` を任意の内容で持つノードを作成するか、すべてのレプリケーションテーブルを復元するためのコマンドを実行します：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバーを起動します（すでに実行されている場合は再起動を行います）。データはレプリカからダウンロードされます。

別の回復オプションとして、失われたレプリカに関する情報をClickHouse Keeperから削除し（`/path_to_table/replica_name`）、その後、"[レプリケーションテーブルの作成](#creating-replicated-tables)"に記載されているように再作成します。

回復中はネットワーク帯域幅に制限はありません。複数のレプリカを同時に復元する場合は、これを考慮してください。

## MergeTreeからReplicatedMergeTreeへの変換 {#converting-from-mergetree-to-replicatedmergetree}

私たちは、`MergeTree`という用語を、`ReplicatedMergeTree` と同様に、`MergeTreeファミリー内のすべてのテーブルエンジンを指すために使用します。

もし手動でレプリケートされた `MergeTree` テーブルがあった場合、それをレプリケーション可能なテーブルに変換できます。この操作が必要になるのは、`MergeTree` テーブル内にすでに大量のデータを集めており、今やレプリケーションを有効にしたい場合です。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) ステートメントを使用して、分離された `MergeTree` テーブルを `ReplicatedMergeTree` としてアタッチできます。

`MergeTree`テーブルは、テーブルのデータディレクトリに `convert_to_replicated` フラグが設定されている場合、サーバーの再起動時に自動的に変換されます（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/` で `Atomic`データベース用）。
空の `convert_to_replicated` ファイルを作成すると、次回のサーバー再起動時にテーブルがレプリケーション可能として読み込まれます。

このクエリを使用してテーブルのデータパスを取得できます。テーブルが複数のデータパスを持っている場合は、最初のものを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

`ReplicatedMergeTree` テーブルは、`default_replica_path` と `default_replica_name` 設定の値を使用して作成されます。
他のレプリカに変換されたテーブルを作成するには、`ReplicatedMergeTree`エンジンの最初の引数でそのパスを明示的に指定する必要があります。次のクエリを使用してそのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

これには手動の方法もあります。

さまざまなレプリカでデータが異なる場合、まずそれを同期させるか、1つを除くすべてのレプリカでこのデータを削除します。

既存のMergeTreeテーブルの名前を変更し、古い名前でReplicatedMergeTreeテーブルを作成します。
古いテーブルから新しいテーブルデータのディレクトリ内にある `detached` サブディレクトリにデータを移動します（`/var/lib/clickhouse/data/db_name/table_name/`）。
次に、データパーツを作業セットに追加するために、レプリカの1つで `ALTER TABLE ATTACH PARTITION` を実行します。

## ReplicatedMergeTreeからMergeTreeへの変換 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) ステートメントを使用して、分離された `ReplicatedMergeTree` テーブルを単一のサーバー上で `MergeTree` としてアタッチできます。

これを行うための別の方法は、サーバーを再起動することです。異なる名前のMergeTreeテーブルを作成します。`ReplicatedMergeTree` テーブルデータのディレクトリから新しいテーブルのデータディレクトリにすべてのデータを移動します。それから、`ReplicatedMergeTree` テーブルを削除してサーバーを再起動します。

サーバーを起動せずに `ReplicatedMergeTree` テーブルを削除したい場合：

- メタデータディレクトリ (`/var/lib/clickhouse/metadata/`) から対応する .sql ファイルを削除します。
- ClickHouse Keeperから対応するパスを削除します（`/path_to_table/replica_name`）。

この後、サーバーを起動し、`MergeTree` テーブルを作成し、データをそのディレクトリに移動し、その後サーバーを再起動します。

## ClickHouse Keeperクラスタ内のメタデータが失われたまたは損傷した場合の回復 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeperのデータが失われたまたは損傷した場合、上記のように未レプリケートテーブルにデータを移動することによってデータを保存できます。

**参照**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
