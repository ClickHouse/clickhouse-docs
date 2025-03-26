---
slug: /architecture/introduction
sidebar_label: 'Введение'
title: 'Введение'
sidebar_position: 1
description: 'Страница с примерами развертывания, основанными на рекомендациях, предоставленных пользователям ClickHouse организацией поддержки и услуг ClickHouse'
---

import ReplicationShardingTerminology from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

Эти примеры развертывания основаны на рекомендациях, предоставленных пользователям ClickHouse организацией поддержки и услуг ClickHouse. Это рабочие примеры, и мы рекомендуем вам попробовать их, а затем адаптировать в соответствии с вашими потребностями. Вы можете найти здесь пример, который соответствует вашим требованиям. Кроме того, если у вас есть требование, чтобы данные реплицировались трижды, а не дважды, вы должны быть в состоянии добавить еще одну реплику, следуя представленным здесь шаблонам.

<ReplicationShardingTerminology />

## Примеры {#examples}

### Основной {#basic}

- Пример [**Масштабирование**](/deployment-guides/horizontal-scaling.md) показывает, как разделить данные между двумя узлами и использовать распределенную таблицу. Это приводит к наличию данных на двух узлах ClickHouse. Два узла ClickHouse также запускают ClickHouse Keeper, обеспечивая распределенную синхронизацию. Третий узел запускает ClickHouse Keeper в автономном режиме, чтобы завершить кворум ClickHouse Keeper.

- Пример [**Репликация для отказоустойчивости**](/deployment-guides/replicated.md) показывает, как реплицировать ваши данные на два узла и использовать таблицу ReplicatedMergeTree. Это приводит к наличию данных на двух узлах ClickHouse. В дополнение к двум серверным узлам ClickHouse есть три автономных узла ClickHouse Keeper для управления репликацией.

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/vBjCJtw_Ei0"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

### Промежуточный {#intermediate}

- Скоро

### Продвинутый {#advanced}

- Скоро
