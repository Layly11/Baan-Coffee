import withAuthenticated from "@/hocs/withAuthenticated";
import Head from "next/head";
import { JSX } from "react";
import title from '../../constants/title.json'



const AuditLogPage = (): JSX.Element => {
    return (
        <>
        <Head>
            <title>{title.AUDIT_LOG}</title>
        </Head>
        </>
    )
}

export default withAuthenticated(AuditLogPage)