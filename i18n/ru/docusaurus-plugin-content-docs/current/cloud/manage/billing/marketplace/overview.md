---
slug: /cloud/marketplace/marketplace-billing
title: 'Оплата на Маркете'
description: 'Подпишитесь на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure.'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

Вы можете подписаться на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure. Это позволяет вам оплачивать ClickHouse Cloud через биллинг вашего существующего облачного провайдера.

Вы можете использовать модель pay-as-you-go (PAYG) или подписаться на контракт с ClickHouse Cloud через маркетплейс. Биллинг будет обрабатываться облачным провайдером, и вы получите единый счет за все ваши облачные услуги.

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## Часто задаваемые вопросы {#faqs}

### Как я могу проверить, что моя организация подключена к биллингу на маркетплейсе?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Billing**. Вы должны увидеть название маркетплейса и ссылку в разделе **Payment details**.

### Я существующий пользователь ClickHouse Cloud. Что произойдет, когда я подпишусь на ClickHouse Cloud через маркетплейс AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Подписка на ClickHouse Cloud из маркетплейса облачного провайдера — это двухшаговый процесс:
1. Сначала вы "подписываетесь" на ClickHouse Cloud на портале маркетплейса облачного провайдера. После завершения подписки нажмите "Pay Now" или "Manage on Provider" (в зависимости от маркетплейса). Это перенаправит вас на ClickHouse Cloud.
2. На ClickHouse Cloud вы можете либо зарегистрировать новый аккаунт, либо войти с существующим. В любом случае для вас будет создана новая организация ClickHouse Cloud, связанная с вашим биллингом на маркетплейсе.

ПРИМЕЧАНИЕ: Ваши существующие услуги и организации из предыдущих подписок на ClickHouse Cloud останутся и не будут связаны с биллингом на маркетплейсе. ClickHouse Cloud позволяет вам использовать одну и ту же учетную запись для управления несколькими организациями, каждая из которых имеет разный биллинг.

Вы можете переключаться между организациями из меню в нижнем левом углу консоли ClickHouse Cloud.

### Я существующий пользователь ClickHouse Cloud. Что мне делать, если я хочу, чтобы мои существующие услуги оплачивались через маркетплейс?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам нужно будет подписаться на ClickHouse Cloud через маркетплейс облачного провайдера. После завершения подписки на маркетплейсе и перенаправления на ClickHouse Cloud у вас будет возможность связать существующую организацию ClickHouse Cloud с биллингом на маркетплейсе. С этого момента ваши существующие ресурсы будут оплачиваться через маркетплейс.

<Image img={marketplace_signup_and_org_linking} size='md' alt='Marketplace signup and org linking' border/>

Вы можете подтвердить на странице биллинга организации, что биллинг действительно сейчас связан с маркетплейсом. Пожалуйста, свяжитесь с [ClickHouse Cloud support](https://clickhouse.com/support/program), если у вас возникнут какие-либо проблемы.

:::note
Ваши существующие услуги и организации из предыдущих подписок на ClickHouse Cloud останутся и не будут связаны с биллингом на маркетплейсе.
:::

### Я подписался на ClickHouse Cloud как пользователь маркетплейса. Как я могу отписаться?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто перестать использовать ClickHouse Cloud и удалить все существующие услуги ClickHouse Cloud. Несмотря на то, что подписка все еще будет активной, вы ничего не будете платить, так как ClickHouse Cloud не имеет регулярных платежей.

Если вы хотите отписаться, пожалуйста, перейдите в консоль облачного провайдера и отмените продление подписки там. После окончания подписки все существующие услуги будут остановлены, и вам будет предложено добавить кредитную карту. Если карта не была добавлена, после двух недель все существующие услуги будут удалены.

### Я подписался на ClickHouse Cloud как пользователь маркетплейса, а затем отписался. Теперь я хочу подписаться снова, каков процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В таком случае, пожалуйста, подпишитесь на ClickHouse Cloud как обычно (см. разделы о подписке на ClickHouse Cloud через маркетплейс).

- Для маркетплейса AWS будет создана новая организация ClickHouse Cloud, которая будет связана с маркетплейсом.
- Для маркетплейса GCP ваша старая организация будет вновь активирована.

Если у вас возникнут проблемы с реактивацией вашей организации на маркетплейсе, пожалуйста, свяжитесь с [ClickHouse Cloud Support](https://clickhouse.com/support/program).

### Как я могу получить свой счет за подписку на ClickHouse Cloud через маркетплейс?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль биллинга AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы на GCP Marketplace](https://console.cloud.google.com/marketplace/orders) (выберите счет для биллинга, который вы использовали для подписки)

### Почему даты в отчетах по использованию не совпадают с моим счетом за маркетплейс?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Биллинг на маркетплейсе следует календарному месячному циклу. Например, за использование с 1 декабря по 1 января счет будет сгенерирован с 3 по 5 января.

Отчеты по использованию ClickHouse Cloud следуют другому циклу биллинга, где использование измеряется и учитывается в течение 30 дней, начиная с момента подписки.

Даты использования и счета будут различаться, если эти даты не совпадают. Поскольку отчеты по использованию отслеживают использование по дням для данной услуги, пользователи могут полагаться на отчеты, чтобы увидеть разбивку затрат.

### Где я могу найти общую информацию о биллинге? {#where-can-i-find-general-billing-information}

Пожалуйста, смотрите [страницу общего обзора биллинга](/cloud/manage/billing).

### Существует ли разница в цене ClickHouse Cloud, оплачивая через маркетплейс облачного провайдера или напрямую ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Нет разницы в цене между биллингом на маркетплейсе и подпиской напрямую с ClickHouse. В любом случае, ваше использование ClickHouse Cloud отслеживается в терминах кредитов ClickHouse Cloud (CHCs), которые измеряются одинаковым образом и рассчитываются соответственно.
