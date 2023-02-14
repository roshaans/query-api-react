import React, { useEffect } from 'react';

import MonacoEditor from '@monaco-editor/react';

import useStyles from './useStyles';

const Editor = _ => {
  const classes = useStyles();

  useEffect(() => {
    // Add a listener for messages from other sources
    window.addEventListener("message", handleMessage);
    return () => {
      // Clean up the listener when the component unmounts
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleMessage = (event) => {
    // Handle incoming messages
    console.log("message sendr: react app", "Received message from widget in react:", event);
  };

  const sendMessage = () => {
    console.log("messager sendr: react app", "sending message to widget...");
    // Send a message to other sources
    window.parent.postMessage("I come with peace2.5.", "*");
    if (window === window.top) {
      console.log("not running from iframe")
    } else {
      console.log("running from iframe")
    }
  };



  return <>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <button onClick={sendMessage}>Send Message</button>
      <div>
        <MonacoEditor
          height="80vh"
          defaultValue={''}
          defaultLanguage="javascript"
          theme="vs-dark"
          onChange={sendMessage} />
      </div>
    </div></>;
}

export default Editor;
