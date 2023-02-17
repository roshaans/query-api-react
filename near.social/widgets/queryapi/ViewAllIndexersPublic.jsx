const limit = 5;
let indexers = [];
let totalIndexers = 0;

const H2 = styled.h2`
  font-size: 19px;
  line-height: 22px;
  color: #11181c;
  margin: 0 0 24px;
`;

const CardWrapper = styled.div`
  margin: 0 0 16px;
`;

const ButtonLink = styled.a`
  display: block;
  width: 100%;
  padding: 8px;
  height: 32px;
  background: #fbfcfd;
  border: 1px solid #d7dbdf;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  cursor: pointer;
  color: #11181c !important;
  margin-top: 24px;

  &:hover,
  &:focus {
    background: #ecedee;
    text-decoration: none;
    outline: none;
  }

  span {
    color: #687076 !important;
  }
`;

return (
  <>
    <H2>Latest Indexers</H2>

    {indexers.map((indexer, i) => (
      <CardWrapper key={i}>
        <Widget
          src="roshaan.near/widget/IndexerView"
          props={{
            indexer_path: `${indexer.accountId}/${indexer.indexerName}`,
          }}
        />
      </CardWrapper>
    ))}

    <ButtonLink href="/#/mob.near/widget/Applications">
      View All Indexers <span>({totalApps})</span>
    </ButtonLink>
  </>
);
