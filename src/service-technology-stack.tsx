import { TechIcon } from "./brand-icon";

export function ServiceTechnologyStack({
  groups,
}: {
  groups: { name: string; items: string[] }[];
}) {
  return (
    <div className="service-stack">
      {groups.map((group) => (
        <div className="service-stack-group" key={group.name}>
          <div className="service-stack-label">
            <span aria-hidden="true" />
            <h3>{group.name}</h3>
          </div>
          <div className="service-stack-tools">
            {group.items.map((name) => (
              <div className="service-stack-tool" key={name}>
                <TechIcon name={name} context={group.name} className="service-stack-icon" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
