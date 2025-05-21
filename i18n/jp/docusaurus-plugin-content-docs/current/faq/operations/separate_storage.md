---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'ClickHouseをストレージとコンピュートを分けてデプロイすることは可能ですか？'
sidebar_label: 'ClickHouseをストレージとコンピュートを分けてデプロイすることは可能ですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ClickHouseをストレージとコンピュートを分けてデプロイすることが可能かどうかについての回答を提供します'
---

短い回答は「はい」です。

オブジェクトストレージ（S3、GCS）は、ClickHouseテーブル内のデータに対する弾力的な主ストレージバックエンドとして使用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md)および[GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md)ガイドが公開されています。この構成では、メタデータのみがコンピュートノードにローカルに保存されます。このセットアップでは、追加のノードがメタデータを複製するだけでよいため、コンピュートリソースを容易にスケールアップおよびスケールダウンできます。
