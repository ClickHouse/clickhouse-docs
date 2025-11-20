---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: 'Контракт с обязательствами в GCP Marketplace'
description: 'Оформление подписки на ClickHouse Cloud через GCP Marketplace (контракт с обязательствами)'
keywords: ['gcp', 'google', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import gcp_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-1.png';
import gcp_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-2.png';
import gcp_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-3.png';
import gcp_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-4.png';
import gcp_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-5.png';
import gcp_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-6.png';
import gcp_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-7.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

Начните работу с ClickHouse Cloud в [GCP Marketplace](https://console.cloud.google.com/marketplace) по фиксированному контракту. Фиксированный контракт, также известный как Private Offer, позволяет клиентам заранее обязаться потратить определённую сумму на ClickHouse Cloud за определённый период времени.


## Предварительные условия {#prerequisites}

- Индивидуальное предложение от ClickHouse на основе конкретных условий договора.


## Шаги для регистрации {#steps-to-sign-up}

1. Вы должны были получить письмо со ссылкой для просмотра и принятия вашего индивидуального предложения.

<br />

<Image
  img={gcp_marketplace_committed_1}
  size='md'
  alt='Письмо с индивидуальным предложением GCP Marketplace'
  border
/>

<br />

2. Нажмите на ссылку **Review Offer** в письме. Вы будете перенаправлены на страницу GCP Marketplace с деталями индивидуального предложения.

<br />

<Image
  img={gcp_marketplace_committed_2}
  size='md'
  alt='Сводка предложения GCP Marketplace'
  border
/>

<br />

<Image
  img={gcp_marketplace_committed_3}
  size='md'
  alt='Сводка цен GCP Marketplace'
  border
/>

<br />

3. Просмотрите детали индивидуального предложения и, если всё верно, нажмите **Accept**.

<br />

<Image
  img={gcp_marketplace_committed_4}
  size='md'
  alt='Страница принятия предложения GCP Marketplace'
  border
/>

<br />

4. Нажмите на **Go to product page**.

<br />

<Image
  img={gcp_marketplace_committed_5}
  size='md'
  alt='Подтверждение принятия предложения GCP Marketplace'
  border
/>

<br />

5. Нажмите на **Manage on provider**.

<br />

<Image
  img={gcp_marketplace_committed_6}
  size='md'
  alt='Страница ClickHouse Cloud в GCP Marketplace'
  border
/>

<br />

Критически важно на этом этапе перейти в ClickHouse Cloud и зарегистрироваться или войти в систему. Без выполнения этого шага мы не сможем связать вашу подписку GCP Marketplace с ClickHouse Cloud.

<br />

<Image
  img={gcp_marketplace_committed_7}
  size='md'
  alt='Модальное окно подтверждения перехода на внешний сайт GCP Marketplace'
  border
/>

<br />

6. После перенаправления в ClickHouse Cloud вы можете либо войти с существующей учётной записью, либо зарегистрировать новую.

<br />

<Image
  img={aws_marketplace_payg_6}
  size='md'
  alt='Страница входа в ClickHouse Cloud'
  border
/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Register** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты. После подтверждения электронной почты вы можете закрыть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя, по адресу [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image
  img={aws_marketplace_payg_7}
  size='md'
  alt='Страница регистрации в ClickHouse Cloud'
  border
/>

<br />

Обратите внимание, что если вы новый пользователь, вам также потребуется предоставить базовую информацию о вашей компании. См. скриншоты ниже.

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='Форма информации для регистрации в ClickHouse Cloud'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='Форма информации для регистрации в ClickHouse Cloud 2'
  border
/>

<br />

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учётные данные.

7. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет подключена к вашему платёжному аккаунту GCP, и все расходы будут выставляться через ваш аккаунт GCP.

8. После входа вы можете подтвердить, что ваше выставление счетов действительно привязано к GCP Marketplace, и начать настройку ресурсов ClickHouse Cloud.

<br />

<Image
  img={gcp_marketplace_payg_5}
  size='md'
  alt='Страница входа в ClickHouse Cloud'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_11}
  size='md'
  alt='Страница новых сервисов ClickHouse Cloud'
  border
/>

<br />

9. Вы должны получить письмо с подтверждением регистрации:

<br />
<br />

<Image
  img={gcp_marketplace_payg_6}
  size='md'
  alt='Письмо с подтверждением от GCP Marketplace'
  border
/>

<br />

<br />

Если у вас возникнут какие-либо проблемы, пожалуйста, не стесняйтесь обращаться к [нашей команде поддержки](https://clickhouse.com/support/program).
