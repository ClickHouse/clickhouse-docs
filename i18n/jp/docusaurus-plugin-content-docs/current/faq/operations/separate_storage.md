---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': 'ClickHouseのストレージと計算を別々に展開することは可能ですか？'
'sidebar_label': 'ClickHouseのストレージと計算を別々に展開することは可能ですか？'
'toc_hidden': true
'toc_priority': 20
'description': 'このページでは、ClickHouseをストレージと計算を別々に展開することが可能かどうかについて回答しています。'
---



短い答えは「はい」です。

オブジェクトストレージ（S3、GCS）は、ClickHouse テーブル内のデータのための弾力的な主ストレージバックエンドとして使用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md)および[GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) ガイドが公開されています。この構成では、メタデータのみが計算ノードにローカルに保存されます。このセットアップでは、追加のノードがメタデータをレプリケートする必要があるため、コンピューティングリソースを簡単に拡張および縮小できます。
