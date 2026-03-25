---
title: 'Поддерживает ли ClickHouse распределённый JOIN?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse поддерживает распределённый JOIN'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# Поддерживает ли ClickHouse распределённый JOIN? \{#does-clickhouse-support-distributed-joins\}

Да, ClickHouse поддерживает распределённый JOIN в кластере.

Когда данные совместно размещены в кластере (например, если JOIN выполняется по идентификатору пользователя, который также является ключом шардирования), ClickHouse предоставляет способ выполнять JOIN без перемещения данных по сети.

Когда данные не размещены совместно, ClickHouse поддерживает широковещательный JOIN, при котором части объединяемых данных распределяются по узлам кластера.

По состоянию на 2025 год ClickHouse не выполняет shuffle JOIN, то есть ни одна из сторон JOIN не перераспределяется по сети кластера в соответствии с ключами JOIN.

:::tip
Более общую информацию о JOIN в ClickHouse см. на странице [&quot;предложение JOIN&quot;](/sql-reference/statements/select/join#supported-types-of-join).
:::