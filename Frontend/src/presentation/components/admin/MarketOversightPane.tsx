import { Market, Broker, Rfs, ServiceType } from "./types";
import { Layers } from "lucide-react";

type MarketOversightPaneProps = {
  markets: Market[];
  brokers: Broker[];
  rfsList: Rfs[];
  serviceTypes: ServiceType[];
};

export const MarketOversightPane = ({ markets, brokers, rfsList, serviceTypes }: MarketOversightPaneProps) => {
  const serviceTypeMap = new Map(serviceTypes.map((type) => [type.id, type.name]));
  const marketMap = new Map(markets.map((m) => [m.id, m.market_name]));

  return (
    <section>
      <div className="section-head">
        <div className="section-title">
          <Layers className="icon" />
          <div>
            <h2>Market Oversight</h2>
            <p>Monitor decentralized markets, registered brokers, and active RFS requests.</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="surface">
          <h3>Registered Markets</h3>
          {markets.length === 0 ? (
            <p className="muted">No markets registered.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market Name</th>
                  <th>Region</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => (
                  <tr key={market.id}>
                    <td>{market.market_name}</td>
                    <td>{market.region}</td>
                    <td><span className="tag tag--success">{market.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="surface">
          <h3>Registered Brokers</h3>
          {brokers.length === 0 ? (
            <p className="muted">No brokers registered.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Market</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((broker) => (
                  <tr key={broker.id}>
                    <td>{broker.first_name} {broker.surname}</td>
                    <td><span className="tag">{broker.broker_type}</span></td>
                    <td>{marketMap.get(broker.market_id) || "Unknown"}</td>
                    <td><span className="tag tag--success">{broker.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="surface mt-6">
        <h3>Active Requests for Service (RFS)</h3>
        {rfsList.length === 0 ? (
          <p className="muted">No RFS requests active.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Service Type</th>
                <th>Buyer ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rfsList.map((rfs) => (
                <tr key={rfs.id}>
                  <td>{rfs.title}</td>
                  <td>{serviceTypeMap.get(rfs.service_type_id) || "Unknown"}</td>
                  <td>{rfs.buyer_id.substring(0, 8)}...</td>
                  <td>
                    <span className={`tag ${rfs.status === 'PUBLISHED' ? 'tag--success' : ''}`}>{rfs.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
