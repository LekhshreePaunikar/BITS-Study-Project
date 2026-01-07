// root/src/components/SupportTicketModeration.tsx

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { adminAPI } from "../utils/api";

interface SupportTicketModerationProps {
  username: string;
  onBackToAdminDashboard: () => void;
}

interface SupportTicket {
  ticket_id: number;
  user_id: number;
  issue_type: string;
  message: string;
  created_at: string;
  status: "open" | "in_progress" | "closed";
}

const splitTicketMessage = (message: string) => {
  const [subject, ...rest] = message.split("||");
  return {
    subject: subject?.trim() || "No Subject",
    description: rest.join("||").trim(),
  };
};

export default function SupportTicketModeration({
  username,
  onBackToAdminDashboard,
}: SupportTicketModerationProps) {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --------------------------------------------------
  // Fetch support tickets for admin
  // --------------------------------------------------
  const fetchSupportTickets = async () => {
    try {
      const data = await adminAPI.getSupportTickets();
      setSupportTickets(data);
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    }
  };



  // --------------------------------------------------
  // Update ticket status
  // --------------------------------------------------
  const handleTicketStatusChange = async (
    ticketId: number,
    newStatus: "open" | "in_progress" | "closed"
  ) => {
    try {
      await adminAPI.updateSupportTicketStatus(ticketId, newStatus);

      setSupportTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === ticketId ? { ...t, status: newStatus } : t
        )
      );

      setIsModalOpen(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };


  useEffect(() => {
    fetchSupportTickets();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#111827" }}>
      {/* ================= Header ================= */}
      <header
        className="border-b"
        style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={onBackToAdminDashboard}
                className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: "#6B7280",
                  backgroundColor: "rgba(62, 65, 69, 1)",
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>

            <div className="text-center">
              <h1 className="text-2xl md:text-3xl mb-2 text-white">
                Support Ticket Monitoring
              </h1>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                Review and resolve user support tickets
              </p>
            </div>

            <div />
          </div>
        </div>
      </header>

      {/* ================= Main Content ================= */}
      <main className="container mx-auto px-6 py-8">
        {supportTickets.length === 0 ? (
          <Card
            className="border text-center py-10"
            style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          >
            <CardContent>
              <AlertTriangle
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#6B7280" }}
              />
              <h3 className="text-lg text-white mb-2">No Support Tickets</h3>
              <p style={{ color: "#9CA3AF" }}>
                There are no support issues raised yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card
            className="border"
            style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          >
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">

                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        borderColor: "#374151",
                        backgroundColor: "#374151",
                      }}
                    >
                      <th className="p-4 text-left text-gray-400">
                        Ticket ID
                      </th>
                      <th className="p-4 text-left text-gray-400">User ID</th>
                      <th className="p-4 text-left text-gray-400">
                        Issue Type
                      </th>
                      <th className="p-4 text-left text-gray-400">
                        Ticket
                      </th>
                      <th className="p-4 text-left text-gray-400">
                        Created At
                      </th>
                      <th className="p-4 text-left text-gray-400">
                        Status
                      </th>
                      <th className="p-4 text-left text-gray-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {supportTickets.map((ticket, index) => (
                      <tr
                        key={ticket.ticket_id}
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? "rgba(55, 65, 81, 0.2)"
                              : "transparent",
                        }}
                      >
                        <td className="p-4 text-gray-300">
                          #{ticket.ticket_id}
                        </td>
                        <td className="p-4 text-gray-300">
                          {ticket.user_id}
                        </td>
                        <td className="p-4 text-gray-300">
                          {ticket.issue_type}
                        </td>
                        <td className="p-4 text-gray-300 max-w-xl">
                          {(() => {
                            const { subject, description } = splitTicketMessage(ticket.message);

                            return (
                              <div className="space-y-1">
                                <div className="font-semibold text-white">
                                  {subject}
                                </div>
                                {description && (
                                  <div className="text-gray-400 whitespace-pre-wrap">
                                    {description}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="p-4 text-gray-400">
                          <div className="text-sm text-gray-300">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(ticket.created_at).toLocaleTimeString()}
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge
                            className="px-3 py-1 text-xs"
                            style={{
                              backgroundColor:
                                ticket.status === "open"
                                  ? "#F59E0B"
                                  : ticket.status === "in_progress"
                                    ? "#3B82F6"
                                    : "#10B981",
                              color: "white",
                            }}
                          >
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setIsModalOpen(true);
                            }}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ================= Status Update Modal ================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: `0 25px 50px -12px rgba(0,0,0,0.75),0 0 0 1px rgba(255,255,255,0.08)`,
            borderRadius: "12px",
          }}
          className="bg-slate-900 text-white border border-gray-700 rounded-xl z-50"
        >

          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
          </DialogHeader>

          <p className="text-gray-400 mb-4">
            Update status for{" "}
            <strong>Ticket #{selectedTicket?.ticket_id}</strong>
          </p>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() =>
                selectedTicket &&
                handleTicketStatusChange(
                  selectedTicket.ticket_id,
                  "in_progress"
                )
              }
            >
              In Progress
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() =>
                selectedTicket &&
                handleTicketStatusChange(
                  selectedTicket.ticket_id,
                  "closed"
                )
              }
            >
              Closed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
