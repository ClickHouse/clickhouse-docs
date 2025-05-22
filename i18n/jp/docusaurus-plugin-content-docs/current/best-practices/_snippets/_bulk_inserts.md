---
{}
---



The above mechanics illustrate a constant overhead regardless of the insert size, making batch size the single most important optimization for ingest throughput. Batching inserts reduce the overhead as a proportion of total insert time and improves processing efficiency.

We recommend inserting data in batches of at least 1,000 rows, and ideally between 10,000–100,000 rows. Fewer, larger inserts reduce the number of parts written, minimize merge load, and lower overall system resource usage.

**For a synchronous insert strategy to be effective this client-side batching is required.**

If you're unable to batch data client-side, ClickHouse supports asynchronous inserts that shift batching to the server ([see](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)).

:::tip 
Regardless of the size of your inserts, we recommend keeping the number of insert queries around one insert query per second. The reason for that recommendation is that the created parts are merged to larger parts in the background (in order to optimize your data for read queries), and sending too many insert queries per second can lead to situations where the background merging can't keep up with the number of new parts. However, you can use a higher rate of insert queries per second when you use asynchronous inserts (see asynchronous inserts). 
:::

上記のメカニズムは、挿入サイズに関係なく一定のオーバーヘッドを示しており、バッチサイズがインジェストスループットの最も重要な最適化要素であることを示しています。バッチ挿入は、全体の挿入時間に対するオーバーヘッドを減少させ、処理効率を向上させます。

データは、少なくとも1,000行のバッチで挿入することを推奨し、理想的には10,000〜100,000行の間で行うべきです。少ない大きな挿入は、書き込まれるパーツの数を減少させ、マージ負荷を最小化し、全体的なシステムリソースの使用を低下させます。

**同期挿入戦略が効果的に機能するためには、このクライアント側のバッチ処理が必要です。**

クライアント側でデータをバッチ処理できない場合、ClickHouseはバッチ処理をサーバーに移す非同期挿入をサポートしています（[参照](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)）。

:::tip 
挿入のサイズに関係なく、挿入クエリの数を約1秒あたり1つの挿入クエリに保つことを推奨します。この推奨の理由は、作成されたパーツがバックグラウンドでより大きなパーツにマージされるため（読み取りクエリ用にデータを最適化するため）、1秒あたりに挿入クエリを送信しすぎると、バックグラウンドのマージが新しいパーツの数に追いつけない状況が発生する可能性があるからです。ただし、非同期挿入を使用する場合は、1秒あたりの挿入クエリの頻度を高めることができます（非同期挿入を参照）。 
:::
