---
sidebar_label: 'Часто задаваемые вопросы'
description: 'Часто задаваемые вопросы по ClickPipes для объектного хранилища'
slug: /integrations/clickpipes/object-storage/faq
sidebar_position: 1
title: 'Часто задаваемые вопросы'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---



## Часто задаваемые вопросы {#faq}

<details>
<summary>Поддерживает ли ClickPipes корзины GCS с префиксом `gs://`?</summary>

Нет. В целях обеспечения совместимости необходимо заменить префикс корзины `gs://` на `https://storage.googleapis.com/`.

</details>

<details>
<summary>Какие разрешения требуются для публичной корзины GCS?</summary>

Для `allUsers` требуется назначение соответствующей роли. Роль `roles/storage.objectViewer` должна быть предоставлена на уровне корзины. Эта роль предоставляет разрешение `storage.objects.list`, которое позволяет ClickPipes получать список всех объектов в корзине, что необходимо для подключения и приёма данных. Эта роль также включает разрешение `storage.objects.get`, которое требуется для чтения или скачивания отдельных объектов из корзины. Дополнительную информацию см. в документации [Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles).

</details>
