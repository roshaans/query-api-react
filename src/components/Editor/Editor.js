import React, { useEffect, useState, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import { providers } from 'near-api-js';
import {
  Button,
  Alert,
  Modal,
  ButtonGroup,
  ButtonToolbar,
  Form,
  InputGroup,
  Nav,
} from 'react-bootstrap';

const defaultCode = `function getBlock(block, context) {
       
  // Add your code here   
  const h = block.header().height;
  context.set('height', h);
}`

const defaultSchema = `
CREATE TABLE key_value (
  key text NOT NULL,
  value text NOT NULL
);
`

//network config (replace testnet with mainnet or betanet)
const provider = new providers.JsonRpcProvider(
  "https://archival-rpc.mainnet.near.org"
);
const contractId = "registry.queryapi.near"

// get latest block height
const getLatestBlockHeight = async () => {
  const provider = new providers.JsonRpcProvider(
    "https://archival-rpc.mainnet.near.org"
  );
  const latestBlock = await provider.block({
    finality: "final"
  });
  return latestBlock.header.height;
}

const get_indexer_function_details = async (name) => {
  let args = { function_name: name };

  try {
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
  catch (error) {
    console.log(error, "error")
    return null;
  }
}

const Editor = ({
  options,
  accountId,
  indexerName,
  onLoadErrorText,
  actionButtonText,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [showResetCodeModel, setShowResetCodeModel] = useState(false);
  const [fileName, setFileName] = useState("indexingLogic.js");
  const [indexingCode, setIndexingCode] = useState(defaultCode);
  const [schema, setSchema] = useState(defaultSchema);
  const [indexerNameField, setIndexerNameField] = useState(indexerName ?? "");
  const [selectedOption, setSelectedOption] = useState('latestBlockHeight');
  const [blockHeight, setBlockHeight] = useState(0);

  useEffect(() => {
    setBlockHeight(getLatestBlockHeight())
  }, [])

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  }
  useEffect(() => {
    console.log(indexingCode, 'indexingCode')
  }, [indexingCode])

  useEffect(() => {
    console.log(schema, 'schema')
  }, [schema])

  const format_SQL_code = (schema) => {
    return prettier.format(schema, {
      parser: "sql",
      plugins: [],
    });
  };
  const checkSQLSchemaFormatting = () => {
    try {
      // let formatted_code = format_SQL_code(schema);
      let formatted_schema = schema;

      return formatted_schema;
    }
    catch (error) {
      console.log("error", error)
      setError(() => "Please check your SQL schema formatting and specify an Indexer Name");
      return undefined;
    }
  }

  const registerFunction = async () => {
    if (selectedOption === "latestBlockHeight") {
      setBlockHeight(await getLatestBlockHeight())
    }

    let formatted_schema = checkSQLSchemaFormatting();

    if (indexerNameField == undefined || formatted_schema == undefined) {
      setError(() => "Please check your SQL schema formatting and specify an Indexer Name");
      return
    }
    setError(() => undefined);

    // Send a message to other sources
    window.parent.postMessage({ action: "register_function", value: { indexerName: indexerNameField.replace(" ", "_"), code: indexingCode, schema: formatted_schema, blockHeight: blockHeight }, from: "react" }, "*");
  };

  const handleReload = useCallback(async () => {
    if (options?.create_new_indexer == true) {
      setIndexingCode(defaultCode);
      setSchema(defaultSchema);
      return
    }
    const data = await get_indexer_function_details(accountId + "/" + indexerName)
    if (data == null) {
      setIndexingCode(defaultCode);
      setSchema(defaultSchema);
      setError(() => onLoadErrorText);
    } else {
      try {
        let unformatted_indexing_code = format_querried_code(data.code);
        let unformatted_schema = data.schema;
        if (unformatted_indexing_code !== null) {
          setIndexingCode(unformatted_indexing_code);
        }
        if (unformatted_schema !== null) {
          setSchema(unformatted_schema);
        }
      }
      catch (error) {
        console.log(error);
        setError(() => "An Error occured while trying to format the code.");
      }
    }
    setShowResetCodeModel(false)
  }, [accountId, indexerName, onLoadErrorText, options?.create_new_indexer])

  const format_querried_code = (code) => {
    code = code.replace(/(?:\\[n])+/g, "\r\n")
    let unformatted_code = `function getBlock(block, context) {
       ${code}
    }`
    return unformatted_code;
    //! Not formatting code on query in case invalid code was submitted to registry which will crash the react app. 
    // try {
    //   let formatted_code = prettier.format(unformatted_code, {
    //     parser: "babel",
    //     plugins: [parserBabel],
    //   });
    //   setError(() => undefined);
    //   return formatted_code;
    // } catch (error) {
    //   setError(() => "Oh snap! We could not format the queried code. The code in the registry contract may be invalid Javascript code. ");
    //   console.log(error);
    // }
  }


  useEffect(() => {
    console.log("loading from scratch")
    const load = async () => {
      setLoading(true)
      await handleReload()
      setLoading(false)
    }
    load()
  }, [accountId, handleReload, indexerName])


  const reformat = () => {
    return new Promise((resolve, reject) => {
      try {
        const formattedCode = prettier.format(indexingCode, {
          parser: "babel",
          plugins: [parserBabel],
        });
        setError(() => undefined);
        setIndexingCode(formattedCode);
        resolve(formattedCode);
      } catch (error) {
        setError(() => "Oh snap! We could not format your code. Make sure it is proper Javascript code.");
        reject(error);
      }
    });
  };

  async function handleFormating() {
    // Handle Register button click
    await reformat()
  }

  async function submit() {
    // Handle Register button click
    await reformat()
    registerFunction()
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {loading && <h2> LOADING...</h2>}
      {
        <>
          <ButtonToolbar className="pt-3 pb-1 flex-col" aria-label="Actions for Editor">
            <InputGroup className="px-3" style={{ width: '100%' }}>
              <InputGroup style={{ width: '30%' }}>
                <InputGroup.Text id="btnGroupAddon">AccountID:</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={accountId}
                  disabled={true}
                  aria-label="Registered Indexer Name"
                  aria-describedby="btnGroupAddon"
                />
              </InputGroup>
              <InputGroup className="px-3" style={{ width: '40%' }}>

                <InputGroup.Text id="btnGroupAddon">Indexer Name: </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={indexerNameField}
                  onChange={(e) => setIndexerNameField(e.target.value)}
                  disabled={options?.create_new_indexer === false}
                  aria-label="Registered Indexer Name"
                  aria-describedby="btnGroupAddon"
                />
              </InputGroup>
            </InputGroup>

            {options?.create_new_indexer && <>
              <InputGroup className="px-3 pt-3">
                <InputGroup.Checkbox value="latestBlockHeight" checked={selectedOption === "latestBlockHeight"}
                  onChange={handleOptionChange} aria-label="Checkbox for following text input" />
                <InputGroup.Text>From Latest Block Height: </InputGroup.Text>
              </InputGroup>
              <InputGroup className="px-3 pt-3">
                <InputGroup.Checkbox value="specificBlockHeight" checked={selectedOption === "specificBlockHeight"}
                  onChange={handleOptionChange} aria-label="Checkbox for following text input" />
                <InputGroup.Text>Specific Block Height</InputGroup.Text>
                <input
                  type="number"
                  value={blockHeight}
                  onChange={(e) => setBlockHeight(e.target.value)}
                  aria-label="Text input with checkbox" />
              </InputGroup>
            </>}
            <ButtonGroup className="px-3 pt-3" style={{ width: '50%' }} aria-label="Action Button Group">
              <Button variant="secondary" className="px-3" onClick={() => setShowResetCodeModel(true)}> Reset</Button>{' '}
              <Button variant="secondary" className="px-3" onClick={() => handleFormating()}> Format Code</Button>{' '}
              {/* <Button variant="primary" className="px-3" onClick={() => submit()}> Save / Register</Button>{' '} */}
              <Button variant="primary" className="px-3" onClick={() => submit()}>
                {actionButtonText}
              </Button>
            </ButtonGroup>

          </ButtonToolbar></>}
      <Modal show={showResetCodeModel} onHide={() => setShowResetCodeModel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The changes you have made in the editor will be deleted.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetCodeModel(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleReload()}>
            Reload
          </Button>
        </Modal.Footer>
      </Modal>

      {error && <Alert className="px-3 pt-3" variant="danger">
        {error}
      </Alert>}
      <div className="px-3 pt-3">
        <button disabled={fileName === "indexingLogic.js"} onClick={() => setFileName("indexingLogic.js")}
        >indexingLogic.js</button>
        <button disabled={fileName === "schema.sql"} onClick={() => setFileName("schema.sql")}>schema.sql</button>
        {/* <div className="container-fluid mt-1">
          <div className="mb-3">
            <Nav
              variant="pills mb-1"
              onSelect={(key) => {
                console.log(key, "key")
                openFile(JSON.parse(key))
              }}
            >
              {Object.entries(files).map((key, file) => {
                return (
                  <Nav.Item key={key}>
                    <Nav.Link className="text-decoration-none" eventKey={key}>
                      {file.name}
                    </Nav.Link>
                  </Nav.Item>
                );
              })}

            </Nav>
          </div>
            <MonacoEditor
            value={fileName == "indexingLogic.js" ? indexingCode : schema}
            height="80vh"
            width="100%"
            // defaultValue={fileName == "indexingLogic.js" ? defaultCode : defaultSchema}
            defaultLanguage={fileName == "indexingLogic.js" ? "javascript" : "sql"}
            theme="vs-dark"
            onChange={(text) => fileName === "indexingLogic.js" ? () => setIndexingCode(text) : () => setSchema(text)}
            options={{ ...options, readOnly: fileName === "indexingLogic.js" ? false : true }}
          />
        </div> */}
        {fileName == "indexingLogic.js" &&
          <MonacoEditor
            value={indexingCode}
            height="80vh"
            width="100%"
            defaultValue={defaultCode}
            defaultLanguage="javascript"
            theme="vs-dark"
            onChange={(text) => setIndexingCode(text)}
            options={{ ...options, readOnly: false }}
          />}
        {fileName == "schema.sql" &&
          <MonacoEditor
            value={schema}
            height="80vh"
            width="100%"
            defaultValue={defaultSchema}
            defaultLanguage="sql"
            theme="vs-dark"
            onChange={(text) => setSchema(text)}
            options={{ ...options, readOnly: true }}
          />
        }
      </div>
    </div >);
}

export default Editor;
