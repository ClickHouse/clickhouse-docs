---
slug: /dictionary/best-practices
title: 'Dictionaryのベストプラクティス'
sidebar_label: 'ベストプラクティス'
description: '辞書レイアウトの選び方、辞書とJOINの使い分け、辞書の使用状況を監視する方法に関するガイドライン。'
doc_type: 'guide'
keywords: ['dictionary', 'dictionaries', 'layout', 'dictGet', 'JOIN', 'hashed', 'flat', 'performance']
---

# Dictionaryのベストプラクティス \{#dictionary-best-practices\}

このページでは、適切な辞書レイアウトを選ぶための実践的な指針、どのような場合に辞書が JOIN より高い性能を発揮するのか (また、そうでないのはどのような場合か) 、そして辞書の使用状況を監視する方法について説明します。

実例を交えた辞書の概要については、[Dictionary ガイド](/dictionary)を参照してください。

## 辞書とJOINを利用するタイミング \{#when-to-use-dictionaries-vs-joins\}

辞書は、JOINの片側がメモリに収まるルックアップテーブルである場合に最も効果的です。通常のJOINでは、ClickHouseはまず右側からハッシュテーブルを構築し、その後で左側を照合します。多くの行が後で`WHERE`フィルタによって除外される場合でも、これは変わりません。最近のバージョン (24.12+) では、多くのケースでJOINの前にフィルタが適用されるようになりましたが、それでもこのオーバーヘッドを常に解消できるわけではありません。これに対して辞書では、`dictGet`をインラインで呼び出すため、ルックアップはすでにフィルタを通過した行に対してのみ実行されます。

ただし、`dictGet`が常に適切な選択肢とは限りません。テーブル内のかなり多くの行に対して`dictGet`を呼び出す必要がある場合、たとえば`dictGet('dict', 'elevation', id) > 1800`のような`WHERE`条件では、ネイティブ索引を持つ通常のカラムを使うほうが適していることがあります。ClickHouseは通常のカラムに対して`PREWHERE`を使ってグラニュールをスキップできますが、`dictGet`は索引の支援なしに行ごとに評価されます。

経験則としては、次のとおりです。

* ルックアップキーがすでに利用可能な、小さなディメンションテーブルに対するJOINの置き換えには辞書を使用します。
* 多くの行に対してルックアップした値でフィルタする場合は、通常のカラムと索引を使用します。

## レイアウトの選択 \{#choosing-a-layout\}

`LAYOUT` 句は、辞書の内部データ構造を制御します。利用可能なすべてのレイアウトについては、[layouts reference](/sql-reference/statements/create/dictionary/layouts#storing-dictionaries-in-memory) を参照してください。

レイアウトを選ぶ際は、次の指針に従ってください。

* **`flat`** — 最も高速なレイアウトです (単純な配列オフセット参照) 。ただし、キーは `UInt64` である必要があり、デフォルトでは 500,000 (`max_array_size`) までに制限されます。小〜中規模のテーブルで、単調増加する整数キーに最適です。キー分布がスパースな場合 (たとえばキー値が 1 と 500,000 の場合) 、配列サイズが最大キーに合わせて決まるため、メモリを無駄にします。500k の上限に達するようなら、`hashed_array` への切り替えを検討してください。
* **`hashed_array`** — ほとんどのケースで推奨されるデフォルトです。属性は配列に格納し、ハッシュテーブルでキーを配列インデックスに対応付けます。`hashed` とほぼ同等の速度で、特に属性数が多い場合はメモリ効率に優れます。
* **`hashed`** — 辞書全体をハッシュテーブルに格納します。属性数がごく少ない場合は `hashed_array` より高速になることがありますが、属性数が増えるにつれてメモリ消費も大きくなります。
* **`complex_key_hashed` / `complex_key_hashed_array`** — キーを `UInt64` にキャストできない場合 (たとえば `String` キー) に使用します。性能面でのトレードオフは、対応する非複合キー版と同じです。
* **`sparse_hashed`** — `hashed` よりメモリ使用量を抑える代わりに、CPU コストが増えます。最適な選択になることはまれで、効率的なのは属性が 1 つしかない場合にほぼ限られます。ほとんどの場合、`hashed_array` の方が適しています。
* **`cache` / `ssd_cache`** — 頻繁にアクセスされるキーだけをキャッシュします。データセット全体がメモリに収まらない場合に有用ですが、キャッシュミス時の参照ではソースにアクセスする可能性があります。レイテンシに敏感な workload には推奨されません。
* **`direct`** — インメモリに保持せず、参照のたびにソースへ問い合わせます。データの更新頻度が高く、キャッシュに向かない場合や、辞書が大きすぎてメモリに収まらない場合に使用してください。

## 辞書の使用状況を監視する \{#monitoring-dictionary-usage\}

[`system.dictionaries`](/operations/system-tables/dictionaries) テーブルを使用して、メモリ使用量と健全性を確認します。

```sql
SELECT
    name,
    status,
    element_count,
    formatReadableSize(bytes_allocated) AS size,
    query_count,
    hit_rate,
    found_rate,
    last_exception
FROM system.dictionaries
```

主なカラム:

* `bytes_allocated` — 辞書が使用しているメモリ量です。辞書はデータを圧縮せずに格納するため、圧縮後のテーブルサイズより大幅に大きくなることがあります。
* `hit_rate` と `found_rate` — `キャッシュ` レイアウトの有効性を評価する際に役立ちます。
* `last_exception` — 辞書の読み込みや更新に失敗した場合は、これを確認してください。
