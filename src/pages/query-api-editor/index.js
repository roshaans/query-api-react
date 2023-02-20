import React from "react";

import Editor from "../../components/Editor";
import { withRouter } from 'next/router'

const QueryApiEditorPage = ({ router }) => {
    const { accountId, indexerName } = router.query
    if (accountId == undefined || indexerName == undefined) {
        return (
            <>
                <h1>404</h1>
            </>
        )
    }
    return (
        <>
            <Editor indexerPath={{ accountId: accountId, indexerName: indexerName }} />
        </>
    );
};

export default withRouter(QueryApiEditorPage);
