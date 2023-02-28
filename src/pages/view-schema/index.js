import React, { useState, useEffect } from "react";

import Editor from "../../components/Editor";
import { withRouter } from 'next/router'
import { Alert } from 'react-bootstrap';

const QueryApiEditorPage = ({ router }) => {
    const { accountId, indexerName } = router.query


    if (accountId == undefined || indexerName == undefined) {
        return (
            <>
                <Alert className="px-3 pt-3" variant="info">
                    Both accountId and IndexerName need to be specified in the URL.
                </Alert>
            </>
        )
    }
    return (
        <>
            <Editor accountId={accountId} indexerName={indexerName} onLoadErrorText="An error occured while trying to query indexer function details from registry." />
        </>
    );
};

export default withRouter(QueryApiEditorPage);
