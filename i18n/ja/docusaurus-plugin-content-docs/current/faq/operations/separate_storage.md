---
slug: /faq/operations/deploy-separate-storage-and-compute
title: ClickHouseをストレージとコンピュートを分離してデプロイすることは可能ですか？
sidebar_label: ClickHouseをストレージとコンピュートを分離してデプロイすることは可能ですか？
toc_hidden: true
toc_priority: 20
---

短い答えは「はい」です。

オブジェクトストレージ（S3、GCS）をClickHouseテーブルのデータ用の弾力的な主ストレージバックエンドとして使用できます。[S3をバックエンドとしたMergeTree](/integrations/data-ingestion/s3/index.md)および[GCSをバックエンドとしたMergeTree](/integrations/data-ingestion/gcs/index.md)のガイドが公開されています。この構成では、メタデータのみが計算ノードにローカルに保存されます。このセットアップでは、追加ノードがメタデータをレプリケートする必要があるだけなので、コンピュートリソースを簡単にスケールアップおよびスケールダウンすることができます。
