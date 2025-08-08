import { Inngest } from "inngest";
import { env } from "~/env";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "ai-podcast-clipper",
  eventKey: env.INNGEST_EVENT_KEY,
  // Add explicit authentication
  ...(env.INNGEST_SIGNING_KEY && { signingKey: env.INNGEST_SIGNING_KEY }),
});
