import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

ClickHouse テーブルは **MergeTree エンジン** を使用して、データを **不変なパーツ** としてディスクに保存します。これはデータが挿入されるたびに作成されます。

各挿入は、ソートされた圧縮カラムファイルとインデックスやチェックサムのようなメタデータを含む新しいパートを生成します。パート構造とその形成方法についての詳細は、この [ガイド](/parts) をお勧めします。

時間が経つにつれて、バックグラウンドプロセスが小さなパーツをより大きなものにマージして、フラグメンテーションを減らし、クエリパフォーマンスを向上させます。

<Image img={simple_merges} size="md" alt="Simple merges" />

手動でこのマージをトリガーする誘惑があるかもしれませんが、以下のように行うことはありません：

```sql
OPTIMIZE TABLE <table> FINAL;
```

**ほとんどの場合、この操作は避けるべきです**。なぜなら、リソースを集中的に消費する操作を開始し、クラスターのパフォーマンスに影響を与える可能性があるからです。

## なぜ避けるべきか？  {#why-avoid}

### 費用が高い {#its-expensive}

`OPTIMIZE FINAL` を実行すると、ClickHouse は **すべての** アクティブなパーツを **単一のパート** にマージすることを強制します。たとえすでに大きなマージが行われていたとしてもです。これには以下が含まれます：

1. **すべてのパーツのデコンプレッション**
2. **データのマージ**
3. **再圧縮**
4. **最終パートをディスクまたはオブジェクトストレージに書き込む**

これらのステップは **CPU と I/O 集中的** であり、特に大規模データセットが関与する場合、システムに大きな負担をかける可能性があります。

### 安全制限を無視する {#it-ignores-safety-limits}

通常、ClickHouse は ~150 GB を超えるパーツをマージすることを避けます（これは [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) を介して設定可能です）。しかし、`OPTIMIZE FINAL` は **この保護を無視します**。つまり：

* **複数の150 GBパーツ** を1つの巨大なパーツにマージしようとする可能性があります
* これにより、**長いマージ時間**、**メモリ圧力**、または **Out-of-Memory エラー** が発生するかもしれません
* これらの大きなパーツはマージが難しくなり、さらにマージを試みると上記の理由で失敗します。クエリ時間の動作に正しいマージが必要な場合、これにより望ましくない結果、例えば [ReplacingMergeTree の重複の蓄積](/guides/developer/deduplication#using-replacingmergetree-for-upserts) が発生し、クエリパフォーマンスが低下する可能性があります。

## バックグラウンドマージに作業をさせる {#let-background-merges-do-the-work}

ClickHouse はすでに、ストレージとクエリ効率を最適化するためにスマートなバックグラウンドマージを実行しています。これらはインクリメンタルで、リソースに配慮し、設定された閾値を尊重します。非常に特定のニーズがない限り（例：テーブルを凍結する前にデータを確定する、またはエクスポートするなど）、**ClickHouse にマージを自動的に管理させた方が良いでしょう**。
