"use client";

import { useState, useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { UserPlus, Users, ArrowRight, Music } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useRouter } from "next/navigation";

interface RoomFormProps {
  session: any;
}


type FormMode = "join" | "create";

export function RoomForm({ session }: RoomFormProps) {

  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("join");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");

  const [joinState, joinAction, isJoiningPending] = useActionState(() => router.push(`/space/${roomCode}`), null);
  const [createState, createAction, isCreatingPending] = useActionState(() => router.push(`/space/${roomName}`), null);

  const isPending = isJoiningPending || isCreatingPending;

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Music className="w-6 h-6 text-primary" />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            {mode === "join" ? "Join Room" : "Create Room"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "join"
              ? "Enter a room code to join an existing session"
              : "Create a new room and invite others"
            }
          </CardDescription>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("join")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mode === "join"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus className="w-4 h-4" />
            Join
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mode === "create"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Create
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {mode === "join" ? (
          <form action={joinAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roomCode" className="text-sm font-medium text-foreground">
                Room Code
              </label>
              <Input
                id="roomCode"
                name="roomCode"
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="tracking-widest font-mono"
                maxLength={8}
                disabled={isPending}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full group"
              disabled={isPending || !roomCode.trim()}
            >
              {isJoiningPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Joining Room...
                </>
              ) : (
                <>
                  Join Room
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form action={createAction} className="space-y-4">
            <input type="hidden" name="adminId" value={session?.user?.id ?? ""} />
            <div className="space-y-2">
              <label htmlFor="roomName" className="text-sm font-medium text-foreground">
                Room Name
              </label>
              <Input
                id="roomName"
                name="roomName"
                type="text"
                placeholder="Enter room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={50}
                className="tracking-widest font-mono"
                disabled={isPending}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full group"
              disabled={isPending || !roomName.trim() || !session?.user?.id}
            >
              {isCreatingPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  Create Room
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* User Info */}
        {session?.user && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{session.user.name}</p>
                <p className="text-xs">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
