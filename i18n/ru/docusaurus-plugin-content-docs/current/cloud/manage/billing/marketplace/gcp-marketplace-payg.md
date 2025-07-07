---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace PAYG'
description: 'Подпишитесь на ClickHouse Cloud через GCP Marketplace (PAYG).'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';
import Image from '@theme/IdealImage';

Начните работать с ClickHouse Cloud в [GCP Marketplace](https://console.cloud.google.com/marketplace) через публичное предложение PAYG (оплата по мере использования).

## Предварительные требования {#prerequisites}

- Проект GCP, в котором включены права на покупку вашим администратором биллинга.
- Чтобы подписаться на ClickHouse Cloud в GCP Marketplace, вы должны войти в систему с учетной записью, которая имеет права на покупку, и выбрать соответствующий проект.

## Шаги для подписки {#steps-to-sign-up}

1. Перейдите в [GCP Marketplace](https://cloud.google.com/marketplace) и найдите ClickHouse Cloud. Убедитесь, что выбран правильный проект.

<Image img={gcp_marketplace_payg_1} size="md" alt="Главная страница GCP Marketplace" border/>

2. Нажмите на [листинг](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud) и затем на **Подписаться**.

<Image img={gcp_marketplace_payg_2} size="md" alt="ClickHouse Cloud в GCP Marketplace" border/>

3. На следующем экране настройте подписку:

- План по умолчанию будет "ClickHouse Cloud"
- Временной интервал подписки - "Ежемесячный"
- Выберите соответствующий счет для биллинга
- Примите условия и нажмите **Подписаться**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="Настройка подписки в GCP Marketplace" border/>

<br />

4. После того как вы нажмете **Подписаться**, появится модальное окно **Подписаться на ClickHouse**.

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="Модальное окно подписки в GCP Marketplace" border/>

<br />

5. Обратите внимание, что на этом этапе настройка еще не завершена. Вам нужно будет перейти на ClickHouse Cloud, нажав на **Настроить вашу учетную запись**, и зарегистрироваться в ClickHouse Cloud.

6. Как только вы перейдете на ClickHouse Cloud, вы можете войти в систему с существующей учетной записью или зарегистрироваться с новой учетной записью. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с биллингом GCP Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения вашей электронной почты вы можете покинуть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также потребуется предоставить некоторую основную информацию о вашем бизнесе. См. скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите в систему, используя свои учетные данные.

7. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим счетом для биллинга GCP, и все использования будут выставляться по вашему счету GCP.

8. Как только вы войдете в систему, вы можете подтвердить, что ваш биллинг действительно связан с GCP Marketplace, и начать настраивать ваши ресурсы ClickHouse Cloud.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Страница новых услуг ClickHouse Cloud" border/>

<br />

9. Вы должны получить электронное письмо, подтверждающее подписку:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="Подтверждение подписки по электронной почте GCP Marketplace" border/>

<br />

<br />

Если у вас возникнут какие-либо проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
