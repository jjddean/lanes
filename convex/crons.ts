import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Survival Design Janitor (Rule 1)
// Runs every 5 minutes to recover abandoned processing locks
crons.interval(
    "recover-expired-queue-locks",
    { minutes: 5 },
    internal.messageDispatcher.recoverExpiredLocks,
);

// Optional: Burst Processing Start
// Periodically check for pending items every 1 minute if the dispatcher isn't already active
crons.interval(
    "trigger-queue-processing",
    { minutes: 1 },
    internal.messageDispatcher.processQueueStep,
);

export default crons;
