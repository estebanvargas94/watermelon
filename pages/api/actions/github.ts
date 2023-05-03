import { Webhooks } from "@octokit/webhooks";
import { Octokit } from "@octokit/rest";

const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET,
});

const octokit = new Octokit({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
});

// Handle the "pull_request" event
webhooks.on("pull_request", async ({ payload }) => {
  console.log("pull_request", payload.repository);
  if (payload.action === "opened") {
    const { repository, pull_request } = payload;
    const comment = {
      owner: repository.owner.login,
      repo: repository.name,
      //@ts-ignore
      issue_number: pull_request.number,
      body: "Thank you for your pull request! We will review it shortly.",
    };

    // Add a comment to the pull request
    await octokit.rest.issues.createComment(comment);
  }
});

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      // Verify and parse the webhook event
      const eventName = req.headers["x-github-event"];
      await webhooks.receive({
        id: req.headers["x-github-delivery"],
        name: eventName,
        payload: req.body,
      });

      res.status(200).send("Webhook event processed");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing webhook event");
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
