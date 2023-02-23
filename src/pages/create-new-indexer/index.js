
import React from "react";

import CreateNewIndexer from "../../components/CreateNewIndexer";
import { withRouter } from 'next/router'


const CreateNewIndexerPage = ({ router }) => {
    const { accountId } = router.query

    if (accountId == undefined) {
        return (
            <>
                <h1>AccountId needs to be specified in the URL </h1>
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
