---
slug: /guides/sre/configuring-tls-acme-client
sidebar_label: 'Configuring ACME client'
sidebar_position: 20
title: 'Configuring ACME client'
description: 'This guide provides simple and minimal settings to configure ClickHouse to use OpenSSL certificates to validate connections.'
keywords: ['ACME configuration', 'TLS setup', 'OpenSSL certificates', 'secure connections', 'SRE guide', "Let's Encrypt"]
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';

# Configuring ACME client

<SelfManaged />

This guide provides describes how to configure ClickHouse to use ACME (RFC8555) protocol to automatically update TLS certificates.
