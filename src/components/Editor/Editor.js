import React, { useEffect, useState } from 'react';

import MonacoEditor from '@monaco-editor/react';

import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { providers } from "near-api-js";
import { Button } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
const defaultCode = `function getBlock(block, context) {
  // Add your code here
  const h = block.header.height;
  context.set('height', h);
}`

const format_querried_code = (code) => {
  code = code.replace(/(?:\\[n])+/g, "\r\n")
  let unformatted_code = `function getBlock(block, context) {
     ${code};
  }`
  let formatted_code = prettier.format(unformatted_code, {
    parser: "babel",
    plugins: [parserBabel],
  });

  return formatted_code;
}
//network config (replace testnet with mainnet or betanet)
const provider = new providers.JsonRpcProvider(
  "https://archival-rpc.mainnet.near.org"
);
const contractId = "registry.queryapi.near"


const get_indexer_function_details = async (name) => {
  let args = { name };

  const result = await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: "read_indexer_function",
    args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
    finality: "optimistic",
  });

  return (
    result.result &&
    result.result.length > 0 &&
    JSON.parse(Buffer.from(result.result).toString())
  );
}

const Editor = (props) => {
  const [value, setValue] = useState(defaultCode);
  const [fullIndexerName, setFullIndexerName] = useState('');
  const [accountId, setAccountId] = useState(undefined);
  const [indexerName, setIndexerName] = useState(undefined);
  function handleReload(accountId, indexerName) {

    setFullIndexerName(`${accountId}/${indexerName}`)
    get_indexer_function_details(`${accountId}/${indexerName}`).then((code) => {
      setValue(format_querried_code(code));
    })
  }
  useEffect(() => {
    if (props.indexerPath !== undefined) {
      setAccountId(props.indexerPath.accountId);
      setIndexerName(props.indexerPath.indexerName);
    }
  }, []);

  useEffect(() => {
    if (accountId !== undefined && indexerName !== undefined) {
      handleReload(accountId, indexerName)
    }
  }, [accountId, indexerName])

  const reformat = (code) => {
    try {
      const formattedCode = prettier.format(code, {
        parser: "babel",
        plugins: [parserBabel],
      });
      setValue(formattedCode);
    } catch (e) {
      console.log(e);
    }
  }
  function handleRegister() {
    // Handle Register button click
    reformat(value)
    registerFunction(value)
  }

  useEffect(() => {
    window.parent.postMessage({ action: "request_indexer_details", from: "react" }, "*");
  }, []);

  const registerFunction = (value) => {
    if (value == undefined) return;
    const innerCode = value.match(/\{([\s\S]*)\}/)[1]
    // Send a message to other sources
    window.parent.postMessage({ action: "register_function", value: { indexerName: fullIndexerName.replace(" ", "_"), code: innerCode }, from: "react" }, "*");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {
        accountId && indexerName && <>
          <ButtonToolbar className="py-3" aria-label="Actions for Editor">
            <InputGroup className="px-3" style={{ width: '40%' }}>
              <InputGroup.Text id="btnGroupAddon">Indexer Name: </InputGroup.Text>
              <Form.Control
                type="text"
                value={fullIndexerName}
                disabled={true}
                aria-label="Registered Indexer Name"
                aria-describedby="btnGroupAddon"
              />
            </InputGroup>

            <ButtonGroup className="px-3 py-1" aria-label="Action Button Group">
              <Button variant="secondary" className="px-3" onClick={() => handleReload(accountId, indexerName)}> Reload</Button>{' '}
              <Button variant="primary" className="px-3" onClick={() => handleRegister()}> Save / Register</Button>{' '}
            </ButtonGroup>



          </ButtonToolbar></>}
      <MonacoEditor
        value={value}
        height="80vh"
        width="100%"
        defaultValue={defaultCode}
        defaultLanguage="javascript"
        theme="vs-dark"
        onChange={(text) => setValue(text)}
      />

    </div>);
}

export default Editor;
