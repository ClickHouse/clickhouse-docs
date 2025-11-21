import React from 'react'
import Layout from '@theme/Layout'
import RedocApi from '../components/RedocApi/RedocApi'

export default function ClickstackApi() {
    return (
        <Layout
            title="ClickstackApi"
            description="ClickstackApi page"
            noFooter={true}
            wrapperClassName="redoc-page"
        >
            <RedocApi/>
        </Layout>
    )
}