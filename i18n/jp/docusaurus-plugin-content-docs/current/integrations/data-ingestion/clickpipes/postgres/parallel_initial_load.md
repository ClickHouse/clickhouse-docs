---
'title': 'Postgres ClickPipeにおけるパラレルスナップショット'
'description': 'Postgres ClickPipeにおけるパラレルスナップショットを説明するドキュメント'
'slug': '/integrations/clickpipes/postgres/parallel_initial_load'
'sidebar_label': 'パラレルスナップショットの動作'
'doc_type': 'guide'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

このドキュメントでは、Postgres ClickPipe の並列スナップショット/初期ロードについて説明し、その制御に使用できるスナップショットパラメータについて説明します。

## 概要 {#overview-pg-snapshot}

初期ロードは、CDC ClickPipe の最初のフェーズであり、ClickPipe がソースデータベース内のテーブルの履歴データを ClickHouse へ同期させた後、CDC を開始します。多くの場合、開発者はこれを単一スレッド方式で行います - 例えば、pg_dump または pg_restore を使用するか、ソースデータベースから読み取り、ClickHouse に書き込むために単一スレッドを使用することです。
しかし、Postgres ClickPipe はこのプロセスを並列化することができ、初期ロードの速度を大幅に向上させることができます。

### Postgres の CTID カラム {#ctid-pg-snapshot}
Postgres では、テーブル内の各行に CTID と呼ばれる一意の識別子があります。これは、デフォルトではユーザーには見えないシステムカラムですが、テーブル内の行を一意に識別するために使用できます。CTID はブロック番号とそのブロック内のオフセットの組み合わせであり、行への効率的なアクセスを可能にします。

### 論理パーティショニング {#logical-partitioning-pg-snapshot}
Postgres ClickPipe は、CTID カラムを使用してソーステーブルを論理的にパーティショニングします。最初にソーステーブルに対して COUNT(*) を実行し、その後ウィンドウ関数のパーティショニングクエリを使用して各パーティションの CTID 範囲を取得します。これにより、ClickPipe はソーステーブルを並列に読み取ることができ、各パーティションは別のスレッドによって処理されます。

以下の設定について説明します：

<Image img={snapshot_params} alt="スナップショットパラメータ" size="md"/>

#### パーティションあたりのスナップショット行数 {#numrows-pg-snapshot}

この設定は、1 つのパーティションを構成する行数を制御します。ClickPipe は、このサイズのチャンクでソーステーブルを読み取り、チャンクは初期ロードの並列性に基づいて並列に処理されます。デフォルト値は、パーティションあたり 100,000 行です。

#### 初期ロードの並列性 {#parallelism-pg-snapshot}

この設定は、並列に処理されるパーティションの数を制御します。デフォルト値は 4 で、これは ClickPipe がソーステーブルの 4 つのパーティションを並列に読み取ることを意味します。これを増やすことで初期ロードを加速できますが、ソースインスタンスの仕様に応じて適切な値に保つことをお勧めします。ClickPipe はソーステーブルのサイズやパーティションあたりの行数に基づいてパーティションの数を自動的に調整します。

#### 並列でのスナップショットテーブル数 {#tables-parallel-pg-snapshot}

並列スナップショットには直接関連していませんが、この設定は初期ロード中に並列に処理されるテーブルの数を制御します。デフォルト値は 1 です。これはパーティションの並列性の上にあるため、4 つのパーティションと 2 つのテーブルがある場合、ClickPipe は 8 つのパーティションを並列に読み取ります。

### Postgres での並列スナップショットの監視 {#monitoring-parallel-pg-snapshot}

**pg_stat_activity** を分析して、並列スナップショットが動作している様子を確認できます。ClickPipe はソースデータベースに複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。異なる CTID 範囲の **FETCH** クエリが表示される場合、ClickPipe がソーステーブルを読み取っていることを意味します。ここで COUNT(*) とパーティショニングクエリも確認できます。

### 制限事項 {#limitations-parallel-pg-snapshot}

- スナップショットパラメータはパイプ作成後に編集できません。変更したい場合は、新しい ClickPipe を作成する必要があります。
- 既存の ClickPipe にテーブルを追加する際、スナップショットパラメータを変更することはできません。ClickPipe は新しいテーブルに対して既存のパラメータを使用します。
- パーティションキーのカラムには `NULL` を含めないでください。これはパーティショニングのロジックによってスキップされます。
