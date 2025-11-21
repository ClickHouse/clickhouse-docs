import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

**MergeTree engine** を使用する ClickHouse テーブルは、データをディスク上に **不変なパーツ (immutable parts)** として保存し、データが挿入されるたびに新しいパーツが作成されます。

各挿入操作は、ソートおよび圧縮されたカラムファイルと、インデックスやチェックサムといったメタデータを含む新しいパーツを作成します。パーツ構造の詳細およびそれらがどのように形成されるかについては、この [ガイド](/parts) を参照することをお勧めします。

時間の経過とともに、バックグラウンドプロセスが小さなパーツをより大きなパーツにマージして、断片化を減らしクエリパフォーマンスを向上させます。

<Image img={simple_merges} size="md" alt="Simple merges" />

次のようにこのマージを手動でトリガーしたくなるかもしれませんが、

```sql
OPTIMIZE TABLE <table> FINAL;
```

**ほとんどのケースでは `OPTIMIZE FINAL` 操作は避けるべきです**。これは、多くのリソースを消費する処理を開始し、クラスタのパフォーマンスに影響を与える可能性があるためです。

:::note OPTIMIZE FINAL vs FINAL
`OPTIMIZE FINAL` は `FINAL` と同じではありません。`ReplacingMergeTree` のように、重複のない結果を得るために `FINAL` の使用が必要になるケースもあります。一般的に、クエリがプライマリキーと同じカラムでフィルタリングしている場合は、`FINAL` を使用しても問題ありません。
:::


## なぜ避けるべきか？ {#why-avoid}

### コストが高い {#its-expensive}

`OPTIMIZE FINAL`を実行すると、大規模なマージがすでに発生している場合でも、ClickHouseは**すべて**のアクティブなパートを**単一のパート**に強制的にマージします。これには以下の処理が含まれます：

1. すべてのパートの**解凍**
2. データの**マージ**
3. 再度の**圧縮**
4. 最終パートのディスクまたはオブジェクトストレージへの**書き込み**

これらの処理は**CPUとI/Oを大量に消費**し、特に大規模なデータセットが関与する場合、システムに大きな負荷をかける可能性があります。

### 安全制限を無視する {#it-ignores-safety-limits}

通常、ClickHouseは約150GBを超えるパートのマージを回避します（[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)で設定可能）。しかし、`OPTIMIZE FINAL`は**この安全機構を無視**するため、以下のような問題が発生する可能性があります：

- **複数の150GBパート**を1つの巨大なパートにマージしようとする可能性がある
- これにより**長時間のマージ**、**メモリ圧迫**、さらには**メモリ不足エラー**が発生する可能性がある
- これらの大きなパートはマージが困難になる可能性があり、つまり上記の理由によりさらなるマージの試みが失敗します。クエリ実行時の正しい動作にマージが必要な場合、[ReplacingMergeTreeで重複が蓄積する](/guides/developer/deduplication#using-replacingmergetree-for-upserts)などの望ましくない結果を招き、クエリ実行時のパフォーマンスが低下します。


## バックグラウンドマージに任せる {#let-background-merges-do-the-work}

ClickHouseは、ストレージとクエリ効率を最適化するために、スマートなバックグラウンドマージを既に実行しています。これらは段階的で、リソースを考慮し、設定された閾値を尊重します。非常に特定のニーズ(例:テーブルの凍結やエクスポート前のデータの確定)がない限り、**ClickHouseにマージを自動管理させる方が適切です**。
