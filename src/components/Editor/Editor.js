import React, { useEffect, useState } from 'react';

import MonacoEditor from '@monaco-editor/react';

import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { providers } from "near-api-js";
import { useRouter } from 'next/router'
import { Container, Row, Col, Button } from 'react-bootstrap';
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

  console.log("result from calling code", JSON.parse(Buffer.from(result.result).toString()))
  return (
    result.result &&
    result.result.length > 0 &&
    JSON.parse(Buffer.from(result.result).toString())
  );
}

const Editor = (props) => {
  const [value, setValue] = useState(props.value ?? defaultCode);
  const [fullIndexerName, setFullIndexerName] = useState('');
  const router = useRouter()
  const { accountId, indexerName } = router.query
  function handleReload() {
    if (accountId && indexerName) {
      setFullIndexerName(`${accountId}/${indexerName}`)
      get_indexer_function_details(`${accountId}/${indexerName}`).then((code) => {
        setValue(format_querried_code(code));
      })
    }
  }

  useEffect(() => {

    handleReload()
  }, [accountId, indexerName])


  useEffect(() => {
    const handleMessage = async (event) => {
      if (!("action" in event.data)) {
        console.log("no action in event data")
        return;
      };
      // Handle the message received from the parent window
      console.log('Message received', event.data);
      if (event.data.action == "subscription_request") {
        console.log("subscription_request, form iframe");
        const { action, value } = event.data;
        console.log("value", event.data)
        const code = await get_indexer_function_details(`${value.accountId} /${value.indexer_function_name}`)
        setValue(format_querried_code(code));
      }
    };

    window.addEventListener('message', handleMessage);
    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);


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



  // useEffect(() => {
  //   const handleMessage = (event) => {
  //     // Handle the message received from the parent window
  //     console.log('Message received:', event.data);
  //   };

  //   window.addEventListener('message', handleMessage);

  //   // Clean up the event listener when the component is unmounted
  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //   };
  // }, []);

  const registerFunction = (value) => {
    if (value == undefined) return;
    const innerCode = value.match(/\{([\s\S]*)\}/)[1]
    // Send a message to other sources
    console.log("sending message to parent")
    window.parent.postMessage({ action: "register_function", value: { indexerName: fullIndexerName.replace(" ", "_"), code: innerCode }, from: "react" }, "*");
  };
  // Define a variable to store the iframe element


  return <>
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* <label>
        name of the contract to load/create:
        <input type="text" value={fullIndexerName} onChange={handleInputChange} />
      </label> */}
      {/* <button onClick={handleSubmit}>Submit</button> */}
      <ButtonToolbar className="py-3" aria-label="Actions for Editor">
        <InputGroup className="px-3" style={{ width: '40%' }}>
          <InputGroup.Text id="btnGroupAddon">@</InputGroup.Text>
          <Form.Control
            type="text"
            value={fullIndexerName}
            disabled={true}
            aria-label="Registered Indexer Name"
            aria-describedby="btnGroupAddon"
          />
        </InputGroup>
        <ButtonGroup className="px-3 py-1" aria-label="Action Button Group">
          <Button variant="secondary" className="px-3" onClick={handleReload}> Reload</Button>{' '}
          <Button variant="primary" className="px-3" onClick={handleRegister}> Save / Register</Button>{' '}
        </ButtonGroup>
      </ButtonToolbar>
      <MonacoEditor
        value={value}
        height="80vh"
        width="100%"
        defaultValue={defaultCode}
        defaultLanguage="javascript"
        theme="vs-dark"
        onChange={(text) => setValue(text)}
      />

    </div></>;
}

export default Editor;
