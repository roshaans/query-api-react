const [accountId, indexerName] = props.indexer_path.split('/');
const limit = 7;
let indexers = [];
let totalIndexers = 0;
const registry_contract_id =
  props.registry_contract_id || 'registry.queryapi.near';

State.init({
  activeTab: 'editor-window',
  selectedIndexer: undefined,
  indexers: [],
  totalIndexers: 0,
});

const indexerDetails = Near.asyncView(
  registry_contract_id,
  'list_indexer_functions'
).then((data) => {
  let indexer_paths = Object.keys(data);
  indexers = indexer_paths.map((indexer_path) => {
    return {
      accountId: indexer_path.split('/')[0],
      indexerName: indexer_path.split('/').splice(1).join('/'),
    };
  });
  if (indexer_paths.length > 0) {
    State.update({ selectedIndexer: 0 });
  }
});
const Wrapper = styled.div`
  margin-top: calc(var(--body-top-padding) * -1);
`;

const Main = styled.div`
  display: grid;
  grid-template-columns: 284px minmax(0, 1fr);
  grid-gap: 16px;
  padding-bottom: 24px;

  @media (max-width: 1200px) {
    display: block;
  }
`;

const Section = styled.div`
  padding-top: 24px;
  border-left: ${(p) => (p.primary ? '1px solid #ECEEF0' : 'none')};
  border-right: ${(p) => (p.primary ? '1px solid #ECEEF0' : 'none')};

  @media (max-width: 1200px) {
    padding-top: 0px;
    border-left: none;
    border-right: none;
    display: ${(p) => (p.active ? 'block' : 'none')};
    margin: ${(p) => (p.negativeMargin ? '0 -12px' : '0')};
  }
`;

const Tabs = styled.div`
  display: none;
  height: 48px;
  background: #f8f9fa;
  border-top: 1px solid #eceef0;
  border-bottom: 1px solid #eceef0;
  margin-bottom: ${(p) => (p.noMargin ? '0' : p.halfMargin ? '24px' : '24px')};

  @media (max-width: 1200px) {
    display: flex;
    margin-left: -12px;
    margin-right: -12px;

    button {
      flex: 1;
    }
  }
`;
const Content = styled.div`
  background-color: #f7f7f7;
  padding: 2em;
  border-radius: 5px;
`;

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

const TabsButton = styled.button`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  padding: 0 12px;
  position: relative;
  color: ${(p) => (p.selected ? '#11181C' : '#687076')};
  background: none;
  border: none;
  outline: none;

  &:hover {
    color: #11181c;
  }

  &::after {
    content: '';
    display: ${(p) => (p.selected ? 'block' : 'none')};
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #0091ff;
  }
`;
const indexerView = (accountId, indexerName, selected) => {
  const Card = styled.div`
    border-radius: 12px;
    background: #fff;
    border: ${(div) =>
      div.selected ? '1px solid black' : '1px solid #eceef0'};
    box-shadow: 0px 1px 3px rgba(16, 24, 40, 0.1),
      0px 1px 2px rgba(16, 24, 40, 0.06);
  `;

  const CardBody = styled.div`
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: center;

    > * {
      min-width: 0;
    }
  `;

  const CardFooter = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px;
    border-top: 1px solid #eceef0;
  `;

  const TextLink = styled.a`
    display: block;
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: ${(p) => (p.bold ? '#11181C !important' : '#687076 !important')};
    font-weight: ${(p) => (p.bold ? '600' : '400')};
    font-size: ${(p) => (p.small ? '12px' : '14px')};
    overflow: ${(p) => (p.ellipsis ? 'hidden' : 'visible')};
    text-overflow: ${(p) => (p.ellipsis ? 'ellipsis' : 'unset')};
    white-space: nowrap;
    outline: none;

    &:focus,
    &:hover {
      text-decoration: underline;
    }
  `;

  const Thumbnail = styled.a`
    display: block;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border: 1px solid #eceef0;
    border-radius: 8px;
    overflow: hidden;
    outline: none;
    transition: border-color 200ms;

    &:focus,
    &:hover {
      border-color: #d0d5dd;
    }

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `;

  const ButtonLink = styled.button`
    padding: 8px;
    height: 32px;
    border: 1px solid #d7dbdf;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
    cursor: pointer;
    color: ${(p) => (p.primary ? '#006ADC' : '#11181C')} !important;
    background: #fbfcfd;

    &:hover,
    &:focus {
      background: #ecedee;
      text-decoration: none;
      outline: none;
    }
  `;

  return (
    <Card selected={selected}>
      <CardBody>
        <Thumbnail>
          <Widget
            src="mob.near/widget/Image"
            props={{
              image: metadata.image,
              fallbackUrl:
                'https://upload.wikimedia.org/wikipedia/commons/8/86/Database-icon.svg',
              alt: 'Near QueryApi indexer',
            }}
          />
        </Thumbnail>

        <div>
          <TextLink as="a" bold ellipsis>
            {indexerName}
          </TextLink>
          <TextLink as="a" ellipsis>
            @{accountId}
          </TextLink>
        </div>
      </CardBody>

      <CardFooter>
        <ButtonLink
          onClick={() => State.update({ activeTab: 'indexer-status' })}
        >
          View Status
        </ButtonLink>
        <ButtonLink
          primary
          onClick={() => State.update({ activeTab: 'editor-window' })}
        >
          Edit Indexer
        </ButtonLink>
      </CardFooter>
    </Card>
  );
};
const allIndexerView = () => {
  const limit = 7;
  const registry_contract_id =
    props.registry_contract_id || 'registry.queryapi.near';
  let accountId = props.accountId || context.accountId;

  const H2 = styled.h2`
    font-size: 19px;
    line-height: 22px;
    color: #11181c;
    margin: 0 0 24px;
  `;

  if (!accountId) {
    return <H2>Please sign in to see your widgets.</H2>;
  }

  Near.asyncView(registry_contract_id, 'list_indexer_functions').then(
    (data) => {
      let indexer_paths = Object.keys(data);
      let indexers = indexer_paths
        .map((indexer_path) => {
          return {
            accountId: indexer_path.split('/')[0],
            indexerName: indexer_path.split('/').splice(1).join('/'),
          };
        })
        .filter((indexer) => indexer.accountId === accountId);
      State.update({ indexers: indexers, totalIndexers: indexer_paths.length });
    }
  );

  const CardWrapper = styled.div`
    margin: 0 0 16px;
  `;

  const sharedButtonStyles = `
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-top: 12px;
  margin-bottom: 12px;
  height: 32px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  cursor: pointer;

  &:hover,
  &:focus {
    text-decoration: none;
    outline: none;
  }

  i {
    color: #7E868C;
  }

  .bi-16 {
    font-size: 16px;
  }
`;

  const Button = styled.button`
    ${sharedButtonStyles}
    color: ${(p) => (p.primary ? '#fff' : '#11181C')} !important;
    background: ${(p) => (p.primary ? '#0091FF' : '#FBFCFD')};
    border: ${(p) => (p.primary ? 'none' : '1px solid #D7DBDF')};

    &:hover,
    &:focus {
      background: ${(p) => (p.primary ? '#0484e5' : '#ECEDEE')};
    }
  `;

  const ButtonLink = styled.a`
    ${sharedButtonStyles}
    color: ${(p) => (p.primary ? '#fff' : '#11181C')} !important;
    background: ${(p) => (p.primary ? '#0091FF' : '#FBFCFD')};
    border: ${(p) => (p.primary ? 'none' : '1px solid #D7DBDF')};

    &:hover,
    &:focus {
      background: ${(p) => (p.primary ? '#0484e5' : '#ECEDEE')};
    }
  `;
  const Subheading = styled.h2`
    display: block;
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: ${(p) => (p.bold ? '#11181C !important' : '#687076 !important')};
    font-weight: ${(p) => (p.bold ? '600' : '400')};
    font-size: ${(p) => (p.small ? '12px' : '14px')};
    overflow: ${(p) => (p.ellipsis ? 'hidden' : 'visible')};
    text-overflow: ${(p) => (p.ellipsis ? 'ellipsis' : 'unset')};
    white-space: nowrap;
    outline: none;
  `;
  return (
    <>
      <ButtonLink
        primary
        href="/#/roshaan.near/widget/queryapi__QueryApiDashboard"
      >
        Create New Indexer
      </ButtonLink>
      <H2>My Indexers</H2>
      {state.indexers.map((indexer, i) => (
        <CardWrapper key={i}>
          {indexerView(
            indexer.accountId,
            indexer.indexerName,
            state.selectedIndexer == i
          )}
        </CardWrapper>
      ))}
      {state.indexers.length == 0 && (
        <Subheading> You have no indexers to show...</Subheading>
      )}
      {state.indexers.length > 0 && (
        <ButtonLink href="/#/roshaan.near/widget/queryapi__ViewAllIndexersPublic">
          View All Public Indexers <span>({state.totalIndexers})</span>
        </ButtonLink>
      )}
    </>
  );
};

return (
  <Wrapper negativeMargin={state.activeTab === 'indexers'}>
    <Tabs
      halfMargin={state.activeTab === 'indexers'}
      noMargin={state.activeTab === 'indexers'}
    >
      <TabsButton
        type="button"
        onClick={() => State.update({ activeTab: 'indexers' })}
        selected={state.activeTab === 'indexers'}
      >
        Indexers
      </TabsButton>

      <TabsButton
        type="button"
        onClick={() => State.update({ activeTab: 'editor-window' })}
        selected={state.activeTab === 'editor-window'}
      >
        Indexer Status
      </TabsButton>

      <TabsButton
        type="button"
        onClick={() => State.update({ activeTab: 'indexer-status' })}
        selected={state.activeTab === 'indexer-status'}
      >
        Explore
      </TabsButton>
    </Tabs>

    <Main>
      <Section active={state.activeTab === 'indexers'}>
        {allIndexerView()}
      </Section>

      <Section
        negativeMargin
        primary
        active={state.activeTab === 'editor-window'}
      >
        {state.activeTab === 'indexer-status' && (
          <Widget src={'roshaan.near/widget/queryapi__IndexerStatus'} />
        )}
        {state.activeTab === 'editor-window' && (
          <Widget src={'roshaan.near/widget/queryapi__IndexerFunctionEditor'} />
        )}
      </Section>
    </Main>
  </Wrapper>
);
