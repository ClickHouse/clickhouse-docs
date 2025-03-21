---
slug: /architecture/introduction
sidebar_label: Введение
title: Введение
sidebar_position: 1
---
import ReplicationShardingTerminology from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

Эти примеры развертывания основаны на рекомендациях, предоставленных пользователям ClickHouse организацией поддержки и услуг ClickHouse. Это рабочие примеры, и мы рекомендуем вам попробовать их, а затем адаптировать под свои нужды. Вы можете найти здесь пример, который точно соответствует вашим требованиям. В альтернативном варианте, если вам нужно, чтобы данные реплицировались трижды вместо двух раз, вы сможете добавить еще одну реплику, следуя представленным здесь схемам.

<ReplicationShardingTerminology />

## Примеры {#examples}

### Основной {#basic}

- Пример [**Масштабирования**](/deployment-guides/horizontal-scaling.md) показывает, как разбить ваши данные на шардов между двумя узлами и использовать распределенную таблицу. Это приводит к тому, что данные находятся на двух узлах ClickHouse. Оба узла ClickHouse также запускают ClickHouse Keeper, обеспечивая распределенную синхронизацию. Третий узел запускает ClickHouse Keeper в автономном режиме для завершения кворума ClickHouse Keeper.

- Пример [**Репликации для отказоустойчивости**](/deployment-guides/replicated.md) показывает, как реплицировать ваши данные между двумя узлами и использовать таблицу ReplicatedMergeTree. Это приводит к тому, что данные находятся на двух узлах ClickHouse. В дополнение к двум узлам сервера ClickHouse есть три автономных узла ClickHouse Keeper для управления репликацией.

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
