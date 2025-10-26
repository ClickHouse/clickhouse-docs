---
'title': 'MySQL ClickPipe における並列スナップショット'
'description': 'MySQL ClickPipe における並列スナップショットを説明するドキュメント'
'slug': '/integrations/clickpipes/mysql/parallel_initial_load'
'sidebar_label': '並列スナップショットの動作方法'
'doc_type': 'guide'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

この文書では、MySQL ClickPipeにおける並列化されたスナップショット/初期ロードの動作について説明し、それを制御するために使用できるスナップショットパラメータについても触れています。

## 概要 {#overview-mysql-snapshot}

初期ロードは、CDC ClickPipeの最初のフェーズであり、ClickPipeがソースデータベース内のテーブルの履歴データをClickHouseに同期させた後、CDCを開始します。多くの場合、開発者はこれをシングルスレッド方式で実行します。しかし、MySQL ClickPipeはこのプロセスを並列化でき、初期ロードを大幅に高速化できます。

### パーティションキー列 {#key-mysql-snapshot}

機能フラグを有効にしたら、ClickPipeテーブルピッカーに以下の設定が表示されるはずです（ClickPipeの作成および編集時の両方）。

<Image img={partition_key} alt="パーティションキー列" size="md"/>

MySQL ClickPipeは、ソーステーブルの列を使用してソーステーブルを論理的にパーティション分けします。この列を**パーティションキー列**と呼びます。これはソーステーブルをパーティションに分割するために使用され、その後ClickPipeによって並列処理されます。

:::warning
パーティションキー列は、ソーステーブルでインデックスが付けられている必要があり、そうすることで性能向上が期待できます。これはMySQLで`SHOW INDEX FROM <table_name>`を実行することで確認できます。
:::

### 論理パーティショニング {#logical-partitioning-mysql-snapshot}

以下の設定について説明します：

<Image img={snapshot_params} alt="スナップショットパラメータ" size="md"/>

#### パーティションあたりのスナップショット行数 {#numrows-mysql-snapshot}
この設定は、1つのパーティションを構成する行数を制御します。ClickPipeは、このサイズのチャンクでソーステーブルを読み込み、チャンクは設定された初期ロードの並列性に基づいて並列処理されます。デフォルト値は、パーティションあたり100,000行です。

#### 初期ロードの並列性 {#parallelism-mysql-snapshot}
この設定は、どれだけのパーティションが並列処理されるかを制御します。デフォルト値は4であり、これはClickPipeがソーステーブルの4つのパーティションを並列に読み込むことを意味します。これを増やすことで初期ロードを高速化できますが、ソースインスタンスの仕様に依存して合理的な値に保つことをお勧めします。これによりソースデータベースが圧倒されるのを防ぎます。ClickPipeはソーステーブルのサイズとパーティションあたりの行数に基づいて自動的にパーティションの数を調整します。

#### 並列のスナップショットにおけるテーブル数 {#tables-parallel-mysql-snapshot}
これは並列スナップショットとは直接関係ありませんが、この設定は初期ロード中に並列処理されるテーブルの数を制御します。デフォルト値は1です。これはパーティションの並列性に加算されるため、4つのパーティションと2つのテーブルがある場合、ClickPipeは並列で8つのパーティションを読み取ります。

### MySQLにおける並列スナップショットの監視 {#monitoring-parallel-mysql-snapshot}
MySQLで**SHOW processlist**を実行することで、並列スナップショットが動作しているのを確認できます。ClickPipeはソースデータベースに対して複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。異なる範囲の**SELECT**クエリが表示されれば、ClickPipeがソーステーブルを読み込んでいることを意味します。ここでCOUNT(*)およびパーティショニングクエリも確認できます。

### 制限事項 {#limitations-parallel-mysql-snapshot}
- スナップショットパラメータは、パイプ作成後に編集できません。これを変更したい場合は、新しいClickPipeを作成する必要があります。
- 既存のClickPipeにテーブルを追加する際、スナップショットパラメータを変更することはできません。ClickPipeは新しいテーブルに対して既存のパラメータを使用します。
- パーティションキー列には`NULL`を含めるべきではありません。これらはパーティショニングロジックによってスキップされます。
