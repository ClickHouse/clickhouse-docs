---
slug: /faq/operations/deploy-separate-storage-and-compute
title: ClickHouseをストレージと計算を別々にデプロイすることは可能ですか？
sidebar_label: ClickHouseをストレージと計算を別々にデプロイすることは可能ですか？
toc_hidden: true
toc_priority: 20
---

短い答えは「はい」です。

オブジェクトストレージ（S3、GCS）は、ClickHouseのテーブルにおけるデータの弾力性のある主ストレージバックエンドとして使用できます。[S3バックの MergeTree](/integrations/data-ingestion/s3/index.md)および[GCSバックの MergeTree](/integrations/data-ingestion/gcs/index.md)ガイドが公開されています。この構成では、メタデータのみが計算ノードにローカルで保存されます。このセットアップでは、追加のノードがメタデータを複製する必要があるため、計算リソースを簡単にアップスケールおよびダウンスケールすることができます。
