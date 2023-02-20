
import React from "react";

import CreateNewIndexer from "../../components/CreateNewIndexer";
import { withRouter } from 'next/router'


const CreateNewIndexerPage = ({ router }) => {
    const { accountId } = router.query

    if (accountId == undefined) {
        return (
            <>
                <h1>404</h1>
            </>
        )
    }
    return (
        <>
            <CreateNewIndexer accountId={accountId} />
        </>
    );
};

export default withRouter(CreateNewIndexerPage);
