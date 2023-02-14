import React, { useEffect, useState } from 'react';

import MonacoEditor from '@monaco-editor/react';

import useStyles from './useStyles';
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
const Editor = (props) => {
  const [value, setValue] = useState(props.value);

  const classes = useStyles();
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

  // useEffect(() => {
  //   console.log("sending message")
  //   sendMessage(value)
  // }, [value]);

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

  const sendMessage = (value) => {
    if (value == undefined) return;
    innerCode = value.match(/\{([\s\S]*)\}/)[1]
    // Send a message to other sources
    window.parent.postMessage(innerCode, "*");
    if (window === window.top) {
      console.log("not running from iframe")
    } else {
      console.log("running from iframe")
    }
  };

  let defaultCode = `function getBlock(block, context) {
    // Add your code here
    const h = block.header.height;
    context.set('height', h);
  }`

  return <>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        <MonacoEditor
          value={value}
          height="80vh"
          defaultValue={props.value ?? defaultCode}
          defaultLanguage="javascript"
          theme="vs-dark"
          onChange={(text) => setValue(text)}
          wrapperProps={{
            onBlur: () => {
              reformat(value)
              sendMessage(value)
            }
          }}
        />
      </div>
    </div></>;
}

export default Editor;
