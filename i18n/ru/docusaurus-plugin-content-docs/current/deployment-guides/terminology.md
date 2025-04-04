---
slug: /architecture/introduction
sidebar_label: 'Введение'
title: 'Введение'
sidebar_position: 1
description: 'Страница с примерами развертывания, основанными на рекомендациях организации поддержки и услуг ClickHouse для пользователей ClickHouse'
---

import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';

Эти примеры развертывания основаны на рекомендациях, предоставленных организации поддержки и услуг ClickHouse пользователям ClickHouse. Это работающие примеры, и мы рекомендуем вам попробовать их, а затем настроить их под свои нужды. Вы можете найти здесь пример, который точно соответствует вашим требованиям. В качестве альтернативы, если у вас есть требование, где данные реплицируются трижды вместо двух, вы должны иметь возможность добавить еще одну реплику, следуя представленным здесь шаблонам.

<ReplicationShardingTerminology />

## Примеры {#examples}

### Основной {#basic}

- Пример [**Масштабирования**](/deployment-guides/horizontal-scaling.md) показывает, как шардировать ваши данные по двум узлам и использовать распределённую таблицу. Это приводит к тому, что данные находятся на двух узлах ClickHouse. Два узла ClickHouse также запускают ClickHouse Keeper, обеспечивая распределенную синхронизацию. Третий узел запускает ClickHouse Keeper в автономном режиме для завершения кворума ClickHouse Keeper.

- Пример [**Репликация для отказоустойчивости**](/deployment-guides/replicated.md) показывает, как реплицировать ваши данные по двум узлам и использовать таблицу ReplicatedMergeTree. Это приводит к тому, что данные находятся на двух узлах ClickHouse. В дополнение к двум узлам сервера ClickHouse есть три узла ClickHouse Keeper в автономном режиме для управления репликацией.

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
