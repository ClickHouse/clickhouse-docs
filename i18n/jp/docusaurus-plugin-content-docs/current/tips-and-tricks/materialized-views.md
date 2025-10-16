---
'sidebar_position': 1
'slug': '/tips-and-tricks/materialized-views'
'sidebar_label': 'Materialized Views'
'doc_type': 'guide'
'keywords':
- 'clickhouse materialized views'
- 'materialized view optimization'
- 'materialized view storage issues'
- 'materialized view best practices'
- 'database aggregation patterns'
- 'materialized view anti-patterns'
- 'storage explosion problems'
- 'materialized view performance'
- 'database view optimization'
- 'aggregation strategy'
- 'materialized view troubleshooting'
- 'view storage overhead'
'title': 'レッスン - Materialized Views'
'description': '実世界の例に基づくMaterialized Views、問題と解決策'
---


# Materialized views: how they can become a double edged sword {#materialized-views-the-double-edged-sword}

*このガイドは、コミュニティミートアップから得られた知見のコレクションの一部です。現実的なソリューションと洞察については、[特定の問題でブラウズする](./community-wisdom.md)ことができます。*
*データベースのパーツが多すぎて困っていますか？ [パーツが多すぎる](./too-many-parts.md)コミュニティの洞察ガイドをチェックしてください。*
*より詳細な情報は、[Materialized Views](/materialized-views)をご覧ください。*

## The 10x storage anti-pattern {#storage-antipattern}

**実際のプロダクション問題:** *「マテリアライズド ビューがありました。生のログテーブルは約20ギガですが、そのログテーブルからのビューは190ギガに膨れ上がり、生のテーブルのサイズの10倍近くになりました。これは、属性ごとに1行を作成していて、各ログには10の属性があるために発生しました。」*

**ルール:** `GROUP BY` が削除する行よりも多くの行を作成する場合、高価なインデックスを構築しているだけで、マテリアライズドビューを構築しているわけではありません。

## Production materialized view health validation {#mv-health-validation}

このクエリは、マテリアライズド ビューを作成する前に、そのビューがデータを圧縮するか、膨張するかを予測するのに役立ちます。実際のテーブルとカラムに対して実行して、「190GBの爆発」を回避してください。

**表示内容:**
- **低い集約比** (\<10%) = 良いMV、重要な圧縮
- **高い集約比** (\>70%) = 悪いMV、ストレージ爆発のリスク
- **ストレージ倍率** = MVがどれほど大きくまたは小さくなるか

```sql
-- Replace with your actual table and columns
SELECT 
    count() as total_rows,
    uniq(your_group_by_columns) as unique_combinations,
    round(uniq(your_group_by_columns) / count() * 100, 2) as aggregation_ratio
FROM your_table
WHERE your_filter_conditions;

-- If aggregation_ratio > 70%, reconsider your MV design
-- If aggregation_ratio < 10%, you'll get good compression
```

## When materialized views become a problem {#mv-problems}

**監視する警告サイン:**
- 挿入のレイテンシが増加（10msかかっていたクエリが現在は100ms以上かかる）
- 「パーツが多すぎる」エラーが頻繁に発生
- 挿入操作中のCPUスパイク
- 以前は発生しなかった挿入タイムアウト

`system.query_log` を使用して、MVを追加する前後の挿入パフォーマンスを比較し、クエリの所要時間の傾向を追跡できます。

## Video sources {#video-sources}
- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - 「マテリアライズドビューに過剰に熱心」および「20GB→190GBの爆発」ケーススタディの出典
