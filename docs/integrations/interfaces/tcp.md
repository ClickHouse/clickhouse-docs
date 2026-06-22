---
description: 'Documentation for the native TCP interface in ClickHouse'
sidebar_label: 'Native interface (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: 'Native interface (TCP)'
doc_type: 'reference'
---


The native protocol is used in the [command-line client](/interfaces/cli), for inter-server communication during distributed query processing, and also in some language clients (e.g. [clickhouse-go](/integrations/go#connection-details)).

ClickHouse provides official specifications for the native protocol and the columnar format it carries:

- [Native Protocol](/interfaces/specs/NativeProtocol) — packet framing, the connection state machine, version negotiation, and the body of every non-`Block` message.
- [Native Format](/interfaces/specs/NativeFormat) — the `Block` and column structure, the per-type encodings, and the compression frame. This format also appears outside the TCP protocol, for example with `FORMAT Native` over HTTP.
