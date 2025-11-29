---
description: 'Документация по родному TCP-интерфейсу ClickHouse'
sidebar_label: 'Родной интерфейс (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: 'Родной интерфейс (TCP)'
doc_type: 'reference'
---

# Нативный интерфейс (TCP) {#native-interface-tcp}

Нативный протокол используется в [клиенте командной строки](../interfaces/cli.md), для межсерверного взаимодействия при распределённой обработке запросов, а также в других C++‑программах. К сожалению, у нативного протокола ClickHouse пока нет формальной спецификации, но его можно восстановить методом реверс‑инжиниринга по исходному коду ClickHouse (начиная [примерно отсюда](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)) и/или перехватывая и анализируя TCP‑трафик.