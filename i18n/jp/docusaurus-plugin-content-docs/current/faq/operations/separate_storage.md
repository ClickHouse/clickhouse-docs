---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': 'ClickHouseをストレージと計算を分離してデプロイすることは可能か？'
'sidebar_label': 'ClickHouseをストレージと計算を分離してデプロイすることは可能か？'
'toc_hidden': true
'toc_priority': 20
'description': 'このページでは、ClickHouseをストレージと計算を分離してデプロイすることが可能かどうかについての回答を提供します。'
'doc_type': 'guide'
---

短い回答は「はい」です。

オブジェクトストレージ (S3, GCS) は、ClickHouse テーブル内のデータのための弾力的な主ストレージバックエンドとして使用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) および [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) ガイドが公開されています。この構成では、メタデータのみが計算ノードにローカルに保存されます。このセットアップでは、追加のノードがメタデータを複製するだけで済むため、計算リソースを簡単にスケールアップおよびスケールダウンできます。
