---
sidebar_label: '常见问题'
description: '对象存储 ClickPipes 常见问题'
slug: /integrations/clickpipes/object-storage/faq
sidebar_position: 1
title: '常见问题'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---



## 常见问题 {#faq}

<details>
<summary>ClickPipes 是否支持以 `gs://` 为前缀的 GCS 存储桶?</summary>

不支持。出于互操作性原因,请将 `gs://` 存储桶前缀替换为 `https://storage.googleapis.com/`。

</details>

<details>
<summary>GCS 公共存储桶需要哪些权限?</summary>

`allUsers` 需要分配适当的角色。必须在存储桶级别授予 `roles/storage.objectViewer` 角色。该角色提供 `storage.objects.list` 权限,允许 ClickPipes 列出存储桶中的所有对象,这是数据接入和摄取的必要条件。该角色还包括 `storage.objects.get` 权限,用于读取或下载存储桶中的单个对象。更多信息请参阅:[Google Cloud 访问控制](https://cloud.google.com/storage/docs/access-control/iam-roles)。

</details>
