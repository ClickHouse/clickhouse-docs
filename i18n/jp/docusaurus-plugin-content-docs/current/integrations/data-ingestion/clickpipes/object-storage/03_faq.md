---
sidebar_label: 'FAQ'
description: 'オブジェクトストレージ ClickPipes の FAQ'
slug: /integrations/clickpipes/object-storage/faq
sidebar_position: 1
title: 'FAQ'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---



## よくある質問 {#faq}

<details>
<summary>ClickPipesは`gs://`プレフィックス付きのGCSバケットをサポートしていますか？</summary>

いいえ。相互運用性の理由により、`gs://`バケットプレフィックスを`https://storage.googleapis.com/`に置き換えていただく必要があります。

</details>

<details>
<summary>GCSパブリックバケットにはどのような権限が必要ですか？</summary>

`allUsers`には適切なロールの割り当てが必要です。`roles/storage.objectViewer`ロールはバケットレベルで付与する必要があります。このロールは`storage.objects.list`権限を提供し、ClickPipesがバケット内のすべてのオブジェクトを一覧表示できるようにします。これはオンボーディングとデータ取り込みに必要です。このロールには`storage.objects.get`権限も含まれており、バケット内の個々のオブジェクトの読み取りまたはダウンロードに必要です。詳細については、[Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles)を参照してください。

</details>
