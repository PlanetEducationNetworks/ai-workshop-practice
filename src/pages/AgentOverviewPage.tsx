import { AGENTS } from '../data/agents'
import { Button } from '../components/ui'

// Admin > Finance > Agent Overview. Open /#agents.
export function AgentOverviewPage() {
  const rows = AGENTS.slice(0, 10)
  return (
    <div className="login">
      <h1>Agent Overview</h1>
      <table className="fees">
        <thead>
          <tr><th>Agency</th><th>Students</th></tr>
        </thead>
        <tbody>
          {rows.map(a => (
            <tr key={a.id}><td>{a.name}</td><td>{a.students}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="pager">
        <Button type="button">Previous</Button>
        <Button type="button">Next</Button>
      </div>
    </div>
  )
}
