"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { UserPlus, Users, ArrowRight, Music, Sparkles } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useRouter } from "next/navigation";

interface RoomFormProps {
  session: any;
  error?: string;
}


type FormMode = "join" | "create";

export function RoomForm({ session, error }: RoomFormProps) {

  useEffect(() => {
    if(error){
      alert(error)
    }
  }, [error])


  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("join");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");


  // TODO: check if room already exists from backend, if yes join, else create the room and join as admin
  const [joinState, joinAction, isJoiningPending] = useActionState(() => router.push(`/space/${roomCode}?intent=join`), null);
  const [createState, createAction, isCreatingPending] = useActionState(() => router.push(`/space/${roomName}?intent=create`), null);

  const isPending = isJoiningPending || isCreatingPending;

  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
          <Music className="h-5 w-5 text-white" />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {mode === "join" ? "Join Room" : "Create Room"}
          </CardTitle>
          <CardDescription className="text-white/60">
            {mode === "join"
              ? "Enter a room code to join an existing session"
              : "Create a new listening space and invite others"
            }
          </CardDescription>
        </div>

        <div className="relative grid grid-cols-2 rounded-xl border border-white/12 bg-black/35 p-1">
          <div
            className={cn(
              "absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300",
              mode === "join" ? "translate-x-0" : "translate-x-[calc(100%+8px)]",
            )}
          />
          <button
            type="button"
            onClick={() => setMode("join")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              mode === "join"
                ? "text-black"
                : "text-white/65 hover:text-white"
            )}
          >
            <UserPlus className="w-4 h-4" />
            Join
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              mode === "create"
                ? "text-black"
                : "text-white/65 hover:text-white"
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
              <label htmlFor="roomCode" className="text-sm font-medium text-white/90">
                Room Code
              </label>
              <Input
                id="roomCode"
                name="roomCode"
                type="text"
                placeholder="Type room name..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="h-11 rounded-xl border-white/15 bg-black/25 font-mono tracking-[0.2em] text-white placeholder:text-white/35"
                maxLength={8}
                disabled={isPending}
                required
              />
            </div>

            <Button
              type="submit"
              className="group h-11 w-full rounded-xl bg-white text-black transition-transform hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
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
              <label htmlFor="roomName" className="text-sm font-medium text-white/90">
                Room Name
              </label>
              <Input
                id="roomName"
                name="roomName"
                type="text"
                placeholder="Type room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={50}
                className="h-11 rounded-xl border-white/15 bg-black/25 font-mono tracking-[0.2em] text-white placeholder:text-white/35"
                disabled={isPending}
                required
              />
            </div>

            <Button
              type="submit"
              className="group h-11 w-full rounded-xl bg-white text-black transition-transform hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
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
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10">
                <span className="text-xs font-semibold text-white">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-white/60">{session.user.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-white/70">
                <Sparkles className="h-3 w-3" />
                Ready
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
