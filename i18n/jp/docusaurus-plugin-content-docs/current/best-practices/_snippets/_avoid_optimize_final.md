import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

**MergeTree engine** を使用する ClickHouse テーブルは、ディスク上にデータを **不変なパーツ (immutable parts)** として保存します。これらのパーツは、データが挿入されるたびに作成されます。

各挿入操作では、ソートおよび圧縮されたカラムファイルと、インデックスやチェックサムなどのメタデータを含む新しいパーツが作成されます。パーツ構造とその生成方法の詳細な説明については、こちらの[ガイド](/parts)を参照してください。

時間の経過とともに、バックグラウンドプロセスが小さなパーツをより大きなパーツにマージし、断片化を抑え、クエリのパフォーマンスを向上させます。

<Image img={simple_merges} size="md" alt="シンプルなマージ" />

次のコマンドを使ってこのマージを手動でトリガーしたくなるかもしれませんが。

```sql
OPTIMIZE TABLE <table> FINAL;
```

**ほとんどの場合は `OPTIMIZE FINAL` 操作は避けるべきです。**\
この操作はリソースを多く消費する処理を実行し、クラスターのパフォーマンスに影響を与える可能性があります。

:::note OPTIMIZE FINAL と FINAL の違い
`OPTIMIZE FINAL` は `FINAL` と同じではありません。`FINAL` は、`ReplacingMergeTree` のように重複を除いた結果を取得するために必要になる場合があります。\
一般的に、クエリがプライマリキーと同じ列を条件にフィルタしている場合は、`FINAL` を使用しても問題ありません。
:::


## なぜ避けるべきか \\{#why-avoid\\}

### コストが高い \\{#its-expensive\\}

`OPTIMIZE FINAL` を実行すると、大きなマージがすでに行われている場合でも、ClickHouse に対してアクティブな **すべて** のパーツを **単一のパーツ** にマージすることを強制します。これには次の処理が含まれます:

1. すべてのパーツを**解凍**する
2. データを**マージ**する
3. 再度**圧縮**する
4. 最終パーツをディスクまたはオブジェクトストレージに**書き込む**

これらの処理は **CPU および I/O 負荷が高く**、特に大規模なデータセットを扱う場合、システムに大きな負荷を与える可能性があります。

### 安全上の制限を無視する \\{#it-ignores-safety-limits\\}

通常、ClickHouse は ~150 GB を超えるパーツのマージを回避します（[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) により設定可能）。しかし `OPTIMIZE FINAL` はこの安全装置を**無視**するため、次のような事態が発生し得ます:

* **複数の 150 GB パーツ** を 1 つの巨大なパーツにマージしようとする可能性がある
* その結果、**マージ時間の長期化**、**メモリプレッシャー**、さらには **メモリ不足エラー** を引き起こす可能性がある
* これらの巨大なパーツは、その後のマージが難しくなる場合があり、つまり、上記の理由によりさらなるマージの試行が失敗します。クエリ時に正しい挙動を得るためにマージが必要なケースでは、[ReplacingMergeTree における重複の蓄積](/guides/developer/deduplication#using-replacingmergetree-for-upserts) のような望ましくない結果を招き、クエリ時のパフォーマンスを低下させる可能性があります。



## バックグラウンドマージに任せる \\{#let-background-merges-do-the-work\\}

ClickHouse は、ストレージとクエリ効率を最適化するために、すでに高度なバックグラウンドマージを実行しています。これらは増分的に行われ、リソース状況を考慮しつつ、設定されたしきい値も順守します。テーブルのフリーズ前やエクスポート前にデータを確定したいといった、ごく特別な要件がある場合を除き、**マージ処理は ClickHouse に任せておくのが最善です**。
