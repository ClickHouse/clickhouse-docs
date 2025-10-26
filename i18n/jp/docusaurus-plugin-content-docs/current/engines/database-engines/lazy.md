---
'description': '最後のアクセスからわずか`expiration_time_in_seconds`秒だけ、テーブルをRAMに保持します。Logタイプのテーブルでのみ使用できます。'
'sidebar_label': '遅延'
'sidebar_position': 20
'slug': '/engines/database-engines/lazy'
'title': '遅延'
'doc_type': 'reference'
---


# Lazy

最後のアクセスから `expiration_time_in_seconds` 秒間のみ RAM にテーブルを保持します。*Log テーブルでのみ使用可能です。

多数の小さな *Log テーブルの格納に最適化されており、アクセス間の時間間隔が長い場合に適しています。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
