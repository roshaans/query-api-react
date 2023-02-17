import React, { useEffect, useState } from 'react';

import MonacoEditor from '@monaco-editor/react';

import useStyles from './useStyles';
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { Button } from '@material-ui/core';
import { providers } from "near-api-js";

const defaultCode = `function getBlock(block, context) {
  // Add your code here
  const h = block.header.height;
  context.set('height', h);
}`

const format_querried_code = (code) => {
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
  console.log("querying for the code!", args)

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
  const [inputValue, setInputValue] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Submitted value:', inputValue);
    // do something with the submitted value

    let code = await get_indexer_function_details(inputValue)
    code = code.replace(/(?:\\[n])+/g, "\r\n")
    console.log(code, "new code")
    setValue(format_querried_code(code));
  };
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
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
    window.parent.postMessage({ action: "register_function", value: innerCode, from: "react" }, "*");
    if (window === window.top) {
      console.log("not running from iframe")
    } else {
      console.log("running from iframe")
    }
  };


  return <>
    <div style={{ display: "flex", flexDirection: "column", borderRadius: "20px" }}>
      <label>
        name of the contract:
        <input type="text" value={inputValue} onChange={handleInputChange} />
      </label>
      <button onClick={handleSubmit}>Submit</button>
      <MonacoEditor
        value={value}
        height="80vh"
        defaultValue={defaultCode}
        defaultLanguage="javascript"
        theme="vs-dark"
        onChange={(text) => setValue(text)}
      />
      <Button style={{ height: "5vh", margin: "10px", justifySelf: "flex-end" }} variant="contained" onClick={() => {
        reformat(value)
        registerFunction(value)
      }}>
        Register Indexer
      </Button>
    </div></>;
}

export default Editor;
