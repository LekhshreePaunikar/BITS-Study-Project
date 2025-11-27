// root/src/components/SupportTicketModeration.tsx

import { useEffect, useState } from "react";
import { adminAPI } from "../utils/api";

export default function SupportTicketModeration() {

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await adminAPI.getSupportTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to load support tickets", err);
      }
    }
    loadTickets();
  }, []);

  const updateStatus = async (ticketId, newStatus) => {
    await adminAPI.updateSupportTicketStatus(ticketId, newStatus);
    setTickets(tickets.map(t =>
      t.ticket_id === ticketId ? { ...t, status: newStatus } : t
    ));
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Support Ticket Monitoring</h2>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>User</th>
              <th>Issue Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.ticket_id}>
                <td>#{ticket.ticket_id}</td>
                <td>USR_{ticket.user_id}</td>
                <td>{ticket.issue_type}</td>

                <td>{(ticket.message?.split("||")[0] || "")}</td>

                <td>
                  <span className={`status-badge status-${ticket.status}`}>
                    {ticket.status}
                  </span>
                </td>

                <td>{new Date(ticket.created_at).toLocaleString()}</td>

                <td>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateStatus(ticket.ticket_id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
