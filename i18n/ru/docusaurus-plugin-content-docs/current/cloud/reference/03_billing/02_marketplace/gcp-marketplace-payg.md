---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'Модель PAYG в GCP Marketplace'
description: 'Оформите подписку на ClickHouse Cloud через GCP Marketplace (PAYG).'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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

Начните работу с ClickHouse Cloud на [GCP Marketplace](https://console.cloud.google.com/marketplace) по публичному предложению с оплатой по мере использования (PAYG, Pay-as-you-go).


## Предварительные требования {#prerequisites}

- Проект GCP, в котором ваш администратор биллинга включил возможность совершать покупки.
- Чтобы оформить подписку на ClickHouse Cloud в GCP Marketplace, войдите под учетной записью с правами на совершение покупок и выберите соответствующий проект.



## Шаги для регистрации {#steps-to-sign-up}

1. Перейдите в [GCP Marketplace](https://cloud.google.com/marketplace) и найдите ClickHouse Cloud. Убедитесь, что выбран корректный проект.

<Image img={gcp_marketplace_payg_1} size="md" alt="Домашняя страница GCP Marketplace" border/>

2. Нажмите на [страницу продукта](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud), а затем на **Subscribe**.

<Image img={gcp_marketplace_payg_2} size="md" alt="ClickHouse Cloud в GCP Marketplace" border/>

3. На следующем экране настройте подписку:

- План по умолчанию — «ClickHouse Cloud»
- Период подписки — «Monthly»
- Выберите соответствующий платежный аккаунт
- Примите условия и нажмите **Subscribe**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="Настройка подписки в GCP Marketplace" border/>

<br />

4. После нажатия **Subscribe** вы увидите модальное окно **Sign up with ClickHouse**.

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="Модальное окно регистрации GCP Marketplace" border/>

<br />

5. Обратите внимание, что на этом этапе настройка еще не завершена. Вам необходимо перейти в ClickHouse Cloud, нажав **Set up your account** и зарегистрировавшись в ClickHouse Cloud.

6. После перехода в ClickHouse Cloud вы можете либо войти с существующей учетной записью, либо зарегистрировать новую. Этот шаг очень важен, чтобы мы могли привязать вашу организацию ClickHouse Cloud к биллингу GCP Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Register** в нижней части страницы. Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты. После подтверждения электронной почты вы можете закрыть страницу входа ClickHouse Cloud и войти, используя новое имя пользователя, на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторую базовую информацию о вашей компании. См. скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма с информацией для регистрации в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма с информацией для регистрации в ClickHouse Cloud 2" border/>

<br />

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учетные данные.

7. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет привязана к вашему платежному аккаунту GCP, и все использование сервиса будет выставляться через ваш аккаунт GCP.

8. После входа вы можете убедиться, что ваш биллинг действительно привязан к GCP Marketplace, и начать настройку ресурсов ClickHouse Cloud.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Страница новых сервисов ClickHouse Cloud" border/>

<br />

9. Вы получите электронное письмо с подтверждением регистрации:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="Подтверждающее письмо GCP Marketplace" border/>

<br />

<br />

Если у вас возникнут какие-либо проблемы, пожалуйста, свяжитесь с [нашей командой поддержки](https://clickhouse.com/support/program).
