---
'description': 'Buffers the data to write in RAM, periodically flushing it to another
  table. During the read operation, data is read from the buffer and the other table
  simultaneously.'
'sidebar_label': 'Buffer'
'sidebar_position': 120
'slug': '/engines/table-engines/special/buffer'
'title': 'Buffer Table Engine'
---




# バッファーテーブルエンジン

データを書き込むためにRAMにバッファリングし、定期的に別のテーブルにフラッシュします。読み取り操作中、データはバッファからと他のテーブルから同時に読み取られます。

:::note
バッファーテーブルエンジンの推奨代替手段は、[非同期挿入](/guides/best-practices/asyncinserts.md)を有効にすることです。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### エンジンパラメーター: {#engine-parameters}

#### database {#database}

`database` – データベース名。`currentDatabase()`や文字列を返す他の定数式を使用できます。

#### table {#table}

`table` – データをフラッシュするテーブル。

#### num_layers {#num_layers}

`num_layers` – 並列性の層。物理的には、テーブルは`num_layers`の独立したバッファとして表されます。

#### min_time, max_time, min_rows, max_rows, min_bytes, and max_bytes {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

バッファからデータをフラッシュする条件。

### オプションのエンジンパラメーター: {#optional-engine-parameters}

#### flush_time, flush_rows, and flush_bytes {#flush_time-flush_rows-and-flush_bytes}

バッファからデータをバックグラウンドでフラッシュする条件（省略またはゼロは`flush*`パラメーターなしを意味します）。

すべての`min*`条件が満たされるか、少なくとも1つの`max*`条件が満たされると、データはバッファからフラッシュされ、宛先テーブルに書き込まれます。

また、少なくとも1つの`flush*`条件が満たされると、バックグラウンドでフラッシュが開始されます。これは`max*`とは異なり、`flush*`を使用することで、バッファテーブルへの`INSERT`クエリの遅延を避けるためにバックグラウンドフラッシュを個別に設定できます。

#### min_time, max_time, and flush_time {#min_time-max_time-and-flush_time}

バッファへの最初の書き込みからの秒数の条件。

#### min_rows, max_rows, and flush_rows {#min_rows-max_rows-and-flush_rows}

バッファ内の行数の条件。

#### min_bytes, max_bytes, and flush_bytes {#min_bytes-max_bytes-and-flush_bytes}

バッファ内のバイト数の条件。

書き込み操作中、データは1つまたは複数のランダムなバッファに挿入されます（`num_layers`で構成）。あるいは、挿入するデータ部分が十分大きい（`max_rows`または`max_bytes`を超える）場合、バッファを省略して宛先テーブルに直接書き込まれます。

データをフラッシュする条件は、各`num_layers`バッファごとに別々に計算されます。例えば、`num_layers = 16`で`max_bytes = 100000000`の場合、最大RAM消費量は1.6 GBです。

例:

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

`merge.hits`と同じ構造の`merge.hits_buffer`テーブルを作成し、バッファエンジンを使用します。このテーブルに書き込むと、データはRAMにバッファリングされ、その後'merge.hits'テーブルに書き込まれます。単一のバッファが作成され、次のいずれかの場合にデータがフラッシュされます。
- 最後のフラッシュから100秒が経過した場合（`max_time`）または
- 100万行が書き込まれた場合（`max_rows`）または
- 100MBのデータが書き込まれた場合（`max_bytes`）または
- 10秒が経過し（`min_time`）、10,000行（`min_rows`）および10MB（`min_bytes`）のデータが書き込まれた場合

例えば、たった1行が書き込まれた場合、100秒後には必ずフラッシュされます。しかし、多くの行が書き込まれた場合、データは早めにフラッシュされます。

サーバーが停止した場合、`DROP TABLE`または`DETACH TABLE`を使用すると、バッファされたデータも宛先テーブルにフラッシュされます。

データベースやテーブル名に空の文字列をシングルクォートで指定することもできます。これは宛先テーブルが存在しないことを示します。この場合、データフラッシュ条件が達成されると、バッファは単にクリアされます。これは、メモリ内のデータウィンドウを保持するために役立つかもしれません。

バッファテーブルから読み取るときは、データはバッファと宛先テーブル（もし存在する場合）から処理されます。
バッファテーブルはインデックスをサポートしないことに注意してください。言い換えれば、バッファ内のデータは完全にスキャンされるため、大きなバッファでは遅くなることがあります。（従属テーブルのデータについては、対応するインデックスが使用されます。）

バッファテーブルのカラムのセットが従属テーブルのカラムのセットと一致しない場合、両方のテーブルに存在するカラムのサブセットが挿入されます。

バッファテーブルのカラムと従属テーブルのカラムの型が一致しない場合、サーバーログにエラーメッセージが記録され、バッファがクリアされます。
従属テーブルが存在しない場合も同様に、バッファがフラッシュされるとエラーが発生します。

:::note
2021年10月26日以前のリリースでバッファテーブルに対してALTERを実行すると、`Block structure mismatch`エラーが発生します（詳細は[#15117](https://github.com/ClickHouse/ClickHouse/issues/15117)および[#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)を参照）。したがって、バッファテーブルを削除してから再作成するのが唯一の選択肢です。このエラーがリリースで修正されたかどうかを確認してから、バッファテーブルに対してALTERを実行してください。
:::

サーバーが異常に再起動された場合、バッファ内のデータは失われます。

`FINAL`と`SAMPLE`はバッファテーブルに対して正しく機能しません。これらの条件は宛先テーブルに渡されますが、バッファ内のデータ処理には使用されません。これらの機能が必要な場合は、バッファテーブルでは書き込みを行うだけで、宛先テーブルから読み取ることをお勧めします。

バッファテーブルにデータを追加する際、1つのバッファがロックされます。これにより、テーブルからの読み取り操作が同時に行われている場合に遅延が発生します。

バッファテーブルに挿入されたデータは、従属テーブルに異なる順序や異なるブロックで保存される可能性があります。このため、バッファテーブルを使用してCollapsingMergeTreeに書き込むのは難しいです。問題を避けるために、`num_layers`を1に設定することができます。

宛先テーブルがレプリケートされている場合、バッファテーブルへの書き込み時に、レプリケートテーブルの期待される特性の一部が失われます。行の順序やデータ部分のサイズのランダムな変更により、データの重複排除が機能しなくなり、レプリケートテーブルに対して信頼できる「正確に一度」書き込みを行うことができなくなります。

これらの欠点により、バッファテーブルの使用は稀なケースに限って推奨されます。

バッファテーブルは、単位時間内に大量のサーバーから多くのINSERTを受け取った場合に使用され、データを挿入前にバッファリングできず、INSERTが十分に速く実行できない場合に利用されます。

バッファテーブルでも、1行ずつデータを挿入することは意味がないことに注意してください。これでは、1秒あたり数千行の速度しか得られず、より大きなデータブロックを挿入すると1秒間に100万行以上の速度を出すことができます。
