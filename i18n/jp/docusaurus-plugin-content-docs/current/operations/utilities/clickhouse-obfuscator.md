---
'description': 'Clickhouse Obfuscatorのドキュメント'
'slug': '/operations/utilities/clickhouse-obfuscator'
'title': 'clickhouse-obfuscator'
---



A simple tool for table data obfuscation.

It reads an input table and produces an output table, that retains some properties of input, but contains different data. It allows publishing almost real production data for usage in benchmarks.

It is designed to retain the following properties of data:
- cardinalities of values (number of distinct values) for every column and every tuple of columns;
- conditional cardinalities: number of distinct values of one column under the condition on the value of another column;
- probability distributions of the absolute value of integers; the sign of signed integers; exponent and sign for floats;
- probability distributions of the length of strings;
- probability of zero values of numbers; empty strings and arrays, `NULL`s;

- data compression ratio when compressed with LZ77 and entropy family of codecs;
- continuity (magnitude of difference) of time values across the table; continuity of floating-point values;
- date component of `DateTime` values;

- UTF-8 validity of string values;
- string values look natural.

Most of the properties above are viable for performance testing:

reading data, filtering, aggregation, and sorting will work at almost the same speed as on original data due to saved cardinalities, magnitudes, compression ratios, etc.

It works in a deterministic fashion: you define a seed value and the transformation is determined by input data and by seed. Some transformations are one to one and could be reversed, so you need to have a large seed and keep it in secret.

It uses some cryptographic primitives to transform data but from the cryptographic point of view, it does not do it properly, that is why you should not consider the result as secure unless you have another reason. The result may retain some data you don't want to publish.

It always leaves 0, 1, -1 numbers, dates, lengths of arrays, and null flags exactly as in source data. For example, you have a column `IsMobile` in your table with values 0 and 1. In transformed data, it will have the same value.

So, the user will be able to count the exact ratio of mobile traffic.

Let's give another example. When you have some private data in your table, like user email, and you don't want to publish any single email address. If your table is large enough and contains multiple different emails and no email has a very high frequency than all others, it will anonymize all data. But if you have a small number of different values in a column, it can reproduce some of them. You should look at the working algorithm of this tool and fine-tune its command line parameters.

This tool works fine only with at least a moderate amount of data (at least 1000s of rows).

---

テーブルデータの匿名化のためのシンプルなツールです。

入力テーブルを読み取り、いくつかのプロパティを保持しつつ異なるデータを含む出力テーブルを生成します。これにより、ベンチマークで使用するためにほぼ実際の生産データを公開することができます。

次のデータプロパティを保持するように設計されています：
- 各カラムおよび各カラムのタプルの値のカーディナリティ（異なる値の数）；
- 他のカラムの値に関する条件下での1つのカラムの異なる値の数、条件付きカーディナリティ；
- 整数の絶対値の確率分布；符号付き整数の符号；浮動小数点数の指数と符号；
- 文字列の長さの確率分布；
- 数値のゼロ値、空の文字列や配列、`NULL`の確率；

- LZ77およびエントロピーファミリーのコーデックで圧縮したときのデータ圧縮比；
- テーブル全体の時間値の連続性（差の大きさ）；浮動小数点値の連続性；
- `DateTime`値の日時コンポーネント；

- 文字列値のUTF-8有効性；
- 文字列値が自然に見えること。

上記のプロパティのほとんどは、パフォーマンステストに適しています：

データの読み取り、フィルタリング、集約、並べ替えは、保存されたカーディナリティ、マグニチュード、圧縮比などがあるため、元のデータとほぼ同じ速度で動作します。

このツールは確定的に動作します：シード値を定義し、変換は入力データとシードによって決まります。一部の変換は一対一であり、逆にすることができるため、大きなシードを持ち、それを秘密に保つ必要があります。

データを変換するためにいくつかの暗号的プリミティブを使用しますが、暗号的視点からは正確には行っていないため、他に理由がない限り、結果を安全とは見なさないでください。結果には公開したくないデータが含まれている可能性があります。

常に0、1、-1の数字、日付、配列の長さ、NULLフラグをソースデータと完全に同じように残します。たとえば、テーブルに値0と1を持つカラム `IsMobile` がある場合、変換データでは同じ値になります。

したがって、ユーザーはモバイルトラフィックの正確な比率をカウントできるようになります。

もう1つの例を挙げましょう。テーブルにユーザーのメールアドレスのようなプライベートデータがあり、単一のメールアドレスを公開したくない場合です。テーブルが十分に大きく、複数の異なるメールアドレスが含まれ、どのメールも他のすべてより非常に高い頻度を持っていない場合、それはすべてのデータを匿名化します。しかし、カラムに異なる値が少数ある場合、一部の値を再生することがあります。このツールの動作アルゴリズムを確認し、コマンドラインパラメータを微調整する必要があります。

このツールは、少なくとも中程度の量のデータ（少なくとも1000行以上）でのみ正常に動作します。
