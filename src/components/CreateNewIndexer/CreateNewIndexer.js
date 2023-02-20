import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import Editor from '../../components/Editor';
import { providers } from "near-api-js";
import Card from 'react-bootstrap/Card';
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
const defaultCode = `function getBlock(block, context) {
    // Add your code here
    const h = block.header.height;
    context.set('height', h);
  }`


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
const CreateNewIndexer = (props) => {
    const [indexerName, setIndexerName] = useState(undefined);
    const [blockHeight, setBlockHeight] = useState(null);

    const [selectedOption, setSelectedOption] = useState('latestBlockHeight');
    useEffect(() => {
        setBlockHeight(getLatestBlockHeight())
    }, [])
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    }

    const createNewIndexer = async () => {
        if (selectedOption === "latestBlockHeight") {
            await getLatestBlockHeight()
        }
        if (indexerName == undefined) return;

        const innerCode = defaultCode.match(/\{([\s\S]*)\}/)[1]
        // Send a message to other sources
        window.parent.postMessage({ action: "register_function", value: { indexerName: indexerName.replace(" ", "_"), code: innerCode }, from: "react" }, "*");
    };

    return (
        <div>
            <Card>
                <Card.Body>
                    Create a New Indexer
                    <h5 htmlFor="basic-url">Indexer Name:</h5>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                            {props.accountId}/
                        </InputGroup.Text>
                        <input value={indexerName}
                            onChange={(e) => setIndexerName(e.target.value)} id="basic-url" aria-describedby="basic-addon3" />
                    </InputGroup>
                    <h5 htmlFor="basic-url">Start Block Height</h5>

                    <InputGroup className="mb-3">
                        <InputGroup.Checkbox value="latestBlockHeight" checked={selectedOption === "latestBlockHeight"}
                            onChange={handleOptionChange} aria-label="Checkbox for following text input" />
                        <InputGroup.Text>From Latest Block Height: </InputGroup.Text>
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Checkbox value="specificBlockHeight" checked={selectedOption === "specificBlockHeight"}
                            onChange={handleOptionChange} aria-label="Checkbox for following text input" />
                        <InputGroup.Text>Specific Block Height</InputGroup.Text>
                        <input aria-label="Text input with checkbox" />
                    </InputGroup>
                    <Button variant="primary" onClick={() => createNewIndexer()}>
                        Create New Indexer
                    </Button>
                </Card.Body>
            </Card>

        </div>
    )
};

export default CreateNewIndexer;
