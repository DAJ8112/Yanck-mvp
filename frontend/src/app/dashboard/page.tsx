"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  MessageSquare,
  Trash2,
  PlusCircle,
  Search,
  Loader2,
  FileText,
  Calendar,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { chatbotApi } from "@/lib/api";
import type { Chatbot } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [filteredChatbots, setFilteredChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch chatbots on mount
  useEffect(() => {
    fetchChatbots();
  }, []);

  // Filter chatbots when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChatbots(chatbots);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chatbots.filter(
        (chatbot) =>
          chatbot.name.toLowerCase().includes(query) ||
          chatbot.system_prompt.toLowerCase().includes(query)
      );
      setFilteredChatbots(filtered);
    }
  }, [searchQuery, chatbots]);

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatbotApi.list();
      setChatbots(response.chatbots);
      setFilteredChatbots(response.chatbots);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load chatbots"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chatbotId: string) => {
    try {
      setDeletingId(chatbotId);
      await chatbotApi.delete(chatbotId);
      // Remove from local state
      setChatbots((prev) => prev.filter((c) => c.id !== chatbotId));
      setFilteredChatbots((prev) => prev.filter((c) => c.id !== chatbotId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete chatbot"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: Chatbot["status"]) => {
    const variants = {
      creating: { variant: "secondary" as const, label: "Creating" },
      processing: { variant: "secondary" as const, label: "Processing" },
      ready: { variant: "default" as const, label: "Ready" },
      error: { variant: "destructive" as const, label: "Error" },
    };
    const config = variants[status] || variants.ready;
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI chatbots
            </p>
          </div>
          <Link href="/create">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Chatbot
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chatbots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredChatbots.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery
                  ? "No chatbots found"
                  : "No chatbots yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by creating your first chatbot"}
              </p>
              {!searchQuery && (
                <Link href="/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Chatbot
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chatbots Grid */}
        {!loading && filteredChatbots.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatbots.map((chatbot) => (
              <Card key={chatbot.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                    </div>
                    {getStatusBadge(chatbot.status)}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {chatbot.system_prompt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>
                        {chatbot.document_count || 0} document
                        {chatbot.document_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(chatbot.created_at)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Link href={`/chat/${chatbot.id}`} className="flex-1">
                    <Button
                      variant="default"
                      className="w-full"
                      disabled={chatbot.status !== "ready"}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={deletingId === chatbot.id}
                      >
                        {deletingId === chatbot.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chatbot?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{chatbot.name}&quot; and all
                          its documents and chat history. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(chatbot.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredChatbots.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Showing {filteredChatbots.length} of {chatbots.length} chatbot
            {chatbots.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
