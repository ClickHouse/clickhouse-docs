---
title: 'Настройка частной сети'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: 'Настройка частной сети'
hide_title: true
description: 'Страница оглавления раздела настройки частной сети BYOC в ClickHouse Cloud'
doc_type: 'landing-page'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'privatelink', 'private service connect']
---

# Настройка частной сети \{#private-networking-setup\}

ClickHouse BYOC поддерживает различные варианты частного сетевого подключения, которые повышают безопасность и позволяют напрямую подключать ваши сервисы. В этом руководстве описаны рекомендуемые способы безопасного подключения развертываний ClickHouse Cloud в вашем собственном аккаунте AWS или GCP к другим сетям или сервисам, например к внутренним приложениям или аналитическим инструментам. Мы рассматриваем такие варианты, как VPC Peering, AWS PrivateLink и GCP Private Service Connect, а также описываем основные шаги и ключевые моменты для каждого из них.

Если для вашего развертывания ClickHouse BYOC требуется частное сетевое подключение, выполните шаги из соответствующих руководств или обратитесь в службу поддержки ClickHouse за помощью с более сложными сценариями.