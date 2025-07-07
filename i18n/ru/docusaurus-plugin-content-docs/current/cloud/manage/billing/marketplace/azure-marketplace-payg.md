---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace PAYG'
description: 'Подпишитесь на ClickHouse Cloud через Azure Marketplace (PAYG).'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
---

import Image from '@theme/IdealImage';
import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Начните работу с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через модель PAYG (оплата по мере использования) по публичному предложению.

## Предварительные условия {#prerequisites}

- Проект Azure, который активирован с правами на покупку вашим администратором выставления счетов.
- Для подписки на ClickHouse Cloud в Azure Marketplace вы должны войти в систему с учетной записью, имеющей права на покупку, и выбрать соответствующий проект.

1. Перейдите в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) и найдите ClickHouse Cloud. Убедитесь, что вы вошли в систему, чтобы иметь возможность приобрести предложение на маркетплейсе.

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

2. На странице списка продуктов нажмите **Получить сейчас**.

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

3. На следующем экране вам нужно будет указать имя, адрес электронной почты и местоположение.

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

4. На следующем экране нажмите **Подписаться**.

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

5. На следующем экране выберите подписку, группу ресурсов и местоположение группы ресурсов. Местоположение группы ресурсов не обязательно должно совпадать с местоположением, где вы планируете запустить свои услуги на ClickHouse Cloud.

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

6. Вам также нужно будет указать имя для подписки, а также выбрать срок выставления счетов из доступных вариантов. Вы можете выбрать, чтобы **Периодическая выставка счетов** была включена или отключена. Если вы установите ее "выключенной", ваш контракт завершится после окончания срока выставления счетов, и ваши ресурсы будут выведены из эксплуатации.

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

7. Нажмите **"Просмотреть + подписаться"**.

8. На следующем экране убедитесь, что все выглядит правильно, и нажмите **Подписаться**.

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

9. Обратите внимание, что на этом этапе вы подписались на подписку Azure ClickHouse Cloud, но еще не настроили свою учетную запись на ClickHouse Cloud. Следующие шаги необходимы и критически важны для того, чтобы ClickHouse Cloud смог связать вашу подписку Azure, чтобы выставление счетов происходило корректно через Azure Marketplace.

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

10. После завершения настройки Azure кнопка **Настроить учетную запись сейчас** должна стать активной.

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

11. Нажмите **Настроить учетную запись сейчас**.

<br />

Вы получите электронное письмо, подобное тому, что представлено ниже, с деталями о настройке вашей учетной записи:

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

12. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете либо зарегистрироваться с новой учетной записью, либо войти в систему, используя существующую учетную запись. После входа в систему будет создана новая организация, готовая к использованию и выставлению счетов через Azure Marketplace.

13. Вам нужно будет ответить на несколько вопросов - адрес и данные компании - прежде чем вы сможете продолжить.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud 2" border/>

<br />

14. После нажатия на **Завершить регистрацию** вы сможете перейти к вашей организации в ClickHouse Cloud, где сможете просмотреть экран выставления счетов, чтобы убедиться, что вам выставляют счета через Azure Marketplace, и создать услуги.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

15. Если у вас возникнут какие-либо проблемы, пожалуйста, не стесняйтесь обратиться в [нашу службу поддержки](https://clickhouse.com/support/program).
